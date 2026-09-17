import Image from "next/image";
import { ShieldCheck, CreditCard, ReceiptText, WalletCards } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProductCard from "@/components/ProductCard";
import { listProducts } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await listProducts(false);
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <span className="badge">aloo • rasmiy smartfonlar katalogi</span>
              <h1>Smartfonni tanlang. <span>QR orqali tez buyurtma bering.</span></h1>
              <p>Flayerdagi QR kodni skaner qiling, mahsulot rasmi, amaldagi narx, chegirma, 12/24 oylik to‘lov va kimlar uchun mosligini bir sahifada ko‘ring.</p>
              <div className="inline" style={{marginTop:20}}>
                <a href="#products" className="btn btn-primary">Top smartfonlarni ko‘rish</a>
                <a href="#why" className="btn btn-secondary">aloo qulayliklari</a>
              </div>
            </div>
            <div className="hero-card" aria-hidden="true">
              <div className="phone-stack">
                {products.slice(0,2).map(p => <Image key={p.id} src={p.image_url} alt="" width={350} height={480} />)}
              </div>
            </div>
          </div>
        </section>

        <section id="products" className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <h2>Top smartfonlar</h2>
                <p>Narx va to‘lov ma’lumotlari admin paneldan boshqariladi.</p>
              </div>
            </div>
            <div className="product-grid">
              {products.map(product => <ProductCard product={product} key={product.id} />)}
            </div>
          </div>
        </section>

        <section id="why" className="section" style={{paddingTop:0}}>
          <div className="container">
            <div className="section-head"><div><h2>aloo’da xarid yanada qulay</h2><p>Asosiy xizmat va qulayliklar.</p></div></div>
            <div className="trust-row">
              <div className="trust"><ShieldCheck color="#1690F5"/><strong>aloocare</strong><p>Smartfonlar uchun 1 000 000 so‘mlik himoya voucheri.</p></div>
              <div className="trust"><WalletCards color="#1690F5"/><strong>Plastik kartasiz nasiya</strong><p>Qulay nasiya shartlari asosida xarid.</p></div>
              <div className="trust"><ReceiptText color="#1690F5"/><strong>Rasmiy mahsulot va chek</strong><p>Rasmiy savdo, chek va UZIMEI ishonchi.</p></div>
              <div className="trust"><CreditCard color="#1690F5"/><strong>Paynet</strong><p>1000+ xizmatlarga to‘lov va qo‘shimcha qulayliklar.</p></div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
