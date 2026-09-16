import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { updateOrderStatus } from "@/lib/db";
import type { Order } from "@/lib/types";

const statuses: Order["status"][] = ["new", "contacted", "completed", "cancelled"];

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const status = String(body.status) as Order["status"];
  if (!statuses.includes(status)) return NextResponse.json({ error: "Status noto‘g‘ri" }, { status: 400 });
  updateOrderStatus(Number(id), status);
  return NextResponse.json({ ok: true });
}
