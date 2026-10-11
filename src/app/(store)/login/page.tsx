import Link from "next/link";
import { AuthForm, Field } from "@/components/store/AuthForm";
import { loginAction } from "@/server/auth-actions";

export const metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <div className="py-16">
      <AuthForm action={loginAction} title="Login" submit="Sign in">
        <Field name="email" label="Email" type="email" required />
        <Field name="password" label="Password" type="password" required />
      </AuthForm>
      <p className="mt-4 text-center text-sm text-muted">
        <Link href="/forgot-password">Forgot password?</Link> · <Link href="/register">Create account</Link>
      </p>
    </div>
  );
}
