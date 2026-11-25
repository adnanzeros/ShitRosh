import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { isAdmin } from '@/lib/adminAuth';
import { getCatalog } from '@/lib/catalog';
import { errText } from '@/lib/apiError';

const no = () => NextResponse.json({ ok: false }, { status: 401 });

const fail = (message, status = 400) =>
  NextResponse.json({ ok: false, message }, { status });

const str = (v, n) =>
  String(v ?? '')
    .trim()
    .slice(0, n);

// Validates only the keys that were sent,
// so quick toggles (pause / stock) can send one field.
function clean(b) {
  const o = {};

  if ('name' in b) {
    o.name = str(b.name, 120);
    if (!o.name) throw new Error('নাম দিন');
  }

  if ('short' in b) o.short = str(b.short, 30);
  if ('desc' in b) o.desc = str(b.desc, 600);

  if ('image' in b) {
    const im = str(b.image, 300);

    if (im && !/^\/|^https:\/\//.test(im)) {
      throw new Error('ছবির লিংক / বা https:// দিয়ে শুরু হতে হবে');
    }

    o.image = im || '/images/jhola.png';
  }

  if ('tone' in b) {
    o.tone = /^#[0-9a-f]{6}$/i.test(b.tone) ? b.tone : '#E9A23B';
  }

  if ('kind' in b) {
    o.kind = b.kind === 'combo' ? 'combo' : 'single';
  }

  if ('active' in b) o.active = !!b.active;
  if ('inStock' in b) o.inStock = !!b.inStock;
  if ('sort' in b) o.sort = Number(b.sort) || 100;

  if ('offerLabel' in b) {
    o.offerLabel = str(b.offerLabel, 40);
  }

  if ('variants' in b) {
    const v = Array.isArray(b.variants) ? b.variants : [];

    o.variants = v.slice(0, 8).map(x => ({
      w: str(x.w, 40),
      price: Math.round(Number(x.price)),
      inStock: x.inStock !== false,
    }));

    if (!o.variants.length || o.variants.some(x => !x.w || !(x.price > 0))) {
      throw new Error('প্রতিটি ওজন ও দাম (০ এর বেশি) দিন');
    }
  }

  if ('comboItems' in b) {
    o.comboItems = (Array.isArray(b.comboItems) ? b.comboItems : [])
      .slice(0, 10)
      .filter(x => x.productId && x.weight)
      .map(x => ({
        productId: str(x.productId, 60),
        weight: str(x.weight, 40),
        qty: Math.min(20, Math.max(1, parseInt(x.qty) || 1)),
      }));
  }

  if ('discountType' in b) {
    o.discountType = ['percent', 'flat'].includes(b.discountType)
      ? b.discountType
      : 'none';

    o.discountValue =
      o.discountType === 'none' ? 0 : Math.max(0, Number(b.discountValue) || 0);

    if (o.discountType === 'percent' && o.discountValue > 90) {
      throw new Error('ছাড় সর্বোচ্চ ৯০%');
    }

    const d = b.discountEndsAt ? new Date(b.discountEndsAt) : null;

    o.discountEndsAt = d && !isNaN(d) && o.discountType !== 'none' ? d : null;
  }

  return o;
}

// GET PRODUCTS
export async function GET() {
  if (!(await isAdmin())) return no();

  try {
    return NextResponse.json({
      ok: true,
      products: await getCatalog({ all: true }),
    });
  } catch (e) {
    return fail(errText('ডাটাবেস কানেক্ট হয়নি', e), 500);
  }
}

// CREATE PRODUCT
export async function POST(req) {
  if (!(await isAdmin())) return no();

  try {
    const b = await req.json();

    const data = clean({
      kind: 'single',
      active: true,
      inStock: true,
      ...b,
    });

    if (!data.name || !data.variants) {
      return fail('নাম ও ওজন/দাম দিন');
    }

    const slug = /^[a-z0-9-]{2,40}$/.test(b.slug || '')
      ? b.slug
      : 'p-' + crypto.randomBytes(4).toString('hex');

    await connectDB();

    if (await Product.exists({ slug })) {
      return fail('এই আইডি আগে থেকেই আছে');
    }

    await Product.create({ ...data, slug });

    return NextResponse.json({ ok: true, slug });
  } catch (e) {
    return fail(errText('সেভ হয়নি', e), 500);
  }
}

// UPDATE PRODUCT
export async function PATCH(req) {
  if (!(await isAdmin())) return no();

  try {
    const { slug, ...b } = await req.json();

    await connectDB();

    const p = await Product.findOneAndUpdate(
      { slug },
      { $set: clean(b) },
      { new: true },
    );

    return p
      ? NextResponse.json({ ok: true })
      : fail('পণ্য পাওয়া যায়নি', 404);
  } catch (e) {
    return fail(errText('সেভ হয়নি', e), 500);
  }
}

// DELETE PRODUCT
export async function DELETE(req) {
  if (!(await isAdmin())) return no();

  try {
    const slug = new URL(req.url).searchParams.get('slug');

    await connectDB();

    const r = await Product.deleteOne({ slug });

    return r.deletedCount
      ? NextResponse.json({ ok: true })
      : fail('পণ্য পাওয়া যায়নি', 404);
  } catch (e) {
    return fail(errText('মোছা যায়নি', e), 500);
  }
}
