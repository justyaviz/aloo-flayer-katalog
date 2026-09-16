import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ChevronLeft, CreditCard, ReceiptText, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import ProductTopbar from "@/components/ProductTopbar";
import SiteFooter from "@/components/SiteFooter";
import OrderForm from "@/components/OrderForm";
import ViewTracker from "@/components/ViewTracker";
import ProductVariantProvider from "@/components/ProductVariantProvider";
import VariantSelector from "@/components/VariantSelector";
import MobileBuyBar from "@/components/MobileBuyBar";
import { getProductBySlug, listProductVariants } from "@/lib/db";
import { discountPercent } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  const variants = listProductVariants(product.id, true);
  const discount = discountPercent(product.old_price, product.new_price);
  const supportPhone = (process.env.SUPPORT_PHONE || "").trim();

  return (
    <ProductVariantProvider variants={variants}>
      <ProductTopbar />
      <ViewTracker productId={product.id} />
      <main className="scan-product-page">
        <div className="container scan-shell">
          <Link href="/" className="back-link"><ChevronLeft size={17}/> Katalogga qaytish</Link>

          <section className="scan-hero">
            <div className="scan-media-card">
              {discount > 0 && <span className="floating-discount">−{discount}%</span>}
              {!product.in_stock && <span className="floating-stockout">Tugagan</span>}
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

              <VariantSelector fallback={{ old_price: product.old_price, new_price: product.new_price, installment_12: product.installment_12, installment_24: product.installment_24, in_stock: product.in_stock }} />

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
              <OrderForm productId={product.id} productName={product.name} fallbackInStock={product.in_stock} />
            </div>
          </section>
        </div>
      </main>

      <MobileBuyBar fallbackPrice={product.new_price} fallbackInStock={product.in_stock} supportPhone={supportPhone} />
      <SiteFooter />
    </ProductVariantProvider>
  );
}
