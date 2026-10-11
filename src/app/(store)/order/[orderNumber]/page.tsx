import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/store";
import { formatMoney, toNumber } from "@/lib/utils";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const { orderNumber } = await params;
  const { placed } = await searchParams;
  const session = await getSession();
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, payment: true },
  });
  if (!order) notFound();
  if (session && order.userId && order.userId !== session.id && session.role !== "ADMIN") notFound();
  const settings = await getSettings();

  return (
    <div className="py-10">
      {placed && <p className="mb-4 rounded-2xl border border-success/30 bg-success/10 p-4">Order placed successfully</p>}
      <h1 className="font-display text-4xl">{order.orderNumber}</h1>
      <p className="mt-2 text-muted">
        Status: {order.status} · Payment: {order.paymentStatus} · {order.paymentMethod}
      </p>
      <ul className="mt-8 divide-y divide-border rounded-3xl border border-border">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between px-4 py-3 text-sm">
            <span>{item.name} × {item.quantity}</span>
            <span>{formatMoney(toNumber(item.price) * item.quantity, settings.currency)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 max-w-sm space-y-2 text-sm">
        <p className="flex justify-between"><span>Subtotal</span><span>{formatMoney(toNumber(order.subtotal), settings.currency)}</span></p>
        <p className="flex justify-between"><span>Shipping</span><span>{formatMoney(toNumber(order.shippingFee), settings.currency)}</span></p>
        <p className="flex justify-between"><span>Discount</span><span>{formatMoney(toNumber(order.discount), settings.currency)}</span></p>
        <p className="flex justify-between text-lg"><span>Total</span><span>{formatMoney(toNumber(order.total), settings.currency)}</span></p>
      </div>
      <p className="mt-6 text-sm text-muted">{order.fullName}<br />{order.address}, {order.city}</p>
      <Link href="/shop" className="mt-8 inline-block text-sm">Continue shopping</Link>
    </div>
  );
}
