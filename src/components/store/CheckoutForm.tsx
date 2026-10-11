"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { checkoutAction, validateCoupon } from "@/server/checkout-actions";
import type { PaymentConfig } from "@/lib/payments";

const labels: Record<string, string> = {
  COD: "Cash on Delivery",
  BANK_TRANSFER: "Bank Transfer",
  EASYPAISA: "Easypaisa",
  JAZZCASH: "JazzCash",
  CARD: "Card",
};

export function CheckoutForm({
  email,
  name,
  payments,
  stripeConfigured,
}: {
  email: string;
  name: string;
  payments: PaymentConfig;
  stripeConfigured: boolean;
}) {
  const [pending, start] = useTransition();
  const [method, setMethod] = useState<"COD" | "BANK_TRANSFER" | "EASYPAISA" | "JAZZCASH" | "CARD">("COD");
  const [couponMsg, setCouponMsg] = useState("");

  const methods = Object.entries(payments.methods).filter(([key, value]) => {
    if (!value.enabled) return false;
    if (key === "CARD" && !stripeConfigured) return false;
    return true;
  });

  return (
    <form
      className="grid gap-4"
      action={(data) =>
        start(async () => {
          const result = await checkoutAction(data);
          if (result?.error) toast.error(result.error);
        })
      }
    >
      <h2 className="font-medium">Customer</h2>
      <Field name="fullName" label="Full name" defaultValue={name} required />
      <Field name="email" label="Email" type="email" defaultValue={email} required />
      <Field name="phone" label="Phone number" required />
      <h2 className="mt-4 font-medium">Delivery</h2>
      <Field name="address" label="Address" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="city" label="City" required />
        <Field name="area" label="Area" />
      </div>
      <Field name="postalCode" label="Postal code" />
      <label className="text-sm">
        Additional instructions
        <textarea name="instructions" className="mt-1 w-full rounded-xl border border-border bg-bg-elevated p-3" />
      </label>
      <h2 className="mt-4 font-medium">Payment</h2>
      <div className="grid gap-2">
        {methods.map(([key, value]) => (
          <label key={key} className="flex items-start gap-3 rounded-2xl border border-border p-4">
            <input type="radio" name="paymentMethod" value={key} checked={method === key} onChange={() => setMethod(key as typeof method)} />
            <span>
              <span className="block font-medium">{labels[key]}</span>
              <span className="text-sm text-muted">
                {key === "COD"
                  ? "Pay when your order arrives."
                  : "instructions" in value
                    ? value.instructions
                    : ""}
              </span>
            </span>
          </label>
        ))}
      </div>
      {method === "BANK_TRANSFER" && (
        <div className="rounded-2xl border border-border p-4 text-sm text-muted">
          <p>{payments.methods.BANK_TRANSFER.bankName || "Bank details are configured in store settings."}</p>
          <p>{payments.methods.BANK_TRANSFER.accountTitle}</p>
          <p>{payments.methods.BANK_TRANSFER.accountNumber}</p>
          <p>{payments.methods.BANK_TRANSFER.iban}</p>
        </div>
      )}
      <div className="flex gap-2">
        <input name="couponCode" placeholder="Coupon code" className="flex-1 rounded-full border border-border bg-bg-elevated px-4 py-2" />
        <button
          type="button"
          className="rounded-full border border-border px-4"
          onClick={async () => {
            const input = document.querySelector<HTMLInputElement>("input[name=couponCode]");
            const code = input?.value || "";
            const result = await validateCoupon(code, 1);
            setCouponMsg(result.error || "Coupon looks valid. It will be applied on submit.");
            if (result.error) toast.error(result.error);
            else toast.success("Coupon accepted");
          }}
        >
          Apply
        </button>
      </div>
      {couponMsg && <p className="text-sm text-muted">{couponMsg}</p>}
      <button disabled={pending} className="mt-4 rounded-full bg-text py-3 text-sm text-bg">
        {pending ? "Placing order..." : "Place order"}
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="text-sm">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-xl border border-border bg-bg-elevated px-3 py-2"
      />
    </label>
  );
}
