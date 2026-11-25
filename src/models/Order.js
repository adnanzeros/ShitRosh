// FILE: src/models/Order.js
import mongoose from 'mongoose';
const LineSchema = new mongoose.Schema(
  {
    productId: String,
    name: String,
    weight: String,
    listPrice: Number,
    unitPrice: Number,
    qty: Number,
    lineTotal: Number,
  },
  { _id: false },
);
const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, required: true },
    idempotencyKey: { type: String, unique: true, sparse: true },
    customer: {
      name: String,
      phone: String,
      district: String,
      upazila: String,
      address: String,
    },
    items: [LineSchema],
    note: String,
    adminNote: String,
    subtotal: Number,
    delivery: Number,
    total: Number,
    paymentMethod: { type: String, enum: ['cod', 'bkash', 'nagad'] },
    paymentTrxId: String,
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'pending_verification', 'paid', 'rejected'],
      default: 'unpaid',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true },
);
OrderSchema.index({ createdAt: -1 });
export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
