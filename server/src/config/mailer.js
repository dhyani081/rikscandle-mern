// server/src/config/mailer.js
import nodemailer from 'nodemailer';

const EMAIL_DISABLED = process.env.DISABLE_EMAIL === 'true';
let transporter = null;

if (!EMAIL_DISABLED) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  transporter.verify()
    .then(() => console.log('📧 SMTP ready'))
    .catch(err => console.error('SMTP verify failed:', err?.message));
}

export async function sendMail({ to, subject, text, html, attachments }) {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  if (EMAIL_DISABLED || !transporter) {
    console.log('✉️ [EMAIL DISABLED] would send:', { to, subject });
    return { disabled: true };
  }
  try {
    return await transporter.sendMail({ from, to, subject, text, html, attachments });
  } catch (err) {
    console.error('✉️ Email send failed:', err?.message);
    if (process.env.NODE_ENV !== 'production') {
      console.log('✉️ [DEV FALLBACK] logged instead of sending:', { to, subject });
      return { fallback: true };
    }
    throw err;
  }
}
