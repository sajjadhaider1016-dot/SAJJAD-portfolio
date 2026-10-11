"use client";

import Image from "next/image";
import { useTransition } from "react";
import { toast } from "sonner";
import { formatMoney, effectivePrice, toNumber } from "@/lib/utils";
import { removeCartItemAction, updateCartItemAction } from "@/server/cart-actions";

export function CartControls({
  items,
  currency,
}: {
  currency: string;
  items: {
    id: string;
    quantity: number;
    product: {
      name: string;
      stock: number;
      price: { toString(): string };
      salePrice?: { toString(): string } | null;
      images: { url: string }[];
    };
  }[];
}) {
  const [, start] = useTransition();
  return (
    <ul className="mt-8 divide-y divide-border">
      {items.map((item) => {
        const unit = effectivePrice(toNumber(item.product.price), item.product.salePrice ? toNumber(item.product.salePrice) : null);
        return (
          <li key={item.id} className="flex flex-wrap items-center gap-4 py-5">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-black">
              {item.product.images[0] && (
                <Image src={item.product.images[0].url} alt="" fill className="object-cover" unoptimized={item.product.images[0].url.endsWith(".svg")} />
              )}
            </div>
            <div className="min-w-40 flex-1">
              <p>{item.product.name}</p>
              <p className="text-sm text-muted">{formatMoney(unit, currency)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="h-10 w-10 rounded-full border border-border"
                aria-label="Decrease quantity"
                onClick={() =>
                  start(async () => {
                    const result = await updateCartItemAction(item.id, item.quantity - 1);
                    if (result.error) toast.error(result.error);
                  })
                }
              >
                -
              </button>
              <span>{item.quantity}</span>
              <button
                className="h-10 w-10 rounded-full border border-border"
                aria-label="Increase quantity"
                onClick={() =>
                  start(async () => {
                    const result = await updateCartItemAction(item.id, item.quantity + 1);
                    if (result.error) toast.error(result.error);
                  })
                }
              >
                +
              </button>
            </div>
            <p className="w-24 text-right">{formatMoney(unit * item.quantity, currency)}</p>
            <button
              className="text-sm text-muted"
              onClick={() =>
                start(async () => {
                  await removeCartItemAction(item.id);
                  toast.success("Item removed");
                })
              }
            >
              Remove
            </button>
          </li>
        );
      })}
    </ul>
  );
}
