import Image from "next/image";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
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

  return (
    <>
      <SiteHeader />
      <ViewTracker productId={product.id} />
      <main className="product-page">
        <div className="container product-detail">
          <div className="product-image-box">
            <Image src={product.image_url || "/brand/aloo-logo.png"} alt={product.name} width={720} height={720} priority />
          </div>
          <section className="detail-panel">
            <div className="product-brand">{product.brand}</div>
            <h1>{product.name}</h1>
            <p className="detail-copy">{product.description}</p>

            <div className="price-row" style={{marginTop:20}}>
              {discount > 0 && <span className="discount">−{discount}% chegirma</span>}
            </div>
            <div className="price-big">{formatMoney(product.new_price)}</div>
            {product.old_price > product.new_price && <div className="old-big">Eski narx: {formatMoney(product.old_price)}</div>}

            <div className="monthly-grid">
              <div className="monthly"><small>12 oyga</small><strong>{formatMoney(product.installment_12)} / oy</strong></div>
              <div className="monthly"><small>24 oyga</small><strong>{formatMoney(product.installment_24)} / oy</strong></div>
            </div>

            <div className="recommend"><b>Kimlar uchun tavsiya qilinadi?</b><div style={{marginTop:6}}>{product.recommended_for}</div></div>

            <div className="trust-row" style={{gridTemplateColumns:"repeat(2,1fr)", marginTop:18}}>
              <div className="trust"><strong>1 000 000 so‘mlik aloocare</strong><p>Qo‘shimcha himoya voucheri.</p></div>
              <div className="trust"><strong>Rasmiy xarid</strong><p>Rasmiy chek va UZIMEI.</p></div>
            </div>

            <div className="order-box">
              <h2 style={{marginTop:0}}>Buyurtma bermoqchimisiz?</h2>
              <p className="detail-copy">Ma’lumotlaringizni qoldiring. aloo jamoasi siz bilan bog‘lanadi.</p>
              <OrderForm productId={product.id} productName={product.name} />
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
