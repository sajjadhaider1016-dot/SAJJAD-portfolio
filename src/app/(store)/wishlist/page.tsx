import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/store";
import { ProductCard } from "@/components/store/ProductCard";
import { moveWishlistToCartFormAction, removeWishlistFormAction } from "@/server/cart-actions";

export const metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const [items, settings] = await Promise.all([
    prisma.wishlistItem.findMany({
      where: { userId: session.id },
      include: { product: { include: { images: true, reviews: { where: { isApproved: true, isHidden: false } } } } },
    }),
    getSettings(),
  ]);
  if (!items.length) {
    return (
      <div className="py-24 text-center">
        <h1 className="font-display text-3xl">Your wishlist is empty</h1>
        <Link href="/shop" className="mt-6 inline-block rounded-full bg-text px-6 py-3 text-sm text-bg">Continue Shopping</Link>
      </div>
    );
  }
  return (
    <div className="py-10">
      <h1 className="font-display text-4xl">Wishlist</h1>
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.id}>
            <ProductCard product={item.product} currency={settings.currency} />
            <form action={moveWishlistToCartFormAction.bind(null, item.productId)} className="mt-2">
              <button className="w-full rounded-full border border-border py-2 text-sm">Move to cart</button>
            </form>
            <form action={removeWishlistFormAction.bind(null, item.productId)} className="mt-2">
              <button className="w-full text-sm text-muted">Remove</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
