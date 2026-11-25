// FILE: src/app/api/admin/reset/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { hmac } from '@/lib/adminAuth';
import { hashPassword } from '@/lib/password';
import crypto from 'crypto';

const bad = (message, status = 400) =>
  NextResponse.json({ ok: false, message }, { status });

export async function POST(req) {
  try {
    const { identifier, code, password } = await req.json();
    const id = String(identifier || '')
      .trim()
      .toLowerCase();
    if (String(password || '').length < 8)
      return bad('নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের দিন');
    await connectDB();
    const admin = await Admin.findOne({
      $or: [{ username: id }, { email: id }],
    });
    if (
      !admin ||
      !admin.resetHash ||
      !admin.resetExpires ||
      admin.resetExpires < new Date()
    )
      return bad('কোডের মেয়াদ শেষ বা কোড ভুল। নতুন কোড নিন');
    if (admin.resetTries >= 5) return bad('অনেকবার ভুল কোড। নতুন কোড নিন', 429);
    const a = Buffer.from(admin.resetHash);
    const b = Buffer.from(hmac(`${admin.id}:${String(code || '').trim()}`));
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      admin.resetTries += 1;
      await admin.save();
      return bad('কোড ভুল');
    }
    admin.passwordHash = hashPassword(password);
    admin.resetHash = undefined;
    admin.resetExpires = undefined;
    admin.resetTries = 0;
    await admin.save();
    return NextResponse.json({
      ok: true,
      message: 'পাসওয়ার্ড বদলেছে, এখন লগইন করুন',
    });
  } catch (e) {
    console.error(e);
    return bad('সার্ভারে সমস্যা', 500);
  }
}
