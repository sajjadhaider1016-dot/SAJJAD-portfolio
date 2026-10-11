"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getOrCreateCart } from "@/lib/store";
import { requireUser } from "@/lib/auth";
import { availableStock, canFulfill } from "@/lib/commerce";

function revalidateShop() {
  revalidatePath("/");
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/wishlist");
}

export async function addToCartAction(productId: string, quantity = 1, variantId?: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });
  if (!product || !product.isActive || product.status !== "PUBLISHED") return { error: "Product unavailable." };

  const variant = variantId ? product.variants.find((row) => row.id === variantId && row.isActive) : null;
  if (variantId && !variant) return { error: "That option is unavailable." };

  const stock = availableStock(product.stock, variant?.stock);
  if (stock < 1) return { error: "Out of stock." };

  const cart = await getOrCreateCart();
  const existing = cart.items.find(
    (item) => item.productId === productId && (item.variantId || undefined) === (variant?.id || undefined),
  );
  const nextQty = (existing?.quantity || 0) + quantity;
  if (!canFulfill(nextQty, stock)) return { error: "Not enough stock for that quantity." };

  if (existing) {
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: nextQty } });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, variantId: variant?.id, quantity },
    });
  }
  revalidateShop();
  return { ok: true, message: "Added to cart" };
}

export async function updateCartItemAction(itemId: string, quantity: number) {
  const cart = await getOrCreateCart();
  const item = cart.items.find((row) => row.id === itemId);
  if (!item) return { error: "Item not found." };
  if (quantity < 1) {
    await prisma.cartItem.delete({ where: { id: itemId } });
  } else {
    const stock = availableStock(item.product.stock, item.variant?.stock);
    if (!canFulfill(quantity, stock)) return { error: "Not enough stock." };
    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  }
  revalidateShop();
  return { ok: true };
}

export async function removeCartItemAction(itemId: string) {
  const cart = await getOrCreateCart();
  const item = cart.items.find((row) => row.id === itemId);
  if (!item) return { error: "Item not found." };
  await prisma.cartItem.delete({ where: { id: itemId } });
  revalidateShop();
  return { ok: true };
}

export async function toggleWishlistAction(productId: string) {
  const user = await requireUser();
  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });
  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/wishlist");
    return { ok: true, added: false };
  }
  await prisma.wishlistItem.create({ data: { userId: user.id, productId } });
  revalidatePath("/wishlist");
  return { ok: true, added: true };
}

export async function moveWishlistToCartAction(productId: string) {
  const result = await addToCartAction(productId, 1);
  if (!("error" in result)) {
    try {
      const user = await requireUser();
      await prisma.wishlistItem.deleteMany({ where: { userId: user.id, productId } });
    } catch {
      // Guest wishlist is local-only.
    }
  }
  return result;
}

export async function moveWishlistToCartFormAction(productId: string) {
  await moveWishlistToCartAction(productId);
}

export async function removeWishlistFormAction(productId: string) {
  await toggleWishlistAction(productId);
}
