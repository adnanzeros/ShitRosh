// FILE: src/components/admin/LoginForm.js
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, KeyRound } from 'lucide-react';
import s from './Admin.module.css';

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState('login'); // login | forgot | reset
  const [f, setF] = useState({ identifier: '', password: '', code: '' });
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const set = k => e => setF({ ...f, [k]: e.target.value });

  async function call(url, body) {
    setBusy(true);
    setErr('');
    setInfo('');
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 45000);
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
      let d;
      try {
        d = await r.json();
      } catch {
        d = {
          ok: false,
          message: `সার্ভার ঠিকমতো উত্তর দিচ্ছে না (HTTP ${r.status}) — terminal এর error দেখুন`,
        };
      }
      if (!d.ok) setErr(d.message || 'ব্যর্থ হয়েছে');
      return d;
    } catch (e) {
      setErr(
        e?.name === 'AbortError'
          ? 'সার্ভার অনেক দেরি করছে (DB connect হচ্ছে না)'
          : 'সার্ভারে পৌঁছানো যাচ্ছে না — npm run dev চালু আছে কিনা দেখুন',
      );
      return { ok: false };
    } finally {
      clearTimeout(timer);
      setBusy(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (mode === 'login') {
      const d = await call('/api/admin/login', {
        identifier: f.identifier,
        password: f.password,
      });
      if (d.ok) {
        router.replace('/admin');
        router.refresh();
      }
    } else if (mode === 'forgot') {
      const d = await call('/api/admin/forgot', { identifier: f.identifier });
      if (d.ok) {
        setMode('reset');
        setInfo(d.message);
      }
    } else {
      const d = await call('/api/admin/reset', {
        identifier: f.identifier,
        code: f.code,
        password: f.password,
      });
      if (d.ok) {
        setMode('login');
        setF({ ...f, password: '', code: '' });
        setInfo(d.message);
      }
    }
  }

  const title = {
    login: 'অ্যাডমিন লগইন',
    forgot: 'পাসওয়ার্ড ভুলে গেছেন?',
    reset: 'নতুন পাসওয়ার্ড দিন',
  }[mode];

  return (
    <main className={s.loginWrap}>
      <form className={s.loginCard} onSubmit={submit}>
        <img src="/images/palm-emblem.png" alt="" className={s.loginLogo} />
        <h1>{title}</h1>
        <label className={s.pwField}>
          <User size={18} />
          <input
            autoFocus
            placeholder="ইউজারনেম বা ইমেইল"
            value={f.identifier}
            onChange={set('identifier')}
            autoComplete="username"
          />
        </label>
        {mode === 'reset' && (
          <label className={s.pwField}>
            <KeyRound size={18} />
            <input
              placeholder="ইমেইলে পাওয়া ৬ সংখ্যার কোড"
              inputMode="numeric"
              maxLength={6}
              value={f.code}
              onChange={set('code')}
            />
          </label>
        )}
        {mode !== 'forgot' && (
          <label className={s.pwField}>
            <Lock size={18} />
            <input
              type="password"
              placeholder={
                mode === 'reset' ? 'নতুন পাসওয়ার্ড (কমপক্ষে ৮)' : 'পাসওয়ার্ড'
              }
              value={f.password}
              onChange={set('password')}
              autoComplete={
                mode === 'login' ? 'current-password' : 'new-password'
              }
            />
          </label>
        )}
        {err && <p className={s.err}>{err}</p>}
        {info && <p className={s.okMsg}>{info}</p>}
        <button className={s.primary} disabled={busy || !f.identifier}>
          {busy
            ? 'অপেক্ষা করুন...'
            : mode === 'login'
              ? 'ঢুকুন'
              : mode === 'forgot'
                ? 'কোড পাঠান'
                : 'পাসওয়ার্ড বদলান'}
        </button>
        {mode === 'login' ? (
          <button
            type="button"
            className={s.link}
            onClick={() => {
              setMode('forgot');
              setErr('');
              setInfo('');
            }}
          >
            পাসওয়ার্ড ভুলে গেছি
          </button>
        ) : (
          <button
            type="button"
            className={s.link}
            onClick={() => {
              setMode('login');
              setErr('');
              setInfo('');
            }}
          >
            ← লগইনে ফিরুন
          </button>
        )}
      </form>
    </main>
  );
}
