import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "aloo_admin";

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === "production" && (!secret || secret.length < 32)) {
    throw new Error("SESSION_SECRET must be at least 32 characters in production.");
  }
  return secret || "dev-only-secret-change-before-production";
}

function sign(payload: string) {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function makeSession() {
  const expires = Date.now() + 1000 * 60 * 60 * 12;
  const payload = `admin:${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySession(token?: string | null) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  const [, expires] = payload.split(":");
  return Number(expires) > Date.now();
}

export async function isAdmin() {
  const store = await cookies();
  return verifySession(store.get(COOKIE)?.value);
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export const sessionCookieName = COOKIE;
