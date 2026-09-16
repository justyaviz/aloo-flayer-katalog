import Image from "next/image";
import Link from "next/link";
import { getDashboardStats, getTopProducts } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function AdminDashboard() {
  const s = getDashboardStats();
  const top = getTopProducts();
  return <main className="admin-main">
    <div className="admin-title"><div><h1>Dashboard</h1><p>QR skanlari va buyurtmalar bo‘yicha umumiy ko‘rsatkichlar.</p></div><Link className="btn btn-primary" href="/admin/products">Mahsulotlarni boshqarish</Link></div>
    <div className="stats">
      <div className="stat"><small>Mahsulotlar</small><strong>{s.products}</strong></div>
      <div className="stat"><small>Faol mahsulot</small><strong>{s.active}</strong></div><div className="stat"><small>Sotuvda mavjud</small><strong>{s.inStock}</strong></div>
      <div className="stat"><small>QR / sahifa ko‘rishlar</small><strong>{s.views}</strong></div>
      <div className="stat"><small>Buyurtmalar</small><strong>{s.orders}</strong></div>
      <div className="stat"><small>Yangi buyurtma</small><strong>{s.newOrders}</strong></div>
    </div>
    <section className="admin-card">
      <h2>Mahsulotlar samaradorligi</h2>
      <div className="table-wrap"><table><thead><tr><th>Mahsulot</th><th>Qoldiq</th><th>Ko‘rish</th><th>Buyurtma</th><th>Konversiya</th><th></th></tr></thead><tbody>
        {top.map(p => <tr key={p.id}><td><div className="inline"><Image className="product-mini" src={p.image_url} alt="" width={50} height={50}/><b>{p.name}</b></div></td><td><span className={`status ${p.in_stock ? "status-completed" : "status-cancelled"}`}>{p.in_stock ? "Mavjud" : "Tugagan"}</span></td><td>{p.views}</td><td>{p.orders}</td><td>{p.conversion}%</td><td><Link href={`/p/${p.slug}`} target="_blank">Sahifa ↗</Link></td></tr>)}
      </tbody></table></div>
    </section>
  </main>;
}
