import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ChevronLeft, CreditCard, ReceiptText, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import ProductTopbar from "@/components/ProductTopbar";
import SiteFooter from "@/components/SiteFooter";
import OrderForm from "@/components/OrderForm";
import ViewTracker from "@/components/ViewTracker";
import { getProductBySlug } from "@/lib/db";
import { discountPercent, formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  const discount = discountPercent(product.old_price, product.new_price);
  const supportPhone = (process.env.SUPPORT_PHONE || "").trim();

  return (
    <>
      <ProductTopbar />
      <ViewTracker productId={product.id} />
      <main className="scan-product-page">
        <div className="container scan-shell">
          <Link href="/" className="back-link"><ChevronLeft size={17}/> Katalogga qaytish</Link>

          <section className="scan-hero">
            <div className="scan-media-card">
              {discount > 0 && <span className="floating-discount">−{discount}%</span>}
              <div className="scan-media-glow" />
              <Image
                className="scan-product-image"
                src={product.image_url || "/brand/aloo-logo.png"}
                alt={product.name}
                width={760}
                height={760}
                priority
              />
              <div className="care-ribbon">
                <div className="care-ribbon-icon"><ShieldCheck size={22}/></div>
                <div><small>Smartfon bilan</small><strong>1 000 000 so‘mlik aloocare himoyasi</strong></div>
              </div>
            </div>

            <div className="scan-info">
              <div className="scan-eyebrow"><BadgeCheck size={16}/> {product.brand} • Rasmiy mahsulot</div>
              <h1>{product.name}</h1>
              {product.description && <p className="scan-description">{product.description}</p>}

              <div className="scan-price-card">
                <div className="price-topline">
                  <span>Bugungi narx</span>
                  {discount > 0 && <b>−{discount}% chegirma</b>}
                </div>
                <div className="scan-price">{formatMoney(product.new_price)}</div>
                {product.old_price > product.new_price && <div className="scan-old-price">{formatMoney(product.old_price)}</div>}
              </div>

              <div className="scan-installments">
                <div className="scan-installment-card">
                  <span>12 oyga</span>
                  <strong>{formatMoney(product.installment_12)}</strong>
                  <small>har oy</small>
                </div>
                <div className="scan-installment-card featured-installment">
                  <span>24 oyga</span>
                  <strong>{formatMoney(product.installment_24)}</strong>
                  <small>har oy</small>
                </div>
              </div>

              <a href="#order" className="scan-primary-cta">Buyurtma berish <span>→</span></a>

              {product.recommended_for && (
                <div className="fit-card">
                  <div className="fit-icon"><Sparkles size={20}/></div>
                  <div><span>Kimlar uchun tavsiya qilinadi?</span><p>{product.recommended_for}</p></div>
                </div>
              )}
            </div>
          </section>

          <section className="benefit-section">
            <div className="benefit-head"><span>aloo afzalliklari</span><h2>Xaridingiz qulay va ishonchli</h2></div>
            <div className="benefit-grid">
              <article className="benefit-card benefit-care"><ShieldCheck/><div><strong>aloocare</strong><p>1 000 000 so‘mlik qo‘shimcha himoya voucheri.</p></div></article>
              <article className="benefit-card"><WalletCards/><div><strong>Plastik kartasiz nasiya</strong><p>Qulay shartlarda 12 yoki 24 oylik to‘lov.</p></div></article>
              <article className="benefit-card"><ReceiptText/><div><strong>Rasmiy chek va UZIMEI</strong><p>Rasmiy mahsulot va tasdiqlangan xarid.</p></div></article>
              <article className="benefit-card"><CreditCard/><div><strong>Paynet qulayligi</strong><p>1000+ xizmat va qo‘shimcha to‘lov imkoniyatlari.</p></div></article>
            </div>
          </section>

          <section id="order" className="premium-order-section">
            <div className="order-copy">
              <span className="order-kicker">Buyurtma</span>
              <h2>{product.name} sizni qiziqtirdimi?</h2>
              <p>Raqamingizni qoldiring. aloo jamoasi mahsulot mavjudligi, rang va to‘lov shartlari bo‘yicha siz bilan bog‘lanadi.</p>
              <div className="order-trust"><BadgeCheck size={17}/> Ma’lumotlaringiz faqat buyurtma bilan bog‘lanish uchun ishlatiladi.</div>
            </div>
            <div className="order-form-surface">
              <OrderForm productId={product.id} productName={product.name} />
            </div>
          </section>
        </div>
      </main>

      <div className="mobile-buybar">
        <div className="mobile-buybar-price"><small>Narx</small><strong>{formatMoney(product.new_price)}</strong></div>
        {supportPhone ? <a className="mobile-call" href={`tel:${supportPhone}`}>Qo‘ng‘iroq</a> : null}
        <a className="mobile-order" href="#order">Buyurtma</a>
      </div>
      <SiteFooter />
    </>
  );
}
