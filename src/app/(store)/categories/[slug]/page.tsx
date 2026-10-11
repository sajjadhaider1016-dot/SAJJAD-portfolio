import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSettings, productWhereActive } from "@/lib/store";
import { ProductCard } from "@/components/store/ProductCard";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category || !category.isActive) notFound();
  const [products, settings] = await Promise.all([
    prisma.product.findMany({
      where: { ...productWhereActive(), categoryId: category.id },
      include: { images: { orderBy: { sortOrder: "asc" } }, reviews: { where: { isApproved: true, isHidden: false } } },
    }),
    getSettings(),
  ]);
  return (
    <div className="py-10">
      <h1 className="font-display text-4xl">{category.name}</h1>
      <p className="mt-2 text-muted">{category.description}</p>
      {products.length === 0 ? (
        <p className="mt-16 text-center text-muted">No products found</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} currency={settings.currency} />
          ))}
        </div>
      )}
    </div>
  );
}
