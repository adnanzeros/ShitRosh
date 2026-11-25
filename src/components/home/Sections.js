// FILE: src/components/home/Sections.js
'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ShieldCheck, Leaf, Truck, Wallet } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import {
  trust,
  story,
  process,
  why,
  testimonials,
  steps,
  faqs,
} from '@/data/content';
import s from './Sections.module.css';

const Head = ({ eyebrow, title, lead }) => (
  <Reveal>
    <p className="eyebrow">{eyebrow}</p>
    <h2 className="title">{title}</h2>
    {lead && <p className="lead">{lead}</p>}
  </Reveal>
);

const SLOGAN = 'শীতের ঐতিহ্য, মাটির ঘ্রাণ।';

export function Trust() {
  const icons = [ShieldCheck, Leaf, Wallet, Truck];
  return (
    <section className={s.trust}>
      {/* running slogan */}
      <div className={s.marquee} role="img" aria-label={SLOGAN}>
        <div className={s.track} aria-hidden="true">
          {[0, 1].map(g => (
            <div className={s.group} key={g}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={s.slogan}>
                  {SLOGAN}
                  <Leaf size={18} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className={`container ${s.trustGrid}`}>
        {trust.map(([a, b], i) => {
          const I = icons[i];
          return (
            <Reveal key={a} delay={i * 0.08}>
              <I size={22} color="#F4C75E" />
              <b>{a}</b>
              <span>{b}</span>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

export function Story() {
  return (
    <section id="story" className={`section ${s.story}`}>
      <div className={`container ${s.storyGrid}`}>
        <Reveal className={s.storyArt}>
          <img src="/images/palm-emblem.png" alt="খেজুর গাছ" />
        </Reveal>
        <Reveal delay={0.1} className={s.storyText}>
          <p className="eyebrow">আমাদের গল্প</p>
          <h2 className="title">{story.title}</h2>
          {story.text.map(t => (
            <p key={t}>{t}</p>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export function Process() {
  const [active, setActive] = useState(0);
  return (
    <section id="process" className="section">
      <div className="container">
        <Head
          eyebrow="ঐতিহ্যবাহী পদ্ধতি"
          title="গাছ থেকে আপনার ঘর পর্যন্ত"
          lead="প্রতিটি ধাপে যত্ন — তাই গুড়ের স্বাদ এত খাঁটি।"
        />
        <div className={s.timeline}>
          {process.map(([n, t, d], i) => (
            <Reveal key={n} delay={i * 0.06}>
              <button
                className={`${s.step} ${active === i ? s.active : ''}`}
                onClick={() => setActive(i)}
              >
                <span className={s.num}>{n}</span>
                <span>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Why() {
  return (
    <section id="why" className={`section ${s.story}`}>
      <div className="container">
        <Head eyebrow="কেন শীতরস" title="আপনার আস্থার কারণ" />
        <div className={`${s.cards} ${s.c4}`}>
          {why.map(([a, b], i) => (
            <Reveal key={a} delay={i * 0.08} className={s.card}>
              <h3>{a}</h3>
              <p>{b}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="section">
      <div className="container">
        <Head eyebrow="গ্রাহকদের কথা" title="যাঁরা স্বাদ নিয়েছেন" />
        <div className={`${s.cards} ${s.c3}`}>
          {testimonials.map(([n, c, q], i) => (
            <Reveal key={n} delay={i * 0.08} className={s.card}>
              <p className={s.quote}>“{q}”</p>
              <p className={s.who}>
                {n}, {c}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowTo() {
  return (
    <section className={`section ${s.how}`}>
      <div className="container">
        <Head eyebrow="কীভাবে অর্ডার করবেন" title="মাত্র ৪টি ধাপ" />
        <ol>
          {steps.map(t => (
            <Reveal as="li" key={t}>
              {t}
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="section">
      <div className="container" style={{ maxWidth: 800 }}>
        <Head eyebrow="প্রশ্নোত্তর" title="সচরাচর জিজ্ঞাসা" />
        <div style={{ marginTop: 24 }}>
          {faqs.map(([q, a], i) => (
            <div key={q} className={s.faqItem}>
              <button
                className={s.faqQ}
                onClick={() => setOpen(open === i ? -1 : i)}
                aria-expanded={open === i}
              >
                {q}
                <motion.span animate={{ rotate: open === i ? 180 : 0 }}>
                  <ChevronDown size={20} />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p className={s.faqA}>{a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
