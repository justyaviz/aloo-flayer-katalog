import { NextResponse } from "next/server";
import { checkDatabase } from "@/lib/db";
export async function GET() {
  try {
    const database = await checkDatabase();
    return NextResponse.json({ ok: true, service: "aloo-qr-catalog", version: "5.0.0", database: database.ok ? "postgres-connected" : "error", time: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ ok: false, service: "aloo-qr-catalog", version: "5.0.0", database: "disconnected", error: e instanceof Error ? e.message : "Database error", time: new Date().toISOString() }, { status: 503 });
  }
}
