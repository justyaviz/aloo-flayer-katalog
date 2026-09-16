import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import type { JsonImportPreview, Order, Product, ProductVariant } from "@/lib/types";

let dbInstance: Database.Database | null = null;

function dataDir() {
  const dir = process.env.DATA_DIR || path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function hasColumn(db: Database.Database, table: string, column: string) {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  return rows.some(r => r.name === column);
}

function ensureSchema(db: Database.Database) {
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
      in_stock INTEGER NOT NULL DEFAULT 1,
      json_managed INTEGER NOT NULL DEFAULT 0,
      last_sync_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS product_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      source_name TEXT NOT NULL DEFAULT '',
      storage TEXT NOT NULL DEFAULT 'Standart',
      color TEXT NOT NULL DEFAULT 'Standart',
      color_hex TEXT NOT NULL DEFAULT '#DDE3EA',
      old_price INTEGER NOT NULL DEFAULT 0,
      new_price INTEGER NOT NULL DEFAULT 0,
      installment_12 INTEGER NOT NULL DEFAULT 0,
      installment_24 INTEGER NOT NULL DEFAULT 0,
      stock_qty INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      variant_id INTEGER,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      branch TEXT NOT NULL DEFAULT '',
      comment TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY(variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
    CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_variants_product_id ON product_variants(product_id);
    CREATE INDEX IF NOT EXISTS idx_variants_stock ON product_variants(product_id, stock_qty);
  `);

  if (!hasColumn(db, "products", "in_stock")) db.exec("ALTER TABLE products ADD COLUMN in_stock INTEGER NOT NULL DEFAULT 1");
  if (!hasColumn(db, "products", "json_managed")) db.exec("ALTER TABLE products ADD COLUMN json_managed INTEGER NOT NULL DEFAULT 0");
  if (!hasColumn(db, "products", "last_sync_at")) db.exec("ALTER TABLE products ADD COLUMN last_sync_at TEXT");
  if (!hasColumn(db, "orders", "variant_id")) db.exec("ALTER TABLE orders ADD COLUMN variant_id INTEGER");
}

function getDb() {
  if (dbInstance) return dbInstance;
  const db = new Database(path.join(dataDir(), "aloo-catalog.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  ensureSchema(db);

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
      (name, brand, slug, image_url, recommended_for, description, old_price, new_price, installment_12, installment_24, active, featured, sort_order, in_stock)
    VALUES
      (@name, @brand, @slug, @image_url, @recommended_for, @description, 0, 0, 0, 0, 1, 1, @sort_order, 1)
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

export function listProductVariants(productId: number, includeOutOfStock = true): ProductVariant[] {
  const where = includeOutOfStock ? "" : "AND stock_qty > 0";
  return getDb().prepare(`
    SELECT * FROM product_variants
    WHERE product_id = ? AND active = 1 ${where}
    ORDER BY CASE WHEN stock_qty > 0 THEN 0 ELSE 1 END, new_price ASC, storage ASC, color ASC
  `).all(productId) as ProductVariant[];
}

export function getVariantById(id: number): ProductVariant | undefined {
  return getDb().prepare("SELECT * FROM product_variants WHERE id = ?").get(id) as ProductVariant | undefined;
}

export function createProduct(input: Omit<Product, "id" | "views" | "created_at" | "updated_at" | "in_stock" | "json_managed" | "last_sync_at">) {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO products
    (name, brand, slug, image_url, recommended_for, description, old_price, new_price, installment_12, installment_24, active, featured, sort_order, in_stock)
    VALUES (@name, @brand, @slug, @image_url, @recommended_for, @description, @old_price, @new_price, @installment_12, @installment_24, @active, @featured, @sort_order, 1)
  `).run(input);
  return Number(result.lastInsertRowid);
}

export function updateProduct(id: number, input: Partial<Product>) {
  const allowed = [
    "name", "brand", "slug", "image_url", "recommended_for", "description",
    "old_price", "new_price", "installment_12", "installment_24",
    "active", "featured", "sort_order", "in_stock", "json_managed", "last_sync_at"
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

export function createOrder(input: { product_id: number; variant_id?: number | null; customer_name: string; phone: string; branch?: string; comment?: string }) {
  const result = getDb().prepare(`
    INSERT INTO orders (product_id, variant_id, customer_name, phone, branch, comment)
    VALUES (@product_id, @variant_id, @customer_name, @phone, @branch, @comment)
  `).run({ ...input, variant_id: input.variant_id || null, branch: input.branch || "", comment: input.comment || "" });
  return Number(result.lastInsertRowid);
}

export function listOrders(): Order[] {
  return getDb().prepare(`
    SELECT o.*, p.name as product_name, v.storage as variant_storage, v.color as variant_color
    FROM orders o
    JOIN products p ON p.id = o.product_id
    LEFT JOIN product_variants v ON v.id = o.variant_id
    ORDER BY o.id DESC
  `).all() as Order[];
}

export function updateOrderStatus(id: number, status: Order["status"]) {
  getDb().prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
}

export function applyCatalogImport(preview: JsonImportPreview) {
  const db = getDb();
  const now = new Date().toISOString();
  const clearVariants = db.prepare("DELETE FROM product_variants WHERE product_id = ?");
  const insertVariant = db.prepare(`
    INSERT INTO product_variants
      (product_id, source_name, storage, color, color_hex, old_price, new_price, installment_12, installment_24, stock_qty, active, updated_at)
    VALUES
      (@product_id, @source_name, @storage, @color, @color_hex, @old_price, @new_price, @installment_12, @installment_24, @stock_qty, 1, @updated_at)
  `);
  const setMissing = db.prepare(`
    UPDATE products
    SET json_managed = 1, in_stock = 0, last_sync_at = ?, updated_at = CURRENT_TIMESTAMP
  `);
  const updateSummary = db.prepare(`
    UPDATE products
    SET json_managed = 1,
        in_stock = @in_stock,
        old_price = @old_price,
        new_price = @new_price,
        installment_12 = @installment_12,
        installment_24 = @installment_24,
        last_sync_at = @last_sync_at,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);

  const tx = db.transaction(() => {
    setMissing.run(now);
    db.prepare("DELETE FROM product_variants").run();

    for (const item of preview.products) {
      const dedupe = new Map<string, typeof item.variants[number]>();
      for (const variant of item.variants) {
        const key = `${variant.storage.toLowerCase()}::${variant.color.toLowerCase()}`;
        const previous = dedupe.get(key);
        if (!previous || (variant.stockQty > previous.stockQty) || (variant.newPrice > 0 && variant.newPrice < previous.newPrice)) {
          dedupe.set(key, variant);
        }
      }
      for (const variant of dedupe.values()) {
        insertVariant.run({
          product_id: item.productId,
          source_name: variant.sourceName,
          storage: variant.storage,
          color: variant.color,
          color_hex: variant.colorHex,
          old_price: Math.round(variant.oldPrice),
          new_price: Math.round(variant.newPrice),
          installment_12: Math.round(variant.installment12),
          installment_24: Math.round(variant.installment24),
          stock_qty: Math.round(variant.stockQty),
          updated_at: now,
        });
      }

      const variants = [...dedupe.values()];
      const available = variants.filter(v => v.stockQty > 0);
      const cheapestPool = available.length ? available : variants;
      const cheapest = [...cheapestPool].filter(v => v.newPrice > 0).sort((a, b) => a.newPrice - b.newPrice)[0] || cheapestPool[0];
      updateSummary.run({
        id: item.productId,
        in_stock: available.length > 0 ? 1 : 0,
        old_price: Math.round(cheapest?.oldPrice || 0),
        new_price: Math.round(cheapest?.newPrice || 0),
        installment_12: Math.round(cheapest?.installment12 || 0),
        installment_24: Math.round(cheapest?.installment24 || 0),
        last_sync_at: now,
      });
    }
  });

  tx();
  return { syncedAt: now, products: preview.matchedProducts, variants: preview.recognizedRows, missing: preview.missingProducts.length };
}

export function getDashboardStats() {
  const db = getDb();
  const products = db.prepare("SELECT COUNT(*) c FROM products").get() as { c: number };
  const active = db.prepare("SELECT COUNT(*) c FROM products WHERE active = 1").get() as { c: number };
  const inStock = db.prepare("SELECT COUNT(*) c FROM products WHERE active = 1 AND in_stock = 1").get() as { c: number };
  const orders = db.prepare("SELECT COUNT(*) c FROM orders").get() as { c: number };
  const newOrders = db.prepare("SELECT COUNT(*) c FROM orders WHERE status = 'new'").get() as { c: number };
  const views = db.prepare("SELECT COALESCE(SUM(views), 0) s FROM products").get() as { s: number };
  return { products: products.c, active: active.c, inStock: inStock.c, orders: orders.c, newOrders: newOrders.c, views: views.s };
}

export function getTopProducts() {
  return getDb().prepare(`
    SELECT p.id, p.name, p.slug, p.image_url, p.views, p.in_stock,
           COUNT(o.id) as orders,
           CASE WHEN p.views > 0 THEN ROUND(COUNT(o.id) * 100.0 / p.views, 1) ELSE 0 END as conversion
    FROM products p
    LEFT JOIN orders o ON o.product_id = p.id
    GROUP BY p.id
    ORDER BY p.views DESC, orders DESC
    LIMIT 12
  `).all() as Array<{ id: number; name: string; slug: string; image_url: string; views: number; in_stock: number; orders: number; conversion: number }>;
}
