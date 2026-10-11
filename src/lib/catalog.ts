import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { productCardInclude, productWhereActive } from "./store";
import { toNumber, effectivePrice } from "./utils";
import { searchWhere } from "./search";

export type ShopQuery = {
  q?: string;
  category?: string;
  min?: string;
  max?: string;
  sort?: string;
  page?: string;
  inStock?: string;
  rating?: string;
  collection?: "new" | "best";
};

export async function searchProducts(query: ShopQuery) {
  const page = Math.max(1, Number(query.page || 1));
  const take = 12;
  const where: Prisma.ProductWhereInput = {
    ...productWhereActive(),
  };

  if (query.category) {
    where.category = { isActive: true, slug: query.category };
  }
  if (query.collection === "new") where.isNewArrival = true;
  if (query.collection === "best") where.isBestSeller = true;
  if (query.inStock === "1") where.stock = { gt: 0 };

  const text = searchWhere(query.q);
  if (text) Object.assign(where, text);

  const min = query.min ? Number(query.min) : undefined;
  const max = query.max ? Number(query.max) : undefined;
  const minRating = query.rating ? Number(query.rating) : undefined;

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    query.sort === "price-asc"
      ? { price: "asc" }
      : query.sort === "price-desc"
        ? { price: "desc" }
        : query.sort === "best"
          ? { soldCount: "desc" }
          : query.sort === "featured"
            ? { isFeatured: "desc" }
            : { createdAt: "desc" };

  const all = await prisma.product.findMany({
    where,
    include: { ...productCardInclude, category: true },
    orderBy,
  });

  const filtered = all.filter((product) => {
    const price = effectivePrice(toNumber(product.price), product.salePrice ? toNumber(product.salePrice) : null);
    if (min != null && Number.isFinite(min) && price < min) return false;
    if (max != null && Number.isFinite(max) && price > max) return false;
    if (minRating && Number.isFinite(minRating)) {
      if (!product.reviews.length) return false;
      const avg = product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length;
      if (avg < minRating) return false;
    }
    return true;
  });

  const start = (page - 1) * take;
  return {
    products: filtered.slice(start, start + take),
    total: filtered.length,
    page,
    pages: Math.max(1, Math.ceil(filtered.length / take)),
  };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, ...productWhereActive() },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      specs: { orderBy: { sortOrder: "asc" } },
      reviews: {
        where: { isApproved: true, isHidden: false },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getProductsByIds(ids: string[]) {
  if (!ids.length) return [];
  return prisma.product.findMany({
    where: { id: { in: ids }, ...productWhereActive() },
    include: { images: { orderBy: { sortOrder: "asc" } }, specs: true, variants: true, reviews: { where: { isApproved: true, isHidden: false } } },
  });
}
