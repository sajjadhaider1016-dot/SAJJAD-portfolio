"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { contactAction } from "@/server/content-actions";
import { Field } from "@/components/store/AuthForm";

export function ContactForm() {
  const [pending, start] = useTransition();
  return (
    <form
      className="mt-10 grid max-w-lg gap-4"
      action={(data) =>
        start(async () => {
          const result = await contactAction(data);
          if (result.error) toast.error(result.error);
          else toast.success(result.message);
        })
      }
    >
      <Field name="name" label="Name" required />
      <Field name="email" label="Email" type="email" required />
      <Field name="phone" label="Phone" />
      <label className="text-sm">
        Message
        <textarea name="message" required minLength={10} className="mt-1 min-h-32 w-full rounded-xl border border-border bg-bg-elevated p-3" />
      </label>
      <button disabled={pending} className="rounded-full bg-text py-3 text-sm text-bg">
        Send message
      </button>
    </form>
  );
}
