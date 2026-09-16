import Image from "next/image";
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/"><Image className="logo" src="/brand/aloo-logo.png" alt="aloo" width={180} height={80} priority /></Link>
        <nav className="nav">
          <Link href="/#products">Smartfonlar</Link>
          <Link href="/#why">Qulayliklar</Link>
          <Link className="btn btn-primary" href="/#products">Mahsulotni tanlash</Link>
        </nav>
      </div>
    </header>
  );
}
