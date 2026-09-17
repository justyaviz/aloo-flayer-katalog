export type Product = {
  id: number;
  name: string;
  brand: string;
  slug: string;
  image_url: string;
  image_urls: string[];
  recommended_for: string;
  description: string;
  old_price: number;
  new_price: number;
  installment_12: number;
  installment_24: number;
  active: number;
  featured: number;
  sort_order: number;
  views: number;
  in_stock: number;
  json_managed: number;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductVariant = {
  id: number;
  product_id: number;
  source_name: string;
  storage: string;
  color: string;
  color_hex: string;
  old_price: number;
  new_price: number;
  installment_12: number;
  installment_24: number;
  stock_qty: number;
  active: number;
  updated_at: string;
};

export type Order = {
  id: number;
  product_id: number;
  product_name: string;
  variant_id: number | null;
  variant_storage: string | null;
  variant_color: string | null;
  customer_name: string;
  phone: string;
  branch: string;
  comment: string;
  status: "new" | "contacted" | "completed" | "cancelled";
  created_at: string;
};

export type JsonImportPreview = {
  totalRows: number;
  recognizedRows: number;
  ignoredRows: number;
  matchedProducts: number;
  missingProducts: string[];
  products: Array<{
    productId: number;
    productName: string;
    variants: Array<{
      sourceName: string;
      storage: string;
      color: string;
      colorHex: string;
      oldPrice: number;
      newPrice: number;
      installment12: number;
      installment24: number;
      stockQty: number;
    }>;
  }>;
  ignored: Array<{ name: string; reason: string }>;
};
