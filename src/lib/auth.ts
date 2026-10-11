import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { Role, type AdminRole } from "@prisma/client";
import { prisma } from "./db";

const COOKIE = "cv_session";
const GUEST_CART = "cv_cart";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  adminRole: AdminRole | null;
};

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not configured");
  return new TextEncoder().encode(value);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    adminRole: user.adminRole,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || !payload.email) return null;
    return {
      id: payload.sub,
      email: String(payload.email),
      name: String(payload.name ?? ""),
      role: payload.role === "ADMIN" ? Role.ADMIN : Role.CUSTOMER,
      adminRole: (payload.adminRole as AdminRole | null) ?? null,
    };
  } catch {
    return null;
  }
}

export async function requireUser() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function requireAdmin(permission?: "products" | "orders" | "customers" | "settings") {
  const session = await getSession();
  if (!session || session.role !== Role.ADMIN) throw new Error("FORBIDDEN");
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user?.isActive) throw new Error("FORBIDDEN");
  if (permission && session.adminRole && session.adminRole !== "SUPER_ADMIN") {
    const map: Record<string, AdminRole[]> = {
      products: ["SUPER_ADMIN", "MANAGER", "PRODUCT_MANAGER"],
      orders: ["SUPER_ADMIN", "MANAGER", "ORDER_MANAGER"],
      customers: ["SUPER_ADMIN", "MANAGER"],
      settings: ["SUPER_ADMIN"],
    };
    if (!map[permission].includes(session.adminRole)) throw new Error("FORBIDDEN");
  }
  return session;
}

export async function getGuestCartKey() {
  const jar = await cookies();
  let key = jar.get(GUEST_CART)?.value;
  if (!key) {
    key = crypto.randomUUID();
    jar.set(GUEST_CART, key, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return key;
}

export { COOKIE, GUEST_CART };
