import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { validateOrder, priceOrder } from '@/lib/validations';
import { getCatalog } from '@/lib/catalog';

const makeId = () =>
  'SR-' +
  new Date().toISOString().slice(2, 10).replace(/-/g, '') +
  '-' +
  Math.random().toString(36).slice(2, 7).toUpperCase();

export async function POST(req) {
  try {
    const body = await req.json();

    const { errors, clean } = validateOrder(body);

    if (Object.keys(errors).length) {
      return NextResponse.json({ ok: false, errors }, { status: 400 });
    }

    // Get current products from database
    const products = await getCatalog();

    // Calculate prices on server using database catalog
    const priced = priceOrder(clean.items, clean.district, products);

    if (priced.error) {
      return NextResponse.json(
        { ok: false, errors: { items: priced.error } },
        { status: 400 },
      );
    }

    await connectDB();

    // Prevent duplicate orders
    if (clean.idempotencyKey) {
      const dup = await Order.findOne({
        idempotencyKey: clean.idempotencyKey,
      });

      if (dup) {
        return NextResponse.json({
          ok: true,
          orderId: dup.orderId,
          total: dup.total,
          duplicate: true,
        });
      }
    }

    const order = await Order.create({
      orderId: makeId(),
      idempotencyKey: clean.idempotencyKey || undefined,

      customer: {
        name: clean.name,
        phone: clean.phone,
        district: clean.district,
        upazila: clean.upazila,
        address: clean.address,
      },

      items: priced.lines,
      note: clean.note,

      subtotal: priced.subtotal,
      delivery: priced.delivery,
      total: priced.total,

      paymentMethod: clean.paymentMethod,
      paymentTrxId: clean.trxId,

      paymentStatus:
        clean.paymentMethod === 'cod' ? 'unpaid' : 'pending_verification',
    });

    return NextResponse.json({
      ok: true,
      orderId: order.orderId,
      total: order.total,
      delivery: order.delivery,
    });
  } catch (e) {
    console.error(e);

    return NextResponse.json(
      {
        ok: false,
        message: 'সার্ভারে সমস্যা হয়েছে, আবার চেষ্টা করুন',
      },
      { status: 500 },
    );
  }
}
