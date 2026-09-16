import { NextResponse } from "next/server";
import { createOrder, getProductById, listOrders } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const productId = Number(body.product_id);
    const name = String(body.customer_name || "").trim();
    const phone = String(body.phone || "").trim();
    if (!productId || !getProductById(productId)) return NextResponse.json({ error: "Mahsulot topilmadi" }, { status: 404 });
    if (name.length < 2) return NextResponse.json({ error: "Ismni kiriting" }, { status: 400 });
    if (!/^\+?[0-9\s()-]{7,20}$/.test(phone)) return NextResponse.json({ error: "Telefon raqamini to‘g‘ri kiriting" }, { status: 400 });
    const id = createOrder({
      product_id: productId,
      customer_name: name,
      phone,
      branch: String(body.branch || "").slice(0,120),
      comment: String(body.comment || "").slice(0,700)
    });
    return NextResponse.json({ ok: true, id });
  } catch {
    return NextResponse.json({ error: "Buyurtmani yuborib bo‘lmadi" }, { status: 500 });
  }
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(listOrders());
}
