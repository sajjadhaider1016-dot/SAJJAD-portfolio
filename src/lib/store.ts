import { cookies } from "next/headers";
import { prisma } from "./db";
import { defaultLegal, defaultPaymentConfig, type PaymentConfig } from "./payments";

export async function getSettings() {
  const existing = await prisma.storeSettings.findUnique({ where: { id: "default" } });
  if (existing) {
    return {
      ...existing,
      payments: existing.payments as PaymentConfig,
    };
  }

  const created = await prisma.storeSettings.create({
    data: {
      id: "default",
      payments: defaultPaymentConfig(),
      privacyPolicy: defaultLegal.privacyPolicy,
      terms: defaultLegal.terms,
      shippingPolicy: defaultLegal.shippingPolicy,
      returnPolicy: defaultLegal.returnPolicy,
    },
  });
  return { ...created, payments: created.payments as PaymentConfig };
}

const cartInclude = {
  items: {
    include: {
      product: { include: { images: { orderBy: { sortOrder: "asc" as const } } } },
      variant: true,
    },
  },
};

export async function getCart() {
  const { getSession } = await import("./auth");
  const session = await getSession();
  if (session) {
    return prisma.cart.findUnique({
      where: { userId: session.id },
      include: cartInclude,
    });
  }
  const guestKey = (await cookies()).get("cv_cart")?.value;
  if (!guestKey) return null;
  return prisma.cart.findUnique({
    where: { guestKey },
    include: cartInclude,
  });
}

export async function getOrCreateCart() {
  const { getSession, getGuestCartKey } = await import("./auth");
  const session = await getSession();
  if (session) {
    return prisma.cart.upsert({
      where: { userId: session.id },
      update: {},
      create: { userId: session.id },
      include: cartInclude,
    });
  }
  const guestKey = await getGuestCartKey();
  return prisma.cart.upsert({
    where: { guestKey },
    update: {},
    create: { guestKey },
    include: cartInclude,
  });
}

export async function mergeGuestCart(userId: string) {
  const jar = await cookies();
  const guestKey = jar.get("cv_cart")?.value;
  if (!guestKey) return;
  const guest = await prisma.cart.findUnique({ where: { guestKey }, include: { items: true } });
  if (!guest) return;
  const userCart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: { items: true },
  });
  for (const item of guest.items) {
    const existing = userCart.items.find(
      (row) => row.productId === item.productId && (row.variantId || null) === (item.variantId || null),
    );
    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + item.quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: userCart.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        },
      });
    }
  }
  await prisma.cart.delete({ where: { id: guest.id } });
}

export function productWhereActive() {
  return { isActive: true, status: "PUBLISHED" as const, category: { isActive: true } };
}

export const productCardInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  reviews: { where: { isApproved: true, isHidden: false }, select: { rating: true } },
  variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" as const } },
};
