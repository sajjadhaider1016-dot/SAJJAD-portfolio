export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatMoney(amount: number | string, currency = "PKR") {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function discountPercent(price: number, salePrice?: number | null) {
  if (!salePrice || salePrice >= price || price <= 0) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

export function effectivePrice(price: number, salePrice?: number | null) {
  if (salePrice && salePrice > 0 && salePrice < price) return salePrice;
  return price;
}

export function toNumber(value: { toString(): string } | number | string | null | undefined) {
  if (value == null) return 0;
  return Number(value.toString());
}
