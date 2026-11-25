import { products, DELIVERY } from "@/data/products";

const phoneRe = /^(?:\+?88)?01[3-9]\d{8}$/;
const toEn = (s) => String(s || "").replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d)).trim();

// Server-side pricing: client only sends productId + weight + qty
export function priceOrder(items, district) {
  const lines = [];
  for (const it of items) {
    const p = products.find((x) => x.id === it.productId);
    const v = p?.variants.find((x) => x.w === it.weight);
    const qty = Number(it.qty);
    if (!p || !v || !Number.isInteger(qty) || qty < 1 || qty > 20) return { error: "পণ্য বা পরিমাণ সঠিক নয়" };
    lines.push({ productId: p.id, name: p.name, weight: v.w, unitPrice: v.price, qty, lineTotal: v.price * qty });
  }
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const delivery = subtotal >= DELIVERY.freeAbove ? 0 : district === "ঢাকা" ? DELIVERY.dhaka : DELIVERY.outside;
  return { lines, subtotal, delivery, total: subtotal + delivery };
}

export function validateOrder(b) {
  const errors = {};
  const name = String(b.name || "").trim();
  const phone = toEn(b.phone).replace(/[\s-]/g, "");
  if (name.length < 2) errors.name = "নাম লিখুন";
  if (!phoneRe.test(phone)) errors.phone = "সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)";
  if (!String(b.district || "").trim()) errors.district = "জেলা বেছে নিন";
  if (!String(b.upazila || "").trim()) errors.upazila = "উপজেলা লিখুন";
  if (String(b.address || "").trim().length < 8) errors.address = "পূর্ণ ঠিকানা লিখুন";
  if (!Array.isArray(b.items) || !b.items.length || b.items.length > 10) errors.items = "কমপক্ষে একটি পণ্য নির্বাচন করুন";
  if (!["cod", "bkash", "nagad"].includes(b.paymentMethod)) errors.paymentMethod = "পেমেন্ট পদ্ধতি বেছে নিন";
  if (["bkash", "nagad"].includes(b.paymentMethod) && String(b.trxId || "").trim().length < 6) errors.trxId = "ট্রানজেকশন আইডি দিন";
  return { errors, clean: { name, phone, district: b.district, upazila: String(b.upazila || "").trim(), address: String(b.address || "").trim(), note: String(b.note || "").trim().slice(0, 500), paymentMethod: b.paymentMethod, trxId: String(b.trxId || "").trim().slice(0, 40), items: b.items, idempotencyKey: String(b.idempotencyKey || "").slice(0, 64) } };
}
