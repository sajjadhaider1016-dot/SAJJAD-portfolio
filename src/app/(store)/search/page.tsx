import { searchProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/store";
import { ProductCard } from "@/components/store/ProductCard";
import { SearchBox } from "@/components/store/SearchBox";

export const metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const [result, settings] = await Promise.all([searchProducts({ q }), getSettings()]);
  return (
    <div className="py-10">
      <h1 className="font-display text-4xl">Search</h1>
      <SearchBox initial={q} />
      {!q && <p className="mt-6 text-muted">Search AirPods, headphones, chargers...</p>}
      {q && result.products.length === 0 && (
        <div className="mt-16 text-center">
          <h2 className="text-2xl">No products found</h2>
          <p className="mt-2 text-muted">Try changing your search or filters.</p>
        </div>
      )}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {result.products.map((product) => (
          <ProductCard key={product.id} product={product} currency={settings.currency} />
        ))}
      </div>
    </div>
  );
}
