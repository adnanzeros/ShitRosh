// FILE: src/app/api/admin/orders/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { isAdmin } from '@/lib/adminAuth';
import { errText } from '@/lib/apiError';

const no = () => NextResponse.json({ ok: false }, { status: 401 });

const fail = (message, status = 400) =>
  NextResponse.json({ ok: false, message }, { status });

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const PAY = ['unpaid', 'pending_verification', 'paid', 'rejected'];

const esc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/admin/orders?status=&q=
export async function GET(req) {
  if (!(await isAdmin())) return no();

  try {
    await connectDB();

    const sp = new URL(req.url).searchParams;
    const status = sp.get('status') || '';
    const q = (sp.get('q') || '').trim().slice(0, 60);

    const filter = {};

    if (status === 'verify') {
      filter.paymentStatus = 'pending_verification';
    } else if (STATUSES.includes(status)) {
      filter.status = status;
    }

    if (q) {
      const re = new RegExp(esc(q), 'i');
      filter.$or = [
        { orderId: re },
        { 'customer.name': re },
        { 'customer.phone': re },
      ];
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [orders, grouped, verify, todayRows] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).limit(200).lean(),
      Order.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
      Order.countDocuments({ paymentStatus: 'pending_verification' }),
      Order.find({
        createdAt: { $gte: startOfDay },
        status: { $ne: 'cancelled' },
      })
        .select('total')
        .lean(),
    ]);

    const counts = {};
    for (const g of grouped) counts[g._id] = g.n;

    return NextResponse.json({
      ok: true,
      orders,
      counts,
      verify,
      today: {
        n: todayRows.length,
        sum: todayRows.reduce((a, o) => a + (o.total || 0), 0),
      },
    });
  } catch (e) {
    console.error('Admin orders GET error:', e);
    return fail(errText('অর্ডার লোড হয়নি (ডাটাবেস)', e), 500);
  }
}

// PATCH { orderId, status?, paymentStatus?, adminNote? }
export async function PATCH(req) {
  if (!(await isAdmin())) return no();

  try {
    const b = await req.json();
    const orderId = String(b.orderId || '').trim();
    if (!orderId) return fail('অর্ডার আইডি নেই');

    const set = {};

    if ('status' in b) {
      if (!STATUSES.includes(b.status)) return fail('স্ট্যাটাস ঠিক নয়');
      set.status = b.status;
    }

    if ('paymentStatus' in b) {
      if (!PAY.includes(b.paymentStatus))
        return fail('পেমেন্ট স্ট্যাটাস ঠিক নয়');
      set.paymentStatus = b.paymentStatus;
    }

    if ('adminNote' in b) {
      set.adminNote = String(b.adminNote ?? '')
        .trim()
        .slice(0, 500);
    }

    if (!Object.keys(set).length) return fail('কিছু বদলানোর নেই');

    await connectDB();

    const o = await Order.findOneAndUpdate(
      { orderId },
      { $set: set },
      { new: true },
    );

    return o
      ? NextResponse.json({ ok: true })
      : fail('অর্ডার পাওয়া যায়নি', 404);
  } catch (e) {
    console.error('Admin orders PATCH error:', e);
    return fail(errText('সেভ হয়নি', e), 500);
  }
}
