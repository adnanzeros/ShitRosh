'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { FaWhatsapp, FaPhoneAlt, FaFacebookF } from 'react-icons/fa';
import { nav } from '@/data/content';
import s from './Footer.module.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const whatsappNumber = '8801333647556';
  const callNumber = '+8801321382315';

  // নিজের Facebook Page URL বসাবে
  const facebookUrl = 'https://www.facebook.com/shitrosh';

  const whatsappMessage = encodeURIComponent(
    'আসসালামু আলাইকুম! শীতরসের পণ্য সম্পর্কে জানতে এবং অর্ডার করতে চাই।',
  );

  async function sub(e) {
    e.preventDefault();

    if (busy) return;
    setBusy(true);

    try {
      const r = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const d = await r.json();

      if (d.ok) {
        toast.success('ধন্যবাদ! সাবস্ক্রাইব হয়েছে');
        setEmail('');
      } else {
        toast.error(d.message || 'ব্যর্থ হয়েছে');
      }
    } catch {
      toast.error('নেটওয়ার্ক সমস্যা');
    } finally {
      setBusy(false);
    }
  }

  return (
    <footer className={s.f}>
      <div className={`container ${s.grid}`}>
        {/* Brand & Contact */}
        <div className={s.brand}>
          <img src="/images/logo-full.png" alt="শীতরস" className={s.logo} />

          <p>বাংলার শীতের খাঁটি স্বাদ, সরাসরি গাছির হাত থেকে আপনার ঘরে।</p>

          {/* Contact Cards */}
          <div className={s.contactGrid}>
            {/* WhatsApp */}
            <a
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className={s.waContact}
              aria-label="এক ক্লিকে WhatsApp-এ মেসেজ করুন"
            >
              <span className={s.waIcon}>
                <FaWhatsapp />
              </span>

              <span className={s.contactText}>
                <strong>WhatsApp-এ মেসেজ করুন</strong>
                <small>অর্ডার বা যেকোনো তথ্য জানতে</small>
                <b>এক ক্লিকে মেসেজ করুন →</b>
              </span>
            </a>

            {/* Direct Call */}
            <a
              href={`tel:${callNumber}`}
              className={s.callContact}
              aria-label="এক ক্লিকে সরাসরি কল করুন"
            >
              <span className={s.callIcon}>
                <FaPhoneAlt />
              </span>

              <span className={s.contactText}>
                <strong>সরাসরি কল করুন</strong>
                <small>অর্ডার বা যেকোনো তথ্য জানতে</small>
                <b>এক ক্লিকে কল করুন →</b>
                <em>+880 1321-382315</em>
              </span>
            </a>
          </div>

          {/* Follow Us */}
          <div className={s.followUs}>
            <span>Follow Us</span>

            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Facebook"
              title="Facebook Page"
              className={s.facebookIcon}
            >
              <FaFacebookF />
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div className={s.links}>
          <h4>লিংক</h4>

          {nav.map(([id, l]) => (
            <a key={id} href={`#${id}`}>
              {l}
            </a>
          ))}

          <a href="#order">অর্ডার করুন</a>
        </div>

        {/* Newsletter */}
        <div className={s.newsletter}>
          <h4>অফার ও আপডেট</h4>

          <p>নতুন অফার ও পণ্যের আপডেট পেতে আপনার ইমেইল সাবস্ক্রাইব করুন।</p>

          <form className={s.nl} onSubmit={sub}>
            <input
              type="email"
              required
              placeholder="আপনার ইমেইল"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <button type="submit" className="btn btnPrimary" disabled={busy}>
              {busy ? 'অপেক্ষা করুন...' : 'সাবস্ক্রাইব'}
            </button>
          </form>
        </div>
      </div>

      {/* Copyright */}
      <p className={s.copy}>
        © {new Date().getFullYear()} শীতরস। সর্বস্বত্ব সংরক্ষিত।
      </p>
    </footer>
  );
}
