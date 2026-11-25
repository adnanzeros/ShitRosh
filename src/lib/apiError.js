// FILE: src/lib/apiError.js
// Bengali message for the user + the real reason while developing (so you can see it on screen)
export const errText = (base, e) =>
  process.env.NODE_ENV === 'production' || !e?.message
    ? base
    : `${base} — ${e.message}`;
