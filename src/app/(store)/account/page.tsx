import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatMoney, toNumber } from "@/lib/utils";
import { logoutAction, saveAddressAction, updateProfileAction } from "@/server/auth-actions";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const [user, orders, wishlist, addresses] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.id } }),
    prisma.order.findMany({ where: { userId: session.id }, orderBy: { createdAt: "desc" } }),
    prisma.wishlistItem.findMany({ where: { userId: session.id }, include: { product: { include: { images: true } } } }),
    prisma.address.findMany({ where: { userId: session.id } }),
  ]);
  if (!user) redirect("/login");

  return (
    <div className="py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Account</h1>
        <form action={logoutAction}>
          <button className="text-sm text-muted">Sign out</button>
        </form>
      </div>
      <section className="mt-8 grid gap-8 lg:grid-cols-2">
        <form action={updateProfileAction} className="rounded-3xl border border-border p-6">
          <h2 className="font-medium">Profile</h2>
          <label className="mt-4 block text-sm">Name<input name="name" defaultValue={user.name} className="mt-1 w-full rounded-xl border border-border bg-bg-elevated px-3 py-2" /></label>
          <label className="mt-4 block text-sm">Phone<input name="phone" defaultValue={user.phone || ""} className="mt-1 w-full rounded-xl border border-border bg-bg-elevated px-3 py-2" /></label>
          <p className="mt-3 text-sm text-muted">{user.email}</p>
          <button className="mt-4 rounded-full bg-text px-4 py-2 text-sm text-bg">Save profile</button>
        </form>
        <form action={saveAddressAction} className="rounded-3xl border border-border p-6">
          <h2 className="font-medium">Saved addresses</h2>
          {addresses.length === 0 && <p className="mt-3 text-sm text-muted">No addresses yet.</p>}
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {addresses.map((a) => (
              <li key={a.id}>{a.fullName}, {a.line1}, {a.city}</li>
            ))}
          </ul>
          <div className="mt-4 grid gap-2">
            <input name="fullName" placeholder="Full name" className="rounded-xl border border-border bg-bg-elevated px-3 py-2" />
            <input name="phone" placeholder="Phone" className="rounded-xl border border-border bg-bg-elevated px-3 py-2" />
            <input name="line1" placeholder="Address" className="rounded-xl border border-border bg-bg-elevated px-3 py-2" />
            <input name="city" placeholder="City" className="rounded-xl border border-border bg-bg-elevated px-3 py-2" />
            <input name="area" placeholder="Area" className="rounded-xl border border-border bg-bg-elevated px-3 py-2" />
            <input name="postalCode" placeholder="Postal code" className="rounded-xl border border-border bg-bg-elevated px-3 py-2" />
          </div>
          <button className="mt-4 rounded-full border border-border px-4 py-2 text-sm">Save address</button>
        </form>
      </section>
      <section className="mt-10">
        <h2 className="font-display text-2xl">Orders</h2>
        {orders.length === 0 ? (
          <p className="mt-4 text-muted">You haven&apos;t placed any orders yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {orders.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <Link href={`/order/${order.orderNumber}`} className="font-medium">{order.orderNumber}</Link>
                  <p className="text-sm text-muted">{order.status} · {order.paymentStatus}</p>
                </div>
                <p>{formatMoney(toNumber(order.total), "PKR")}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="mt-10">
        <h2 className="font-display text-2xl">Wishlist</h2>
        <p className="mt-2 text-sm"><Link href="/wishlist">Open wishlist</Link> · {wishlist.length} saved</p>
      </section>
    </div>
  );
}
