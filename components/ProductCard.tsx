import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { discountPercent, formatMoney } from "@/lib/format";

export default function ProductCard({ product }: { product: Product }) {
  const discount = discountPercent(product.old_price, product.new_price);
  return (
    <article className="product-card">
      <Link href={`/p/${product.slug}`} className="product-media">
        <Image src={product.image_url || "/brand/aloo-logo.png"} alt={product.name} width={420} height={420} />
      </Link>
      <div className="product-brand">{product.brand}</div>
      <h3><Link href={`/p/${product.slug}`}>{product.name}</Link></h3>
      <div className="price-row">
        <span className="price">{formatMoney(product.new_price)}</span>
        {product.old_price > product.new_price && <span className="old-price">{formatMoney(product.old_price)}</span>}
        {discount > 0 && <span className="discount">−{discount}%</span>}
      </div>
      <div className="installment">
        12 oy: <b>{formatMoney(product.installment_12)}</b>
      </div>
      <div className="card-actions">
        <Link href={`/p/${product.slug}`} className="btn btn-primary">Ko‘rish va buyurtma</Link>
      </div>
    </article>
  );
}
