import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { verifyPassword } from '@/lib/password';
import { makeToken, COOKIE, cookieOptions } from '@/lib/adminAuth';
import { errText } from '@/lib/apiError';

const tries = globalThis._adminTries || (globalThis._adminTries = new Map());

const DUMMY = 'aa:' + '0'.repeat(128);

export async function POST(req) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';

  const now = Date.now();

  const rec = (tries.get(ip) || []).filter(t => now - t < 10 * 60 * 1000);

  if (rec.length >= 6) {
    return NextResponse.json(
      {
        ok: false,
        message: 'অনেকবার ভুল হয়েছে, ১০ মিনিট পরে চেষ্টা করুন',
      },
      { status: 429 },
    );
  }

  try {
    const { identifier, password } = await req.json();

    const id = String(identifier || '')
      .trim()
      .toLowerCase();

    await connectDB();

    const admin = id
      ? await Admin.findOne({
          $or: [{ username: id }, { email: id }],
        })
      : null;

    const ok =
      verifyPassword(String(password || ''), admin?.passwordHash || DUMMY) &&
      !!admin;

    if (!ok) {
      rec.push(now);
      tries.set(ip, rec);

      return NextResponse.json(
        {
          ok: false,
          message: 'ইউজারনেম বা পাসওয়ার্ড ভুল',
        },
        { status: 401 },
      );
    }

    tries.delete(ip);

    const res = NextResponse.json({ ok: true });

    res.cookies.set(COOKIE, makeToken(String(admin._id)), cookieOptions);

    return res;
  } catch (e) {
    console.error('Admin login error:', e);

    return NextResponse.json(
      {
        ok: false,
        message: errText('সার্ভার সেটআপ ঠিক নেই (.env.local ও seed দেখুন)', e),
      },
      { status: 500 },
    );
  }
}
