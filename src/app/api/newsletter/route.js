// FILE: src/app/api/newsletter/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || ''))
      return NextResponse.json(
        { ok: false, message: 'সঠিক ইমেইল দিন' },
        { status: 400 },
      );
    await connectDB();
    const e = email.toLowerCase().trim();
    await Newsletter.updateOne(
      { email: e },
      { $setOnInsert: { email: e } },
      { upsert: true },
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, message: 'সার্ভারে সমস্যা হয়েছে' },
      { status: 500 },
    );
  }
}
