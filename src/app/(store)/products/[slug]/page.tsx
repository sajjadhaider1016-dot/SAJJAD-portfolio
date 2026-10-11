import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/catalog";
import { getSession } from "@/lib/auth";
import { getSettings, productWhereActive } from "@/lib/store";
import { prisma } from "@/lib/db";
import { discountPercent, effectivePrice, formatMoney, toNumber } from "@/lib/utils";
import { AddToCartButton, WishlistButton } from "@/components/store/AddToCartButton";
import { ProductCard } from "@/components/store/ProductCard";
import { ReviewForm } from "@/components/store/ReviewForm";
import { ProductGallery } from "@/components/store/ProductGallery";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.shortDescription || product.description.slice(0, 160),
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title: product.name, description: product.shortDescription || undefined },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const [settings, session, related] = await Promise.all([
    getSettings(),
    getSession(),
    prisma.product.findMany({
      where: { ...productWhereActive(), categoryId: product.categoryId, NOT: { id: product.id } },
      include: { images: { orderBy: { sortOrder: "asc" } }, reviews: { where: { isApproved: true, isHidden: false } } },
      take: 4,
    }),
  ]);
  const price = toNumber(product.price);
  const sale = product.salePrice ? toNumber(product.salePrice) : null;
  const current = effectivePrice(price, sale);
  const off = discountPercent(price, sale);
  const specs = (product.specifications as { key: string; value: string }[]) || [];
  const rating = product.reviews.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    sku: product.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: settings.currency,
      price: current,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="text-sm text-muted">
        <Link href="/shop">Shop</Link> / <Link href={`/categories/${product.category.slug}`}>{product.category.name}</Link>
      </p>
      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />
        <div>
          {product.isDemo && <p className="text-xs uppercase tracking-wide text-accent">Demo / sample product</p>}
          <h1 className="mt-2 font-display text-4xl">{product.name}</h1>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl">{formatMoney(current, settings.currency)}</span>
            {sale && sale < price && <span className="text-muted line-through">{formatMoney(price, settings.currency)}</span>}
            {off > 0 && <span className="text-accent">-{off}%</span>}
          </div>
          {rating && <p className="mt-2 text-sm text-muted">{rating.toFixed(1)} from {product.reviews.length} reviews</p>}
          <p className="mt-4 text-muted">{product.shortDescription}</p>
          <p className="mt-3 text-sm">{product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <AddToCartButton productId={product.id} disabled={product.stock < 1} buyNow />
            <WishlistButton productId={product.id} signedIn={Boolean(session)} />
          </div>
          <div className="prose prose-invert mt-8 max-w-none text-sm text-muted whitespace-pre-wrap">{product.description}</div>
          {specs.length > 0 && (
            <dl className="mt-8 divide-y divide-border rounded-2xl border border-border">
              {specs.map((spec) => (
                <div key={spec.key} className="flex justify-between gap-4 px-4 py-3 text-sm">
                  <dt className="text-muted">{spec.key}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
      <section className="mt-16">
        <h2 className="font-display text-2xl">Reviews</h2>
        {product.reviews.length === 0 && <p className="mt-3 text-muted">No reviews yet.</p>}
        <ul className="mt-4 space-y-4">
          {product.reviews.map((review) => (
            <li key={review.id} className="rounded-2xl border border-border p-4">
              <p className="font-medium">{review.user.name} — {review.rating}/5</p>
              <p className="mt-2 text-sm text-muted">{review.comment}</p>
            </li>
          ))}
        </ul>
        <ReviewForm productId={product.id} signedIn={Boolean(session)} />
      </section>
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl">Related products</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} currency={settings.currency} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
