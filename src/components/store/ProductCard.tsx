import Image from "next/image";
import Link from "next/link";
import { discountPercent, effectivePrice, formatMoney, toNumber } from "@/lib/utils";
import { AddToCartButton } from "./AddToCartButton";

export function ProductCard({
  product,
  currency,
}: {
  product: {
    id: string;
    name: string;
    slug: string;
    price: { toString(): string } | number;
    salePrice?: { toString(): string } | number | null;
    stock: number;
    isDemo?: boolean;
    images: { url: string; alt?: string | null }[];
    reviews?: { rating: number }[];
  };
  currency: string;
}) {
  const price = toNumber(product.price);
  const sale = product.salePrice ? toNumber(product.salePrice) : null;
  const current = effectivePrice(price, sale);
  const off = discountPercent(price, sale);
  const rating =
    product.reviews && product.reviews.length
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : null;
  const image = product.images[0];

  return (
    <article className="group overflow-hidden rounded-3xl border border-border bg-bg-elevated transition hover:-translate-y-0.5 hover:border-white/20">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square bg-black">
          {image ? (
            <Image src={image.url} alt={image.alt || product.name} fill className="object-cover" sizes="(max-width:768px) 50vw, 25vw" />
          ) : (
            <div className="grid h-full place-items-center text-muted">No image</div>
          )}
          {off > 0 && <span className="absolute left-3 top-3 rounded-full bg-accent px-2 py-1 text-xs font-semibold text-black">-{off}%</span>}
          {product.stock < 1 && <span className="absolute right-3 top-3 rounded-full bg-black/70 px-2 py-1 text-xs">Out of Stock</span>}
        </div>
        <div className="p-4">
          <h3 className="font-medium">{product.name}</h3>
          {product.isDemo && <p className="mt-1 text-xs uppercase tracking-wide text-muted">Demo / sample</p>}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg">{formatMoney(current, currency)}</span>
            {sale && sale < price && <span className="text-sm text-muted line-through">{formatMoney(price, currency)}</span>}
          </div>
          {rating && <p className="mt-1 text-xs text-muted">{rating.toFixed(1)} rating</p>}
        </div>
      </Link>
      <div className="px-4 pb-4">
        <AddToCartButton productId={product.id} disabled={product.stock < 1} />
      </div>
    </article>
  );
}
