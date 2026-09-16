import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import type { Order, Product } from "@/lib/types";

let dbInstance: Database.Database | null = null;

function dataDir() {
  const dir = process.env.DATA_DIR || path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function getDb() {
  if (dbInstance) return dbInstance;
  const db = new Database(path.join(dataDir(), "aloo-catalog.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT NOT NULL DEFAULT '',
      slug TEXT NOT NULL UNIQUE,
      image_url TEXT NOT NULL DEFAULT '',
      recommended_for TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      old_price INTEGER NOT NULL DEFAULT 0,
      new_price INTEGER NOT NULL DEFAULT 0,
      installment_12 INTEGER NOT NULL DEFAULT 0,
      installment_24 INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      featured INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      views INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      branch TEXT NOT NULL DEFAULT '',
      comment TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
    CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  `);

  const count = db.prepare("SELECT COUNT(*) as c FROM products").get() as { c: number };
  if (count.c === 0) seedProducts(db);

  dbInstance = db;
  return db;
}

function seedProducts(db: Database.Database) {
  const products = [
    ["Samsung A07", "Samsung", "samsung-a07", "/products/samsung-a07.png", 10],
    ["Redmi 15C", "Redmi", "redmi-15c", "/products/redmi-15c.png", 20],
    ["Honor X6e", "Honor", "honor-x6e", "/products/honor-x6e.png", 30],
    ["Tecno Spark 50", "Tecno", "tecno-spark-50", "/products/tecno-spark-50.png", 40],
    ["Samsung A17", "Samsung", "samsung-a17", "/products/samsung-a17.png", 50],
    ["Samsung A57", "Samsung", "samsung-a57", "/products/samsung-a57.png", 60],
    ["Honor X7e", "Honor", "honor-x7e", "/products/honor-x7e.png", 70],
    ["Honor X8d", "Honor", "honor-x8d", "/products/honor-x8d.png", 80],
    ["Honor X9d", "Honor", "honor-x9d", "/products/honor-x9d.png", 90],
    ["Redmi 17", "Redmi", "redmi-17", "/products/redmi-17.png", 100],
    ["Tecno Camon Slim", "Tecno", "tecno-camon-slim", "/products/tecno-camon-slim.png", 110],
    ["iPhone 17 Pro Max", "Apple", "iphone-17-pro-max", "/products/iphone-17-pro-max.png", 120]
  ];
  const stmt = db.prepare(`
    INSERT INTO products
      (name, brand, slug, image_url, recommended_for, description, old_price, new_price, installment_12, installment_24, active, featured, sort_order)
    VALUES
      (@name, @brand, @slug, @image_url, @recommended_for, @description, 0, 0, 0, 0, 1, 1, @sort_order)
  `);
  const tx = db.transaction(() => {
    for (const [name, brand, slug, image_url, sort_order] of products) {
      stmt.run({
        name,
        brand,
        slug,
        image_url,
        sort_order,
        recommended_for: "Narx va imkoniyat muvozanatini izlayotgan xaridorlar uchun.",
        description: "Mahsulot ma’lumotlarini admin panel orqali yangilang: tavsif, narxlar, muddatli to‘lov va tavsiya etiladigan auditoriya."
      });
    }
  });
  tx();
}

export function listProducts(includeInactive = false): Product[] {
  const db = getDb();
  const where = includeInactive ? "" : "WHERE active = 1";
  return db.prepare(`SELECT * FROM products ${where} ORDER BY sort_order ASC, id ASC`).all() as Product[];
}

export function getProductBySlug(slug: string): Product | undefined {
  return getDb().prepare("SELECT * FROM products WHERE slug = ? AND active = 1").get(slug) as Product | undefined;
}

export function getAnyProductBySlug(slug: string): Product | undefined {
  return getDb().prepare("SELECT * FROM products WHERE slug = ?").get(slug) as Product | undefined;
}

export function getProductById(id: number): Product | undefined {
  return getDb().prepare("SELECT * FROM products WHERE id = ?").get(id) as Product | undefined;
}

export function createProduct(input: Omit<Product, "id" | "views" | "created_at" | "updated_at">) {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO products
    (name, brand, slug, image_url, recommended_for, description, old_price, new_price, installment_12, installment_24, active, featured, sort_order)
    VALUES (@name, @brand, @slug, @image_url, @recommended_for, @description, @old_price, @new_price, @installment_12, @installment_24, @active, @featured, @sort_order)
  `).run(input);
  return Number(result.lastInsertRowid);
}

export function updateProduct(id: number, input: Partial<Product>) {
  const allowed = [
    "name", "brand", "slug", "image_url", "recommended_for", "description",
    "old_price", "new_price", "installment_12", "installment_24",
    "active", "featured", "sort_order"
  ];
  const entries = Object.entries(input).filter(([key]) => allowed.includes(key));
  if (!entries.length) return;
  const set = entries.map(([key]) => `${key} = @${key}`).join(", ");
  const params = Object.fromEntries(entries);
  getDb().prepare(`UPDATE products SET ${set}, updated_at = CURRENT_TIMESTAMP WHERE id = @id`).run({ id, ...params });
}

export function deleteProduct(id: number) {
  getDb().prepare("DELETE FROM products WHERE id = ?").run(id);
}

export function incrementProductView(id: number) {
  getDb().prepare("UPDATE products SET views = views + 1 WHERE id = ?").run(id);
}

export function createOrder(input: { product_id: number; customer_name: string; phone: string; branch?: string; comment?: string }) {
  const result = getDb().prepare(`
    INSERT INTO orders (product_id, customer_name, phone, branch, comment)
    VALUES (@product_id, @customer_name, @phone, @branch, @comment)
  `).run({ ...input, branch: input.branch || "", comment: input.comment || "" });
  return Number(result.lastInsertRowid);
}

export function listOrders(): Order[] {
  return getDb().prepare(`
    SELECT o.*, p.name as product_name
    FROM orders o JOIN products p ON p.id = o.product_id
    ORDER BY o.id DESC
  `).all() as Order[];
}

export function updateOrderStatus(id: number, status: Order["status"]) {
  getDb().prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
}

export function getDashboardStats() {
  const db = getDb();
  const products = db.prepare("SELECT COUNT(*) c FROM products").get() as { c: number };
  const active = db.prepare("SELECT COUNT(*) c FROM products WHERE active = 1").get() as { c: number };
  const orders = db.prepare("SELECT COUNT(*) c FROM orders").get() as { c: number };
  const newOrders = db.prepare("SELECT COUNT(*) c FROM orders WHERE status = 'new'").get() as { c: number };
  const views = db.prepare("SELECT COALESCE(SUM(views), 0) s FROM products").get() as { s: number };
  return { products: products.c, active: active.c, orders: orders.c, newOrders: newOrders.c, views: views.s };
}

export function getTopProducts() {
  return getDb().prepare(`
    SELECT p.id, p.name, p.slug, p.image_url, p.views,
           COUNT(o.id) as orders,
           CASE WHEN p.views > 0 THEN ROUND(COUNT(o.id) * 100.0 / p.views, 1) ELSE 0 END as conversion
    FROM products p
    LEFT JOIN orders o ON o.product_id = p.id
    GROUP BY p.id
    ORDER BY p.views DESC, orders DESC
    LIMIT 12
  `).all() as Array<{ id: number; name: string; slug: string; image_url: string; views: number; orders: number; conversion: number }>;
}
