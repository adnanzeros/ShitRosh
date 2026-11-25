// FILE: src/models/Newsletter.js
import mongoose from 'mongoose';
const S = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true },
);
export default mongoose.models.Newsletter || mongoose.model('Newsletter', S);
