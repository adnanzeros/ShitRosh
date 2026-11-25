"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { products } from "@/data/products";
import { bn } from "@/lib/format";
import s from "./Products.module.css";

function Card({ p, i }) {
  const [vi, setVi] = useState(0);
  const [qty, setQty] = useState(1);
  const v = p.variants[vi];
  function order() {
    window.dispatchEvent(new CustomEvent("add-to-order", { detail: { productId: p.id, weight: v.w, qty } }));
    document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });
  }
  return (
    <Reveal delay={i * 0.08} className={s.card}>
      <div className={s.media} style={{ background: `radial-gradient(circle at 50% 40%, ${p.tone}55, ${p.tone}18)` }}>
        <motion.img src={p.image} alt={p.name} whileHover={{ scale: 1.08, rotate: -2 }} />
      </div>
      <div className={s.body}>
        <h3>{p.name}</h3><p>{p.desc}</p>
        <div className={s.weights}>{p.variants.map((x, k) => <button key={x.w} className={`${s.chip} ${k === vi ? s.on : ""}`} onClick={() => setVi(k)}>{x.w}</button>)}</div>
        <div className={s.row}>
          <span className={s.price}>৳{bn(v.price * qty)}</span>
          <div className={s.qty}>
            <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="কমান"><Minus size={16} /></button>
            <b>{bn(qty)}</b>
            <button onClick={() => setQty(Math.min(20, qty + 1))} aria-label="বাড়ান"><Plus size={16} /></button>
          </div>
        </div>
        <button className="btn btnPrimary" onClick={order}><ShoppingBag size={18} />অর্ডার করুন</button>
      </div>
    </Reveal>
  );
}

export default function Products() {
  return (
    <section id="products" className="section"><div className="container">
      <Reveal><p className="eyebrow">আমাদের সংগ্রহ</p><h2 className="title">কোনটা আপনার?</h2><p className="lead">পছন্দের গুড় বেছে নিন, ওজন ঠিক করুন, অর্ডার করুন।</p></Reveal>
      <div className={s.grid}>{products.map((p, i) => <Card key={p.id} p={p} i={i} />)}</div>
    </div></section>
  );
}
