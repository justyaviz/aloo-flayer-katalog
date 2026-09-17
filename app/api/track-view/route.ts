import { NextResponse } from "next/server";
import { getProductById, incrementProductView } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { product_id } = await req.json();
    const id = Number(product_id);
    if (!id || !(await getProductById(id))) return NextResponse.json({ ok: false }, { status: 404 });
    await incrementProductView(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
