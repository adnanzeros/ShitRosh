// FILE: src/components/home/Hero.js
'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Tag, Truck, BadgeCheck, Gift } from 'lucide-react';

import { bn } from '@/lib/format';
import { DELIVERY } from '@/data/products';
import {
  unitPrice,
  discountActive,
  productAvailable,
  variantAvailable,
} from '@/lib/pricing';
import s from './Hero.module.css';

// cheapest orderable price (after any discount) for the price under each product
const fromPrice = p => {
  const ok = p.variants.filter(v => variantAvailable(p, v));
  const list = ok.length ? ok : p.variants;
  return Math.min(...list.map(v => unitPrice(p, v.price)));
};

export default function Hero({ products = [] }) {
  const reduce = useReducedMotion();

  // up to 3 live products (not combo, not stocked out)
  const featured = useMemo(() => {
    const live = products.filter(
      p => p.kind !== 'combo' && productAvailable(p),
    );
    return (live.length ? live : products).slice(0, 3);
  }, [products]);

  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduce || paused || featured.length < 2) return;
    const t = setInterval(() => setI(x => (x + 1) % featured.length), 3800);
    return () => clearInterval(t);
  }, [reduce, paused, featured.length]);

  const deal = products.find(p => discountActive(p) && productAvailable(p));
  const idx = featured.length ? i % featured.length : 0;
  const cur = featured[idx];
  if (!cur) return null;

  const fade = (delay = 0, y = 16) => ({
    initial: reduce ? false : { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
  });

  return (
    <section className={s.hero}>
      <div className={`container ${s.in}`}>
        <div className={s.copy}>
          <motion.h1 className={s.h1} {...fade(0, 26)}>
            <span className={s.l1}>শীতের খাঁটি স্বাদ,</span>
            <span className={s.l2}>খেজুরের</span>
            <span className={s.l3}>গুড়ের ঐতিহ্যে</span>
          </motion.h1>

          <motion.p className={s.p} {...fade(0.12)}>
            গাছির হাতে তোলা টাটকা রসে, মাটির চুলায় ধীর আঁচে জ্বাল দেওয়া — কোনো
            চিনি বা কেমিক্যাল ছাড়া খাঁটি খেজুরের গুড়, সরাসরি আপনার ঘরে।
          </motion.p>

          <motion.div className={s.btns} {...fade(0.22)}>
            <a href="#products" className="btn btnPrimary">
              এখনই অর্ডার করুন
            </a>
            <a href="#story" className={`btn ${s.ghost}`}>
              আমাদের গল্প জানুন
            </a>
          </motion.div>

          <motion.ul className={s.perks} {...fade(0.3)}>
            <li>
              <BadgeCheck size={18} /> ১০০% খাঁটি
            </li>
            <li>
              <Truck size={18} /> সারা দেশে হোম ডেলিভারি
            </li>
            <li>
              <Gift size={18} /> ৳{bn(DELIVERY.freeAbove)}+ অর্ডারে ডেলিভারি
              ফ্রি
            </li>
          </motion.ul>

          {deal && (
            <a href="#products" className={s.deal}>
              <Tag size={16} />
              <b>{deal.offerLabel || 'বিশেষ অফার'}:</b>
              {deal.short || deal.name} এ{' '}
              {deal.discountType === 'percent'
                ? `${bn(deal.discountValue)}%`
                : `৳${bn(deal.discountValue)}`}{' '}
              ছাড়
            </a>
          )}
        </div>

        <div
          className={s.stage}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div className={s.scene}>
            <div className={s.sky} aria-hidden="true">
              <motion.div
                className={s.sun}
                initial={reduce ? false : { y: '26%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <div className={s.horizon} aria-hidden="true" />
            <div className={s.ground} aria-hidden="true" />

            <a href="#products" className={s.prod} aria-label={cur.name}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={cur.id}
                  src={cur.image}
                  alt={cur.name}
                  initial={reduce ? false : { y: 34, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                />
              </AnimatePresence>
            </a>
          </div>

          <div className={s.picker} style={{ '--n': featured.length }}>
            {featured.map((p, k) => {
              const now = fromPrice(p);
              const listMin = Math.min(...p.variants.map(v => v.price));
              return (
                <button
                  type="button"
                  key={p.id}
                  className={`${s.chip} ${k === idx ? s.on : ''}`}
                  onClick={() => setI(k)}
                  onMouseEnter={() => setI(k)}
                  onFocus={() => setI(k)}
                  aria-pressed={k === idx}
                  aria-label={p.name}
                >
                  <img src={p.image} alt="" loading="lazy" />
                  <span>
                    <b>{p.short || p.name}</b>
                    <small>
                      ৳{bn(now)} থেকে
                      {now < listMin && <del>৳{bn(listMin)}</del>}
                    </small>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <svg
        className={s.wave}
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 40 C 240 90, 480 0, 720 38 S 1200 80, 1440 30 V80 H0Z" />
      </svg>
    </section>
  );
}
