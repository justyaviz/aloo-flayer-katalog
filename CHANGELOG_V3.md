# aloo QR Catalog v3.0 — JSON Sync + variantlar

## Yangi imkoniyatlar

- `/admin/products` sahifasiga **JSON orqali narx va qoldiq yangilash** qo‘shildi.
- JSON yuklanganda tizim avval **preview** qiladi, keyin tasdiq bilan bazaga yozadi.
- Faqat saytdagi/flyer’dagi mahsulotlar avtomatik ajratib olinadi.
- Mahsulot nomidan **xotira** (`8/128 GB`, `8/256 GB`) avtomatik aniqlanadi.
- Mahsulot nomidan **rang** (`Blue`, `Black`, `Grey` va boshqalar) avtomatik aniqlanadi.
- Bir modeldagi bir nechta xotira/rang kombinatsiyalari `product_variants` jadvalida saqlanadi.
- Mahsulot sahifasiga xotira va rang tanlash qo‘shildi.
- Sahifa ochilganda **eng arzon, qoldiqda bor variant** avtomatik tanlanadi.
- Variant o‘zgarganda narx, eski narx, 12/24 oy to‘lovi va qoldiq holati avtomatik o‘zgaradi.
- JSON ichida saytdagi mahsulot umuman bo‘lmasa — u **Tugagan** holatiga o‘tadi, lekin QR sahifasi ishlashda davom etadi.
- Qoldiq `0` bo‘lgan ranglar ko‘rinadi, ammo tanlab buyurtma berib bo‘lmaydi.
- Buyurtmaga tanlangan variant (`xotira + rang`) biriktiriladi va admin buyurtmalar jadvalida ko‘rinadi.
- Dashboard’da sotuvda mavjud mahsulotlar soni qo‘shildi.

## JSON maydonlari

Tizim bir nechta nomlarni taniydi:

- nom: `name`, `title`, `product_name`, `Наименование`, `Товар`
- narx: `price`, `new_price`, `sale_price`, `Цена`, `narx`
- eski narx: `old_price`, `original_price`, `Старая цена`
- qoldiq: `stock`, `qty`, `quantity`, `balance`, `Остаток`, `Количество`, `qoldiq`
- 12 oy: `installment_12`, `monthly_12`, `12 oy`, `12 мес`
- 24 oy: `installment_24`, `monthly_24`, `24 oy`, `24 мес`

`JSON_IMPORT_EXAMPLE.json` faylida tayyor namuna bor.
