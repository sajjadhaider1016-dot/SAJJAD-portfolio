import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  return (
    <div className="py-10">
      <h1 className="font-display text-4xl">Categories</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link key={c.id} href={`/categories/${c.slug}`} className="rounded-3xl border border-border p-8 hover:border-white/20">
            <h2 className="text-2xl">{c.name}</h2>
            <p className="mt-2 text-sm text-muted">{c.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
