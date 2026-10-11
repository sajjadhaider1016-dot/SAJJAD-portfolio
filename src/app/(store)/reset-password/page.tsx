"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useTransition } from "react";
import { toast } from "sonner";
import { resetPasswordAction } from "@/server/auth-actions";
import { Field } from "@/components/store/AuthForm";

function ResetInner() {
  const token = useSearchParams().get("token") || "";
  const [pending, start] = useTransition();
  return (
    <form
      className="mx-auto max-w-md py-16"
      action={(data) =>
        start(async () => {
          const result = await resetPasswordAction(data);
          if (result?.error) toast.error(result.error);
        })
      }
    >
      <h1 className="font-display text-3xl">Reset password</h1>
      <input type="hidden" name="token" value={token} />
      <div className="mt-6 grid gap-4">
        <Field name="password" label="New password" type="password" required />
        <Field name="confirmPassword" label="Confirm password" type="password" required />
      </div>
      <button disabled={pending} className="mt-4 w-full rounded-full bg-text py-3 text-sm text-bg">
        Update password
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetInner />
    </Suspense>
  );
}
