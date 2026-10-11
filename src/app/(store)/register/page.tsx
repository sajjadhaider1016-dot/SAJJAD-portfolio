import Link from "next/link";
import { AuthForm, Field } from "@/components/store/AuthForm";
import { registerAction } from "@/server/auth-actions";

export const metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <div className="py-16">
      <AuthForm action={registerAction} title="Create account" submit="Register">
        <Field name="name" label="Name" required />
        <Field name="email" label="Email" type="email" required />
        <Field name="password" label="Password" type="password" required />
        <Field name="confirmPassword" label="Confirm password" type="password" required />
      </AuthForm>
      <p className="mt-4 text-center text-sm text-muted">
        Already have an account? <Link href="/login">Login</Link>
      </p>
    </div>
  );
}
