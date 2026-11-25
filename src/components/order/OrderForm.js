"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { products, districts, DELIVERY } from "@/data/products";
import { bn } from "@/lib/format";
import s from "./OrderForm.module.css";

const newLine = (productId = "", weight = "", qty = 1) => ({ productId, weight, qty });
const newKey = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random());
const empty = { name: "", phone: "", district: "", upazila: "", address: "", note: "", paymentMethod: "cod", trxId: "" };

export default function OrderForm() {
  const [f, setF] = useState(empty);
  const [items, setItems] = useState([newLine()]);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const key = useRef(newKey());
  const lock = useRef(false);

  useEffect(() => {
    const h = (e) => {
      const { productId, weight, qty } = e.detail;
      setDone(null);
      setItems((cur) => {
        const idx = cur.findIndex((l) => l.productId === productId && l.weight === weight);
        if (idx >= 0) return cur.map((l, i) => (i === idx ? { ...l, qty: Math.min(20, l.qty + qty) } : l));
        return [...cur.filter((l) => l.productId), newLine(productId, weight, qty)];
      });
    };
    window.addEventListener("add-to-order", h);
    return () => window.removeEventListener("add-to-order", h);
  }, []);

  // Preview only. The server recalculates every price and the delivery charge.
  const preview = useMemo(() => {
    let sub = 0;
    for (const l of items) { const v = products.find((p) => p.id === l.productId)?.variants.find((x) => x.w === l.weight); if (v) sub += v.price * l.qty; }
    const delivery = !sub ? 0 : sub >= DELIVERY.freeAbove ? 0 : f.district === "ঢাকা" ? DELIVERY.dhaka : DELIVERY.outside;
    return { sub, delivery, total: sub + delivery };
  }, [items, f.district]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const upd = (i, patch) => setItems(items.map((l, k) => (k === i ? { ...l, ...patch } : l)));
  const E = ({ k }) => (errors[k] ? <p className={s.err}>{errors[k]}</p> : null);

  async function submit(e) {
    e.preventDefault();
    if (lock.current) return;
    const valid = items.filter((l) => l.productId && l.weight);
    if (!valid.length) { setErrors({ items: "কমপক্ষে একটি পণ্য ও ওজন বেছে নিন" }); toast.error("পণ্য ও ওজন বেছে নিন"); return; }
    lock.current = true; setBusy(true); setErrors({});
    try {
      const r = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, items: valid, idempotencyKey: key.current }) });
      const d = await r.json();
      if (!d.ok) { setErrors(d.errors || {}); toast.error(d.message || "ফর্মে ভুল আছে, দেখুন"); }
      else {
        setDone({ id: d.orderId, total: d.total, method: f.paymentMethod });
        setF(empty); setItems([newLine()]); key.current = newKey();
        document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });
      }
    } catch { toast.error("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন"); }
    lock.current = false; setBusy(false);
  }

  const num = f.paymentMethod === "bkash" ? process.env.NEXT_PUBLIC_BKASH : process.env.NEXT_PUBLIC_NAGAD;

  return (
    <section id="order" className={`section ${s.wrap}`}><div className="container">
      <p className="eyebrow" style={{ textAlign: "center" }}>অর্ডার ফর্ম</p>
      <h2 className="title" style={{ textAlign: "center" }}>এখনই অর্ডার করুন</h2>
      <div className={s.card}>
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="ok" className={s.success} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <CheckCircle2 size={64} />
              <h3 style={{ fontSize: "1.6rem", marginTop: 8 }}>অর্ডার গ্রহণ করা হয়েছে!</h3>
              <div className={s.oid}>{done.id}</div>
              <p>মোট: <b>৳{bn(done.total)}</b></p>
              <p style={{ marginTop: 8 }}>আমরা শীঘ্রই ফোন করে নিশ্চিত করব।{done.method !== "cod" && " আপনার পেমেন্ট এখনও যাচাই হয়নি — আমরা যাচাই করে জানাব।"}</p>
              <button className="btn btnPrimary" style={{ marginTop: 18 }} onClick={() => setDone(null)}>নতুন অর্ডার করুন</button>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className={s.h} style={{ marginTop: 0 }}>পণ্য ও পরিমাণ</h3>
              {items.map((l, i) => {
                const p = products.find((x) => x.id === l.productId);
                return (
                  <div className={s.line} key={i}>
                    <div className={`${s.field} ${s.pick}`}>
                      <select value={l.productId} onChange={(e) => upd(i, { productId: e.target.value, weight: "" })} aria-label="পণ্য">
                        <option value="">পণ্য বেছে নিন</option>{products.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                      </select>
                    </div>
                    <div className={s.field}>
                      <select value={l.weight} onChange={(e) => upd(i, { weight: e.target.value })} disabled={!p} aria-label="ওজন">
                        <option value="">ওজন</option>{p?.variants.map((v) => <option key={v.w} value={v.w}>{v.w} — ৳{bn(v.price)}</option>)}
                      </select>
                    </div>
                    <div className={s.lineEnd}>
                      <div className={s.field}><input type="number" min="1" max="20" value={l.qty} onChange={(e) => upd(i, { qty: Math.max(1, Math.min(20, Number(e.target.value) || 1)) })} aria-label="পরিমাণ" /></div>
                      {items.length > 1 && <button type="button" className={s.rm} onClick={() => setItems(items.filter((_, k) => k !== i))} aria-label="মুছুন"><Trash2 size={18} /></button>}
                    </div>
                  </div>
                );
              })}
              <E k="items" />
              {items.length < 10 && <button type="button" className={s.add} onClick={() => setItems([...items, newLine()])}><Plus size={18} />আরও পণ্য যোগ করুন</button>}

              <h3 className={s.h}>ডেলিভারি তথ্য</h3>
              <div className={s.grid2}>
                <div className={s.field}><label>আপনার নাম</label><input value={f.name} onChange={set("name")} autoComplete="name" /><E k="name" /></div>
                <div className={s.field}><label>মোবাইল নম্বর</label><input value={f.phone} onChange={set("phone")} inputMode="tel" placeholder="01XXXXXXXXX" autoComplete="tel" /><E k="phone" /></div>
                <div className={s.field}><label>জেলা</label><select value={f.district} onChange={set("district")}><option value="">জেলা বেছে নিন</option>{districts.map((d) => <option key={d}>{d}</option>)}</select><E k="district" /></div>
                <div className={s.field}><label>উপজেলা / থানা</label><input value={f.upazila} onChange={set("upazila")} /><E k="upazila" /></div>
                <div className={`${s.field} ${s.full}`}><label>পূর্ণ ঠিকানা</label><textarea rows={3} value={f.address} onChange={set("address")} placeholder="বাসা/রোড/গ্রাম, এলাকা" /><E k="address" /></div>
                <div className={`${s.field} ${s.full}`}><label>বিশেষ নির্দেশনা (ঐচ্ছিক)</label><textarea rows={2} value={f.note} onChange={set("note")} /></div>
              </div>

              <h3 className={s.h}>পেমেন্ট পদ্ধতি</h3>
              <div className={s.pay}>
                {[["cod", "ক্যাশ অন ডেলিভারি"], ["bkash", "bKash"], ["nagad", "Nagad"]].map(([v, l]) => (
                  <label key={v} className={`${s.payOpt} ${f.paymentMethod === v ? s.on : ""}`}><input type="radio" name="pm" checked={f.paymentMethod === v} onChange={() => setF({ ...f, paymentMethod: v })} />{l}</label>
                ))}
              </div>
              <E k="paymentMethod" />
              {f.paymentMethod !== "cod" && (
                <div className={s.info}>
                  <p>{f.paymentMethod === "bkash" ? "bKash" : "Nagad"} নম্বর <b>{num || "শীঘ্রই যোগ হবে"}</b> এ Send Money করুন, তারপর ট্রানজেকশন আইডি দিন। আমরা যাচাইয়ের পর নিশ্চিত করব।</p>
                  <div className={s.field} style={{ marginTop: 10 }}><label>ট্রানজেকশন আইডি</label><input value={f.trxId} onChange={set("trxId")} /><E k="trxId" /></div>
                </div>
              )}

              <div className={s.sum}>
                <div><span>পণ্যের মূল্য</span><span>৳{bn(preview.sub)}</span></div>
                <div><span>ডেলিভারি চার্জ</span><span>{preview.sub && !preview.delivery ? "ফ্রি" : `৳${bn(preview.delivery)}`}</span></div>
                <div className={s.tot}><span>সর্বমোট</span><span>৳{bn(preview.total)}</span></div>
                <p style={{ fontSize: ".78rem", opacity: 0.7, marginTop: 6 }}>চূড়ান্ত মূল্য সার্ভারে যাচাই করে নিশ্চিত করা হবে।</p>
              </div>
              <button className={`btn btnPrimary ${s.submit}`} disabled={busy}>{busy ? <><Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />অর্ডার হচ্ছে...</> : "অর্ডার নিশ্চিত করুন"}</button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div></section>
  );
}
