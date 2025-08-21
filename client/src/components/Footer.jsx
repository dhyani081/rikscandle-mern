// client/src/components/Footer.jsx
import { Link } from 'react-router-dom';

/** Small helper to render a support row with a circular icon */
function SupportItem({ href, label, external = false, icon, bg = 'bg-amber-50', color = 'text-amber-700', ring = 'ring-amber-200' }) {
  return (
    <li>
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        className="group flex items-center gap-3 hover:text-amber-700"
      >
        <span
          className={[
            'inline-flex items-center justify-center w-9 h-9 rounded-full ring-1 ring-inset',
            bg,
            color,
            ring
          ].join(' ')}
          aria-hidden="true"
        >
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </a>
    </li>
  );
}

export default function Footer() {
  // You can override these with Vite env if needed
  const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || 'support@rikscandle.com';
  const SUPPORT_PHONE = import.meta.env.VITE_SUPPORT_PHONE || '+91 98765 43210';
  const WHATSAPP_NUMBER = (import.meta.env.VITE_SUPPORT_WHATSAPP || '919876543210').replace(/\D/g, '');

  // Gmail compose link (pre-filled)
  const subject = 'Support Request | RiksCandle';
  const body =
    'Hi RiksCandle Support,\n\nPlease help me with the following issue:\n\nOrder ID: \nIssue: \n\nThanks,';
  const gmailHref =
    'https://mail.google.com/mail/?view=cm&fs=1&tf=1' +
    `&to=${encodeURIComponent(SUPPORT_EMAIL)}` +
    `&su=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;

  // tel: href (digits + plus only)
  const telHref = 'tel:' + SUPPORT_PHONE.replace(/[^\d+]/g, '');

  return (
    <footer className="border-t bg-white mt-12">
      <div className="container py-10 grid md:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <div className="text-2xl font-extrabold tracking-tight">
            <span className="text-amber-800">Riks</span>
            <span className="text-amber-600">Candle</span>
          </div>
          <p className="mt-2 text-gray-600 text-sm">
            Hand‑poured, small‑batch candles made with clean ingredients.
          </p>
        </div>

        {/* Company */}
        <div>
          <div className="font-semibold text-gray-900">Company</div>
          <ul className="mt-3 space-y-2 text-gray-700">
            <li><Link to="/about" className="hover:text-amber-700">About Us</Link></li>
            <li><Link to="/policy/terms" className="hover:text-amber-700">Terms &amp; Conditions</Link></li>
            <li><Link to="/policy/privacy" className="hover:text-amber-700">Privacy Policy</Link></li>
            <li><Link to="/policy/refund" className="hover:text-amber-700">Return &amp; Refund</Link></li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <div className="font-semibold text-gray-900">Social</div>
          <div className="mt-3 flex items-center gap-3">
            <a
              href="https://www.instagram.com/rikscandle"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="inline-flex items-center justify-center w-9 h-9 rounded border hover:bg-amber-50"
            >
              {/* Instagram */}
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6zM18 6.3a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
            </a>
            <a
              href="https://www.facebook.com/rikscandle"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="inline-flex items-center justify-center w-9 h-9 rounded border hover:bg-amber-50"
            >
              {/* Facebook */}
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path d="M13 3h4a1 1 0 1 1 0 2h-3v3h3a1 1 0 0 1 0 2h-3v9a1 1 0 1 1-2 0v-9h-2a1 1 0 0 1 0-2h2V5a2 2 0 0 1 2-2z"/>
              </svg>
            </a>
            <a
              href="https://www.youtube.com/@rikscandle"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="inline-flex items-center justify-center w-9 h-9 rounded border hover:bg-amber-50"
            >
              {/* YouTube */}
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path d="M21.8 8.2a3 3 0 0 0-2.1-2.1C17.8 5.5 12 5.5 12 5.5s-5.8 0-7.7.6A3 3 0 0 0 2.2 8.2C1.6 10.1 1.6 12 1.6 12s0 1.9.6 3.8a3 3 0 0 0 2.1 2.1c1.9.6 7.7.6 7.7.6s5.8 0 7.7-.6a3 3 0 0 0 2.1-2.1c.6-1.9.6-3.8.6-3.8s0-1.9-.6-3.8zM10 15.5v-7l6 3.5-6 3.5z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Support with icons */}
        <div>
          <div className="font-semibold text-gray-900">Support</div>
          <ul className="mt-3 space-y-3 text-gray-700">
            {/* Email (Gmail compose) */}
            <SupportItem
              href={gmailHref}
              label={SUPPORT_EMAIL}
              external
              bg="bg-amber-50"
              color="text-amber-700"
              ring="ring-amber-200"
              icon={
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                  <path d="M3 7l9 6 9-6"></path>
                </svg>
              }
            />
            {/* Phone (Call now) */}
            <SupportItem
              href={telHref}
              label={SUPPORT_PHONE}
              bg="bg-sky-50"
              color="text-sky-600"
              ring="ring-sky-200"
              icon={
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M22 16.92v2a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 3.18 2 2 0 0 1 4.11 1h2a2 2 0 0 1 2 1.72c.12.9.31 1.77.56 2.61a2 2 0 0 1-.45 2.11L7.1 8.9a16 16 0 0 0 6 6l1.46-1.12a2 2 0 0 1 2.11-.45c.84.25 1.71.44 2.61.56A2 2 0 0 1 22 16.92z"></path>
                </svg>
              }
            />
            {/* WhatsApp */}
            <SupportItem
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              label="WhatsApp us"
              external
              bg="bg-green-50"
              color="text-green-600"
              ring="ring-green-200"
              icon={
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                  <path d="M20.52 3.48A11.83 11.83 0 0012 0 11.94 11.94 0 000 12a11.83 11.83 0 003.48 8.52L2 24l3.6-.94A12 12 0 0012 24a12 12 0 008.52-3.48A11.83 11.83 0 0024 12a11.83 11.83 0 00-3.48-8.52zM12 22a9.79 9.79 0 01-5-1.37l-.36-.21-2.14.56.57-2.09-.22-.34A9.79 9.79 0 1122 12 9.82 9.82 0 0112 22zm5.4-7.1c-.3-.15-1.81-.9-2.09-1s-.49-.16-.7.15-.8 1-.98 1.2-.36.22-.67.07a7.9 7.9 0 01-2.32-1.43 8.73 8.73 0 01-1.6-2c-.17-.29 0-.45.12-.6s.29-.33.44-.5a2 2 0 00.3-.5.55.55 0 00-.02-.5c0-.15-.67-1.6-.92-2.19s-.49-.5-.67-.51h-.56a1.07 1.07 0 00-.77.36 3.2 3.2 0 00-1 2.37 5.5 5.5 0 001.2 2.93c.14.2 1.93 2.95 4.67 4.14.65.28 1.16.44 1.55.57a3.73 3.73 0 001.7.1 2.78 2.78 0 001.83-1.29 2.27 2.27 0 00.16-1.29c-.06-.11-.23-.18-.53-.33z" />
                </svg>
              }
            />
          </ul>

          {/* (Optional) Default mail app fallback:
          <div className="mt-2 text-xs text-gray-500">
            Not using Gmail? <a className="underline" href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`}>Open default mail app</a>
          </div>
          */}
        </div>
      </div>

      <div className="border-t">
        <div className="container py-4 text-sm text-gray-500 flex items-center justify-between">
          <div>© {new Date().getFullYear()} RiksCandle. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-amber-700">About</Link>
            <Link to="/policy/privacy" className="hover:text-amber-700">Privacy</Link>
            <Link to="/policy/terms" className="hover:text-amber-700">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
