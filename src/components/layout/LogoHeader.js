// FILE: src/components/layout/LogoHeader.js
import { announcement } from '@/data/content';
import s from './LogoHeader.module.css';

// No nav bar: just the centred logo (and the one-line announcement above it).
export default function LogoHeader() {
  return (
    <header className={s.head} id="top">
      <p className={s.announce}>{announcement}</p>
      <a href="#top" aria-label="শীতরস">
        <img
          src="/images/logo-full.png"
          alt="শীতরস"
          className={s.logo}
          width="640"
          height="392"
        />
      </a>
    </header>
  );
}
