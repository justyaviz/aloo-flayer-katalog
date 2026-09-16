"use client";
import { useProductVariant } from "@/components/ProductVariantProvider";
import { formatMoney } from "@/lib/format";

export default function MobileBuyBar({ fallbackPrice, fallbackInStock, supportPhone }: { fallbackPrice: number; fallbackInStock: number; supportPhone: string }) {
  const { selected } = useProductVariant();
  const price = selected?.new_price || fallbackPrice;
  const inStock = selected ? selected.stock_qty > 0 : !!fallbackInStock;
  return <div className="mobile-buybar">
    <div className="mobile-buybar-price"><small>Narx</small><strong>{price > 0 ? formatMoney(price) : "—"}</strong></div>
    {supportPhone ? <a className="mobile-call" href={`tel:${supportPhone}`}>Qo‘ng‘iroq</a> : null}
    {inStock ? <a className="mobile-order" href="#order">Buyurtma</a> : <span className="mobile-order disabled">Tugagan</span>}
  </div>;
}
