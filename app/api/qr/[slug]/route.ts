import { NextResponse } from "next/server";
import { getAnyProductBySlug } from "@/lib/db";
import { generateStyledQrSvg } from "@/lib/qr";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getAnyProductBySlug(slug);
  if (!product) return new NextResponse("Not found", { status: 404 });
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, "");
  const target = `${siteUrl}/p/${product.slug}`;
  const svg = generateStyledQrSvg(target);
  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": `inline; filename="${product.slug}-qr.svg"`,
      "Cache-Control": "no-store"
    }
  });
}
