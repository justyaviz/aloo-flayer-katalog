import crypto from "crypto";
import { NextResponse } from "next/server";
import { makeSession, sessionCookieName } from "@/lib/auth";

function safeEqual(a: string, b: string) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    const expectedUser = process.env.ADMIN_USERNAME || "admin";
    const expectedPass = process.env.ADMIN_PASSWORD;
    if (!expectedPass) return NextResponse.json({ error: "ADMIN_PASSWORD sozlanmagan" }, { status: 500 });
    if (!safeEqual(String(username || ""), expectedUser) || !safeEqual(String(password || ""), expectedPass)) {
      return NextResponse.json({ error: "Login yoki parol noto‘g‘ri" }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(sessionCookieName, makeSession(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 12
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Kirishda xatolik" }, { status: 400 });
  }
}
