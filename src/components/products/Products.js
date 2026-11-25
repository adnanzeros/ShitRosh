// FILE: src/components/products/Products.js
'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import Reveal from '@/components/ui/Reveal';
import { bn } from '@/lib/format';
import { unitPrice, discountActive, variantAvailable } from '@/lib/pricing';
import s from './Products.module.css';

function Card({ p, i }) {
  const first = p.variants.findIndex(v => variantAvailable(p, v));
  const [vi, setVi] = useState(Math.max(0, first));
  const [qty, setQty] = useState(1);
  const v = p.variants[vi];
  const ok = variantAvailable(p, v);
  const now = unitPrice(p, v.price);
  const off = discountActive(p) && now < v.price;
  function order() {
    window.dispatchEvent(
      new CustomEvent('add-to-order', {
        detail: { productId: p.id, weight: v.w, qty },
      }),
    );
    toast.success(`${p.name} (${v.w} × ${bn(qty)}) যোগ হয়েছে`);
  }
  return (
    <Reveal delay={i * 0.08} className={`${s.card} ${p.images ? s.combo : ''}`}>
      <div className={s.media} style={{ '--tone': p.tone }}>
        {(off || p.offerLabel) && (
          <span className={s.tag}>
            {p.offerLabel ||
              (p.discountType === 'percent'
                ? `${bn(p.discountValue)}% ছাড়`
                : `৳${bn(p.discountValue)} ছাড়`)}
          </span>
        )}
        {p.images ? (
          p.images.map(src => <img key={src} src={src} alt="" loading="lazy" />)
        ) : (
          <motion.img
            src={p.image}
            alt={p.name}
            loading="lazy"
            whileHover={{ scale: 1.06, rotate: -2 }}
          />
        )}
      </div>
      <div className={s.body}>
        <h3>{p.name}</h3>
        <p>{p.desc}</p>
        {p.comboLabels?.length > 0 && (
          <p className={s.incl}>এতে আছে: {p.comboLabels.join(' + ')}</p>
        )}
        <div className={s.weights}>
          {p.variants.map((x, k) => (
            <button
              key={x.w}
              className={`${s.chip} ${k === vi ? s.on : ''} ${!variantAvailable(p, x) ? s.out : ''}`}
              onClick={() => setVi(k)}
            >
              {x.w}
            </button>
          ))}
        </div>
        <div className={s.row}>
          <span className={s.price}>
            ৳{bn(now * qty)}
            {off && <del className={s.old}>৳{bn(v.price * qty)}</del>}
          </span>
          <div className={s.qty}>
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              aria-label="কমান"
            >
              <Minus size={16} />
            </button>
            <b>{bn(qty)}</b>
            <button
              onClick={() => setQty(Math.min(20, qty + 1))}
              aria-label="বাড়ান"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        <button className="btn btnPrimary" onClick={order} disabled={!ok}>
          <ShoppingBag size={20} />
          {ok ? 'অর্ডারে যোগ করুন' : 'স্টক শেষ'}
        </button>
      </div>
    </Reveal>
  );
}

export default function Products({ products = [] }) {
  return (
    <section id="products" className="section">
      <div className="container">
        <Reveal>
          <p className="eyebrow">আমাদের সংগ্রহ</p>
          <h2 className="title">কোনটা আপনার?</h2>
          <p className="lead">
            পছন্দের গুড় বেছে নিন, ওজন ঠিক করুন, অর্ডার করুন।
          </p>
        </Reveal>
        <div className={s.grid}>
          {products.map((p, i) => (
            <Card key={p.id} p={p} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
