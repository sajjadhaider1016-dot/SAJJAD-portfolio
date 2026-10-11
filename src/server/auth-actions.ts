"use server";

import { createHash } from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  clearSession,
  createSession,
  getSession,
  hashPassword,
  requireUser,
  verifyPassword,
} from "@/lib/auth";
import { sendPasswordResetEmail, sendWelcomeEmail } from "@/lib/email";
import { rateLimit } from "@/lib/security";
import { loginSchema, registerSchema } from "@/lib/validators";
import { mergeGuestCart as mergeCart } from "@/lib/store";

function form(data: FormData) {
  return Object.fromEntries(data.entries());
}

export async function registerAction(data: FormData) {
  const parsed = registerSchema.safeParse(form(data));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid details" };
  const { name, email, password } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (exists) return { error: "An account with this email already exists." };
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash: await hashPassword(password),
    },
  });
  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    adminRole: user.adminRole,
  });
  await mergeCart(user.id);
  await sendWelcomeEmail(user.email, user.name);
  redirect("/account");
}

export async function loginAction(data: FormData) {
  const parsed = loginSchema.safeParse(form(data));
  if (!parsed.success) return { error: "Enter a valid email and password." };
  const limit = rateLimit(`login:${parsed.data.email.toLowerCase()}`, 8, 60_000);
  if (!limit.ok) return { error: "Too many attempts. Please wait a minute." };
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || !user.isActive) return { error: "Invalid email or password." };
  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) return { error: "Invalid email or password." };
  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    adminRole: user.adminRole,
  });
  await mergeCart(user.id);
  redirect(user.role === "ADMIN" ? "/admin" : "/account");
}

export async function adminLoginAction(data: FormData) {
  const parsed = loginSchema.safeParse(form(data));
  if (!parsed.success) return { error: "Enter a valid email and password." };
  const limit = rateLimit(`admin-login:${parsed.data.email.toLowerCase()}`, 6, 60_000);
  if (!limit.ok) return { error: "Too many attempts. Please wait a minute." };
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || user.role !== "ADMIN" || !user.isActive) return { error: "Invalid admin credentials." };
  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) return { error: "Invalid admin credentials." };
  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    adminRole: user.adminRole,
  });
  redirect("/admin");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

export async function forgotPasswordAction(data: FormData) {
  const email = String(data.get("email") || "").toLowerCase().trim();
  if (!email) return { error: "Enter your email." };
  const user = await prisma.user.findUnique({ where: { email } });
  const generic = { ok: true, message: "If an account exists, a reset link has been prepared." };
  if (!user) return generic;
  const raw = crypto.randomUUID() + crypto.randomUUID();
  const tokenHash = createHash("sha256").update(raw).digest("hex");
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const resetUrl = `${base}/reset-password?token=${raw}`;
  await sendPasswordResetEmail(user.email, resetUrl);
  if (process.env.NODE_ENV !== "production") {
    return { ...generic, resetUrl };
  }
  return generic;
}

export async function resetPasswordAction(data: FormData) {
  const token = String(data.get("token") || "");
  const password = String(data.get("password") || "");
  const confirm = String(data.get("confirmPassword") || "");
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { error: "This reset link is invalid or has expired." };
  }
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: await hashPassword(password) },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);
  redirect("/login");
}

export async function updateProfileAction(data: FormData): Promise<void> {
  const user = await requireUser();
  const name = String(data.get("name") || "").trim();
  const phone = String(data.get("phone") || "").trim();
  if (name.length < 2) return;
  await prisma.user.update({ where: { id: user.id }, data: { name, phone } });
}

export async function saveAddressAction(data: FormData): Promise<void> {
  const user = await requireUser();
  await prisma.address.create({
    data: {
      userId: user.id,
      fullName: String(data.get("fullName") || user.name),
      phone: String(data.get("phone") || ""),
      line1: String(data.get("line1") || ""),
      city: String(data.get("city") || ""),
      area: String(data.get("area") || ""),
      postalCode: String(data.get("postalCode") || ""),
      isDefault: true,
    },
  });
}

export { getSession };
