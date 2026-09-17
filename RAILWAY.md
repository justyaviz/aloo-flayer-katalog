# Railway deploy — v5 PostgreSQL

Sizda `Postgres` service allaqachon bo‘lsa, alohida Volume kerak emas.

## Variables
`aloo-flayer-katalog` service → Variables:

- `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- `NEXT_PUBLIC_SITE_URL=https://alookatalog.up.railway.app`
- `HOSTNAME=0.0.0.0`
- `ADMIN_USERNAME=admin`
- `ADMIN_PASSWORD=<kuchli-parol>`
- `SESSION_SECRET=<32+ belgili random secret>`
- `SUPPORT_PHONE=<ixtiyoriy>`

`DATA_DIR` v5 da kerak emas. Qolsa zarar qilmaydi, lekin ishlatilmaydi.

## Deploy
1. Yangi kodni GitHub main branchga push qiling.
2. Railway avtomatik deploy qiladi.
3. `/api/health` ni oching. `database: postgres-connected` bo‘lishi kerak.
4. `/admin/products` ga kiring.
5. Mahsulotni tahrirlab 2–3 ta rasm yuklab test qiling.
6. Sahifani qayta oching — rasmlar redeploydan keyin ham Postgresda qoladi.

## Muhim
v4 SQLite ishlatgan. v5 dan boshlab yangi ma’lumotlar PostgreSQL da saqlanadi. Eski SQLite ma’lumotlari avtomatik ko‘chirilmaydi.
