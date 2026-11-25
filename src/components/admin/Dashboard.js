'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Phone,
  Copy,
  RefreshCw,
  LogOut,
  Search,
  Download,
  BadgeCheck,
  XCircle,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { bn } from '@/lib/format';
import ProductsAdmin from './ProductsAdmin';
import s from './Admin.module.css';

const TABS = [
  ['', 'সব'],
  ['pending', 'নতুন'],
  ['verify', 'পেমেন্ট যাচাই'],
  ['confirmed', 'নিশ্চিত'],
  ['shipped', 'পাঠানো হয়েছে'],
  ['delivered', 'ডেলিভারি হয়েছে'],
  ['cancelled', 'বাতিল'],
];

const ST = {
  pending: 'নতুন',
  confirmed: 'নিশ্চিত',
  shipped: 'পাঠানো হয়েছে',
  delivered: 'ডেলিভারি হয়েছে',
  cancelled: 'বাতিল',
};

const NEXT = {
  pending: ['confirmed', 'অর্ডার নিশ্চিত করুন'],
  confirmed: ['shipped', 'পাঠানো হয়েছে'],
  shipped: ['delivered', 'ডেলিভারি হয়েছে'],
};

const PM = {
  cod: 'ক্যাশ অন ডেলিভারি',
  bkash: 'bKash',
  nagad: 'Nagad',
};

const PS = {
  unpaid: 'বাকি',
  pending_verification: 'যাচাই বাকি',
  paid: 'পেমেন্ট পেয়েছি',
  rejected: 'পেমেন্ট ভুল',
};

const when = d =>
  new Date(d).toLocaleString('bn-BD', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });

export default function Dashboard() {
  const [tab, setTab] = useState('');
  const [q, setQ] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);
  const [view, setView] = useState('orders');
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const r = await fetch(
        `/api/admin/orders?status=${tab}&q=${encodeURIComponent(q)}`,
      );

      if (r.status === 401) {
        location.href = '/admin/login';
        return;
      }

      const d = await r.json();

      if (d.ok) {
        setData(d);
        setErr('');
      } else {
        setErr(d.message || 'লোড হয়নি');
        toast.error(d.message || 'লোড হয়নি');
      }
    } catch {
      setErr('নেটওয়ার্ক সমস্যা বা সার্ভার সাড়া দিচ্ছে না');
      toast.error('নেটওয়ার্ক সমস্যা');
    } finally {
      setLoading(false);
    }
  }, [tab, q]);

  useEffect(() => {
    const t = setTimeout(load, q ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  useEffect(() => {
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load]);

  async function patch(orderId, body, msg) {
    try {
      const r = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, ...body }),
      });

      if (r.status === 401) {
        location.href = '/admin/login';
        return;
      }

      const d = await r.json();

      if (d.ok) {
        toast.success(msg || 'সেভ হয়েছে');
        load();
      } else {
        toast.error(d.message || 'ব্যর্থ');
      }
    } catch {
      toast.error('নেটওয়ার্ক সমস্যা বা সার্ভার সাড়া দিচ্ছে না');
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // Logout page redirect will still happen.
    }

    location.href = '/admin/login';
  };

  const copy = t => {
    navigator.clipboard?.writeText(t);
    toast.success('কপি হয়েছে');
  };

  const c = data?.counts || {};

  return (
    <main className={s.wrap}>
      <header className={s.top}>
        <div className={s.brand}>
          <img src="/images/palm-emblem.png" alt="" />
          <b>শীতরস অ্যাডমিন</b>
        </div>

        <div className={s.topBtns}>
          <a className={s.ghost} href="/api/admin/subscribers">
            <Download size={16} />
            সাবস্ক্রাইবার CSV
          </a>

          <button className={s.ghost} onClick={load} aria-label="রিফ্রেশ">
            <RefreshCw size={16} className={loading ? s.spin : ''} />
          </button>

          <button className={s.ghost} onClick={logout}>
            <LogOut size={16} />
            বের হোন
          </button>
        </div>
      </header>

      <div className={s.views}>
        <button
          className={view === 'orders' ? s.on : ''}
          onClick={() => setView('orders')}
        >
          অর্ডার
        </button>

        <button
          className={view === 'products' ? s.on : ''}
          onClick={() => setView('products')}
        >
          পণ্য, কম্বো ও অফার
        </button>
      </div>

      {view === 'products' ? (
        <ProductsAdmin />
      ) : (
        <>
          <section className={s.stats}>
            <div>
              <span>আজকের অর্ডার</span>
              <b>{bn(data?.today.n ?? 0)}</b>
            </div>

            <div>
              <span>আজকের বিক্রি</span>
              <b>৳{bn(data?.today.sum ?? 0)}</b>
            </div>

            <div className={c.pending ? s.alert : ''}>
              <span>নতুন অর্ডার</span>
              <b>{bn(c.pending || 0)}</b>
            </div>

            <div className={data?.verify ? s.alert : ''}>
              <span>পেমেন্ট যাচাই বাকি</span>
              <b>{bn(data?.verify || 0)}</b>
            </div>
          </section>

          <div className={s.tools}>
            <div className={s.tabs}>
              {TABS.map(([k, l]) => (
                <button
                  key={k}
                  className={tab === k ? s.on : ''}
                  onClick={() => setTab(k)}
                >
                  {l}
                  {k && k !== 'verify' && c[k] ? <i>{bn(c[k])}</i> : null}
                </button>
              ))}
            </div>

            <label className={s.search}>
              <Search size={16} />

              <input
                placeholder="ফোন, নাম বা অর্ডার আইডি"
                value={q}
                onChange={e => setQ(e.target.value)}
              />
            </label>
          </div>

          {!data ? (
            <p className={s.empty}>{err || 'লোড হচ্ছে...'}</p>
          ) : !data.orders.length ? (
            <p className={s.empty}>কোনো অর্ডার নেই</p>
          ) : (
            <div className={s.list}>
              {data.orders.map(o => {
                const isOpen = open === o.orderId;
                const nx = NEXT[o.status];

                return (
                  <article
                    key={o.orderId}
                    className={`${s.order} ${s['st_' + o.status]}`}
                  >
                    <button
                      className={s.row}
                      onClick={() => setOpen(isOpen ? null : o.orderId)}
                      aria-expanded={isOpen}
                    >
                      <span className={s.badge}>{ST[o.status]}</span>

                      <span className={s.who}>
                        <b>{o.customer.name}</b>

                        <small>
                          {o.customer.district} · {when(o.createdAt)}
                        </small>
                      </span>

                      <span className={s.amt}>
                        ৳{bn(o.total)}
                        <small
                          className={
                            o.paymentStatus === 'paid'
                              ? s.ok
                              : o.paymentStatus === 'pending_verification'
                                ? s.warn
                                : ''
                          }
                        >
                          {PM[o.paymentMethod]} · {PS[o.paymentStatus]}
                        </small>
                      </span>

                      <ChevronDown size={18} className={isOpen ? s.flip : ''} />
                    </button>

                    {isOpen && (
                      <div className={s.detail}>
                        <div className={s.cols}>
                          <div>
                            <h4>পণ্য</h4>

                            {o.items.map((l, i) => (
                              <p key={i}>
                                {l.name} — {l.weight} × {bn(l.qty)}
                                {l.listPrice > l.unitPrice
                                  ? ` (ছাড়: ৳${bn(l.unitPrice)}, আসল ৳${bn(l.listPrice)})`
                                  : ''}{' '}
                                <b>৳{bn(l.lineTotal)}</b>
                              </p>
                            ))}

                            <p className={s.muted}>
                              ডেলিভারি ৳{bn(o.delivery)} · মোট{' '}
                              <b>৳{bn(o.total)}</b>
                            </p>

                            {o.note && (
                              <p className={s.note}>গ্রাহকের নোট: {o.note}</p>
                            )}
                          </div>

                          <div>
                            <h4>গ্রাহক</h4>

                            <p>
                              <b>{o.customer.name}</b>
                            </p>

                            <p>
                              <a
                                className={s.call}
                                href={`tel:${o.customer.phone}`}
                              >
                                <Phone size={15} />
                                {o.customer.phone}
                              </a>
                            </p>

                            <p>
                              {o.customer.address}, {o.customer.upazila},{' '}
                              {o.customer.district}
                            </p>

                            <button
                              className={s.mini}
                              onClick={() =>
                                copy(
                                  `${o.customer.name}\n${o.customer.phone}\n${o.customer.address}, ${o.customer.upazila}, ${o.customer.district}\nমোট: ৳${o.total}`,
                                )
                              }
                            >
                              <Copy size={14} />
                              ঠিকানা কপি
                            </button>
                          </div>

                          {o.paymentMethod !== 'cod' && (
                            <div>
                              <h4>{PM[o.paymentMethod]} পেমেন্ট</h4>

                              <p>
                                TrxID: <b className={s.trx}>{o.paymentTrxId}</b>{' '}
                                <button
                                  className={s.mini}
                                  onClick={() => copy(o.paymentTrxId)}
                                >
                                  <Copy size={14} />
                                </button>
                              </p>

                              <p className={s.muted}>
                                bKash/Nagad অ্যাপে TrxID মিলিয়ে ৳{bn(o.total)}{' '}
                                এসেছে কিনা দেখুন।
                              </p>

                              {o.paymentStatus !== 'paid' && (
                                <button
                                  className={s.good}
                                  onClick={() =>
                                    patch(
                                      o.orderId,
                                      { paymentStatus: 'paid' },
                                      'পেমেন্ট যাচাই হয়েছে',
                                    )
                                  }
                                >
                                  <BadgeCheck size={16} />
                                  পেমেন্ট পেয়েছি
                                </button>
                              )}

                              {o.paymentStatus === 'pending_verification' && (
                                <button
                                  className={s.bad}
                                  onClick={() =>
                                    patch(
                                      o.orderId,
                                      {
                                        paymentStatus: 'rejected',
                                      },
                                      'পেমেন্ট ভুল চিহ্নিত',
                                    )
                                  }
                                >
                                  <XCircle size={16} />
                                  মেলেনি
                                </button>
                              )}
                            </div>
                          )}

                          {o.paymentMethod === 'cod' &&
                            o.status === 'delivered' &&
                            o.paymentStatus !== 'paid' && (
                              <div>
                                <h4>ক্যাশ অন ডেলিভারি</h4>

                                <button
                                  className={s.good}
                                  onClick={() =>
                                    patch(
                                      o.orderId,
                                      { paymentStatus: 'paid' },
                                      'টাকা পাওয়া হয়েছে',
                                    )
                                  }
                                >
                                  <BadgeCheck size={16} />
                                  টাকা বুঝে পেয়েছি
                                </button>
                              </div>
                            )}
                        </div>

                        <div className={s.actions}>
                          {nx && (
                            <button
                              className={s.primary}
                              onClick={() =>
                                patch(o.orderId, { status: nx[0] }, ST[nx[0]])
                              }
                            >
                              {nx[1]}
                            </button>
                          )}

                          {o.status !== 'cancelled' &&
                            o.status !== 'delivered' && (
                              <button
                                className={s.dangerBtn}
                                onClick={() =>
                                  confirm('অর্ডার বাতিল করবেন?') &&
                                  patch(
                                    o.orderId,
                                    { status: 'cancelled' },
                                    'বাতিল হয়েছে',
                                  )
                                }
                              >
                                বাতিল
                              </button>
                            )}

                          {o.status === 'cancelled' && (
                            <button
                              className={s.ghost}
                              onClick={() =>
                                patch(
                                  o.orderId,
                                  { status: 'pending' },
                                  'আবার চালু হয়েছে',
                                )
                              }
                            >
                              আবার চালু করুন
                            </button>
                          )}

                          <span className={s.oid}>{o.orderId}</span>
                        </div>

                        <NoteBox
                          key={o.orderId + (o.adminNote || '')}
                          initial={o.adminNote || ''}
                          onSave={v =>
                            patch(o.orderId, { adminNote: v }, 'নোট সেভ হয়েছে')
                          }
                        />
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
}

function NoteBox({ initial, onSave }) {
  const [v, setV] = useState(initial);

  return (
    <div className={s.noteBox}>
      <input
        placeholder="আপনার নিজের নোট (গ্রাহক দেখবে না)"
        value={v}
        onChange={e => setV(e.target.value)}
      />

      <button
        className={s.mini}
        disabled={v === initial}
        onClick={() => onSave(v)}
      >
        সেভ
      </button>
    </div>
  );
}
