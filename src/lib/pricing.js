// FILE: src/lib/pricing.js  (pure — used by both browser and server)
export function discountActive(p, now = Date.now()) {
  return (
    !!p &&
    (p.discountType === 'percent' || p.discountType === 'flat') &&
    Number(p.discountValue) > 0 &&
    (!p.discountEndsAt || new Date(p.discountEndsAt).getTime() > now)
  );
}
export function unitPrice(p, price, now = Date.now()) {
  if (!discountActive(p, now)) return price;
  const d = Number(p.discountValue);
  const v =
    p.discountType === 'percent'
      ? Math.round((price * (100 - Math.min(d, 90))) / 100)
      : price - d;
  return Math.max(1, Math.min(price, v));
}
export const variantAvailable = (p, v) =>
  p.active !== false && p.inStock !== false && v.inStock !== false;
export const productAvailable = p =>
  p.active !== false &&
  p.inStock !== false &&
  p.variants.some(v => v.inStock !== false);
