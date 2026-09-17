# aloo QR Catalog v5

Flyerdagi har bir smartfon QR kodi uchun mahsulot sahifasi + `/admin` boshqaruv paneli.

## v5 asosiy yangiliklari
- Barcha mahsulotlar, variantlar, buyurtmalar va analytics **PostgreSQL** da saqlanadi.
- Admin paneldan har bir mahsulotga **1–3 ta rasm** yuklash mumkin.
- Yuklangan rasm fayllarining o‘zi ham PostgreSQL `media_files` jadvalida BYTEA sifatida saqlanadi — Railway Volume shart emas.
- Mahsulot sahifasida 2–3 rasmli galereya, chap/o‘ng tugmalar va indikatorlar ishlaydi.
- Flyer mahsulotlari yangilandi: Samsung A07s Lite, Samsung A18 Lite, Honor X8e, Redmi Note 15.
- Eski QR sluglar (`samsung-a07`, `samsung-a17`, `honor-x8d`, `redmi-15c`) yangi mahsulotlarga avtomatik moslanadi.
- JSON narx/qoldiq sync, rang/xotira variantlari va buyurtma oqimi saqlangan.

## Mahsulotlar
Seed ro‘yxati:
1. Samsung A07s Lite
2. Redmi Note 15
3. Honor X6e
4. Tecno Spark 50
5. Samsung A18 Lite
6. Samsung A57
7. Honor X7e
8. Honor X8e
9. Honor X9d
10. Redmi 17
11. Tecno Camon Slim
12. iPhone 17 Pro Max

## Local ishga tushirish
1. `.env.example` dan `.env.local` yarating.
2. PostgreSQL `DATABASE_URL` kiriting.
3. `ADMIN_PASSWORD` va `SESSION_SECRET` ni almashtiring.
4. `npm install`
5. `npm run dev`
6. Sayt: `http://localhost:3000`
7. Admin: `http://localhost:3000/admin`

## PostgreSQL
Ilova birinchi ishga tushganda jadvallarni avtomatik yaratadi:
- `products`
- `product_variants`
- `orders`
- `media_files`

`/api/health` PostgreSQL ulanishini ham tekshiradi.

## 1–3 ta rasm
`/admin/products` ichida har bir mahsulotda uchta rasm sloti bor.
- 1-rasm — asosiy rasm.
- 2 va 3-rasmlar — mahsulot galereyasi.
- Istalgan rasmni `Asosiy qilish` mumkin.
- Rasmlar `/api/upload` orqali PostgreSQL ga yoziladi va `/media/<id>` orqali ko‘rsatiladi.

## JSON orqali narx/qoldiq yangilash
`/admin/products` → `JSON Sync`.
- Xotira va ranglar avtomatik aniqlanadi.
- Eng arzon mavjud variant asosiy narx bo‘ladi.
- JSONda yo‘q mahsulot `Tugagan` bo‘ladi.
- Yangilangan flyer nomlari uchun eski model nomlari ham alias sifatida taniladi.

## Muhim ENV
- `DATABASE_URL=${{Postgres.DATABASE_URL}}` (Railway reference tavsiya qilinadi)
- `NEXT_PUBLIC_SITE_URL=https://sizning-domeningiz`
- `HOSTNAME=0.0.0.0`
- `ADMIN_USERNAME=admin`
- `ADMIN_PASSWORD=...`
- `SESSION_SECRET=kamida-32-belgili-random-secret`
- `SUPPORT_PHONE=...` (ixtiyoriy)

## QR
Har mahsulot: `https://SIZNING-DOMEN/p/slug`.
Admin paneldan branded SVG QR yuklab olinadi.
