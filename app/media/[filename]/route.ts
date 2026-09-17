import { NextResponse } from "next/server";
import { getMediaFile } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  try {
    const file = await getMediaFile(filename);
    if (!file) return new NextResponse("Not found", { status: 404 });
    return new NextResponse(new Uint8Array(file.data), {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Length": String(file.size),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
