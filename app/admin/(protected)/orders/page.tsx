import OrdersManager from "@/components/OrdersManager";
import { listOrders } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function OrdersPage() {
  const orders = await listOrders();
  return <main className="admin-main"><div className="admin-title"><div><h1>Buyurtmalar</h1><p>QR mahsulot sahifalaridan kelgan murojaatlar.</p></div></div><section className="admin-card" style={{marginTop:0}}>{orders.length ? <OrdersManager orders={orders}/> : <div className="empty">Hozircha buyurtma yo‘q.</div>}</section></main>;
}
