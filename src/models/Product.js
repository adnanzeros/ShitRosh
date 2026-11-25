// FILE: src/models/Product.js
import mongoose from 'mongoose';
const Variant = new mongoose.Schema(
  { w: String, price: Number, inStock: { type: Boolean, default: true } },
  { _id: false },
);
const ComboItem = new mongoose.Schema(
  { productId: String, weight: String, qty: { type: Number, default: 1 } },
  { _id: false },
);
const S = new mongoose.Schema(
  {
    slug: { type: String, unique: true, required: true },
    kind: { type: String, enum: ['single', 'combo'], default: 'single' },
    name: { type: String, required: true },
    short: String,
    desc: String,
    image: String,
    tone: { type: String, default: '#E9A23B' },
    variants: [Variant],
    comboItems: [ComboItem],
    active: { type: Boolean, default: true }, // false = paused (hidden from shop)
    inStock: { type: Boolean, default: true }, // false = stock out (visible, can't order)
    discountType: {
      type: String,
      enum: ['none', 'percent', 'flat'],
      default: 'none',
    },
    discountValue: { type: Number, default: 0 },
    discountEndsAt: Date,
    offerLabel: String,
    sort: { type: Number, default: 100 },
  },
  { timestamps: true },
);
export default mongoose.models.Product || mongoose.model('Product', S);
