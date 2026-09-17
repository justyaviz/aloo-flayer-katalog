import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { analyzeCatalogJson } from "@/lib/catalog-import";
import { applyCatalogImport, listProducts } from "@/lib/db";

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const mode = body?.mode === "apply" ? "apply" : "preview";
    const payload = body?.payload;
    const products = await listProducts(true);
    const preview = analyzeCatalogJson(payload, products);

    if (!preview.totalRows) {
      return NextResponse.json({ error: "JSON ichida mahsulotlar ro‘yxati topilmadi" }, { status: 400 });
    }

    if (mode === "preview") return NextResponse.json({ ok: true, preview });

    const result = await applyCatalogImport(preview);
    return NextResponse.json({ ok: true, result, preview });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "JSON yangilashda xatolik" }, { status: 400 });
  }
}
