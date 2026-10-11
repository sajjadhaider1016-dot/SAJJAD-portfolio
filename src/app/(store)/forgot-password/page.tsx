"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { forgotPasswordAction } from "@/server/auth-actions";
import { Field } from "@/components/store/AuthForm";

export default function ForgotPasswordPage() {
  const [pending, start] = useTransition();
  return (
    <form
      className="mx-auto max-w-md py-16"
      action={(data) =>
        start(async () => {
          const result = await forgotPasswordAction(data);
          if ("error" in result) toast.error(result.error);
          if ("message" in result) {
            toast.success(result.message);
            if ("resetUrl" in result && result.resetUrl) toast.message(result.resetUrl);
          }
        })
      }
    >
      <h1 className="font-display text-3xl">Forgot password</h1>
      <div className="mt-6">
        <Field name="email" label="Email" type="email" required />
      </div>
      <button disabled={pending} className="mt-4 w-full rounded-full bg-text py-3 text-sm text-bg">
        Send reset link
      </button>
    </form>
  );
}
