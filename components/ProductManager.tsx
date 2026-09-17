"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Star, Trash2, UploadCloud } from "lucide-react";
import type { Product } from "@/lib/types";
import { discountPercent, formatMoney } from "@/lib/format";

type Draft = {
  id?: number;
  name: string;
  brand: string;
  slug: string;
  image_url: string;
  image_urls: string[];
  recommended_for: string;
  description: string;
  old_price: number;
  new_price: number;
  installment_12: number;
  installment_24: number;
  active: boolean;
  featured: boolean;
  sort_order: number;
};

const emptyDraft: Draft = {
  name: "", brand: "", slug: "", image_url: "", image_urls: [], recommended_for: "", description: "",
  old_price: 0, new_price: 0, installment_12: 0, installment_24: 0,
  active: true, featured: true, sort_order: 0,
};

function productImages(product: Product) {
  const list = Array.isArray(product.image_urls) ? product.image_urls.filter(Boolean) : [];
  if (list.length) return list.slice(0, 3);
  return product.image_url ? [product.image_url] : [];
}

export default function ProductManager({ products, siteUrl }: { products: Product[]; siteUrl: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const discount = useMemo(() => discountPercent(draft.old_price, draft.new_price), [draft.old_price, draft.new_price]);

  function edit(p: Product) {
    const images = productImages(p);
    setDraft({
      id: p.id, name: p.name, brand: p.brand, slug: p.slug,
      image_url: images[0] || p.image_url || "", image_urls: images,
      recommended_for: p.recommended_for, description: p.description,
      old_price: p.old_price, new_price: p.new_price, installment_12: p.installment_12,
      installment_24: p.installment_24, active: !!p.active, featured: !!p.featured, sort_order: p.sort_order,
    });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save() {
    setSaving(true); setMessage("");
    const endpoint = draft.id ? `/api/products/${draft.id}` : "/api/products";
    const images = draft.image_urls.filter(Boolean).slice(0, 3);
    const payload = { ...draft, image_urls: images, image_url: images[0] || draft.image_url || "" };
    const res = await fetch(endpoint, {
      method: draft.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setMessage(data.error || "Xatolik");
    setMessage("Saqlandi");
    setDraft(emptyDraft);
    router.refresh();
  }

  async function upload(file: File | undefined, slot: number) {
    if (!file) return;
    setUploadingSlot(slot); setMessage("");
    const fd = new FormData(); fd.set("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploadingSlot(null);
    if (!res.ok) return setMessage(data.error || "Rasm yuklanmadi");
    setDraft(current => {
      const images = [...current.image_urls];
      images[slot] = data.url;
      const clean = images.filter(Boolean).slice(0, 3);
      return { ...current, image_urls: clean, image_url: clean[0] || "" };
    });
  }

  function removeImage(index: number) {
    setDraft(current => {
      const images = current.image_urls.filter((_, i) => i !== index);
      return { ...current, image_urls: images, image_url: images[0] || "" };
    });
  }

  function makePrimary(index: number) {
    setDraft(current => {
      if (!current.image_urls[index]) return current;
      const images = [...current.image_urls];
      const [chosen] = images.splice(index, 1);
      images.unshift(chosen);
      return { ...current, image_urls: images, image_url: chosen };
    });
  }

  async function remove(id: number, name: string) {
    if (!confirm(`${name} o‘chirilsinmi? Buyurtmalari ham o‘chadi.`)) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!res.ok) return alert("O‘chirib bo‘lmadi");
    router.refresh();
  }

  return <>
    <section className="admin-card" style={{marginTop:0}}>
      <div className="admin-title" style={{marginBottom:16}}>
        <div>
          <h1 style={{fontSize:24}}>{draft.id ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}</h1>
          <p>Mahsulot ma’lumotlari va 3 tagacha rasm PostgreSQL bazada saqlanadi.</p>
        </div>
        {draft.id && <button className="btn btn-secondary" onClick={() => { setDraft(emptyDraft); setMessage(""); }}>Yangi mahsulot</button>}
      </div>

      <div className="admin-form">
        <div className="field"><label>Mahsulot nomi</label><input value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} placeholder="Samsung A18 Lite" /></div>
        <div className="field"><label>Brend</label><input value={draft.brand} onChange={e=>setDraft({...draft,brand:e.target.value})} placeholder="Samsung" /></div>
        <div className="field"><label>Slug / QR havola</label><input value={draft.slug} onChange={e=>setDraft({...draft,slug:e.target.value})} placeholder="samsung-a18-lite" /></div>
        <div className="field"><label>Tartib raqami</label><input type="number" value={draft.sort_order} onChange={e=>setDraft({...draft,sort_order:Number(e.target.value)})} /></div>

        <div className="field wide">
          <label>Mahsulot rasmlari <span style={{color:"#8a94a3",fontWeight:600}}>(1–3 ta)</span></label>
          <div className="admin-gallery-editor">
            {[0,1,2].map(slot => {
              const src = draft.image_urls[slot];
              return <div className={`admin-image-slot ${slot === 0 && src ? "is-primary" : ""}`} key={slot}>
                {src ? <>
                  <div className="admin-image-preview"><Image src={src} alt={`Rasm ${slot+1}`} fill sizes="180px" /></div>
                  {slot === 0 ? <span className="admin-primary-pill"><Star size={13} fill="currentColor"/> Asosiy</span> : <button type="button" className="admin-image-action" onClick={()=>makePrimary(slot)}><Star size={14}/> Asosiy qilish</button>}
                  <button type="button" className="admin-image-remove" onClick={()=>removeImage(slot)} aria-label="Rasmni o‘chirish"><Trash2 size={16}/></button>
                </> : <label className="admin-image-empty">
                  {uploadingSlot === slot ? <span>Yuklanmoqda...</span> : <><ImagePlus size={28}/><strong>{slot === 0 ? "Asosiy rasm" : `${slot+1}-rasm`}</strong><span>PNG, JPG yoki WEBP</span></>}
                  <input type="file" accept="image/*" disabled={uploadingSlot !== null} onChange={e=>upload(e.target.files?.[0], slot)} />
                </label>}
                {src && <label className="admin-replace-image"><UploadCloud size={14}/> Almashtirish<input type="file" accept="image/*" disabled={uploadingSlot !== null} onChange={e=>upload(e.target.files?.[0], slot)} /></label>}
              </div>;
            })}
          </div>
          <p className="admin-field-help">Birinchi rasm mahsulot kartasi va buyurtma oynasida asosiy rasm bo‘ladi. Rasmlar Railway Postgres ichida saqlanadi.</p>
        </div>

        <div className="field wide"><label>Kimlar uchun tavsiya qilinadi?</label><textarea rows={3} value={draft.recommended_for} onChange={e=>setDraft({...draft,recommended_for:e.target.value})} placeholder="Masalan: kamera va batareyaga urg‘u beradigan foydalanuvchilar uchun..." /></div>
        <div className="field wide"><label>Qisqa tavsif</label><textarea rows={4} value={draft.description} onChange={e=>setDraft({...draft,description:e.target.value})} placeholder="Mahsulotning asosiy afzalliklari..." /></div>

        <div className="field"><label>Eski narxi</label><input type="number" min="0" value={draft.old_price} onChange={e=>setDraft({...draft,old_price:Number(e.target.value)})}/></div>
        <div className="field"><label>Yangi narxi</label><input type="number" min="0" value={draft.new_price} onChange={e=>setDraft({...draft,new_price:Number(e.target.value)})}/></div>
        <div className="field"><label>12 oylik to‘lov / oy</label><input type="number" min="0" value={draft.installment_12} onChange={e=>setDraft({...draft,installment_12:Number(e.target.value)})}/></div>
        <div className="field"><label>24 oylik to‘lov / oy</label><input type="number" min="0" value={draft.installment_24} onChange={e=>setDraft({...draft,installment_24:Number(e.target.value)})}/></div>

        <div className="field wide"><div className="inline">
          <span className="badge">Chegirma: {discount}%</span>
          <span><b>{formatMoney(draft.new_price)}</b> {draft.old_price > draft.new_price && <span className="old-price">{formatMoney(draft.old_price)}</span>}</span>
        </div></div>

        <div className="field wide"><div className="inline">
          <label className="toggle"><input type="checkbox" checked={draft.active} onChange={e=>setDraft({...draft,active:e.target.checked})}/> Saytda faol</label>
          <label className="toggle"><input type="checkbox" checked={draft.featured} onChange={e=>setDraft({...draft,featured:e.target.checked})}/> Top mahsulot</label>
        </div></div>
      </div>

      <div className="inline" style={{marginTop:16}}>
        <button className="btn btn-primary" onClick={save} disabled={saving || !draft.name || uploadingSlot !== null}>{saving ? "Saqlanmoqda..." : draft.id ? "O‘zgarishlarni saqlash" : "Mahsulot qo‘shish"}</button>
        {message && <span style={{fontWeight:800,color:message==="Saqlandi"?"#17833e":"#b42318"}}>{message}</span>}
      </div>
    </section>

    <section className="admin-card">
      <h2>Barcha mahsulotlar</h2>
      <div className="table-wrap"><table><thead><tr><th>Rasm</th><th>Mahsulot</th><th>Narx</th><th>12/24 oy</th><th>QR</th><th>Holat</th><th></th></tr></thead><tbody>
        {products.map(p => <tr key={p.id}>
          <td><div className="admin-product-thumbs">{productImages(p).slice(0,3).map((src,i)=><Image key={src+i} className="product-mini" src={src} alt="" width={50} height={50}/>)}</div></td>
          <td><b>{p.name}</b><div style={{color:"#7a8390",fontSize:11}}>{p.slug}</div><small style={{color:"#1690F5",fontWeight:800}}>{productImages(p).length} ta rasm</small></td>
          <td><b>{formatMoney(p.new_price)}</b><div className="old-price">{p.old_price ? formatMoney(p.old_price) : ""}</div></td>
          <td>{formatMoney(p.installment_12)}<br/><span style={{color:"#7a8390"}}>{formatMoney(p.installment_24)}</span></td>
          <td><div className="qr-admin-cell"><div className="qr-frame"><img className="qr-preview" src={`/api/qr/${p.slug}`} alt={`${p.name} QR`} width={116} height={116}/></div><div className="qr-meta"><span className="qr-badge">aloo QR</span><a className="btn btn-secondary" href={`/api/qr/${p.slug}`} download={`${p.slug}-qr.svg`}>SVG yuklash</a><div className="qr-link">{siteUrl}/p/{p.slug}</div></div></div></td>
          <td><div style={{display:"grid",gap:5}}><span className={`status ${p.active ? "status-completed" : "status-cancelled"}`}>{p.active ? "Faol" : "O‘chiq"}</span><span className={`status ${p.in_stock ? "status-completed" : "status-cancelled"}`}>{p.in_stock ? "Sotuvda" : "Tugagan"}</span>{p.json_managed ? <small style={{color:"#0878da",fontWeight:800}}>JSON</small> : null}</div></td>
          <td><div className="inline"><button className="btn btn-secondary" onClick={()=>edit(p)}>Tahrirlash</button><a className="btn btn-secondary" href={`/p/${p.slug}`} target="_blank">Ko‘rish</a><button className="btn btn-danger" onClick={()=>remove(p.id,p.name)}>O‘chirish</button></div></td>
        </tr>)}
      </tbody></table></div>
    </section>
  </>;
}
