import type { DiscountType } from "@prisma/client";

export type CouponLike = {
  isActive: boolean;
  expiresAt: Date | null;
  usageLimit: number | null;
  usedCount: number;
  minOrderAmount: { toString(): string } | number;
  type: DiscountType;
  value: { toString(): string } | number;
  code: string;
  id: string;
};

export function toAmount(value: { toString(): string } | number) {
  return Number(value.toString());
}

export function calcDiscount(coupon: CouponLike, subtotal: number) {
  if (!coupon.isActive) return { error: "Invalid coupon" as const };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return { error: "This coupon has expired." as const };
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return { error: "This coupon has reached its usage limit." as const };
  }
  if (subtotal < toAmount(coupon.minOrderAmount)) {
    return { error: "Order does not meet the coupon minimum." as const };
  }
  const discount =
    coupon.type === "PERCENTAGE"
      ? Math.min(subtotal, (subtotal * toAmount(coupon.value)) / 100)
      : Math.min(subtotal, toAmount(coupon.value));
  return { ok: true as const, discount, code: coupon.code, couponId: coupon.id };
}

export function calcShipping(subtotal: number, fee: number, freeThreshold: number | null, discount = 0) {
  const payable = Math.max(0, subtotal - discount);
  if (freeThreshold != null && payable >= freeThreshold) return 0;
  return fee;
}

export function availableStock(productStock: number, variantStock?: number | null) {
  if (variantStock == null) return productStock;
  return variantStock;
}

export function canFulfill(requested: number, onHand: number) {
  return requested > 0 && requested <= onHand;
}

export const ORDER_STEPS = [
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

export function orderStepIndex(status: string) {
  if (status === "CANCELLED" || status === "RETURNED") return -1;
  return ORDER_STEPS.indexOf(status as (typeof ORDER_STEPS)[number]);
}
