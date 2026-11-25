import mongoose from "mongoose";
// Optional: products live in src/data/products.js; this model is for a future DB-driven catalog.
const S = new mongoose.Schema({ slug: { type: String, unique: true }, name: String, description: String, variants: [{ weight: String, price: Number }], active: { type: Boolean, default: true } }, { timestamps: true });
export default mongoose.models.Product || mongoose.model("Product", S);
