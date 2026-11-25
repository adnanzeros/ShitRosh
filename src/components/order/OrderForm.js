// FILE: src/components/order/OrderForm.js
'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  Plus,
  Trash2,
  Loader2,
  Copy,
  ShoppingBag,
  Truck,
  Banknote,
  BadgeCheck,
  Undo2,
} from 'lucide-react';
import { toast } from 'sonner';
import { districts, DELIVERY } from '@/data/products';
import { unitPrice, variantAvailable, productAvailable } from '@/lib/pricing';
import { bn } from '@/lib/format';
import s from './OrderForm.module.css';

const newLine = (productId = '', weight = '', qty = 1) => ({
  productId,
  weight,
  qty,
});
const newKey = () =>
  crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random();
const empty = {
  name: '',
  phone: '',
  district: '',
  upazila: '',
  address: '',
  note: '',
  paymentMethod: 'cod',
};
export default function OrderForm({ products = [] }) {
  const [f, setF] = useState(empty);
  const [items, setItems] = useState([newLine()]);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const [showBar, setShowBar] = useState(false);
  const key = useRef(newKey());
  const lock = useRef(false);
  const sec = useRef(null);

  useEffect(() => {
    const h = e => {
      const { productId, weight, qty } = e.detail;
      setDone(null);
      setItems(cur => {
        const idx = cur.findIndex(
          l => l.productId === productId && l.weight === weight,
        );
        if (idx >= 0)
          return cur.map((l, i) =>
            i === idx ? { ...l, qty: Math.min(20, l.qty + qty) } : l,
          );
        return [
          ...cur.filter(l => l.productId),
          newLine(productId, weight, qty),
        ];
      });
    };
    window.addEventListener('add-to-order', h);
    return () => window.removeEventListener('add-to-order', h);
  }, []);

  // floating "order" bar is shown only while the form itself is off-screen
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = sec.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([x]) => setInView(x.isIntersecting), {
      threshold: 0.05,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Preview only. The server recalculates every price and the delivery charge.
  const preview = useMemo(() => {
    let sub = 0,
      count = 0;
    for (const l of items) {
      const p = products.find(p => p.id === l.productId);
      const v = p?.variants.find(x => x.w === l.weight);
      if (v && variantAvailable(p, v)) {
        sub += unitPrice(p, v.price) * l.qty;
        count += l.qty;
      }
    }
    const delivery = !sub
      ? 0
      : sub >= DELIVERY.freeAbove
        ? 0
        : f.district === 'ঢাকা'
          ? DELIVERY.dhaka
          : DELIVERY.outside;
    return { sub, count, delivery, total: sub + delivery };
  }, [items, f.district, products]);
  useEffect(
    () => setShowBar(preview.count > 0 && !inView && !done),
    [preview.count, inView, done],
  );

  const set = k => e => setF({ ...f, [k]: e.target.value });
  const upd = (i, patch) =>
    setItems(items.map((l, k) => (k === i ? { ...l, ...patch } : l)));
  const E = ({ k }) =>
    errors[k] ? <p className={s.err}>{errors[k]}</p> : null;
  const copy = t => {
    try {
      navigator.clipboard.writeText(String(t));
      toast.success('কপি হয়েছে');
    } catch {
      toast.error('কপি হয়নি, হাতে লিখে নিন');
    }
  };

  async function submit(e) {
    e.preventDefault();
    if (lock.current) return;
    const valid = items.filter(l => l.productId && l.weight);
    if (!valid.length) {
      setErrors({ items: 'কমপক্ষে একটি পণ্য ও ওজন বেছে নিন' });
      toast.error('পণ্য ও ওজন বেছে নিন');
      return;
    }
    lock.current = true;
    setBusy(true);
    setErrors({});
    try {
      const r = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...f,
          items: valid,
          idempotencyKey: key.current,
        }),
      });
      const d = await r.json();
      if (!d.ok) {
        setErrors(d.errors || {});
        toast.error(d.message || 'ফর্মে ভুল আছে, লাল লেখাগুলো দেখুন');
        const first = d.errors && Object.keys(d.errors)[0];
        if (first)
          setTimeout(
            () =>
              document
                .querySelector(`[data-f="${first}"]`)
                ?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
            50,
          );
      } else {
        setDone({ id: d.orderId, total: d.total, method: f.paymentMethod });
        setF(empty);
        setItems([newLine()]);
        key.current = newKey();
        document
          .getElementById('order')
          ?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch {
      toast.error('নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন');
    }
    lock.current = false;
    setBusy(false);
  }

  const phone = process.env.NEXT_PUBLIC_PHONE;
  const toFree = Math.max(0, DELIVERY.freeAbove - preview.sub);

  return (
    <section id="order" ref={sec} className={`section ${s.wrap}`}>
      <div className="container">
        <div style={{ textAlign: 'center' }}>
          <p className="eyebrow">অর্ডার ফর্ম</p>
          <h2 className="title">এখনই অর্ডার করুন</h2>
        </div>
        <div className={s.card}>
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="ok"
                className={s.success}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <CheckCircle2 size={72} />
                <h3>অর্ডার গ্রহণ করা হয়েছে!</h3>
                <button
                  className={s.oid}
                  onClick={() => copy(done.id)}
                  aria-label="অর্ডার আইডি কপি"
                >
                  {done.id} <Copy size={16} />
                </button>
                <p>
                  মোট: <b>৳{bn(done.total)}</b>
                </p>
                <p className={s.sub}>
                  আমরা শীঘ্রই ফোন করে নিশ্চিত করব। গুড় হাতে পেয়ে টাকা দিন।
                </p>
                {phone && (
                  <a
                    className="btn btnGhost"
                    style={{ marginTop: 14 }}
                    href={`tel:+${phone.replace(/\D/g, '')}`}
                  >
                    কথা বলতে কল করুন
                  </a>
                )}
                <button
                  className="btn btnPrimary"
                  style={{ marginTop: 14 }}
                  onClick={() => setDone(null)}
                >
                  নতুন অর্ডার করুন
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={submit}
                noValidate
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className={s.h} style={{ marginTop: 0 }}>
                  পণ্য ও পরিমাণ
                </h3>
                {items.map((l, i) => {
                  const p = products.find(x => x.id === l.productId);
                  return (
                    <div className={s.line} key={i}>
                      <div className={s.thumb}>
                        {p ? (
                          <img src={p.image} alt="" />
                        ) : (
                          <ShoppingBag size={22} />
                        )}
                      </div>
                      <div className={`${s.field} ${s.pick}`}>
                        <select
                          value={l.productId}
                          onChange={e =>
                            upd(i, { productId: e.target.value, weight: '' })
                          }
                          aria-label="পণ্য"
                        >
                          <option value="">পণ্য বেছে নিন</option>
                          {products.map(x => (
                            <option
                              key={x.id}
                              value={x.id}
                              disabled={!productAvailable(x)}
                            >
                              {x.name}
                              {!productAvailable(x) ? ' (স্টক শেষ)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className={`${s.field} ${s.wt}`}>
                        <select
                          value={l.weight}
                          onChange={e => upd(i, { weight: e.target.value })}
                          disabled={!p}
                          aria-label="ওজন"
                        >
                          <option value="">ওজন</option>
                          {p?.variants.map(v => (
                            <option
                              key={v.w}
                              value={v.w}
                              disabled={!variantAvailable(p, v)}
                            >
                              {v.w} — ৳{bn(unitPrice(p, v.price))}
                              {!variantAvailable(p, v) ? ' (স্টক শেষ)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className={s.lineEnd}>
                        <div className={s.step}>
                          <button
                            type="button"
                            onClick={() =>
                              upd(i, { qty: Math.max(1, l.qty - 1) })
                            }
                            aria-label="কমান"
                          >
                            −
                          </button>
                          <b>{bn(l.qty)}</b>
                          <button
                            type="button"
                            onClick={() =>
                              upd(i, { qty: Math.min(20, l.qty + 1) })
                            }
                            aria-label="বাড়ান"
                          >
                            +
                          </button>
                        </div>
                        {items.length > 1 && (
                          <button
                            type="button"
                            className={s.rm}
                            onClick={() =>
                              setItems(items.filter((_, k) => k !== i))
                            }
                            aria-label="মুছুন"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div data-f="items">
                  <E k="items" />
                </div>
                {items.length < 10 && (
                  <button
                    type="button"
                    className={s.add}
                    onClick={() => setItems([...items, newLine()])}
                  >
                    <Plus size={18} />
                    আরও পণ্য যোগ করুন
                  </button>
                )}
                {preview.sub > 0 && toFree > 0 && (
                  <p className={s.free}>
                    <Truck size={16} /> আর ৳{bn(toFree)} এর পণ্য নিলে ডেলিভারি
                    ফ্রি
                  </p>
                )}

                <h3 className={s.h}>ডেলিভারি তথ্য</h3>
                <div className={s.grid2}>
                  <div className={s.field} data-f="name">
                    <label>আপনার নাম</label>
                    <input
                      value={f.name}
                      onChange={set('name')}
                      autoComplete="name"
                    />
                    <E k="name" />
                  </div>
                  <div className={s.field} data-f="phone">
                    <label>মোবাইল নম্বর</label>
                    <input
                      value={f.phone}
                      onChange={set('phone')}
                      inputMode="tel"
                      placeholder="01XXXXXXXXX"
                      autoComplete="tel"
                    />
                    <E k="phone" />
                  </div>
                  <div className={s.field} data-f="district">
                    <label>জেলা</label>
                    <select value={f.district} onChange={set('district')}>
                      <option value="">জেলা বেছে নিন</option>
                      {districts.map(d => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                    <E k="district" />
                  </div>
                  <div className={s.field} data-f="upazila">
                    <label>উপজেলা / থানা</label>
                    <input value={f.upazila} onChange={set('upazila')} />
                    <E k="upazila" />
                  </div>
                  <div className={`${s.field} ${s.full}`} data-f="address">
                    <label>পূর্ণ ঠিকানা</label>
                    <textarea
                      rows={3}
                      value={f.address}
                      onChange={set('address')}
                      placeholder="বাসা/রোড/গ্রাম, এলাকা"
                    />
                    <E k="address" />
                  </div>
                  <div className={`${s.field} ${s.full}`}>
                    <label>বিশেষ নির্দেশনা (ঐচ্ছিক)</label>
                    <textarea rows={2} value={f.note} onChange={set('note')} />
                  </div>
                </div>

                <h3 className={s.h}>পেমেন্ট পদ্ধতি</h3>
                <div className={s.cod}>
                  <span className={s.codIcon}>
                    <Banknote size={26} />
                  </span>
                  <div>
                    <b className={s.codTitle}>ক্যাশ অন ডেলিভারি</b>
                    <p className={s.codSlogan}>
                      শীতরস — শীতের ঐতিহ্য, মাটির ঘ্রাণ।
                    </p>
                    <p className={s.codText}>
                      খেজুরের গুড় হাতে পেয়ে তারপর টাকা দিন। ভালো না লাগলে ফেরত
                      পাঠিয়ে দিন।
                    </p>
                    <div className={s.codTags}>
                      <span>
                        <BadgeCheck size={15} /> আগে কোনো টাকা নয়
                      </span>
                      <span>
                        <Undo2 size={15} /> পছন্দ না হলে ফেরত
                      </span>
                    </div>
                  </div>
                </div>

                <div className={s.sum}>
                  <div>
                    <span>পণ্যের মূল্য</span>
                    <span>৳{bn(preview.sub)}</span>
                  </div>
                  <div>
                    <span>ডেলিভারি চার্জ</span>
                    <span>
                      {preview.sub && !preview.delivery
                        ? 'ফ্রি'
                        : `৳${bn(preview.delivery)}`}
                    </span>
                  </div>
                  <div className={s.tot}>
                    <span>সর্বমোট</span>
                    <span>৳{bn(preview.total)}</span>
                  </div>
                  <p>চূড়ান্ত মূল্য সার্ভারে যাচাই করে নিশ্চিত করা হবে।</p>
                </div>
                <button
                  className={`btn btnPrimary ${s.submit}`}
                  disabled={busy}
                >
                  {busy ? (
                    <>
                      <Loader2
                        size={20}
                        style={{ animation: 'spin 1s linear infinite' }}
                      />
                      অর্ডার হচ্ছে...
                    </>
                  ) : (
                    'অর্ডার নিশ্চিত করুন'
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showBar && (
            <motion.a
              href="#order"
              className={s.bar}
              initial={{ y: 90, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 90, opacity: 0 }}
            >
              <span className={s.barL}>
                <ShoppingBag size={20} />
                <b>{bn(preview.count)} টি পণ্য</b>
              </span>
              <span className={s.barR}>
                ৳{bn(preview.sub)} · অর্ডার সম্পন্ন করুন
              </span>
            </motion.a>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
