"use client";

import { useTransition } from "react";
import { toast } from "sonner";

export function AuthForm({
  action,
  title,
  submit,
  children,
}: {
  action: (data: FormData) => Promise<{ error?: string } | void>;
  title: string;
  submit: string;
  children: React.ReactNode;
}) {
  const [pending, start] = useTransition();
  return (
    <form
      className="mx-auto mt-8 grid max-w-md gap-4"
      action={(data) =>
        start(async () => {
          const result = await action(data);
          if (result?.error) toast.error(result.error);
        })
      }
    >
      <h1 className="font-display text-3xl">{title}</h1>
      {children}
      <button disabled={pending} className="rounded-full bg-text py-3 text-sm text-bg">
        {pending ? "Please wait..." : submit}
      </button>
    </form>
  );
}

export function Field({
  name,
  label,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="text-sm">
      {label}
      <input name={name} type={type} required={required} className="mt-1 w-full rounded-xl border border-border bg-bg-elevated px-3 py-2" />
    </label>
  );
}
