"use client";
import { useRouter } from "next/navigation";
import type { Order } from "@/lib/types";

const labels: Record<Order["status"], string> = { new:"Yangi", contacted:"Bog‘lanildi", completed:"Yakunlandi", cancelled:"Bekor qilindi" };

export default function OrdersManager({ orders }: { orders: Order[] }) {
  const router = useRouter();
  async function setStatus(id: number, status: Order["status"]) {
    await fetch(`/api/orders/${id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({status}) });
    router.refresh();
  }
  return <div className="table-wrap"><table><thead><tr><th>#</th><th>Mahsulot</th><th>Mijoz</th><th>Telefon</th><th>Filial/shahar</th><th>Izoh</th><th>Vaqt</th><th>Status</th></tr></thead><tbody>
    {orders.map(o => <tr key={o.id}><td>{o.id}</td><td><b>{o.product_name}</b>{o.variant_storage && <div style={{fontSize:11,color:"#667085",marginTop:4}}>{o.variant_storage}{o.variant_color ? ` • ${o.variant_color}` : ""}</div>}</td><td>{o.customer_name}</td><td><a href={`tel:${o.phone}`}>{o.phone}</a></td><td>{o.branch || "—"}</td><td style={{maxWidth:240}}>{o.comment || "—"}</td><td>{new Date(o.created_at + "Z").toLocaleString("uz-UZ")}</td><td><select value={o.status} onChange={e=>setStatus(o.id,e.target.value as Order["status"])} className={`status status-${o.status}`} style={{border:0}}><option value="new">Yangi</option><option value="contacted">Bog‘lanildi</option><option value="completed">Yakunlandi</option><option value="cancelled">Bekor qilindi</option></select><div style={{fontSize:10,color:"#7b8490",marginTop:4}}>{labels[o.status]}</div></td></tr>)}
  </tbody></table></div>;
}
