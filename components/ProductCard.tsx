import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { discountPercent, formatMoney } from "@/lib/format";

export default function ProductCard({ product }: { product: Product }) {
  const discount = discountPercent(product.old_price, product.new_price);
  return (
    <article className={`product-card ${!product.in_stock ? "product-soldout" : ""}`}>
      <Link href={`/p/${product.slug}`} className="product-media">
        {!product.in_stock && <span className="card-stockout">Tugagan</span>}
        <Image src={product.image_url || "/brand/aloo-logo.png"} alt={product.name} width={420} height={420} />
      </Link>
      <div className="product-brand">{product.brand}</div>
      <h3><Link href={`/p/${product.slug}`}>{product.name}</Link></h3>
      <div className="price-row">
        <span className="price">{product.new_price > 0 ? formatMoney(product.new_price) : "Narx aniqlanmoqda"}</span>
        {product.old_price > product.new_price && product.new_price > 0 && <span className="old-price">{formatMoney(product.old_price)}</span>}
        {discount > 0 && <span className="discount">−{discount}%</span>}
      </div>
      <div className="installment">12 oy: <b>{product.installment_12 > 0 ? formatMoney(product.installment_12) : "—"}</b></div>
      <div className="card-actions"><Link href={`/p/${product.slug}`} className="btn btn-primary">{product.in_stock ? "Ko‘rish va buyurtma" : "Variantlarni ko‘rish"}</Link></div>
    </article>
  );
}
