# v5 — PostgreSQL + Multi Image

- SQLite olib tashlandi, `pg` orqali PostgreSQL qo‘shildi.
- Product, variant, order, analytics PostgreSQL ga ko‘chirildi.
- `media_files` jadvali: upload qilingan rasmlar BYTEA formatda Postgresda saqlanadi.
- Har mahsulot uchun `image_urls` (max 3) qo‘shildi.
- Admin panel: 3 rasm sloti, almashtirish, o‘chirish, asosiy qilish.
- Mijoz mahsulot sahifasi: multi-image gallery.
- Flyer katalog nomlari yangilandi: A07s Lite, A18 Lite, X8e, Redmi Note 15.
- Eski QR slug aliaslari ishlashda davom etadi.
- JSON importerga eski/yangi model aliaslari qo‘shildi.
- `/api/health` PostgreSQL ulanishini tekshiradi.
