import Image from "next/image";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/AdminLoginForm";
import { isAdmin } from "@/lib/auth";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return <main className="login-page"><section className="login-card">
    <Image src="/brand/aloo-logo.png" alt="aloo" width={180} height={80} />
    <h1>Admin panel</h1>
    <p>Mahsulotlar, narxlar, QR kodlar va buyurtmalarni boshqaring.</p>
    <AdminLoginForm />
  </section></main>;
}
