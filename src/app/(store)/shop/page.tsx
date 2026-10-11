import { searchProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/store";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/store/ProductCard";
import { ShopFilters } from "@/components/store/ShopFilters";

export const metadata = { title: "Shop" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = {
    q: typeof params.q === "string" ? params.q : undefined,
    category: typeof params.category === "string" ? params.category : undefined,
    min: typeof params.min === "string" ? params.min : undefined,
    max: typeof params.max === "string" ? params.max : undefined,
    sort: typeof params.sort === "string" ? params.sort : undefined,
    page: typeof params.page === "string" ? params.page : undefined,
  };
  const [result, settings, categories] = await Promise.all([
    searchProducts(query),
    getSettings(),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="py-10">
      <h1 className="font-display text-4xl">Shop</h1>
      <p className="mt-2 text-muted">Browse electronics and accessories.</p>
      <ShopFilters categories={categories} />
      {result.products.length === 0 ? (
        <div className="mt-16 text-center">
          <h2 className="text-2xl">No products found</h2>
          <p className="mt-2 text-muted">Try changing your search or filters.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {result.products.map((product) => (
            <ProductCard key={product.id} product={product} currency={settings.currency} />
          ))}
        </div>
      )}
      {result.pages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: result.pages }, (_, i) => i + 1).map((page) => (
            <a
              key={page}
              href={`?${new URLSearchParams({ ...Object.fromEntries(Object.entries(query).filter(([, v]) => v)), page: String(page) }).toString()}`}
              className={`rounded-full px-3 py-1 text-sm ${page === result.page ? "bg-text text-bg" : "border border-border"}`}
            >
              {page}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
