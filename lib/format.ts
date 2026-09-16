export function formatMoney(value: number) {
  if (!value) return "—";
  return new Intl.NumberFormat("uz-UZ").format(value) + " so‘m";
}

export function discountPercent(oldPrice: number, newPrice: number) {
  if (!oldPrice || !newPrice || oldPrice <= newPrice) return 0;
  return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[’'`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
