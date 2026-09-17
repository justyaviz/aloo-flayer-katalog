import crypto from "crypto";
import { Pool, type PoolClient } from "pg";
import type { JsonImportPreview, Order, Product, ProductVariant } from "@/lib/types";

declare global {
  // eslint-disable-next-line no-var
  var __alooPgPool: Pool | undefined;
}

function makePool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL sozlanmagan. Railway Postgres DATABASE_URL ni ulang.");
  return new Pool({ connectionString, max: 10, idleTimeoutMillis: 30_000, connectionTimeoutMillis: 10_000 });
}

function getPool() {
  if (!globalThis.__alooPgPool) globalThis.__alooPgPool = makePool();
  return globalThis.__alooPgPool;
}

let schemaPromise: Promise<void> | null = null;

function toIso(value: unknown) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function normalizeProduct(row: Record<string, any>): Product {
  const urls = Array.isArray(row.image_urls) ? row.image_urls.filter(Boolean).map(String) : [];
  const main = String(row.image_url || urls[0] || "");
  return {
    ...row,
    id: Number(row.id),
    old_price: Number(row.old_price || 0),
    new_price: Number(row.new_price || 0),
    installment_12: Number(row.installment_12 || 0),
    installment_24: Number(row.installment_24 || 0),
    active: Number(row.active || 0),
    featured: Number(row.featured || 0),
    sort_order: Number(row.sort_order || 0),
    views: Number(row.views || 0),
    in_stock: Number(row.in_stock || 0),
    json_managed: Number(row.json_managed || 0),
    image_url: main,
    image_urls: urls.length ? urls : main ? [main] : [],
    last_sync_at: toIso(row.last_sync_at),
    created_at: toIso(row.created_at) || "",
    updated_at: toIso(row.updated_at) || "",
  } as Product;
}

function normalizeVariant(row: Record<string, any>): ProductVariant {
  return {
    ...row,
    id: Number(row.id),
    product_id: Number(row.product_id),
    old_price: Number(row.old_price || 0),
    new_price: Number(row.new_price || 0),
    installment_12: Number(row.installment_12 || 0),
    installment_24: Number(row.installment_24 || 0),
    stock_qty: Number(row.stock_qty || 0),
    active: Number(row.active || 0),
    updated_at: toIso(row.updated_at) || "",
  } as ProductVariant;
}

async function seedProducts(client: PoolClient) {
  const products = [
    ["Samsung A07s Lite", "Samsung", "samsung-a07s-lite", "/products/samsung-a07s-lite.png", 10],
    ["Redmi Note 15", "Redmi", "redmi-note-15", "/products/redmi-note-15.png", 20],
    ["Honor X6e", "Honor", "honor-x6e", "/products/honor-x6e.png", 30],
    ["Tecno Spark 50", "Tecno", "tecno-spark-50", "/products/tecno-spark-50.png", 40],
    ["Samsung A18 Lite", "Samsung", "samsung-a18-lite", "/products/samsung-a18-lite.png", 50],
    ["Samsung A57", "Samsung", "samsung-a57", "/products/samsung-a57.png", 60],
    ["Honor X7e", "Honor", "honor-x7e", "/products/honor-x7e.png", 70],
    ["Honor X8e", "Honor", "honor-x8e", "/products/honor-x8e.png", 80],
    ["Honor X9d", "Honor", "honor-x9d", "/products/honor-x9d.png", 90],
    ["Redmi 17", "Redmi", "redmi-17", "/products/redmi-17.png", 100],
    ["Tecno Camon Slim", "Tecno", "tecno-camon-slim", "/products/tecno-camon-slim.png", 110],
    ["iPhone 17 Pro Max", "Apple", "iphone-17-pro-max", "/products/iphone-17-pro-max.png", 120],
  ] as const;

  for (const [name, brand, slug, image, sortOrder] of products) {
    await client.query(
      `INSERT INTO products
        (name, brand, slug, image_url, image_urls, recommended_for, description, active, featured, sort_order, in_stock)
       VALUES ($1,$2,$3,$4,$5,$6,$7,1,1,$8,1)
       ON CONFLICT (slug) DO NOTHING`,
      [
        name,
        brand,
        slug,
        image,
        [image],
        "Narx va imkoniyat muvozanatini izlayotgan xaridorlar uchun.",
        "Mahsulot ma’lumotlarini admin panel orqali yangilang: rasmlar, tavsif, narxlar, muddatli to‘lov va tavsiya etiladigan auditoriya.",
        sortOrder,
      ],
    );
  }
}

async function migrateLegacyNames(client: PoolClient) {
  const migrations = [
    ["samsung-a07", "Samsung A07s Lite", "samsung-a07s-lite", "/products/samsung-a07.png", "/products/samsung-a07s-lite.png"],
    ["redmi-15c", "Redmi Note 15", "redmi-note-15", "/products/redmi-15c.png", "/products/redmi-note-15.png"],
    ["samsung-a17", "Samsung A18 Lite", "samsung-a18-lite", "/products/samsung-a17.png", "/products/samsung-a18-lite.png"],
    ["honor-x8d", "Honor X8e", "honor-x8e", "/products/honor-x8d.png", "/products/honor-x8e.png"],
  ] as const;

  for (const [oldSlug, name, newSlug, oldImage, image] of migrations) {
    const exists = await client.query("SELECT id FROM products WHERE slug = $1 LIMIT 1", [newSlug]);
    if (exists.rowCount) continue;
    await client.query(
      `UPDATE products
       SET name=$1, slug=$2, image_url=$3,
           image_urls=CASE
             WHEN cardinality(image_urls)=0 OR image_urls IS NULL THEN ARRAY[$3]::text[]
             WHEN image_urls = ARRAY[$4]::text[] THEN ARRAY[$3]::text[]
             ELSE image_urls
           END,
           updated_at=NOW()
       WHERE slug=$5`,
      [name, newSlug, image, oldImage, oldSlug],
    );
  }
}

async function ensureSchema() {
  if (schemaPromise) return schemaPromise;
  schemaPromise = (async () => {
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      await client.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          brand TEXT NOT NULL DEFAULT '',
          slug TEXT NOT NULL UNIQUE,
          image_url TEXT NOT NULL DEFAULT '',
          image_urls TEXT[] NOT NULL DEFAULT '{}'::text[],
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
          last_sync_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS product_variants (
          id SERIAL PRIMARY KEY,
          product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
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
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
          customer_name TEXT NOT NULL,
          phone TEXT NOT NULL,
          branch TEXT NOT NULL DEFAULT '',
          comment TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL DEFAULT 'new',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS media_files (
          id TEXT PRIMARY KEY,
          filename TEXT NOT NULL,
          mime_type TEXT NOT NULL,
          size_bytes INTEGER NOT NULL DEFAULT 0,
          data BYTEA NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        ALTER TABLE products ADD COLUMN IF NOT EXISTS image_urls TEXT[] NOT NULL DEFAULT '{}'::text[];
        CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
        CREATE INDEX IF NOT EXISTS idx_products_sort ON products(sort_order, id);
        CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
        CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
        CREATE INDEX IF NOT EXISTS idx_variants_product_id ON product_variants(product_id);
        CREATE INDEX IF NOT EXISTS idx_variants_stock ON product_variants(product_id, stock_qty);
      `);

      await migrateLegacyNames(client);
      const count = await client.query<{ c: string }>("SELECT COUNT(*)::text AS c FROM products");
      if (Number(count.rows[0]?.c || 0) === 0) await seedProducts(client);
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      schemaPromise = null;
      throw e;
    } finally {
      client.release();
    }
  })();
  return schemaPromise;
}

export async function listProducts(includeInactive = false): Promise<Product[]> {
  await ensureSchema();
  const where = includeInactive ? "" : "WHERE active = 1";
  const result = await getPool().query(`SELECT * FROM products ${where} ORDER BY sort_order ASC, id ASC`);
  return result.rows.map(normalizeProduct);
}

const LEGACY_SLUGS: Record<string, string> = {
  "samsung-a07": "samsung-a07s-lite",
  "redmi-15c": "redmi-note-15",
  "samsung-a17": "samsung-a18-lite",
  "honor-x8d": "honor-x8e",
};

function canonicalSlug(slug: string) {
  return LEGACY_SLUGS[slug] || slug;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  await ensureSchema();
  const result = await getPool().query("SELECT * FROM products WHERE slug = $1 AND active = 1 LIMIT 1", [canonicalSlug(slug)]);
  return result.rows[0] ? normalizeProduct(result.rows[0]) : undefined;
}

export async function getAnyProductBySlug(slug: string): Promise<Product | undefined> {
  await ensureSchema();
  const result = await getPool().query("SELECT * FROM products WHERE slug = $1 LIMIT 1", [canonicalSlug(slug)]);
  return result.rows[0] ? normalizeProduct(result.rows[0]) : undefined;
}

export async function getProductById(id: number): Promise<Product | undefined> {
  await ensureSchema();
  const result = await getPool().query("SELECT * FROM products WHERE id = $1 LIMIT 1", [id]);
  return result.rows[0] ? normalizeProduct(result.rows[0]) : undefined;
}

export async function listProductVariants(productId: number, includeOutOfStock = true): Promise<ProductVariant[]> {
  await ensureSchema();
  const stock = includeOutOfStock ? "" : "AND stock_qty > 0";
  const result = await getPool().query(
    `SELECT * FROM product_variants
     WHERE product_id = $1 AND active = 1 ${stock}
     ORDER BY CASE WHEN stock_qty > 0 THEN 0 ELSE 1 END, new_price ASC, storage ASC, color ASC`,
    [productId],
  );
  return result.rows.map(normalizeVariant);
}

export async function getVariantById(id: number): Promise<ProductVariant | undefined> {
  await ensureSchema();
  const result = await getPool().query("SELECT * FROM product_variants WHERE id = $1 LIMIT 1", [id]);
  return result.rows[0] ? normalizeVariant(result.rows[0]) : undefined;
}

type ProductWrite = Omit<Product, "id" | "views" | "created_at" | "updated_at" | "in_stock" | "json_managed" | "last_sync_at">;

export async function createProduct(input: ProductWrite) {
  await ensureSchema();
  const images = (input.image_urls || []).filter(Boolean).slice(0, 3);
  const main = images[0] || input.image_url || "";
  const result = await getPool().query<{ id: number }>(
    `INSERT INTO products
      (name, brand, slug, image_url, image_urls, recommended_for, description, old_price, new_price, installment_12, installment_24, active, featured, sort_order, in_stock)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,1)
     RETURNING id`,
    [input.name, input.brand, input.slug, main, images.length ? images : main ? [main] : [], input.recommended_for, input.description, input.old_price, input.new_price, input.installment_12, input.installment_24, input.active, input.featured, input.sort_order],
  );
  return Number(result.rows[0].id);
}

export async function updateProduct(id: number, input: Partial<Product>) {
  await ensureSchema();
  const allowed = [
    "name", "brand", "slug", "image_url", "image_urls", "recommended_for", "description",
    "old_price", "new_price", "installment_12", "installment_24",
    "active", "featured", "sort_order", "in_stock", "json_managed", "last_sync_at",
  ];
  const entries = Object.entries(input).filter(([key]) => allowed.includes(key));
  if (!entries.length) return;

  const normalized = entries.map(([key, value]) => {
    if (key === "image_urls") {
      const urls = Array.isArray(value) ? value.filter(Boolean).map(String).slice(0, 3) : [];
      return [key, urls] as const;
    }
    return [key, value] as const;
  });
  const imageUrlsEntry = normalized.find(([key]) => key === "image_urls");
  if (imageUrlsEntry) {
    const urls = imageUrlsEntry[1] as string[];
    const imageIndex = normalized.findIndex(([key]) => key === "image_url");
    if (imageIndex >= 0) normalized[imageIndex] = ["image_url", urls[0] || normalized[imageIndex][1] || ""];
    else normalized.push(["image_url", urls[0] || ""]);
  }

  const sets = normalized.map(([key], i) => `${key} = $${i + 1}`);
  const values = normalized.map(([, value]) => value);
  values.push(id);
  await getPool().query(`UPDATE products SET ${sets.join(", ")}, updated_at = NOW() WHERE id = $${values.length}`, values);
}

export async function deleteProduct(id: number) {
  await ensureSchema();
  await getPool().query("DELETE FROM products WHERE id = $1", [id]);
}

export async function incrementProductView(id: number) {
  await ensureSchema();
  await getPool().query("UPDATE products SET views = views + 1 WHERE id = $1", [id]);
}

export async function createOrder(input: { product_id: number; variant_id?: number | null; customer_name: string; phone: string; branch?: string; comment?: string }) {
  await ensureSchema();
  const result = await getPool().query<{ id: number }>(
    `INSERT INTO orders (product_id, variant_id, customer_name, phone, branch, comment)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [input.product_id, input.variant_id || null, input.customer_name, input.phone, input.branch || "", input.comment || ""],
  );
  return Number(result.rows[0].id);
}

export async function listOrders(): Promise<Order[]> {
  await ensureSchema();
  const result = await getPool().query(`
    SELECT o.*, p.name AS product_name, v.storage AS variant_storage, v.color AS variant_color
    FROM orders o
    JOIN products p ON p.id = o.product_id
    LEFT JOIN product_variants v ON v.id = o.variant_id
    ORDER BY o.id DESC
  `);
  return result.rows.map((row: Record<string, any>) => ({
    ...row,
    id: Number(row.id),
    product_id: Number(row.product_id),
    variant_id: row.variant_id == null ? null : Number(row.variant_id),
    created_at: toIso(row.created_at) || "",
  })) as Order[];
}

export async function updateOrderStatus(id: number, status: Order["status"]) {
  await ensureSchema();
  await getPool().query("UPDATE orders SET status = $1 WHERE id = $2", [status, id]);
}

export async function applyCatalogImport(preview: JsonImportPreview) {
  await ensureSchema();
  const client = await getPool().connect();
  const now = new Date();
  try {
    await client.query("BEGIN");
    await client.query("UPDATE products SET json_managed=1, in_stock=0, last_sync_at=$1, updated_at=NOW()", [now]);
    await client.query("DELETE FROM product_variants");

    for (const item of preview.products) {
      const dedupe = new Map<string, typeof item.variants[number]>();
      for (const variant of item.variants) {
        const key = `${variant.storage.toLowerCase()}::${variant.color.toLowerCase()}`;
        const previous = dedupe.get(key);
        if (!previous || variant.stockQty > previous.stockQty || (variant.newPrice > 0 && variant.newPrice < previous.newPrice)) dedupe.set(key, variant);
      }

      for (const variant of dedupe.values()) {
        await client.query(
          `INSERT INTO product_variants
            (product_id, source_name, storage, color, color_hex, old_price, new_price, installment_12, installment_24, stock_qty, active, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,1,$11)`,
          [item.productId, variant.sourceName, variant.storage, variant.color, variant.colorHex, Math.round(variant.oldPrice), Math.round(variant.newPrice), Math.round(variant.installment12), Math.round(variant.installment24), Math.round(variant.stockQty), now],
        );
      }

      const variants = [...dedupe.values()];
      const available = variants.filter(v => v.stockQty > 0);
      const cheapestPool = available.length ? available : variants;
      const cheapest = [...cheapestPool].filter(v => v.newPrice > 0).sort((a, b) => a.newPrice - b.newPrice)[0] || cheapestPool[0];
      await client.query(
        `UPDATE products SET json_managed=1, in_stock=$1, old_price=$2, new_price=$3, installment_12=$4, installment_24=$5, last_sync_at=$6, updated_at=NOW() WHERE id=$7`,
        [available.length > 0 ? 1 : 0, Math.round(cheapest?.oldPrice || 0), Math.round(cheapest?.newPrice || 0), Math.round(cheapest?.installment12 || 0), Math.round(cheapest?.installment24 || 0), now, item.productId],
      );
    }

    await client.query("COMMIT");
    return { syncedAt: now.toISOString(), products: preview.matchedProducts, variants: preview.recognizedRows, missing: preview.missingProducts.length };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function getDashboardStats() {
  await ensureSchema();
  const result = await getPool().query(`SELECT
    COUNT(*)::int AS products,
    COUNT(*) FILTER (WHERE active=1)::int AS active,
    COUNT(*) FILTER (WHERE active=1 AND in_stock=1)::int AS in_stock,
    COALESCE(SUM(views),0)::int AS views
    FROM products`);
  const orderResult = await getPool().query(`SELECT COUNT(*)::int AS orders, COUNT(*) FILTER (WHERE status='new')::int AS new_orders FROM orders`);
  const row = result.rows[0];
  const orow = orderResult.rows[0];
  return { products: Number(row.products), active: Number(row.active), inStock: Number(row.in_stock), views: Number(row.views), orders: Number(orow.orders), newOrders: Number(orow.new_orders) };
}

export async function getTopProducts() {
  await ensureSchema();
  const result = await getPool().query(`
    SELECT p.id, p.name, p.slug, p.image_url, p.views, p.in_stock,
           COUNT(o.id)::int AS orders,
           CASE WHEN p.views > 0 THEN ROUND(COUNT(o.id) * 100.0 / p.views, 1) ELSE 0 END AS conversion
    FROM products p
    LEFT JOIN orders o ON o.product_id = p.id
    GROUP BY p.id
    ORDER BY p.views DESC, orders DESC
    LIMIT 12
  `);
  return result.rows.map((row: Record<string, any>) => ({
    id: Number(row.id), name: String(row.name), slug: String(row.slug), image_url: String(row.image_url || ""), views: Number(row.views || 0), in_stock: Number(row.in_stock || 0), orders: Number(row.orders || 0), conversion: Number(row.conversion || 0),
  }));
}

export async function saveMediaFile(input: { filename: string; mimeType: string; data: Buffer }) {
  await ensureSchema();
  const id = crypto.randomUUID();
  await getPool().query(
    "INSERT INTO media_files (id, filename, mime_type, size_bytes, data) VALUES ($1,$2,$3,$4,$5)",
    [id, input.filename, input.mimeType, input.data.length, input.data],
  );
  return { id, url: `/media/${id}` };
}

export async function getMediaFile(id: string) {
  await ensureSchema();
  const result = await getPool().query("SELECT filename, mime_type, size_bytes, data, created_at FROM media_files WHERE id=$1 LIMIT 1", [id]);
  if (!result.rows[0]) return undefined;
  return {
    filename: String(result.rows[0].filename),
    mimeType: String(result.rows[0].mime_type),
    size: Number(result.rows[0].size_bytes || 0),
    data: result.rows[0].data as Buffer,
    createdAt: toIso(result.rows[0].created_at) || "",
  };
}

export async function checkDatabase() {
  await ensureSchema();
  const result = await getPool().query("SELECT NOW() AS now");
  return { ok: true, now: toIso(result.rows[0]?.now) };
}
