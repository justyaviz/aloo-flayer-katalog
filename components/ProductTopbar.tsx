import Image from "next/image";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";

export default function ProductTopbar() {
  return (
    <header className="product-topbar">
      <div className="container product-topbar-inner">
        <Link href="/" className="product-topbar-logo" aria-label="aloo bosh sahifa">
          <Image src="/brand/aloo-logo.png" alt="aloo" width={150} height={64} priority />
        </Link>
        <div className="official-pill"><BadgeCheck size={16}/> Rasmiy katalog</div>
      </div>
    </header>
  );
}
