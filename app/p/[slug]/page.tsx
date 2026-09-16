import { notFound } from "next/navigation";
import ProductVariantProvider from "@/components/ProductVariantProvider";
import ProductMobileFlow from "@/components/ProductMobileFlow";
import ViewTracker from "@/components/ViewTracker";
import { getProductBySlug, listProducts, listProductVariants } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const variants = listProductVariants(product.id, true);
  const related = listProducts(false)
    .filter(item => item.id !== product.id)
    .slice(0, 4)
    .map(item => ({ id: item.id, name: item.name, slug: item.slug, image_url: item.image_url, new_price: item.new_price }));

  return (
    <ProductVariantProvider variants={variants}>
      <ViewTracker productId={product.id} />
      <ProductMobileFlow product={product} related={related} />
    </ProductVariantProvider>
  );
}
