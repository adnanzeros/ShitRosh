// FILE: src/app/api/admin/subscribers/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import { isAdmin } from '@/lib/adminAuth';

export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ ok: false }, { status: 401 });
  await connectDB();
  const list = await Newsletter.find().sort({ createdAt: -1 }).lean();
  const csv =
    'email,date\n' +
    list
      .map(
        x => `${x.email},${new Date(x.createdAt).toISOString().slice(0, 10)}`,
      )
      .join('\n');
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename=subscribers.csv',
    },
  });
}
