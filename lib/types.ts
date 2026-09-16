export type Product = {
  id: number;
  name: string;
  brand: string;
  slug: string;
  image_url: string;
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
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: number;
  product_id: number;
  product_name: string;
  customer_name: string;
  phone: string;
  branch: string;
  comment: string;
  status: "new" | "contacted" | "completed" | "cancelled";
  created_at: string;
};
