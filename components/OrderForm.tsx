"use client";

import { useState } from "react";
import { useProductVariant } from "@/components/ProductVariantProvider";

export default function OrderForm({ productId, productName, fallbackInStock }: { productId: number; productName: string; fallbackInStock: number }) {
  const { selected, hasVariants } = useProductVariant();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const inStock = selected ? selected.stock_qty > 0 : !!fallbackInStock;

  async function submit(formData: FormData) {
    if (!inStock) return setMessage({ type: "err", text: "Bu variant hozirda tugagan." });
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          variant_id: selected?.id || null,
          customer_name: String(formData.get("customer_name") || ""),
          phone: String(formData.get("phone") || ""),
          branch: String(formData.get("branch") || ""),
          comment: String(formData.get("comment") || "")
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xatolik yuz berdi");
      setMessage({ type: "ok", text: `Buyurtmangiz qabul qilindi. ${productName} bo‘yicha siz bilan bog‘lanamiz.` });
      const form = document.getElementById("order-form") as HTMLFormElement | null;
      form?.reset();
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : "Xatolik yuz berdi" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form id="order-form" action={submit} className="form-grid">
      {hasVariants && selected && <div className="selected-variant-summary"><small>Tanlangan variant</small><strong>{selected.storage} • {selected.color}</strong><span>{selected.stock_qty > 0 ? `${selected.stock_qty} dona mavjud` : "Tugagan"}</span></div>}
      <div className="field">
        <label>Ismingiz</label>
        <input name="customer_name" required minLength={2} placeholder="Ism" />
      </div>
      <div className="field">
        <label>Telefon raqamingiz</label>
        <input name="phone" required inputMode="tel" placeholder="+998 90 123 45 67" />
      </div>
      <div className="field">
        <label>Qulay filial yoki shahar</label>
        <input name="branch" placeholder="Masalan: Qo‘qon" />
      </div>
      <div className="field">
        <label>Izoh</label>
        <textarea name="comment" rows={3} placeholder="Savolingiz yoki qo‘shimcha izoh..." />
      </div>
      <button disabled={loading || !inStock} className="btn btn-primary" type="submit">
        {!inStock ? "Mahsulot tugagan" : loading ? "Yuborilmoqda..." : "Buyurtma berish"}
      </button>
      {message && <div className={`notice ${message.type === "ok" ? "notice-ok" : "notice-err"}`}>{message.text}</div>}
    </form>
  );
}
