// FILE: src/lib/mailer.js
import nodemailer from 'nodemailer';
export async function sendMail({ to, subject, text, html }) {
  const { SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_USER || !SMTP_PASS)
    throw new Error('SMTP_USER / SMTP_PASS missing');
  const port = Number(process.env.SMTP_PORT || 465);
  const t = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  await t.sendMail({
    from: process.env.MAIL_FROM || SMTP_USER,
    to,
    subject,
    text,
    html,
  });
}
