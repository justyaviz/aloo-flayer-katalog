import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ ok: true, service: "aloo-qr-catalog", version: "3.0.0", time: new Date().toISOString() });
}
