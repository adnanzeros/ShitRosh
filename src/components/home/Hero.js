"use client";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import s from "./Hero.module.css";

const line = (i) => ({ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { delay: 0.15 * i, duration: 0.7 } } });

export default function Hero() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, reduce ? 0 : -50]);
  return (
    <section id="top" className={s.hero}>
      <div className={`container ${s.grid}`}>
        <div>
          <motion.p variants={line(0)} initial="hidden" animate="show" className="eyebrow">বাংলার শীতের ঐতিহ্য</motion.p>
          <motion.h1 variants={line(1)} initial="hidden" animate="show" className={s.h1}>শীতের খাঁটি স্বাদ,<span>খেজুরের গুড়ের ঐতিহ্যে</span></motion.h1>
          <motion.p variants={line(2)} initial="hidden" animate="show" className={s.p}>প্রকৃতির মিষ্টি ছোঁয়ায় তৈরি বাংলার ঐতিহ্যবাহী খেজুরের গুড়।</motion.p>
          <motion.div variants={line(3)} initial="hidden" animate="show" className={s.btns}>
            <a href="#order" className="btn btnPrimary">অর্ডার করুন</a>
            <a href="#story" className="btn btnGhost">আমাদের গল্প জানুন</a>
          </motion.div>
        </div>
        <motion.div className={s.art} style={{ y }}>
          <div className={s.sun} />
          <motion.img src="/images/palm-emblem.png" alt="খেজুর গাছ ও রসের হাঁড়ি" className={s.palm}
            animate={reduce ? {} : { y: [0, -12, 0], rotate: [0, 1.5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
          <motion.span className={`${s.drop} ${s.d1}`} animate={reduce ? {} : { y: [0, -14, 0] }} transition={{ duration: 4, repeat: Infinity }} />
          <motion.span className={`${s.drop} ${s.d2}`} animate={reduce ? {} : { y: [0, 12, 0] }} transition={{ duration: 5, repeat: Infinity }} />
        </motion.div>
      </div>
      <div className={s.hill} />
    </section>
  );
}
