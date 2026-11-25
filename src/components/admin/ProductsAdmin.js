'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Pause,
  Play,
  PackageX,
  PackageCheck,
  Layers,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { bn } from '@/lib/format';
import { discountActive, unitPrice } from '@/lib/pricing';
import s from './Admin.module.css';

const IMAGES = [
  ['/images/jhola.png', 'ঝোলা'],
  ['/images/patali.png', 'পাটালি'],
  ['/images/bij.png', 'বীজ/দানাদার'],
];

const blank = kind => ({
  kind,
  name: '',
  short: '',
  desc: '',
  image: '/images/jhola.png',
  tone: '#E9A23B',
  offerLabel: '',
  variants: [
    {
      w: kind === 'combo' ? '৩ কেজি বক্স' : '১ কেজি',
      price: '',
      inStock: true,
    },
  ],
  comboItems: [],
  active: true,
  inStock: true,
  discountType: 'none',
  discountValue: 0,
  discountEndsAt: '',
});

const api = async (method, body, qs = '') => {
  const r = await fetch('/api/admin/products' + qs, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body && JSON.stringify(body),
  });

  if (r.status === 401) {
    location.href = '/admin/login';
    return { ok: false };
  }

  return r.json();
};

export default function ProductsAdmin() {
  const [list, setList] = useState(null);
  const [edit, setEdit] = useState(null);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    try {
      const d = await api('GET');

      if (d.ok) {
        setList(d.products);
        setErr('');
      } else {
        setErr(d.message || 'লোড হয়নি');
        toast.error(d.message || 'লোড হয়নি');
      }
    } catch {
      setErr('নেটওয়ার্ক সমস্যা বা সার্ভার সাড়া দিচ্ছে না');
      toast.error('নেটওয়ার্ক সমস্যা বা সার্ভার সাড়া দিচ্ছে না');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const quick = async (p, patch, msg) => {
    try {
      const d = await api('PATCH', { slug: p.id, ...patch });

      if (d.ok) {
        toast.success(msg);
        load();
      } else {
        toast.error(d.message || 'ব্যর্থ');
      }
    } catch {
      toast.error('নেটওয়ার্ক সমস্যা বা সার্ভার সাড়া দিচ্ছে না');
    }
  };

  const del = async p => {
    if (
      !confirm(
        `"${p.name}" মুছে ফেলবেন? এটা ফেরানো যাবে না। (শুধু লুকাতে চাইলে "বন্ধ" দিন)`,
      )
    )
      return;

    try {
      const d = await api('DELETE', null, `?slug=${encodeURIComponent(p.id)}`);

      if (d.ok) {
        toast.success('মুছে গেছে');
        load();
      } else {
        toast.error(d.message || 'ব্যর্থ');
      }
    } catch {
      toast.error('নেটওয়ার্ক সমস্যা বা সার্ভার সাড়া দিচ্ছে না');
    }
  };

  return (
    <>
      <div className={s.pHead}>
        <button className={s.primary} onClick={() => setEdit(blank('single'))}>
          <Plus size={16} /> নতুন পণ্য
        </button>

        <button className={s.ghost} onClick={() => setEdit(blank('combo'))}>
          <Layers size={16} /> নতুন কম্বো
        </button>
      </div>

      {!list ? (
        <p className={s.empty}>{err || 'লোড হচ্ছে...'}</p>
      ) : !list.length ? (
        <p className={s.empty}>
          কোনো পণ্য নেই — <code>npm run seed</code> চালান অথবা নতুন পণ্য যোগ
          করুন
        </p>
      ) : (
        <div className={s.list}>
          {list.map(p => {
            const off = discountActive(p);

            return (
              <article
                key={p.id}
                className={`${s.pRow} ${!p.active ? s.paused : ''}`}
              >
                <img src={p.image} alt="" className={s.pThumb} />

                <div className={s.pInfo}>
                  <b>{p.name}</b>

                  <small>
                    {p.variants
                      .map(
                        v =>
                          `${v.w} ৳${bn(unitPrice(p, v.price))}${v.inStock ? '' : ' (শেষ)'}`,
                      )
                      .join(' · ')}
                  </small>

                  <span className={s.tagRow}>
                    {p.kind === 'combo' && <i className={s.tCombo}>কম্বো</i>}

                    {!p.active && <i className={s.tOff}>বন্ধ (লুকানো)</i>}

                    {!p.inStock && <i className={s.tOff}>স্টক শেষ</i>}

                    {off && (
                      <i className={s.tOffer}>
                        {p.discountType === 'percent'
                          ? `${bn(p.discountValue)}%`
                          : `৳${bn(p.discountValue)}`}{' '}
                        ছাড়
                      </i>
                    )}

                    {p.offerLabel && <i className={s.tOffer}>{p.offerLabel}</i>}
                  </span>
                </div>

                <div className={s.pBtns}>
                  <button
                    className={s.mini}
                    onClick={() =>
                      setEdit({
                        ...p,
                        discountEndsAt: p.discountEndsAt
                          ? p.discountEndsAt.slice(0, 10)
                          : '',
                      })
                    }
                  >
                    <Pencil size={14} /> এডিট
                  </button>

                  <button
                    className={s.mini}
                    onClick={() =>
                      quick(
                        p,
                        { active: !p.active },
                        p.active ? 'বন্ধ করা হয়েছে' : 'চালু হয়েছে',
                      )
                    }
                  >
                    {p.active ? (
                      <>
                        <Pause size={14} /> বন্ধ
                      </>
                    ) : (
                      <>
                        <Play size={14} /> চালু
                      </>
                    )}
                  </button>

                  <button
                    className={s.mini}
                    onClick={() =>
                      quick(
                        p,
                        { inStock: !p.inStock },
                        p.inStock ? 'স্টক আউট' : 'স্টকে আছে',
                      )
                    }
                  >
                    {p.inStock ? (
                      <>
                        <PackageX size={14} /> স্টক আউট
                      </>
                    ) : (
                      <>
                        <PackageCheck size={14} /> স্টকে আনুন
                      </>
                    )}
                  </button>

                  <button className={s.miniDanger} onClick={() => del(p)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {edit && (
        <Editor
          init={edit}
          all={list || []}
          onClose={() => setEdit(null)}
          onSaved={() => {
            setEdit(null);
            load();
          }}
        />
      )}
    </>
  );
}

function Editor({ init, all, onClose, onSaved }) {
  const [p, setP] = useState(init);
  const [busy, setBusy] = useState(false);

  const isNew = !init.id;

  const set = (k, v) => setP(x => ({ ...x, [k]: v }));

  const setVar = (i, patch) =>
    set(
      'variants',
      p.variants.map((v, k) => (k === i ? { ...v, ...patch } : v)),
    );

  const setItem = (i, patch) =>
    set(
      'comboItems',
      p.comboItems.map((v, k) => (k === i ? { ...v, ...patch } : v)),
    );

  const singles = all.filter(x => x.kind !== 'combo' && x.id !== p.id);

  const sumOf = () =>
    p.comboItems.reduce((t, it) => {
      const v = singles
        .find(x => x.id === it.productId)
        ?.variants.find(x => x.w === it.weight);

      return t + (v ? v.price * (it.qty || 1) : 0);
    }, 0);

  async function save() {
    setBusy(true);

    const body = {
      name: p.name,
      short: p.short,
      desc: p.desc,
      image: p.image,
      tone: p.tone,
      kind: p.kind,
      offerLabel: p.offerLabel,
      active: p.active,
      inStock: p.inStock,
      variants: p.variants,
      comboItems: p.kind === 'combo' ? p.comboItems : [],
      discountType: p.discountType,
      discountValue: p.discountValue,
      discountEndsAt: p.discountEndsAt || null,
    };

    try {
      const d = isNew
        ? await api('POST', body)
        : await api('PATCH', { slug: p.id, ...body });

      setBusy(false);

      if (d.ok) {
        toast.success('সেভ হয়েছে');
        onSaved();
      } else {
        toast.error(d.message || 'সেভ হয়নি');
      }
    } catch {
      setBusy(false);
      toast.error('নেটওয়ার্ক সমস্যা বা সার্ভার সাড়া দিচ্ছে না');
    }
  }

  return (
    <div
      className={s.overlay}
      onMouseDown={e => e.target === e.currentTarget && onClose()}
    >
      <div className={s.modal}>
        <div className={s.mHead}>
          <h3>
            {isNew ? 'নতুন' : 'এডিট:'} {p.kind === 'combo' ? 'কম্বো' : 'পণ্য'}
          </h3>

          <button className={s.ghost} onClick={onClose} aria-label="বন্ধ">
            <X size={16} />
          </button>
        </div>

        <div className={s.fGrid}>
          <label className={s.fFull}>
            নাম
            <input value={p.name} onChange={e => set('name', e.target.value)} />
          </label>

          <label>
            ছোট নাম
            <input
              value={p.short}
              onChange={e => set('short', e.target.value)}
            />
          </label>

          <label>
            রং
            <input
              type="color"
              value={p.tone}
              onChange={e => set('tone', e.target.value)}
            />
          </label>

          <label className={s.fFull}>
            বর্ণনা
            <textarea
              rows={2}
              value={p.desc}
              onChange={e => set('desc', e.target.value)}
            />
          </label>
        </div>

        <label className={s.fFull}>
          ছবি
          <div className={s.imgPick}>
            {IMAGES.map(([src, l]) => (
              <button
                type="button"
                key={src}
                className={p.image === src ? s.on : ''}
                onClick={() => set('image', src)}
              >
                <img src={src} alt={l} />
                {l}
              </button>
            ))}
          </div>
          <input
            value={p.image}
            onChange={e => set('image', e.target.value)}
            placeholder="/images/... অথবা https://..."
          />
        </label>

        <h4 className={s.fh}>ওজন ও দাম</h4>

        {p.variants.map((v, i) => (
          <div className={s.vRow} key={i}>
            <input
              placeholder="ওজন (যেমন ১ কেজি)"
              value={v.w}
              onChange={e => setVar(i, { w: e.target.value })}
            />

            <input
              placeholder="দাম ৳"
              inputMode="numeric"
              value={v.price}
              onChange={e =>
                setVar(i, {
                  price: e.target.value.replace(/\D/g, ''),
                })
              }
            />

            <label className={s.chk}>
              <input
                type="checkbox"
                checked={v.inStock}
                onChange={e => setVar(i, { inStock: e.target.checked })}
              />{' '}
              স্টকে
            </label>

            {p.variants.length > 1 && (
              <button
                type="button"
                className={s.miniDanger}
                onClick={() =>
                  set(
                    'variants',
                    p.variants.filter((_, k) => k !== i),
                  )
                }
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}

        {p.variants.length < 8 && (
          <button
            type="button"
            className={s.mini}
            onClick={() =>
              set('variants', [
                ...p.variants,
                { w: '', price: '', inStock: true },
              ])
            }
          >
            <Plus size={14} /> ওজন যোগ
          </button>
        )}

        {p.kind === 'combo' && (
          <>
            <h4 className={s.fh}>কম্বোতে কী কী থাকবে</h4>

            {p.comboItems.map((it, i) => {
              const sp = singles.find(x => x.id === it.productId);

              return (
                <div className={s.vRow} key={i}>
                  <select
                    value={it.productId}
                    onChange={e =>
                      setItem(i, {
                        productId: e.target.value,
                        weight:
                          singles.find(x => x.id === e.target.value)
                            ?.variants[0]?.w || '',
                      })
                    }
                  >
                    <option value="">পণ্য বাছুন</option>

                    {singles.map(x => (
                      <option key={x.id} value={x.id}>
                        {x.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={it.weight}
                    onChange={e => setItem(i, { weight: e.target.value })}
                    disabled={!sp}
                  >
                    <option value="">ওজন</option>

                    {sp?.variants.map(v => (
                      <option key={v.w} value={v.w}>
                        {v.w} (৳{bn(v.price)})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={it.qty}
                    onChange={e => setItem(i, { qty: e.target.value })}
                    aria-label="পরিমাণ"
                  />

                  <button
                    type="button"
                    className={s.miniDanger}
                    onClick={() =>
                      set(
                        'comboItems',
                        p.comboItems.filter((_, k) => k !== i),
                      )
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}

            <button
              type="button"
              className={s.mini}
              onClick={() =>
                set('comboItems', [
                  ...p.comboItems,
                  { productId: '', weight: '', qty: 1 },
                ])
              }
            >
              <Plus size={14} /> আইটেম যোগ
            </button>

            {sumOf() > 0 && (
              <p className={s.muted}>
                আলাদা কিনলে মোট ৳{bn(sumOf())}।{' '}
                <button
                  type="button"
                  className={s.mini}
                  onClick={() => setVar(0, { price: String(sumOf()) })}
                >
                  প্রথম ওজনের দামে বসান
                </button>
              </p>
            )}
          </>
        )}

        <h4 className={s.fh}>অফার ও ডিসকাউন্ট</h4>

        <div className={s.vRow}>
          <select
            value={p.discountType}
            onChange={e => set('discountType', e.target.value)}
          >
            <option value="none">ছাড় নেই</option>
            <option value="percent">শতাংশ (%)</option>
            <option value="flat">টাকা (৳) কমবে</option>
          </select>

          <input
            type="number"
            min={0}
            placeholder="পরিমাণ"
            disabled={p.discountType === 'none'}
            value={p.discountValue}
            onChange={e => set('discountValue', e.target.value)}
          />

          <label className={s.chk}>
            শেষ তারিখ
            <input
              type="date"
              disabled={p.discountType === 'none'}
              value={p.discountEndsAt || ''}
              onChange={e => set('discountEndsAt', e.target.value)}
            />
          </label>
        </div>

        <label className={s.fFull}>
          অফার ব্যাজ (ঐচ্ছিক, যেমন "শীতের অফার")
          <input
            maxLength={40}
            value={p.offerLabel}
            onChange={e => set('offerLabel', e.target.value)}
          />
        </label>

        <div className={s.vRow}>
          <label className={s.chk}>
            <input
              type="checkbox"
              checked={p.active}
              onChange={e => set('active', e.target.checked)}
            />{' '}
            দোকানে দেখাবে (বন্ধ করলে লুকানো)
          </label>

          <label className={s.chk}>
            <input
              type="checkbox"
              checked={p.inStock}
              onChange={e => set('inStock', e.target.checked)}
            />{' '}
            স্টকে আছে
          </label>
        </div>

        <div className={s.actions}>
          <button
            className={s.primary}
            onClick={save}
            disabled={busy || !p.name.trim()}
          >
            {busy ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
          </button>

          <button className={s.ghost} onClick={onClose}>
            বাতিল
          </button>
        </div>
      </div>
    </div>
  );
}
