"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { addToCartAction, toggleWishlistAction } from "@/server/cart-actions";

export function AddToCartButton({
  productId,
  disabled,
  buyNow,
}: {
  productId: string;
  disabled?: boolean;
  buyNow?: boolean;
}) {
  const [pending, start] = useTransition();
  const [qty, setQty] = useState(1);

  return (
    <div className="flex flex-wrap gap-2">
      {!buyNow && (
        <label className="sr-only" htmlFor={`qty-${productId}`}>
          Quantity
        </label>
      )}
      {buyNow && (
        <input
          id={`qty-${productId}`}
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="w-20 rounded-full border border-border bg-transparent px-3 py-2"
        />
      )}
      <button
        disabled={disabled || pending}
        onClick={() =>
          start(async () => {
            const result = await addToCartAction(productId, buyNow ? qty : 1);
            if ("error" in result) toast.error(result.error);
            else {
              toast.success("Product added to cart");
              if (buyNow) window.location.href = "/checkout";
            }
          })
        }
        className="flex-1 rounded-full bg-text px-4 py-2.5 text-sm font-medium text-bg disabled:opacity-40"
      >
        {disabled ? "Out of Stock" : pending ? "Adding..." : buyNow ? "Buy now" : "Add to cart"}
      </button>
    </div>
  );
}

export function WishlistButton({ productId, signedIn }: { productId: string; signedIn: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() =>
        start(async () => {
          if (!signedIn) {
            window.location.href = "/login";
            return;
          }
          const result = await toggleWishlistAction(productId);
          toast.success(result.added ? "Added to wishlist" : "Removed from wishlist");
        })
      }
      className="rounded-full border border-border px-4 py-2.5 text-sm"
    >
      Wishlist
    </button>
  );
}
