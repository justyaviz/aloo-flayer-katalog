# aloo QR Catalog

Flyerdagi har bir smartfon QR kodi uchun mahsulot sahifasi + `/admin` boshqaruv paneli.

## Nimalar bor
- aloo brendiga mos katalog va mahsulot sahifasi
- 12 ta flyer smartfoni user bergan original rasmlar bilan seed qilingan
- har mahsulot uchun: rasm, kimlar uchun tavsiya, tavsif, eski/yangi narx, avtomatik chegirma %, 12 va 24 oylik to‘lov
- `Buyurtma berish` formasi
- admin panel: mahsulot CRUD, rasm upload, faol/o‘chiq holat, tartiblash
- har mahsulot uchun avtomatik SVG QR kod
- admin buyurtmalar ro‘yxati va status boshqaruvi
- QR/sahifa ko‘rishlar, buyurtma va konversiya analytics
- SQLite bazasi; Railway Volume bilan persistent ishlaydi

## Local ishga tushirish
1. `.env.example` dan `.env.local` yarating.
2. `ADMIN_PASSWORD` va `SESSION_SECRET` ni albatta almashtiring.
3. `npm install`
4. `npm run dev`
5. Sayt: `http://localhost:3000`
6. Admin: `http://localhost:3000/admin`

## QR ishlash prinsipi
Admin panelda har bir mahsulot qatorida QR preview va `QR SVG` tugmasi bor.
QR quyidagi manzilga olib boradi:

`https://SIZNING-DOMEN/p/mahsulot-slugi`

Productionda `NEXT_PUBLIC_SITE_URL` ni haqiqiy domen bilan yozish shart.

## Rasm upload
Admin paneldan yuklangan rasmlar `${DATA_DIR}/uploads` ichiga tushadi.
Railway’da `/data` ga Volume ulang. Aks holda redeployda yuklangan rasmlar va SQLite baza yo‘qolishi mumkin.

## Muhim production ENV
- `NEXT_PUBLIC_SITE_URL=https://catalog.aloo.uz`
- `ADMIN_USERNAME=admin`
- `ADMIN_PASSWORD=...`
- `SESSION_SECRET=kamida-32-belgili-tasodifiy-secret`
- `DATA_DIR=/data`

## Narxlar
Seed qilingan mahsulotlarda narxlar 0 holatda turadi. Admin panel orqali amaldagi narxlarni kiriting. Narxlar ataylab o‘ylab topilmadi.

## JSON orqali narx va qoldiq yangilash (v3)

Admin panelga kiring: `/admin/products`.

1. `JSON Sync` blokida `.json` faylni tanlang.
2. Tizim flyer mahsulotlarini, xotira/rang variantlarini va JSONda yo‘q mahsulotlarni ko‘rsatadi.
3. `Narx va qoldiqni yangilash` tugmasini bosing.
4. JSONda yo‘q mahsulotlar saytda `Tugagan` bo‘lib qoladi.
5. Bir modelda bir nechta xotira/rang bo‘lsa, mijoz mahsulot sahifasida tanlay oladi.

Tayyor format: `JSON_IMPORT_EXAMPLE.json`.
