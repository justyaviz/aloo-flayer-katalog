# Railway deploy

1. Projectni GitHubga push qiling yoki Railway'ga repo orqali ulang.
2. Variables:
   - `NEXT_PUBLIC_SITE_URL=https://sizning-domeningiz.uz`
   - `ADMIN_USERNAME=admin`
   - `ADMIN_PASSWORD=<kuchli-parol>`
   - `SESSION_SECRET=<32+ belgili random secret>`
   - `DATA_DIR=/data`
3. Railway Volume yarating va mount path `/data` qiling.
4. Healthcheck path: `/api/health`
5. Domain ulang.
6. Deploy tugagach `/admin` ga kiring va 12 mahsulot narxlarini kiriting.
7. Har mahsulotdagi `QR SVG` ni yuklab olib flyerga qo‘ying.

Dockerfile mavjud.
