"use client";
import { useEffect } from "react";

export default function ViewTracker({ productId }: { productId: number }) {
  useEffect(() => {
    const key = `aloo-view-${productId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    fetch("/api/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId })
    }).catch(() => {});
  }, [productId]);
  return null;
}
