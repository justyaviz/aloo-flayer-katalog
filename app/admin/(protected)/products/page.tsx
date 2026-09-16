import ProductManager from "@/components/ProductManager";
import { listProducts } from "@/lib/db";
export const dynamic = "force-dynamic";
export default function ProductsPage() {
  const products = listProducts(true);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://catalog.aloo.uz").replace(/\/$/, "");
  return <main className="admin-main"><ProductManager products={products} siteUrl={siteUrl}/></main>;
}
