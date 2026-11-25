import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { products as staticProducts } from '@/data/products';
import { bn } from '@/lib/format';

const iso = d => (d ? new Date(d).toISOString() : null);

export function serialize(d, byId = {}) {
  const p = {
    id: d.slug ?? d.id,
    kind: d.kind || (d.images ? 'combo' : 'single'),
    name: d.name,
    short: d.short || '',
    desc: d.desc || '',
    image: d.image || '/images/jhola.png',
    tone: d.tone || '#E9A23B',

    variants: (d.variants || []).map(v => ({
      w: v.w,
      price: v.price,
      inStock: v.inStock !== false,
    })),

    comboItems: (d.comboItems || []).map(i => ({
      productId: i.productId,
      weight: i.weight,
      qty: i.qty || 1,
    })),

    active: d.active !== false,
    inStock: d.inStock !== false,

    discountType: d.discountType || 'none',
    discountValue: d.discountValue || 0,
    discountEndsAt: iso(d.discountEndsAt),

    offerLabel: d.offerLabel || '',
    sort: d.sort ?? 100,
  };

  if (p.kind === 'combo') {
    const imgs = p.comboItems
      .map(i => byId[i.productId]?.image)
      .filter(Boolean);

    if (imgs.length >= 2) {
      p.images = [...new Set(imgs)].slice(0, 3);
    } else if (d.images) {
      p.images = d.images;
    }

    p.comboLabels = p.comboItems
      .map(
        i =>
          byId[i.productId] &&
          `${byId[i.productId].short || byId[i.productId].name} ${i.weight} × ${bn(i.qty)}`,
      )
      .filter(Boolean);
  }

  return p;
}

const fromStatic = () =>
  staticProducts.map(p =>
    serialize({
      ...p,
      slug: p.id,
      kind: p.id === 'combo' ? 'combo' : 'single',
    }),
  );

// all=true → paused products included (admin).
// Falls back to static products for public catalog if DB is empty/unreachable.
export async function getCatalog({ all = false } = {}) {
  try {
    await connectDB();

    const docs = await Product.find().sort({ sort: 1, createdAt: 1 }).lean();

    if (!docs.length && !all) {
      return fromStatic();
    }

    const byId = Object.fromEntries(docs.map(d => [d.slug, d]));

    const list = docs.map(d => serialize(d, byId));

    return all ? list : list.filter(p => p.active);
  } catch (e) {
    console.error('catalog:', e.message);

    // Admin must see the real DB problem, not an empty list
    if (all) throw e;

    // Public catalog falls back to static products
    return fromStatic();
  }
}
