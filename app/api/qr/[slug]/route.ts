import QRCode from "qrcode";
import { NextResponse } from "next/server";
import { getAnyProductBySlug } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getAnyProductBySlug(slug);
  if (!product) return new NextResponse("Not found", { status: 404 });
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, "");
  const target = `${siteUrl}/p/${product.slug}`;
  const svg = await QRCode.toString(target, { type: "svg", errorCorrectionLevel: "H", margin: 1, color: { dark: "#000000", light: "#FFFFFF" } });
  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": `inline; filename="${product.slug}-qr.svg"`,
      "Cache-Control": "no-store"
    }
  });
}
