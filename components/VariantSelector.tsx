"use client";

import { Check, HardDrive, Palette, PackageCheck, PackageX } from "lucide-react";
import { useProductVariant } from "@/components/ProductVariantProvider";
import { discountPercent, formatMoney } from "@/lib/format";

export default function VariantSelector({ fallback }: { fallback: { old_price: number; new_price: number; installment_12: number; installment_24: number; in_stock: number } }) {
  const { selected, storage, color, storages, colors, setStorage, setColor, hasVariants } = useProductVariant();
  const current = selected || {
    old_price: fallback.old_price,
    new_price: fallback.new_price,
    installment_12: fallback.installment_12,
    installment_24: fallback.installment_24,
    stock_qty: fallback.in_stock ? 1 : 0,
  };
  const discount = discountPercent(current.old_price, current.new_price);
  const inStock = current.stock_qty > 0;

  return <>
    {hasVariants && (
      <div className="variant-configurator">
        {storages.length > 0 && <div className="variant-group">
          <div className="variant-label"><HardDrive size={17}/><span>Xotira</span></div>
          <div className="storage-options">
            {storages.map(item => {
              const available = item === storage || true;
              return <button key={item} type="button" className={`storage-option ${storage === item ? "selected" : ""}`} onClick={() => setStorage(item)}>
                {item}{storage === item && <Check size={14}/>} 
              </button>;
            })}
          </div>
        </div>}

        {colors.length > 0 && <div className="variant-group">
          <div className="variant-label"><Palette size={17}/><span>Rang</span><b>{color}</b></div>
          <div className="color-options">
            {colors.map(item => <button key={item.name} type="button" title={item.inStock ? item.name : `${item.name} — tugagan`} disabled={!item.inStock} className={`color-option ${color === item.name ? "selected" : ""} ${!item.inStock ? "soldout" : ""}`} onClick={() => setColor(item.name)}>
              <span className="color-dot" style={{ background:item.hex }}/><span>{item.name}</span>{color === item.name && <Check size={14}/>} 
            </button>)}
          </div>
        </div>}
      </div>
    )}

    <div className={`stock-pill ${inStock ? "in" : "out"}`}>
      {inStock ? <><PackageCheck size={16}/> Sotuvda mavjud{selected ? ` • ${selected.stock_qty} dona` : ""}</> : <><PackageX size={16}/> Hozirda tugagan</>}
    </div>

    <div className="scan-price-card">
      <div className="price-topline"><span>Bugungi narx</span>{discount > 0 && <b>−{discount}% chegirma</b>}</div>
      <div className="scan-price">{current.new_price > 0 ? formatMoney(current.new_price) : "Narx aniqlanmoqda"}</div>
      {current.old_price > current.new_price && current.new_price > 0 && <div className="scan-old-price">{formatMoney(current.old_price)}</div>}
    </div>

    <div className="scan-installments">
      <div className="scan-installment-card"><span>12 oyga</span><strong>{current.installment_12 > 0 ? formatMoney(current.installment_12) : "—"}</strong><small>har oy</small></div>
      <div className="scan-installment-card featured-installment"><span>24 oyga</span><strong>{current.installment_24 > 0 ? formatMoney(current.installment_24) : "—"}</strong><small>har oy</small></div>
    </div>

    {inStock ? <a href="#order" className="scan-primary-cta">Buyurtma berish <span>→</span></a> : <button type="button" className="scan-primary-cta disabled" disabled>Tugagan</button>}
  </>;
}
