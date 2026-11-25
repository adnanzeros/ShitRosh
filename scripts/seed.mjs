import mongoose from 'mongoose';
import crypto from 'crypto';
import fs from 'fs';
import dns from 'node:dns';

const {
  MONGODB_URI,
  SEED_ADMIN_USERNAME,
  SEED_ADMIN_EMAIL,
  SEED_ADMIN_PASSWORD,
} = process.env;

if (
  !MONGODB_URI ||
  !SEED_ADMIN_USERNAME ||
  !SEED_ADMIN_EMAIL ||
  !SEED_ADMIN_PASSWORD
) {
  console.error(
    'Missing env: MONGODB_URI, SEED_ADMIN_USERNAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD (put them in .env.local)',
  );
  process.exit(1);
}

const hashPassword = pw => {
  const salt = crypto.randomBytes(16).toString('hex');

  return `${salt}:${crypto.scryptSync(String(pw), salt, 64).toString('hex')}`;
};

// src/*.js are ESM without "type":"module"
// Load them through a data URL
const load = rel =>
  import(
    'data:text/javascript;base64,' +
      Buffer.from(
        fs.readFileSync(new URL(rel, import.meta.url), 'utf8'),
      ).toString('base64')
  );

const { products } = await load('../src/data/products.js');

const { isSrvDnsError, srvToStandardUri } = await load(
  '../src/lib/mongoUri.js',
);

const OPTIONS = {
  serverSelectionTimeoutMS: 15000,
  maxPoolSize: 10,
};

try {
  try {
    // First try the original MongoDB SRV URI
    await mongoose.connect(MONGODB_URI, OPTIONS);
  } catch (e) {
    if (!MONGODB_URI.startsWith('mongodb+srv://') || !isSrvDnsError(e)) {
      throw e;
    }

    console.warn(
      `[MongoDB] ${e.message}\n` +
        '[MongoDB] System DNS failed. Retrying with public DNS...',
    );

    // Retry SRV lookup using public DNS
    dns.setServers(['8.8.8.8', '1.1.1.1']);

    await mongoose.disconnect().catch(() => {});

    try {
      await mongoose.connect(MONGODB_URI, OPTIONS);
    } catch (dnsError) {
      if (!isSrvDnsError(dnsError)) {
        throw dnsError;
      }

      console.warn(
        '[MongoDB] Public DNS SRV lookup also failed. ' +
          'Trying standard MongoDB URI...',
      );

      await mongoose.disconnect().catch(() => {});

      const standardUri = await srvToStandardUri(MONGODB_URI);

      await mongoose.connect(standardUri, OPTIONS);
    }
  }

  console.log('[MongoDB] Connected successfully');
} catch (e) {
  console.error('\n✖ Could not connect to MongoDB:', e.message);

  console.error(
    '  Check MONGODB_URI, DNS connection, and Atlas → Network Access.',
  );

  process.exit(1);
}

// ---------- Seed data ----------
const RESET = process.argv.includes('--reset');
const now = new Date();

try {
  const db = mongoose.connection.db;

  // 1) Main admin (created only if missing; use `npm run seed -- --reset` to reset the password)
  const username = SEED_ADMIN_USERNAME.trim().toLowerCase();
  const email = SEED_ADMIN_EMAIL.trim().toLowerCase();
  const admins = db.collection('admins');
  const existing = await admins.findOne({ $or: [{ username }, { email }] });

  if (!existing) {
    await admins.insertOne({
      username,
      email,
      passwordHash: hashPassword(SEED_ADMIN_PASSWORD),
      isMain: true,
      resetTries: 0,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`✔ Admin created: ${username} (${email})`);
  } else if (RESET) {
    await admins.updateOne(
      { _id: existing._id },
      {
        $set: {
          passwordHash: hashPassword(SEED_ADMIN_PASSWORD),
          updatedAt: now,
        },
        $unset: { resetHash: '', resetExpires: '', resetSentAt: '' },
      },
    );
    console.log(`✔ Admin password reset: ${existing.username}`);
  } else {
    console.log(
      `• Admin already exists: ${existing.username} (password unchanged; add -- --reset to reset)`,
    );
  }

  // 2) Products (inserted only if the slug is missing, so admin-panel edits are never overwritten)
  const col = db.collection('products');
  let added = 0;

  for (const [i, p] of products.entries()) {
    const isCombo = p.id === 'combo';
    const doc = {
      slug: p.id,
      kind: isCombo ? 'combo' : 'single',
      name: p.name,
      short: p.short || '',
      desc: p.desc || '',
      image: p.image || '/images/jhola.png',
      tone: p.tone || '#E9A23B',
      variants: p.variants.map(v => ({
        w: v.w,
        price: v.price,
        inStock: true,
      })),
      comboItems: isCombo
        ? ['jhola', 'patali', 'danadar'].map(id => ({
            productId: id,
            weight: '১ কেজি',
            qty: 1,
          }))
        : [],
      active: true,
      inStock: true,
      discountType: 'none',
      discountValue: 0,
      offerLabel: '',
      sort: (i + 1) * 10,
      createdAt: now,
      updatedAt: now,
    };
    const r = await col.updateOne(
      { slug: doc.slug },
      { $setOnInsert: doc },
      { upsert: true },
    );
    if (r.upsertedCount) added++;
  }

  console.log(
    `✔ Products: ${added} added, ${products.length - added} already existed`,
  );
} catch (e) {
  console.error('\n✖ Seed failed:', e.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => {});
}
