// FILE: src/app/api/admin/forgot/route.js  — emails a 6-digit code to the admin's saved email
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { hmac } from '@/lib/adminAuth';
import { sendMail } from '@/lib/mailer';

export async function POST(req) {
  const generic = NextResponse.json({
    ok: true,
    message:
      'ইউজারের ইমেইলে কোড পাঠানো হয়েছে (থাকলে)। ১০ মিনিটের মধ্যে ব্যবহার করুন।',
  });
  try {
    const { identifier } = await req.json();
    const id = String(identifier || '')
      .trim()
      .toLowerCase();
    if (!id) return generic;
    await connectDB();
    const admin = await Admin.findOne({
      $or: [{ username: id }, { email: id }],
    });
    if (!admin) return generic;
    if (
      admin.resetSentAt &&
      Date.now() - admin.resetSentAt.getTime() < 60 * 1000
    )
      return NextResponse.json(
        { ok: false, message: 'এক মিনিট পরে আবার চেষ্টা করুন' },
        { status: 429 },
      );
    const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    admin.resetHash = hmac(`${admin.id}:${code}`);
    admin.resetExpires = new Date(Date.now() + 10 * 60 * 1000);
    admin.resetTries = 0;
    admin.resetSentAt = new Date();
    await admin.save();
    await sendMail({
      to: admin.email, // always the stored address, never one typed by the visitor
      subject: 'শীতরস অ্যাডমিন — পাসওয়ার্ড রিসেট কোড',
      text: `আপনার রিসেট কোড: ${code}\nকোডটি ১০ মিনিট চালু থাকবে। আপনি না চাইলে এই মেইল উপেক্ষা করুন।`,
      html: `<p>আপনার রিসেট কোড:</p><p style="font-size:30px;letter-spacing:6px"><b>${code}</b></p><p>কোডটি ১০ মিনিট চালু থাকবে। আপনি না চাইলে এই মেইল উপেক্ষা করুন।</p>`,
    });
    return generic;
  } catch (e) {
    console.error('forgot:', e.message);
    return NextResponse.json(
      { ok: false, message: 'মেইল পাঠানো যায়নি (SMTP সেটিং দেখুন)' },
      { status: 500 },
    );
  }
}
