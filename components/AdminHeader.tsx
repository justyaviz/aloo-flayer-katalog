import Image from "next/image";
import Link from "next/link";
export default function AdminHeader() {
  return <div className="admin-top"><div className="admin-top-inner">
    <div className="admin-logo"><Image src="/brand/aloo-logo.png" alt="aloo" width={130} height={60}/><span>QR Catalog Admin</span></div>
    <nav className="admin-tabs"><Link href="/admin">Dashboard</Link><Link href="/admin/products">Mahsulotlar</Link><Link href="/admin/orders">Buyurtmalar</Link><Link href="/" target="_blank">Saytni ko‘rish</Link></nav>
    <form action="/api/auth/logout" method="post"><button className="btn btn-secondary" type="submit">Chiqish</button></form>
  </div></div>;
}
