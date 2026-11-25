"use client";
import { useState } from "react";
import { toast } from "sonner";
import { nav } from "@/data/content";
import s from "./Footer.module.css";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  async function sub(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const r = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const d = await r.json();
      if (d.ok) { toast.success("ধন্যবাদ! সাবস্ক্রাইব হয়েছে"); setEmail(""); } else toast.error(d.message || "ব্যর্থ হয়েছে");
    } catch { toast.error("নেটওয়ার্ক সমস্যা"); }
    setBusy(false);
  }
  return (
    <footer className={s.f}>
      <div className={`container ${s.grid}`}>
        <div><img src="/images/logo-full.png" alt="শীতরস" className={s.logo} /><p>বাংলার শীতের খাঁটি স্বাদ, সরাসরি গাছির হাত থেকে আপনার ঘরে।</p></div>
        <div><h4>লিংক</h4>{nav.map(([id, l]) => <a key={id} href={`#${id}`}>{l}</a>)}<a href="#order">অর্ডার করুন</a></div>
        <div><h4>অফার ও আপডেট</h4><form className={s.nl} onSubmit={sub}><input type="email" required placeholder="আপনার ইমেইল" value={email} onChange={(e) => setEmail(e.target.value)} /><button className="btn btnPrimary" disabled={busy}>সাবস্ক্রাইব</button></form></div>
      </div>
      <p className={s.copy}>© {new Date().getFullYear()} শীতরস। সর্বস্বত্ব সংরক্ষিত।</p>
    </footer>
  );
}
