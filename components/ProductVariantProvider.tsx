"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ProductVariant } from "@/lib/types";

type VariantContextValue = {
  variants: ProductVariant[];
  selected: ProductVariant | null;
  storage: string;
  color: string;
  storages: string[];
  colors: Array<{ name: string; hex: string; inStock: boolean }>;
  setStorage: (value: string) => void;
  setColor: (value: string) => void;
  hasVariants: boolean;
};

const Ctx = createContext<VariantContextValue | null>(null);

function cheapest(items: ProductVariant[]) {
  const priced = items.filter(v => v.new_price > 0);
  const pool = priced.length ? priced : items;
  return [...pool].sort((a, b) => (a.new_price || Number.MAX_SAFE_INTEGER) - (b.new_price || Number.MAX_SAFE_INTEGER))[0] || null;
}

export default function ProductVariantProvider({ variants, children }: { variants: ProductVariant[]; children: React.ReactNode }) {
  const available = variants.filter(v => v.active && v.stock_qty > 0);
  const initial = cheapest(available.length ? available : variants.filter(v => v.active));
  const [storage, setStorageState] = useState(initial?.storage || "");
  const [color, setColorState] = useState(initial?.color || "");

  const storages = useMemo(() => Array.from(new Set(variants.filter(v => v.active).map(v => v.storage))), [variants]);
  const variantsForStorage = useMemo(() => variants.filter(v => v.active && (!storage || v.storage === storage)), [variants, storage]);
  const colors = useMemo(() => {
    const map = new Map<string, { name: string; hex: string; inStock: boolean }>();
    for (const v of variantsForStorage) {
      const old = map.get(v.color);
      map.set(v.color, { name: v.color, hex: v.color_hex || "#DDE3EA", inStock: (old?.inStock || false) || v.stock_qty > 0 });
    }
    return [...map.values()];
  }, [variantsForStorage]);

  const selected = useMemo(() => {
    const exact = variants.find(v => v.active && v.storage === storage && v.color === color);
    if (exact) return exact;
    return cheapest(variantsForStorage.filter(v => v.stock_qty > 0)) || cheapest(variantsForStorage) || initial;
  }, [variants, variantsForStorage, storage, color, initial]);

  function setStorage(value: string) {
    setStorageState(value);
    const candidates = variants.filter(v => v.active && v.storage === value);
    const next = cheapest(candidates.filter(v => v.stock_qty > 0)) || cheapest(candidates);
    setColorState(next?.color || "");
  }

  function setColor(value: string) {
    setColorState(value);
  }

  return <Ctx.Provider value={{ variants, selected, storage, color, storages, colors, setStorage, setColor, hasVariants: variants.length > 0 }}>{children}</Ctx.Provider>;
}

export function useProductVariant() {
  const value = useContext(Ctx);
  if (!value) throw new Error("useProductVariant must be used inside ProductVariantProvider");
  return value;
}
