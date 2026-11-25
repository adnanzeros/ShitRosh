import mongoose from "mongoose";
const LineSchema = new mongoose.Schema({ productId: String, name: String, weight: String, unitPrice: Number, qty: Number, lineTotal: Number }, { _id: false });
const OrderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, required: true },
  idempotencyKey: { type: String, unique: true, sparse: true },
  customer: { name: String, phone: String, district: String, upazila: String, address: String },
  items: [LineSchema],
  note: String,
  subtotal: Number, delivery: Number, total: Number,
  paymentMethod: { type: String, enum: ["cod", "bkash", "nagad"] },
  paymentTrxId: String,
  paymentStatus: { type: String, enum: ["unpaid", "pending_verification"], default: "unpaid" },
  status: { type: String, default: "pending" },
}, { timestamps: true });
export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
