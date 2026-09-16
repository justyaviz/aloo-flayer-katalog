import Link from "next/link";
export default function NotFound() {
  return <div className="login-page"><div className="login-card"><h1>Mahsulot topilmadi</h1><p>Havola eskirgan yoki mahsulot vaqtincha faol emas.</p><Link className="btn btn-primary" href="/">Katalogga qaytish</Link></div></div>;
}
