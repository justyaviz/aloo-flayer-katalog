import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { saveMediaFile } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Fayl topilmadi" }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Faqat rasm yuklang" }, { status: 400 });
    if (file.size > 12 * 1024 * 1024) return NextResponse.json({ error: "Rasm 12 MB dan katta bo‘lmasin" }, { status: 400 });
    const data = Buffer.from(await file.arrayBuffer());
    const saved = await saveMediaFile({ filename: file.name || "image", mimeType: file.type || "image/png", data });
    return NextResponse.json({ ok: true, url: saved.url, id: saved.id });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Rasm yuklanmadi" }, { status: 500 });
  }
}
