"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { nav } from "@/data/content";
import s from "./Navbar.module.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className={s.bar}>
      <div className={`container ${s.in}`}>
        <a href="#top"><img src="/images/logo-full.png" alt="শীতরস" className={s.logo} /></a>
        <nav className={`${s.links} ${open ? s.open : ""}`}>
          {nav.map(([id, label]) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>{label}</a>)}
        </nav>
        <a href="#order" className={`btn btnPrimary ${s.cta}`}>অর্ডার করুন</a>
        <button className={s.menuBtn} onClick={() => setOpen(!open)} aria-label="মেনু">{open ? <X /> : <Menu />}</button>
      </div>
    </header>
  );
}
