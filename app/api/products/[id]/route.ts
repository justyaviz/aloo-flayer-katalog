import { NextResponse } from "next/server";
import { deleteProduct, getProductById, updateProduct } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const productId = Number(id);
  if (!productId || !getProductById(productId)) return NextResponse.json({ error: "Mahsulot topilmadi" }, { status: 404 });
  try {
    const body = await req.json();
    updateProduct(productId, {
      name: String(body.name || "").trim(),
      brand: String(body.brand || "").trim(),
      slug: slugify(String(body.slug || body.name || "")),
      image_url: String(body.image_url || "").trim(),
      recommended_for: String(body.recommended_for || "").trim(),
      description: String(body.description || "").trim(),
      old_price: Math.max(0, Number(body.old_price) || 0),
      new_price: Math.max(0, Number(body.new_price) || 0),
      installment_12: Math.max(0, Number(body.installment_12) || 0),
      installment_24: Math.max(0, Number(body.installment_24) || 0),
      active: body.active ? 1 : 0,
      featured: body.featured ? 1 : 0,
      sort_order: Number(body.sort_order) || 0
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error && e.message.includes("UNIQUE") ? "Bu slug avval ishlatilgan" : "Mahsulot saqlanmadi";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const productId = Number(id);
  if (!productId || !getProductById(productId)) return NextResponse.json({ error: "Mahsulot topilmadi" }, { status: 404 });
  deleteProduct(productId);
  return NextResponse.json({ ok: true });
}
