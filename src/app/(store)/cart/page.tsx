import Link from "next/link";
import { getCart, getSettings } from "@/lib/store";
import { effectivePrice, formatMoney, toNumber } from "@/lib/utils";
import { CartControls } from "@/components/store/CartControls";

export const metadata = { title: "Cart" };

export default async function CartPage() {
  const [cart, settings] = await Promise.all([getCart(), getSettings()]);
  const items = cart?.items ?? [];
  if (!items.length) {
    return (
      <div className="py-24 text-center">
        <h1 className="font-display text-3xl">Your cart is empty</h1>
        <p className="mt-3 text-muted">Discover something you'll love.</p>
        <Link href="/shop" className="mt-6 inline-block rounded-full bg-text px-6 py-3 text-sm text-bg">
          Continue Shopping
        </Link>
      </div>
    );
  }
  const subtotal = items.reduce((sum, item) => {
    const unit = effectivePrice(toNumber(item.product.price), item.product.salePrice ? toNumber(item.product.salePrice) : null);
    return sum + unit * item.quantity;
  }, 0);
  const threshold = settings.freeShippingThreshold ? toNumber(settings.freeShippingThreshold) : null;
  const shipping = threshold != null && subtotal >= threshold ? 0 : toNumber(settings.shippingFee);
  const total = subtotal + shipping;

  return (
    <div className="py-10">
      <h1 className="font-display text-4xl">Cart</h1>
      <CartControls items={items} currency={settings.currency} />
      <div className="mt-8 max-w-md rounded-3xl border border-border p-6">
        <p className="flex justify-between"><span>Subtotal</span><span>{formatMoney(subtotal, settings.currency)}</span></p>
        <p className="mt-2 flex justify-between"><span>Shipping</span><span>{formatMoney(shipping, settings.currency)}</span></p>
        <p className="mt-4 flex justify-between text-lg font-medium"><span>Total</span><span>{formatMoney(total, settings.currency)}</span></p>
        <Link href="/checkout" className="mt-6 block rounded-full bg-text py-3 text-center text-sm text-bg">
          Checkout
        </Link>
      </div>
    </div>
  );
}
