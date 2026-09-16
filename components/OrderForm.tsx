"use client";

import { useState } from "react";

export default function OrderForm({ productId, productName }: { productId: number; productName: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function submit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
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
        <textarea name="comment" rows={3} placeholder="Rang, xotira yoki boshqa savol..." />
      </div>
      <button disabled={loading} className="btn btn-primary" type="submit">
        {loading ? "Yuborilmoqda..." : "Buyurtma berish"}
      </button>
      {message && <div className={`notice ${message.type === "ok" ? "notice-ok" : "notice-err"}`}>{message.text}</div>}
    </form>
  );
}
