import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  const safe = path.basename(filename);
  const filePath = path.join(process.env.DATA_DIR || path.join(process.cwd(), "data"), "uploads", safe);
  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(safe).toLowerCase();
    const type = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : ext === ".webp" ? "image/webp" : ext === ".gif" ? "image/gif" : "image/png";
    return new NextResponse(data, { headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
