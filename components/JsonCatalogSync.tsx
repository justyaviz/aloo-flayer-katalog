"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileJson, RefreshCw, TriangleAlert, UploadCloud } from "lucide-react";
import type { JsonImportPreview } from "@/lib/types";

type PreviewResponse = { ok: true; preview: JsonImportPreview };

export default function JsonCatalogSync() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [payload, setPayload] = useState<unknown>(null);
  const [preview, setPreview] = useState<JsonImportPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function request(mode: "preview" | "apply", data: unknown) {
    const res = await fetch("/api/admin/catalog-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, payload: data }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "Xatolik");
    return body as PreviewResponse & { result?: { syncedAt: string; products: number; variants: number; missing: number } };
  }

  async function readFile(file?: File) {
    if (!file) return;
    setMessage(null);
    setPreview(null);
    setFileName(file.name);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      setPayload(data);
      setLoading(true);
      const result = await request("preview", data);
      setPreview(result.preview);
    } catch (e) {
      setPayload(null);
      setMessage({ type: "err", text: e instanceof Error ? e.message : "JSON faylni o‘qib bo‘lmadi" });
    } finally {
      setLoading(false);
    }
  }

  async function apply() {
    if (!payload || !preview) return;
    if (!confirm("Narxlar va qoldiq JSON bo‘yicha yangilansinmi? JSONda yo‘q flyer mahsulotlari ‘Tugagan’ bo‘ladi.")) return;
    setLoading(true); setMessage(null);
    try {
      const result = await request("apply", payload);
      setMessage({ type: "ok", text: `Yangilandi: ${result.result?.products || 0} mahsulot, ${result.result?.variants || 0} variant. JSONda yo‘q: ${result.result?.missing || 0}.` });
      router.refresh();
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : "Yangilashda xatolik" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="admin-card json-sync-card">
      <div className="json-sync-head">
        <div>
          <span className="admin-kicker">JSON SYNC</span>
          <h2>Narx va qoldiqni yangilash</h2>
          <p>Umumiy smartfonlar JSON faylini yuklang. Tizim flyer’dagi modellarni avtomatik topadi, xotira va rang bo‘yicha variantlarga ajratadi.</p>
        </div>
        <div className="json-sync-icon"><FileJson size={28}/></div>
      </div>

      <div className="json-drop" onClick={() => inputRef.current?.click()}>
        <UploadCloud size={27}/>
        <div><strong>{fileName || "JSON faylni tanlang"}</strong><span>.json fayl • mahsulot nomi, narx va qoldiq</span></div>
        <button type="button" className="btn btn-secondary">Fayl tanlash</button>
        <input ref={inputRef} hidden type="file" accept="application/json,.json" onChange={e => readFile(e.target.files?.[0])}/>
      </div>

      {loading && <div className="sync-loading"><RefreshCw className="spin" size={17}/> Tahlil qilinmoqda...</div>}
      {message && <div className={`notice ${message.type === "ok" ? "notice-ok" : "notice-err"}`}>{message.text}</div>}

      {preview && !loading && (
        <div className="json-preview">
          <div className="json-stat-grid">
            <div><small>JSON qatorlari</small><strong>{preview.totalRows}</strong></div>
            <div><small>Flyerga mos</small><strong>{preview.recognizedRows}</strong></div>
            <div><small>Mahsulot</small><strong>{preview.matchedProducts}</strong></div>
            <div className={preview.missingProducts.length ? "warn" : "good"}><small>JSONda yo‘q</small><strong>{preview.missingProducts.length}</strong></div>
          </div>

          <div className="json-preview-grid">
            <div className="json-preview-block">
              <h3><CheckCircle2 size={18}/> Topilgan mahsulotlar</h3>
              <div className="sync-product-list">
                {preview.products.map(p => (
                  <div className="sync-product" key={p.productId}>
                    <div><b>{p.productName}</b><span>{p.variants.length} ta variant</span></div>
                    <div className="variant-mini-list">
                      {p.variants.slice(0, 6).map((v, i) => <span key={`${v.storage}-${v.color}-${i}`}>{v.storage} • {v.color} • {v.stockQty} dona</span>)}
                      {p.variants.length > 6 && <span>+{p.variants.length - 6} variant</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="json-preview-block">
              <h3><TriangleAlert size={18}/> JSONda topilmagan flyer mahsulotlari</h3>
              {preview.missingProducts.length ? (
                <div className="missing-list">{preview.missingProducts.map(name => <span key={name}>{name} <b>Tugagan bo‘ladi</b></span>)}</div>
              ) : <div className="all-found">Barcha flyer mahsulotlari JSON ichida topildi.</div>}
            </div>
          </div>

          <div className="json-sync-actions">
            <button className="btn btn-primary" onClick={apply}>Narx va qoldiqni yangilash</button>
            <span>Yangilashdan keyin eng arzon mavjud variant mahsulotning asosiy narxi bo‘ladi.</span>
          </div>
        </div>
      )}
    </section>
  );
}
