"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function ShopFilters({ categories }: { categories: { name: string; slug: string }[] }) {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.push(`/shop?${next.toString()}`);
  }

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <select
        defaultValue={params.get("category") || ""}
        onChange={(e) => update("category", e.target.value)}
        className="rounded-full border border-border bg-bg-elevated px-4 py-2 text-sm"
        aria-label="Filter by category"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
      <select
        defaultValue={params.get("sort") || "newest"}
        onChange={(e) => update("sort", e.target.value)}
        className="rounded-full border border-border bg-bg-elevated px-4 py-2 text-sm"
        aria-label="Sort products"
      >
        <option value="newest">Newest</option>
        <option value="price-asc">Price low to high</option>
        <option value="price-desc">Price high to low</option>
        <option value="best">Best selling</option>
        <option value="featured">Featured</option>
      </select>
      <input
        type="number"
        placeholder="Min price"
        defaultValue={params.get("min") || ""}
        onBlur={(e) => update("min", e.target.value)}
        className="w-28 rounded-full border border-border bg-bg-elevated px-4 py-2 text-sm"
        aria-label="Minimum price"
      />
      <input
        type="number"
        placeholder="Max price"
        defaultValue={params.get("max") || ""}
        onBlur={(e) => update("max", e.target.value)}
        className="w-28 rounded-full border border-border bg-bg-elevated px-4 py-2 text-sm"
        aria-label="Maximum price"
      />
    </div>
  );
}
