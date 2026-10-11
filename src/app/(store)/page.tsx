import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/store";
import { productWhereActive } from "@/lib/store";
import { ProductCard } from "@/components/store/ProductCard";
import { ShieldCheck, Truck, Headphones, BadgeCheck, Wallet } from "lucide-react";

export default async function HomePage() {
  const settings = await getSettings();
  const [categories, featured, newest, best] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: { ...productWhereActive(), isFeatured: true },
      include: { images: { orderBy: { sortOrder: "asc" } }, reviews: { where: { isApproved: true, isHidden: false } } },
      take: 8,
    }),
    prisma.product.findMany({
      where: { ...productWhereActive(), isNewArrival: true },
      include: { images: { orderBy: { sortOrder: "asc" } }, reviews: { where: { isApproved: true, isHidden: false } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.product.findMany({
      where: { ...productWhereActive(), isBestSeller: true },
      include: { images: { orderBy: { sortOrder: "asc" } }, reviews: { where: { isApproved: true, isHidden: false } } },
      orderBy: { soldCount: "desc" },
      take: 8,
    }),
  ]);

  return (
    <div>
      <section className="grid gap-10 py-16 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm tracking-[0.3em] text-accent">CHINA VIBES</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-6xl">
            Technology That Fits Your Vibe.
          </h1>
          <p className="mt-5 max-w-xl text-muted">
            Premium electronics and accessories designed for your everyday life.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="rounded-full bg-text px-6 py-3 text-sm font-medium text-bg">
              Shop Now
            </Link>
            <Link href="/shop" className="rounded-full border border-border px-6 py-3 text-sm">
              Explore Products
            </Link>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-gradient-to-br from-zinc-900 to-black p-10">
          <div className="aspect-square rounded-full border border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.25),transparent_55%)]" />
          <p className="absolute bottom-8 left-8 text-sm text-muted">Audio. Power. Everyday tech.</p>
        </div>
      </section>

      <section className="py-10">
        <h2 className="font-display text-2xl">Featured Categories</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="rounded-2xl border border-border bg-bg-elevated p-5 text-center hover:border-white/20"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <ProductRow title="Featured Products" products={featured} currency={settings.currency} />
      <ProductRow title="New Arrivals" products={newest} currency={settings.currency} />
      <ProductRow title="Best Sellers" products={best} currency={settings.currency} />

      <section className="my-12 overflow-hidden rounded-[2rem] border border-border bg-bg-elevated px-8 py-14">
        <h2 className="font-display text-3xl">{settings.promoTitle}</h2>
        <p className="mt-3 max-w-xl text-muted">{settings.promoSubtitle}</p>
        <Link href="/shop" className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-black">
          Shop Collection
        </Link>
      </section>

      <section className="grid gap-4 py-10 md:grid-cols-5">
        {[
          { icon: BadgeCheck, title: "Quality Products", text: "Curated electronics and accessories." },
          { icon: Wallet, title: "Competitive Prices", text: "Fair pricing with optional store offers." },
          { icon: Truck, title: "Fast Delivery", text: settings.deliveryInfo },
          { icon: Headphones, title: "Customer Support", text: settings.email },
          { icon: ShieldCheck, title: "Secure Payments", text: "COD and configurable payment methods." },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-border p-5">
            <item.icon className="text-accent" size={20} />
            <h3 className="mt-3 font-medium">{item.title}</h3>
            <p className="mt-2 text-sm text-muted">{item.text}</p>
          </div>
        ))}
      </section>

      <section className="mb-16 rounded-[2rem] border border-border p-8">
        <h2 className="font-display text-2xl">Follow CHINA VIBES</h2>
        <p className="mt-2 text-muted">See new drops and everyday tech on social.</p>
        <div className="mt-5 flex gap-3">
          <a className="rounded-full border border-border px-5 py-2 text-sm" href={settings.instagramUrl} target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a className="rounded-full border border-border px-5 py-2 text-sm" href={settings.facebookUrl} target="_blank" rel="noreferrer">
            Facebook
          </a>
        </div>
      </section>
    </div>
  );
}

function ProductRow({
  title,
  products,
  currency,
}: {
  title: string;
  products: Parameters<typeof ProductCard>[0]["product"][];
  currency: string;
}) {
  if (!products.length) return null;
  return (
    <section className="py-8">
      <div className="flex items-end justify-between">
        <h2 className="font-display text-2xl">{title}</h2>
        <Link href="/shop" className="text-sm text-muted">
          View all
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} currency={currency} />
        ))}
      </div>
    </section>
  );
}
