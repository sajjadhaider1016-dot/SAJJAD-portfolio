"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, type OrderStatus, type PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { categorySchema, couponSchema, productSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";
import { deleteStoredImage } from "@/lib/storage";
import { defaultPaymentConfig, type PaymentConfig } from "@/lib/payments";

function bool(data: FormData, key: string) {
  return data.get(key) === "on" || data.get(key) === "true";
}

function parseSpecs(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [key, ...rest] = line.split(":");
      return { key: key.trim(), value: rest.join(":").trim() };
    })
    .filter((row) => row.key && row.value);
}

export async function saveProductAction(data: FormData) {
  await requireAdmin("products");
  const parsed = productSchema.safeParse(Object.fromEntries(data.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid product." };
  const id = String(data.get("id") || "");
  const imageUrls = String(data.get("imageUrls") || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

  const slugBase = parsed.data.slug?.trim() || slugify(parsed.data.name);
  let slug = slugBase;
  let n = 1;
  while (await prisma.product.findFirst({ where: { slug, NOT: id ? { id } : undefined } })) {
    slug = `${slugBase}-${++n}`;
  }

  const payload = {
    name: parsed.data.name,
    slug,
    sku: parsed.data.sku,
    categoryId: parsed.data.categoryId,
    brand: parsed.data.brand || null,
    tags: parsed.data.tags
      ? parsed.data.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [],
    price: new Prisma.Decimal(parsed.data.price),
    salePrice:
      parsed.data.salePrice && !Number.isNaN(parsed.data.salePrice)
        ? new Prisma.Decimal(parsed.data.salePrice)
        : null,
    costPrice:
      parsed.data.costPrice && !Number.isNaN(parsed.data.costPrice)
        ? new Prisma.Decimal(parsed.data.costPrice)
        : null,
    stock: parsed.data.stock,
    lowStockThreshold: parsed.data.lowStockThreshold,
    shortDescription: parsed.data.shortDescription || null,
    description: parsed.data.description || "",
    specifications: parseSpecs(parsed.data.specifications || ""),
    isFeatured: bool(data, "isFeatured"),
    isBestSeller: bool(data, "isBestSeller"),
    isNewArrival: bool(data, "isNewArrival"),
    isActive: data.has("isActive") ? bool(data, "isActive") : true,
  };

  const product = id
    ? await prisma.product.update({
        where: { id },
        data: {
          ...payload,
          images: {
            deleteMany: {},
            create: imageUrls.map((url, index) => ({ url, sortOrder: index })),
          },
        },
      })
    : await prisma.product.create({
        data: {
          ...payload,
          images: { create: imageUrls.map((url, index) => ({ url, sortOrder: index })) },
        },
      });

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  redirect("/admin/products");
  return { ok: true, id: product.id };
}

export async function deleteProductAction(id: string) {
  await requireAdmin("products");
  const product = await prisma.product.findUnique({ where: { id }, include: { images: true } });
  if (!product) return { error: "Product not found." };
  for (const image of product.images) await deleteStoredImage(image.url);
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { ok: true };
}

export async function duplicateProductAction(id: string) {
  await requireAdmin("products");
  const product = await prisma.product.findUnique({ where: { id }, include: { images: true } });
  if (!product) return { error: "Product not found." };
  await prisma.product.create({
    data: {
      name: `${product.name} Copy`,
      slug: `${product.slug}-copy-${Date.now().toString(36)}`,
      sku: `${product.sku}-COPY-${Date.now().toString(36).slice(-4)}`,
      brand: product.brand,
      tags: product.tags,
      shortDescription: product.shortDescription,
      description: product.description,
      specifications: product.specifications ?? [],
      price: product.price,
      salePrice: product.salePrice,
      costPrice: product.costPrice,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: true,
      isActive: false,
      categoryId: product.categoryId,
      images: { create: product.images.map((image, index) => ({ url: image.url, sortOrder: index })) },
    },
  });
  revalidatePath("/admin/products");
  return { ok: true };
}

export async function saveCategoryAction(data: FormData) {
  await requireAdmin("products");
  const parsed = categorySchema.safeParse(Object.fromEntries(data.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid category." };
  const id = String(data.get("id") || "");
  const imageUrl = String(data.get("imageUrl") || "") || null;
  const slug = slugify(parsed.data.name);
  const payload = {
    name: parsed.data.name,
    slug,
    description: parsed.data.description || null,
    imageUrl,
    isActive: data.has("isActive") ? bool(data, "isActive") : true,
  };
  if (id) await prisma.category.update({ where: { id }, data: payload });
  else await prisma.category.create({ data: payload });
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin("products");
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) return { error: "Move or delete products in this category first." };
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function updateOrderAction(data: FormData) {
  await requireAdmin("orders");
  const id = String(data.get("id"));
  const status = String(data.get("status")) as OrderStatus;
  const paymentStatus = String(data.get("paymentStatus")) as PaymentStatus;
  const existing = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!existing) return { error: "Order not found." };

  if (
    (status === "CANCELLED" || status === "RETURNED") &&
    existing.status !== "CANCELLED" &&
    existing.status !== "RETURNED"
  ) {
    for (const item of existing.items) {
      if (item.productId) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity }, soldCount: { decrement: item.quantity } },
        });
      }
    }
  }

  await prisma.order.update({
    where: { id },
    data: {
      status,
      paymentStatus,
      payment: { update: { status: paymentStatus } },
    },
  });
  revalidatePath("/admin/orders");
  return { ok: true };
}

export async function saveCouponAction(data: FormData) {
  await requireAdmin("settings");
  const parsed = couponSchema.safeParse(Object.fromEntries(data.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid coupon." };
  const id = String(data.get("id") || "");
  const payload = {
    code: parsed.data.code.toUpperCase(),
    type: parsed.data.type,
    value: new Prisma.Decimal(parsed.data.value),
    minOrderAmount: new Prisma.Decimal(parsed.data.minOrderAmount || 0),
    usageLimit:
      parsed.data.usageLimit && !Number.isNaN(parsed.data.usageLimit) ? parsed.data.usageLimit : null,
    expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    isActive: data.has("isActive") ? bool(data, "isActive") : true,
  };
  if (id) await prisma.coupon.update({ where: { id }, data: payload });
  else await prisma.coupon.create({ data: payload });
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function deleteCouponAction(id: string) {
  await requireAdmin("settings");
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function setCustomerStatusAction(id: string, isActive: boolean) {
  await requireAdmin("customers");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.role === "ADMIN") return { error: "Cannot change this account." };
  await prisma.user.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/customers");
  return { ok: true };
}

export async function moderateReviewAction(id: string, action: "approve" | "hide" | "delete") {
  await requireAdmin("products");
  if (action === "delete") await prisma.review.delete({ where: { id } });
  else if (action === "approve") await prisma.review.update({ where: { id }, data: { isApproved: true, isHidden: false } });
  else await prisma.review.update({ where: { id }, data: { isHidden: true } });
  revalidatePath("/admin/reviews");
  return { ok: true };
}

export async function saveSettingsAction(data: FormData) {
  await requireAdmin("settings");
  const current = await prisma.storeSettings.findUnique({ where: { id: "default" } });
  const payments = (current?.payments as PaymentConfig) || defaultPaymentConfig();
  const next: PaymentConfig = {
    methods: {
      COD: {
        enabled: bool(data, "codEnabled"),
        note: String(data.get("codNote") || "Pay when your order arrives."),
      },
      BANK_TRANSFER: {
        enabled: bool(data, "bankEnabled"),
        bankName: String(data.get("bankName") || ""),
        accountTitle: String(data.get("accountTitle") || ""),
        accountNumber: String(data.get("accountNumber") || ""),
        iban: String(data.get("iban") || ""),
        instructions: String(data.get("bankInstructions") || ""),
      },
      EASYPAISA: {
        enabled: bool(data, "easypaisaEnabled"),
        accountTitle: String(data.get("easypaisaTitle") || ""),
        accountNumber: String(data.get("easypaisaNumber") || ""),
        instructions: String(data.get("easypaisaInstructions") || ""),
      },
      JAZZCASH: {
        enabled: bool(data, "jazzcashEnabled"),
        accountTitle: String(data.get("jazzcashTitle") || ""),
        accountNumber: String(data.get("jazzcashNumber") || ""),
        instructions: String(data.get("jazzcashInstructions") || ""),
      },
      CARD: {
        enabled: bool(data, "cardEnabled") && Boolean(process.env.STRIPE_SECRET_KEY),
        provider: "stripe",
        instructions: String(data.get("cardInstructions") || ""),
      },
    },
  };

  await prisma.storeSettings.upsert({
    where: { id: "default" },
    create: { id: "default", payments: next },
    update: {
      storeName: String(data.get("storeName") || "CHINA VIBES"),
      email: String(data.get("email") || "chinawalivibes@gmail.com"),
      phone: String(data.get("phone") || ""),
      address: String(data.get("address") || ""),
      tagline: String(data.get("tagline") || "Technology That Fits Your Vibe."),
      facebookUrl: String(data.get("facebookUrl") || ""),
      instagramUrl: String(data.get("instagramUrl") || ""),
      whatsappNumber: String(data.get("whatsappNumber") || ""),
      shippingFee: new Prisma.Decimal(String(data.get("shippingFee") || "0")),
      freeShippingThreshold: data.get("freeShippingThreshold")
        ? new Prisma.Decimal(String(data.get("freeShippingThreshold")))
        : null,
      deliveryInfo: String(data.get("deliveryInfo") || ""),
      promoTitle: String(data.get("promoTitle") || ""),
      promoSubtitle: String(data.get("promoSubtitle") || ""),
      privacyPolicy: String(data.get("privacyPolicy") || ""),
      terms: String(data.get("terms") || ""),
      shippingPolicy: String(data.get("shippingPolicy") || ""),
      returnPolicy: String(data.get("returnPolicy") || ""),
      logoUrl: String(data.get("logoUrl") || "") || null,
      payments: next,
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { ok: true };
}
