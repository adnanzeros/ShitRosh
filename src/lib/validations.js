// FILE: src/lib/validations.js
import { DELIVERY } from '@/data/products';
import { unitPrice, variantAvailable } from '@/lib/pricing';

const phoneRe = /^(?:\+?88)?01[3-9]\d{8}$/;
const toEn = s =>
  String(s || '')
    .replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d))
    .trim();

// Server-side pricing: client only sends productId + weight + qty. `products` = catalog from DB.
export function priceOrder(items, district, products) {
  const lines = [];
  for (const it of items) {
    const p = products.find(x => x.id === it.productId);
    const v = p?.variants.find(x => x.w === it.weight);
    const qty = Number(it.qty);
    if (!p || !v || !Number.isInteger(qty) || qty < 1 || qty > 20)
      return { error: 'পণ্য বা পরিমাণ সঠিক নয়' };
    if (!variantAvailable(p, v))
      return { error: `${p.name} (${v.w}) এখন স্টকে নেই` };
    const price = unitPrice(p, v.price);
    lines.push({
      productId: p.id,
      name: p.name,
      weight: v.w,
      listPrice: v.price,
      unitPrice: price,
      qty,
      lineTotal: price * qty,
    });
  }
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const delivery =
    subtotal >= DELIVERY.freeAbove
      ? 0
      : district === 'ঢাকা'
        ? DELIVERY.dhaka
        : DELIVERY.outside;
  return { lines, subtotal, delivery, total: subtotal + delivery };
}

export function validateOrder(b) {
  const errors = {};
  const name = String(b.name || '').trim();
  const phone = toEn(b.phone).replace(/[\s-]/g, '');
  if (name.length < 2) errors.name = 'নাম লিখুন';
  if (!phoneRe.test(phone))
    errors.phone = 'সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)';
  if (!String(b.district || '').trim()) errors.district = 'জেলা বেছে নিন';
  if (!String(b.upazila || '').trim()) errors.upazila = 'উপজেলা লিখুন';
  if (String(b.address || '').trim().length < 8)
    errors.address = 'পূর্ণ ঠিকানা লিখুন';
  if (!Array.isArray(b.items) || !b.items.length || b.items.length > 10)
    errors.items = 'কমপক্ষে একটি পণ্য নির্বাচন করুন';
  return {
    errors,
    clean: {
      name,
      phone,
      district: b.district,
      upazila: String(b.upazila || '').trim(),
      address: String(b.address || '').trim(),
      note: String(b.note || '')
        .trim()
        .slice(0, 500),
      // Only cash on delivery is offered, so the server always saves it as COD
      paymentMethod: 'cod',
      trxId: '',
      items: b.items,
      idempotencyKey: String(b.idempotencyKey || '').slice(0, 64),
    },
  };
}
