import { redirect } from "next/navigation";
import { getCart, getSettings } from "@/lib/store";
import { getSession } from "@/lib/auth";
import { effectivePrice, formatMoney, toNumber } from "@/lib/utils";
import { CheckoutForm } from "@/components/store/CheckoutForm";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const [cart, settings, session] = await Promise.all([getCart(), getSettings(), getSession()]);
  const items = cart?.items ?? [];
  if (!items.length) redirect("/cart");
  const subtotal = items.reduce((sum, item) => {
    const unit = effectivePrice(toNumber(item.product.price), item.product.salePrice ? toNumber(item.product.salePrice) : null);
    return sum + unit * item.quantity;
  }, 0);
  return (
    <div className="py-10">
      <h1 className="font-display text-4xl">Checkout</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <CheckoutForm
          email={session?.email || ""}
          name={session?.name || ""}
          payments={settings.payments}
          stripeConfigured={Boolean(process.env.STRIPE_SECRET_KEY)}
        />
        <aside className="h-fit rounded-3xl border border-border p-6">
          <h2 className="font-medium">Order</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span>
                  {item.product.name} × {item.quantity}
                </span>
                <span>
                  {formatMoney(
                    effectivePrice(toNumber(item.product.price), item.product.salePrice ? toNumber(item.product.salePrice) : null) *
                      item.quantity,
                    settings.currency,
                  )}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between text-sm"><span>Subtotal</span><span>{formatMoney(subtotal, settings.currency)}</span></p>
          <p className="mt-2 text-xs text-muted">Shipping and discounts are calculated when you place the order.</p>
        </aside>
      </div>
    </div>
  );
}
