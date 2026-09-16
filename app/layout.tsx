import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "aloo — smartfonlar katalogi",
  description: "aloo smartfonlari, narxlar, muddatli to‘lov va buyurtma."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uz">
      <body className={jakarta.className}>{children}</body>
    </html>
  );
}
