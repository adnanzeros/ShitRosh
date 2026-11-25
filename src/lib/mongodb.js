import mongoose from "mongoose";
const cached = globalThis._mongoose || (globalThis._mongoose = { conn: null, promise: null });
export async function connectDB() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI missing");
  if (cached.conn) return cached.conn;
  cached.promise ||= mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
  cached.conn = await cached.promise;
  return cached.conn;
}
