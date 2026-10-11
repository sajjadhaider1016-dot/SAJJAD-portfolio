import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { productWhereActive } from "./store";

export async function searchSuggestions(q: string) {
  const query = q.trim();
  if (query.length < 2) return { products: [], categories: [] };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        ...productWhereActive(),
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
          { tags: { hasSome: [query.toLowerCase()] } },
        ],
      },
      select: { id: true, name: true, slug: true, sku: true },
      take: 6,
    }),
    prisma.category.findMany({
      where: { isActive: true, name: { contains: query, mode: "insensitive" } },
      select: { name: true, slug: true },
      take: 4,
    }),
  ]);

  return { products, categories };
}

export function searchWhere(q?: string): Prisma.ProductWhereInput | undefined {
  if (!q?.trim()) return undefined;
  const query = q.trim();
  return {
    OR: [
      { name: { contains: query, mode: "insensitive" } },
      { sku: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { shortDescription: { contains: query, mode: "insensitive" } },
      { brand: { contains: query, mode: "insensitive" } },
      { tags: { has: query.toLowerCase() } },
      { category: { name: { contains: query, mode: "insensitive" } } },
    ],
  };
}
