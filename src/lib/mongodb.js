// FILE: src/lib/mongodb.js
import mongoose from 'mongoose';
import { isSrvDnsError, srvToStandardUri } from '@/lib/mongoUri';

// Reused across hot-reloads (dev) and warm serverless invocations (prod)
const cached =
  globalThis._mongoose ||
  (globalThis._mongoose = { promise: null, stdUri: null });

const OPTIONS = {
  bufferCommands: false,
  serverSelectionTimeoutMS: 10000,
  maxPoolSize: 10,
};

async function open(uri) {
  // 1) normal connection
  try {
    await mongoose.connect(uri, OPTIONS);
    return;
  } catch (e) {
    if (!uri.startsWith('mongodb+srv://') || !isSrvDnsError(e)) throw e;
    console.warn(
      '[MongoDB] SRV DNS failed, trying public DNS / DNS-over-HTTPS fallback...',
    );
    await mongoose.disconnect().catch(() => {});
  }

  // 2) SRV blocked -> build a plain mongodb:// URI (public DNS, then DoH)
  if (!cached.stdUri) cached.stdUri = await srvToStandardUri(uri);
  await mongoose.connect(cached.stdUri, OPTIONS);
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) throw new Error('MONGODB_URI missing in .env.local');

  if (mongoose.connection.readyState === 1) return mongoose;
  if (mongoose.connection.readyState === 0) cached.promise = null;

  if (!cached.promise) {
    cached.promise = open(uri)
      .then(() => {
        console.log('[MongoDB] Connected successfully');
        return mongoose;
      })
      .catch(error => {
        console.error('[MongoDB] Connection failed:', error.message);
        cached.promise = null;
        throw error;
      });
  }

  await cached.promise;
  return mongoose;
}
