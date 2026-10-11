"use server";

import { PaymentMethod, Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getCart, getSettings } from "@/lib/store";
import { checkoutSchema } from "@/lib/validators";
import { effectivePrice, toNumber } from "@/lib/utils";
import { sendOrderEmail } from "@/lib/email";
import type { PaymentConfig } from "@/lib/payments";
import { calcDiscount, calcShipping, availableStock } from "@/lib/commerce";

function orderNumber() {
  return `CV-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 999)
    .toString()
    .padStart(3, "0")}`;
}

export async function validateCoupon(code: string, subtotal: number) {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (!coupon) return { error: "Invalid coupon" };
  return calcDiscount(coupon, subtotal);
}

export async function checkoutAction(data: FormData) {
  const parsed = checkoutSchema.safeParse(Object.fromEntries(data.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Check your details." };

  const cart = await getCart();
  if (!cart || cart.items.length === 0) return { error: "Your cart is empty." };

  const settings = await getSettings();
  const payments = settings.payments as PaymentConfig;
  const method = parsed.data.paymentMethod as PaymentMethod;
  if (!payments.methods[method]?.enabled) return { error: "That payment method is not available." };
  if (method === "CARD" && !process.env.STRIPE_SECRET_KEY) {
    return { error: "Card payments are not configured yet. Choose another method." };
  }

  const session = await getSession();
  const lines = cart.items.map((item) => {
    const price = item.variant?.price ?? item.product.price;
    const sale = item.variant?.salePrice ?? item.product.salePrice;
    const unit = effectivePrice(toNumber(price), sale ? toNumber(sale) : null);
    return { item, unit, lineTotal: unit * item.quantity };
  });
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const couponCode = parsed.data.couponCode?.trim();
  let discount = 0;
  let couponId: string | undefined;
  if (couponCode) {
    const coupon = await validateCoupon(couponCode, subtotal);
    if ("error" in coupon) return { error: coupon.error };
    discount = coupon.discount || 0;
    couponId = coupon.couponId;
  }

  const threshold = settings.freeShippingThreshold ? toNumber(settings.freeShippingThreshold) : null;
  const shippingFee = calcShipping(subtotal, toNumber(settings.shippingFee), threshold, discount);
  const total = Math.max(0, subtotal + shippingFee - discount);

  try {
    const order = await prisma.$transaction(async (tx) => {
      for (const line of lines) {
        const product = await tx.product.findUnique({
          where: { id: line.item.productId },
          include: { variants: true },
        });
        if (!product || !product.isActive || product.status !== "PUBLISHED") {
          throw new Error("A product in your cart is no longer available.");
        }
        const variant = line.item.variantId
          ? product.variants.find((row) => row.id === line.item.variantId)
          : null;
        const stock = availableStock(product.stock, variant?.stock);
        if (stock < line.item.quantity) throw new Error(`Not enough stock for ${product.name}.`);
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: line.item.quantity }, soldCount: { increment: line.item.quantity } },
        });
        if (variant) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: { stock: { decrement: line.item.quantity } },
          });
        }
      }

      const created = await tx.order.create({
        data: {
          orderNumber: orderNumber(),
          userId: session?.id,
          fullName: parsed.data.fullName,
          email: parsed.data.email.toLowerCase(),
          phone: parsed.data.phone,
          address: parsed.data.address,
          city: parsed.data.city,
          area: parsed.data.area || null,
          postalCode: parsed.data.postalCode || null,
          country: parsed.data.country || "Pakistan",
          province: parsed.data.province || null,
          instructions: parsed.data.instructions || null,
          shippingMethod: parsed.data.shippingMethod || "standard",
          subtotal: new Prisma.Decimal(subtotal.toFixed(2)),
          shippingFee: new Prisma.Decimal(shippingFee.toFixed(2)),
          discount: new Prisma.Decimal(discount.toFixed(2)),
          couponCode: couponCode ? couponCode.toUpperCase() : null,
          total: new Prisma.Decimal(total.toFixed(2)),
          status: "PLACED",
          paymentMethod: method,
          paymentStatus: "PENDING",
          items: {
            create: lines.map((line) => ({
              productId: line.item.productId,
              variantId: line.item.variantId,
              name: line.item.variant ? `${line.item.product.name} · ${line.item.variant.name}` : line.item.product.name,
              sku: line.item.variant?.sku || line.item.product.sku,
              price: new Prisma.Decimal(line.unit.toFixed(2)),
              quantity: line.item.quantity,
              imageUrl: line.item.variant?.imageUrl || line.item.product.images[0]?.url,
            })),
          },
          payment: {
            create: {
              method,
              status: "PENDING",
              provider: method === "CARD" ? "stripe" : method.toLowerCase(),
            },
          },
        },
      });

      if (couponId) {
        await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
        await tx.couponRedemption.create({
          data: { couponId, userId: session?.id, orderId: created.id },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return created;
    });

    await sendOrderEmail(order.email, order.orderNumber, order.total.toString());
    redirect(`/order/${order.orderNumber}?placed=1`);
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw error;
    return { error: error instanceof Error ? error.message : "Could not place the order." };
  }
}
