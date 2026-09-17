import { NextResponse } from "next/server";
import { createProduct, listProducts } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await listProducts(true));
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    if (!name) return NextResponse.json({ error: "Mahsulot nomi majburiy" }, { status: 400 });
    const id = await createProduct({
      name,
      brand: String(body.brand || "").trim(),
      slug: slugify(String(body.slug || name)),
      image_url: String(body.image_url || "").trim(),
      image_urls: Array.isArray(body.image_urls) ? body.image_urls.map((v: unknown) => String(v || "").trim()).filter(Boolean).slice(0, 3) : (body.image_url ? [String(body.image_url).trim()] : []),
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
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    const message = e instanceof Error && (e.message.includes("unique") || e.message.includes("duplicate key")) ? "Bu slug avval ishlatilgan" : "Mahsulot yaratilmadi";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
