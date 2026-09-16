"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Gift,
  Heart,
  Menu,
  PackageCheck,
  ReceiptText,
  Search,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Truck,
  User,
  Phone,
  MapPin,
  WalletCards,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { useProductVariant } from "@/components/ProductVariantProvider";
import { discountPercent, formatMoney } from "@/lib/format";

type RelatedProduct = Pick<Product, "id" | "name" | "slug" | "image_url" | "new_price">;
type PayPlan = "full" | "12" | "24";

function scrollTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function ProductMobileFlow({
  product,
  related,
}: {
  product: Product;
  related: RelatedProduct[];
}) {
  const {
    variants,
    selected,
    storage,
    color,
    storages,
    colors,
    setStorage,
    setColor,
    hasVariants,
  } = useProductVariant();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [payPlan, setPayPlan] = useState<PayPlan>("full");
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");

  const current = selected || {
    id: null,
    storage: "",
    color: "",
    old_price: product.old_price,
    new_price: product.new_price,
    installment_12: product.installment_12,
    installment_24: product.installment_24,
    stock_qty: product.in_stock ? 1 : 0,
  };

  const inStock = current.stock_qty > 0;
  const discount = discountPercent(current.old_price, current.new_price);

  const storagePrices = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of storages) {
      const pool = variants.filter(v => v.active && v.storage === s && v.stock_qty > 0 && v.new_price > 0);
      const fallback = variants.filter(v => v.active && v.storage === s && v.new_price > 0);
      const arr = pool.length ? pool : fallback;
      const price = arr.length ? Math.min(...arr.map(v => v.new_price)) : 0;
      map.set(s, price);
    }
    return map;
  }, [storages, variants]);

  const cheapest = useMemo(() => {
    const available = variants.filter(v => v.active && v.stock_qty > 0 && v.new_price > 0);
    const fallback = variants.filter(v => v.active && v.new_price > 0);
    return [...(available.length ? available : fallback)].sort((a, b) => a.new_price - b.new_price)[0] || null;
  }, [variants]);

  const planPrice = payPlan === "12" ? current.installment_12 : payPlan === "24" ? current.installment_24 : current.new_price;
  const planLabel = payPlan === "12" ? "12 oy" : payPlan === "24" ? "24 oy" : "To‘liq to‘lov";

  function go(next: 1 | 2 | 3) {
    setStep(next);
    requestAnimationFrame(scrollTop);
  }

  async function shareProduct() {
    const payload = { title: product.name, text: `${product.name} — aloo`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(payload);
      else await navigator.clipboard.writeText(window.location.href);
    } catch {}
  }

  async function submitOrder(formData: FormData) {
    if (!inStock || loading) return;
    setLoading(true);
    setMessage("");
    try {
      const customerName = String(formData.get("customer_name") || "").trim();
      const phone = String(formData.get("phone") || "").trim();
      const branch = String(formData.get("branch") || "").trim();
      if (customerName.length < 2) throw new Error("Ism va familiyangizni kiriting.");
      if (phone.length < 7) throw new Error("Telefon raqamingizni tekshiring.");

      const details = [
        hasVariants && selected ? `Variant: ${selected.storage} / ${selected.color}` : "",
        `To‘lov usuli: ${planLabel}`,
      ].filter(Boolean).join(" • ");

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          variant_id: selected?.id || null,
          customer_name: customerName,
          phone,
          branch,
          comment: details,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Buyurtmani yuborib bo‘lmadi.");
      setDone(true);
      requestAnimationFrame(scrollTop);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }

  const Topbar = ({ back }: { back?: () => void }) => (
    <div className="aloo-mobile-topbar">
      <div className="aloo-top-left">
        {back ? (
          <button className="aloo-icon-btn" type="button" onClick={back} aria-label="Orqaga"><ChevronLeft size={24}/></button>
        ) : (
          <Link href="/" className="aloo-icon-btn" aria-label="Katalog"><Menu size={22}/></Link>
        )}
        <Image src="/brand/aloo-logo.png" alt="aloo" width={120} height={48} className="aloo-flow-logo" priority />
      </div>
      <div className="aloo-top-actions">
        <Link href="/" className="aloo-icon-btn" aria-label="Qidirish"><Search size={21}/></Link>
        <button className="aloo-icon-btn" type="button" onClick={() => go(3)} aria-label="Buyurtma"><ShoppingBag size={21}/></button>
      </div>
    </div>
  );

  if (done) {
    return (
      <main className="aloo-flow-page">
        <div className="aloo-flow-shell aloo-success-screen">
          <Topbar back={() => go(1)} />
          <div className="aloo-success-icon"><Check size={38}/></div>
          <span className="aloo-overline">Buyurtma qabul qilindi</span>
          <h1>Rahmat!</h1>
          <p>{product.name} bo‘yicha so‘rovingiz qabul qilindi. aloo jamoasi tez orada siz bilan bog‘lanadi.</p>
          <div className="aloo-order-summary-card">
            <Image src={product.image_url || "/brand/aloo-logo.png"} alt={product.name} width={76} height={76}/>
            <div><strong>{product.name}</strong><span>{storage || ""}{storage && color ? " • " : ""}{color || ""}</span><b>{formatMoney(current.new_price)}</b></div>
          </div>
          <button type="button" className="aloo-primary-button" onClick={() => { setDone(false); go(1); }}>Mahsulotga qaytish <ChevronRight size={20}/></button>
        </div>
      </main>
    );
  }

  return (
    <main className="aloo-flow-page">
      <div className="aloo-flow-shell">
        {step === 1 && (
          <section className="aloo-flow-screen aloo-overview-screen">
            <Topbar />

            <div className="aloo-mini-nav">
              <Link href="/"><ChevronLeft size={15}/> Smartfonlar</Link>
              <div>
                <button type="button" onClick={() => setFavorite(v => !v)} className={favorite ? "active" : ""} aria-label="Sevimli"><Heart size={19} fill={favorite ? "#1690F5" : "none"}/></button>
                <button type="button" onClick={shareProduct} aria-label="Ulashish">↗</button>
              </div>
            </div>

            <div className="aloo-title-block">
              <span>{product.brand}</span>
              <h1>{product.name}</h1>
              <p>Yaxshi texnologiya yaqinroq.</p>
            </div>

            <div className="aloo-feature-strip">
              <div><BadgeCheck/><b>Rasmiy</b><span>UZIMEI</span></div>
              <div><ShieldCheck/><b>1 mln</b><span>aloocare</span></div>
              <div><WalletCards/><b>12/24 oy</b><span>Nasiya</span></div>
            </div>

            <div className="aloo-product-stage">
              {discount > 0 && <span className="aloo-best-price">Eng yaxshi narx</span>}
              {!inStock && <span className="aloo-stock-badge out">Tugagan</span>}
              <Image src={product.image_url || "/brand/aloo-logo.png"} alt={product.name} width={620} height={720} priority />
              <div className="aloo-stage-dots"><i className="active"/><i/><i/><i/></div>
            </div>

            <div className="aloo-price-panel">
              <div className="aloo-price-meta">
                <div>
                  <small>Boshlang‘ich narx</small>
                  {current.old_price > current.new_price && current.new_price > 0 && <span>{formatMoney(current.old_price)}</span>}
                  <strong>{current.new_price > 0 ? formatMoney(current.new_price) : "Narx aniqlanmoqda"}</strong>
                </div>
                {discount > 0 && <em>−{discount}%</em>}
              </div>
              <div className="aloo-official-mark"><Image src="/brand/aloo-logo.png" alt="aloo" width={82} height={32}/><span>Rasmiy savdo</span></div>
            </div>

            <div className="aloo-care-inline"><Gift size={23}/><div><strong>aloocare — 1 000 000 so‘m</strong><span>Himoya voucheri smartfon xaridiga qo‘shimcha xotirjamlik beradi.</span></div></div>

            <button type="button" className="aloo-primary-button" disabled={!inStock} onClick={() => go(2)}>
              {inStock ? <>Buyurtma berish <ChevronRight size={21}/></> : "Mahsulot tugagan"}
            </button>

            <div className="aloo-bottom-benefits">
              <div><Truck/><span>Qulay xarid</span></div>
              <div><ReceiptText/><span>Rasmiy chek</span></div>
              <div><ShieldCheck/><span>Rasmiy mahsulot</span></div>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="aloo-flow-screen aloo-options-screen">
            <Topbar back={() => go(1)} />
            <div className="aloo-options-heading"><h1>{product.name}</h1><p>{storage || "Variantni tanlang"}{color ? ` • ${color}` : ""}</p></div>

            {hasVariants && colors.length > 0 && (
              <div className="aloo-numbered-group">
                <div className="aloo-group-title"><span>1</span><h2>Rangni tanlang</h2></div>
                <div className="aloo-color-grid">
                  {colors.map(item => (
                    <button key={item.name} type="button" disabled={!item.inStock} className={`${color === item.name ? "selected" : ""} ${!item.inStock ? "soldout" : ""}`} onClick={() => setColor(item.name)}>
                      <i style={{ background: item.hex || "#dfe5ec" }}/>
                      <b>{item.name}</b>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasVariants && storages.length > 0 && (
              <div className="aloo-numbered-group">
                <div className="aloo-group-title"><span>2</span><h2>Xotira hajmini tanlang</h2></div>
                <div className="aloo-storage-grid">
                  {storages.map(item => (
                    <button key={item} type="button" className={storage === item ? "selected" : ""} onClick={() => setStorage(item)}>
                      <b>{item}</b>
                      <small>{storagePrices.get(item) ? formatMoney(storagePrices.get(item) || 0) : "—"}</small>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="aloo-numbered-group">
              <div className="aloo-group-title"><span>3</span><h2>To‘lov usulini tanlang</h2></div>
              <div className="aloo-payment-grid">
                <button type="button" className={payPlan === "full" ? "selected" : ""} onClick={() => setPayPlan("full")}>
                  <CreditCard/><span><b>To‘liq to‘lov</b><strong>{formatMoney(current.new_price)}</strong></span>{payPlan === "full" && <Check/>}
                </button>
                <button type="button" className={payPlan === "12" ? "selected" : ""} onClick={() => setPayPlan("12")} disabled={!current.installment_12}>
                  <span><b>12 oy</b><strong>{current.installment_12 ? `${formatMoney(current.installment_12)} / oy` : "—"}</strong></span>{payPlan === "12" && <Check/>}
                </button>
                <button type="button" className={payPlan === "24" ? "selected" : ""} onClick={() => setPayPlan("24")} disabled={!current.installment_24}>
                  <span><b>24 oy</b><strong>{current.installment_24 ? `${formatMoney(current.installment_24)} / oy` : "—"}</strong></span>{payPlan === "24" && <Check/>}
                </button>
              </div>
            </div>

            {cheapest && (
              <div className="aloo-cheapest-card">
                <span>Eng arzon variant</span>
                <Image src={product.image_url || "/brand/aloo-logo.png"} alt="" width={54} height={54}/>
                <div><b>{product.name} • {cheapest.storage} • {cheapest.color}</b><strong>{formatMoney(cheapest.new_price)}</strong><small>{cheapest.installment_24 ? `${formatMoney(cheapest.installment_24)} / oy • 24 oy` : "Eng arzon mavjud narx"}</small></div>
                <ChevronRight/>
              </div>
            )}

            {product.recommended_for && (
              <div className="aloo-recommend-note"><Smartphone size={20}/><div><strong>Kimlar uchun tavsiya qilinadi?</strong><p>{product.recommended_for}</p></div></div>
            )}

            {related.length > 0 && (
              <div className="aloo-related-block">
                <div><h3>Boshqa modellarga ham nazar tashlang</h3><Link href="/">Barchasi →</Link></div>
                <div className="aloo-related-grid">
                  {related.slice(0, 2).map(item => (
                    <Link key={item.id} href={`/p/${item.slug}`}>
                      <Image src={item.image_url || "/brand/aloo-logo.png"} alt={item.name} width={52} height={52}/>
                      <span><b>{item.name}</b><small>{item.new_price > 0 ? formatMoney(item.new_price) : "Narx aniqlanmoqda"}</small></span>
                      <ChevronRight size={17}/>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="aloo-options-footer">
              <div><small>{planLabel}</small><strong>{planPrice ? formatMoney(planPrice) : "—"}{payPlan !== "full" && planPrice ? " / oy" : ""}</strong></div>
              <button type="button" onClick={() => go(3)} disabled={!inStock}>Davom etish <ChevronRight size={20}/></button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="aloo-flow-screen aloo-checkout-screen">
            <Topbar back={() => go(2)} />
            <div className="aloo-secure-label"><ShieldCheck size={15}/> Xavfsiz buyurtma</div>
            <div className="aloo-progress">
              <div className="active"><span>1</span><b>Buyurtma</b></div><i/>
              <div><span>2</span><b>Tasdiqlash</b></div><i/>
              <div><span>3</span><b>Tugallandi</b></div>
            </div>

            <div className="aloo-order-summary-card">
              <Image src={product.image_url || "/brand/aloo-logo.png"} alt={product.name} width={72} height={72}/>
              <div><strong>{product.name}</strong><span>{storage || ""}{storage && color ? " • " : ""}{color || ""}</span><b>{formatMoney(current.new_price)}</b></div>
            </div>

            <form action={submitOrder} className="aloo-checkout-form">
              <h2>Kontakt ma’lumotlari</h2>
              <label><Phone size={20}/><input name="phone" required inputMode="tel" placeholder="+998 90 123 45 67"/></label>
              <label><User size={20}/><input name="customer_name" required minLength={2} placeholder="Ism va familiya"/></label>

              <h2>Qaysi filialga qulay?</h2>
              <label><MapPin size={20}/><input name="branch" list="aloo-branches" placeholder="Masalan: Qo‘qon"/></label>
              <datalist id="aloo-branches">
                <option value="Qo‘qon"/><option value="Chirchiq"/><option value="Angren"/><option value="Ohangaron"/><option value="Olmaliq"/><option value="Guliston"/><option value="Qibray"/><option value="Parkent"/><option value="G‘azalkent"/><option value="Chinoz"/><option value="Sho‘rchi"/><option value="Sherobod"/><option value="Jarqo‘rg‘on"/>
              </datalist>

              <div className="aloo-callback-card"><Phone/><div><strong>Biz sizga qo‘ng‘iroq qilamiz</strong><span>Buyurtmangizni tasdiqlash va tafsilotlarni aniqlash uchun siz bilan bog‘lanamiz.</span></div></div>

              <div className="aloo-checkout-total"><span>Tanlangan to‘lov</span><div><small>{planLabel}</small><strong>{planPrice ? formatMoney(planPrice) : "—"}{payPlan !== "full" && planPrice ? " / oy" : ""}</strong></div></div>

              {message && <div className="aloo-form-error">{message}</div>}
              <button className="aloo-primary-button" type="submit" disabled={loading || !inStock}>{loading ? "Yuborilmoqda..." : <>Buyurtmani yuborish <ChevronRight size={21}/></>}</button>
            </form>

            <div className="aloo-bottom-benefits checkout">
              <div><ShieldCheck/><span>Rasmiy mahsulot</span></div>
              <div><ReceiptText/><span>Rasmiy chek</span></div>
              <div><WalletCards/><span>Muddatli to‘lov</span></div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
