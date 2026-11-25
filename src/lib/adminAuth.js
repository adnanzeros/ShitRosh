// FILE: src/lib/adminAuth.js
import crypto from 'crypto';
import { cookies } from 'next/headers';

export const COOKIE = 'sr_admin';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const secret = () => {
  const s = process.env.ADMIN_SECRET;
  if (!s || s.length < 16)
    throw new Error('ADMIN_SECRET missing/too short in .env.local');
  return s;
};
export const hmac = v =>
  crypto.createHmac('sha256', secret()).update(v).digest('hex');
const same = (a, b) => {
  const x = Buffer.from(String(a)),
    y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

export function makeToken(adminId) {
  const body = `${adminId}.${Date.now() + MAX_AGE * 1000}`;
  return `${body}.${hmac(body)}`;
}
export function verifyToken(t) {
  const [id, exp, sig] = String(t || '').split('.');
  if (!id || !exp || !sig || Number(exp) < Date.now()) return false;
  return same(sig, hmac(`${id}.${exp}`));
}
export async function isAdmin() {
  try {
    return verifyToken((await cookies()).get(COOKIE)?.value);
  } catch {
    return false;
  }
}
export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: MAX_AGE,
};
