import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Fayl topilmadi" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Faqat rasm yuklang" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Rasm 10 MB dan katta bo‘lmasin" }, { status: 400 });

  const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
  const filename = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
  const dir = path.join(process.env.DATA_DIR || path.join(process.cwd(), "data"), "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ ok: true, url: `/media/${filename}` });
}
