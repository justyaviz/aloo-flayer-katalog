import type { JsonImportPreview, Product } from "@/lib/types";

const COLOR_MAP: Array<{ names: string[]; label: string; hex: string }> = [
  { names: ["black", "черный", "чёрный", "qora", "midnight", "graphite"], label: "Black", hex: "#171717" },
  { names: ["blue", "синий", "голубой", "ko'k", "kok", "navy"], label: "Blue", hex: "#1690F5" },
  { names: ["grey", "gray", "серый", "kulrang", "graphite grey"], label: "Grey", hex: "#8B9098" },
  { names: ["white", "белый", "oq"], label: "White", hex: "#F2F4F7" },
  { names: ["green", "зеленый", "зелёный", "yashil", "mint"], label: "Green", hex: "#42A56B" },
  { names: ["purple", "фиолетовый", "binafsha", "violet", "lavender"], label: "Purple", hex: "#8B6BD6" },
  { names: ["gold", "golden", "золотой", "oltin"], label: "Gold", hex: "#D4AF67" },
  { names: ["silver", "серебристый", "kumush"], label: "Silver", hex: "#C4C9CF" },
  { names: ["orange", "оранжевый", "to'q sariq", "toq sariq"], label: "Orange", hex: "#FF8A35" },
  { names: ["pink", "розовый", "pushti"], label: "Pink", hex: "#E88AB8" },
  { names: ["red", "красный", "qizil"], label: "Red", hex: "#D84A4A" },
  { names: ["brown", "коричневый", "jigarrang"], label: "Brown", hex: "#795548" },
  { names: ["beige", "бежевый"], label: "Beige", hex: "#D6C3A5" },
];

function decodeHtml(value: string) {
  return value
    .replace(/&#x20;/gi, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .trim();
}

export function normalizeModelText(value: string) {
  let base = decodeHtml(value)
    .toLowerCase()
    .replace(/смартфон|smartfon|smartphone|телефон/gi, " ")
    .replace(/apple\s+(?=iphone)/gi, "");

  const memory = base.match(/\b(?:\d{1,2}\s*\/\s*\d{2,4}|64|128|256|512|1024)\s*(?:gb|гб)?\b/i);
  if (memory?.index !== undefined) base = base.slice(0, memory.index);

  for (const item of COLOR_MAP) {
    for (const color of item.names) {
      const escaped = color.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      base = base.replace(new RegExp(`\\b${escaped}\\b`, "gi"), " ");
    }
  }

  return base.replace(/[^a-zа-яё0-9]+/gi, "").trim();
}

function compact(value: string) {
  return decodeHtml(value).toLowerCase().replace(/[^a-zа-яё0-9]+/gi, "");
}

function pick(obj: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") return obj[key];
    const realKey = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
    if (realKey && obj[realKey] !== undefined && obj[realKey] !== null && obj[realKey] !== "") return obj[realKey];
  }
  return undefined;
}

function asNumber(value: unknown) {
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, value);
  if (typeof value !== "string") return 0;
  const cleaned = value.replace(/[^0-9.,-]/g, "").replace(/,/g, ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function extractRows(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload.filter(v => v && typeof v === "object") as Record<string, unknown>[];
  if (!payload || typeof payload !== "object") return [];
  const obj = payload as Record<string, unknown>;
  for (const key of ["products", "data", "items", "rows", "result", "товары", "mahsulotlar"]) {
    const value = obj[key];
    if (Array.isArray(value)) return value.filter(v => v && typeof v === "object") as Record<string, unknown>[];
  }
  const firstArray = Object.values(obj).find(Array.isArray);
  return Array.isArray(firstArray) ? firstArray.filter(v => v && typeof v === "object") as Record<string, unknown>[] : [];
}

function rowName(row: Record<string, unknown>) {
  const raw = pick(row, ["name", "title", "product_name", "product", "nomi", "Наименование", "Наименование товара", "Товар", "mahsulot"]);
  return decodeHtml(String(raw || "")).replace(/^#+\s*/, "").trim();
}

function extractStorage(name: string) {
  const ramStorage = name.match(/\b(\d{1,2})\s*\/\s*(\d{2,4})\s*(?:gb|гб)?\b/i);
  if (ramStorage) return `${ramStorage[1]}/${ramStorage[2]} GB`;
  const storage = name.match(/\b(64|128|256|512|1024)\s*(?:gb|гб)\b/i);
  if (storage) return `${storage[1]} GB`;
  return "Standart";
}

function extractColor(name: string) {
  const lower = decodeHtml(name).toLowerCase();
  const compactName = compact(name);
  const sorted = [...COLOR_MAP].sort((a, b) => Math.max(...b.names.map(n => n.length)) - Math.max(...a.names.map(n => n.length)));
  for (const item of sorted) {
    if (item.names.some(color => lower.includes(color.toLowerCase()) || compactName.includes(compact(color)))) {
      return { color: item.label, colorHex: item.hex };
    }
  }
  const afterMemory = name.replace(/^.*?\b\d{1,2}\s*\/\s*\d{2,4}\s*(?:GB|ГБ)?\b/i, "").trim();
  const tail = afterMemory.replace(/^[\s,;\-–—/]+/, "").trim();
  if (tail && tail.length <= 30) return { color: tail, colorHex: "#DDE3EA" };
  return { color: "Standart", colorHex: "#DDE3EA" };
}

const MODEL_ALIASES: Record<string, string[]> = {
  "samsung-a07s-lite": ["Samsung A07s Lite", "Samsung A07", "Samsung A075", "Samsung A075 A07"],
  "samsung-a18-lite": ["Samsung A18 Lite", "Samsung A18", "Samsung A17", "Samsung A175"],
  "honor-x8e": ["Honor X8e", "Honor X8d"],
  "redmi-note-15": ["Redmi Note 15", "Redmi 15C", "Xiaomi Redmi Note 15"],
};

function modelAliases(product: Product) {
  const name = normalizeModelText(product.name);
  const aliases = new Set([name]);
  for (const alias of MODEL_ALIASES[product.slug] || []) aliases.add(normalizeModelText(alias));
  if (product.brand) {
    const withoutBrand = normalizeModelText(product.name.replace(new RegExp(`^${product.brand}\\s+`, "i"), ""));
    if (withoutBrand && (withoutBrand.length >= 4 || /[a-zа-яё]/i.test(withoutBrand))) aliases.add(withoutBrand);
  }
  if (/iphone/i.test(product.name)) aliases.add(name.replace(/^apple/, ""));
  return [...aliases].filter(Boolean).sort((a, b) => b.length - a.length);
}

function findProduct(name: string, products: Product[]) {
  const normalized = normalizeModelText(name);
  if (!normalized) return undefined;
  const candidates = products
    .map(product => ({ product, aliases: modelAliases(product) }))
    .filter(item => item.aliases.some(alias => alias === normalized))
    .sort((a, b) => Math.max(...b.aliases.map(a => a.length)) - Math.max(...a.aliases.map(a => a.length)));
  return candidates[0]?.product;
}

export function analyzeCatalogJson(payload: unknown, products: Product[]): JsonImportPreview {
  const rows = extractRows(payload);
  const grouped = new Map<number, JsonImportPreview["products"][number]>();
  const ignored: JsonImportPreview["ignored"] = [];

  for (const row of rows) {
    const name = rowName(row);
    if (!name) {
      ignored.push({ name: "Nomsiz qator", reason: "Mahsulot nomi topilmadi" });
      continue;
    }
    const product = findProduct(name, products);
    if (!product) {
      ignored.push({ name, reason: "Saytdagi flyer mahsulotlariga mos kelmadi" });
      continue;
    }

    const { color, colorHex } = extractColor(name);
    const variant = {
      sourceName: name,
      storage: extractStorage(name),
      color,
      colorHex,
      oldPrice: asNumber(pick(row, ["old_price", "oldPrice", "original_price", "regular_price", "Старая цена", "Цена до скидки", "eski_narx"])) || product.old_price,
      newPrice: asNumber(pick(row, ["new_price", "newPrice", "price", "sale_price", "retail_price", "Цена", "Цена продажи", "narx", "sotuv_narxi"])),
      installment12: asNumber(pick(row, ["installment_12", "installment12", "monthly_12", "12_month", "12 oy", "12_oy", "12 мес", "12 месяцев"])) || product.installment_12,
      installment24: asNumber(pick(row, ["installment_24", "installment24", "monthly_24", "24_month", "24 oy", "24_oy", "24 мес", "24 месяцев"])) || product.installment_24,
      stockQty: asNumber(pick(row, ["stock", "stock_qty", "qty", "quantity", "balance", "available", "in_stock", "Остаток", "Остатки", "Остаток на складе", "Количество", "qoldiq", "qoldiq_soni"])),
    };

    const current = grouped.get(product.id) || { productId: product.id, productName: product.name, variants: [] };
    current.variants.push(variant);
    grouped.set(product.id, current);
  }

  const matchedIds = new Set(grouped.keys());
  const missingProducts = products.filter(p => !matchedIds.has(p.id)).map(p => p.name);
  const recognizedRows = [...grouped.values()].reduce((sum, p) => sum + p.variants.length, 0);

  return {
    totalRows: rows.length,
    recognizedRows,
    ignoredRows: ignored.length,
    matchedProducts: grouped.size,
    missingProducts,
    products: [...grouped.values()].sort((a, b) => a.productId - b.productId),
    ignored: ignored.slice(0, 100),
  };
}
