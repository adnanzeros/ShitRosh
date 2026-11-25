// FILE: src/models/Admin.js
import mongoose from 'mongoose';
const S = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    isMain: { type: Boolean, default: true },
    resetHash: String,
    resetExpires: Date,
    resetTries: { type: Number, default: 0 },
    resetSentAt: Date,
  },
  { timestamps: true },
);
export default mongoose.models.Admin || mongoose.model('Admin', S);
