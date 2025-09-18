// client/src/pages/Contact.jsx
function digitsOnly(s = '') { return String(s).replace(/\D/g, ''); }

export default function Contact() {
  // Contact values from env (fallbacks)
  const EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'owner@example.com';
  const PHONE = import.meta.env.VITE_CONTACT_PHONE || '+91 98765 43210';
  const WHATS = import.meta.env.VITE_CONTACT_WHATSAPP || PHONE;

  const phoneDigits = digitsOnly(PHONE);
  const waDigits = digitsOnly(WHATS);

  // Gmail compose link (opens Gmail in a new tab)
  const subject = 'Support — RiksCandle';
  const body = 'Hi RiksCandle team,\n\nI have a query about my order.';
  const gmailCompose = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    EMAIL
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // WhatsApp chat link
  const waText = 'Hi RiksCandle, I have a query about my order.';
  const waLink = waDigits ? `https://wa.me/${waDigits}?text=${encodeURIComponent(waText)}` : '#';

  return (
    <div className="container py-12 max-w-3xl">
      <div className="text-center mb-8">
        <div className="text-3xl font-bold text-amber-800">Contact Us</div>
        <p className="text-gray-600 mt-1">
          We’re happy to help. Reach us via email, phone, or WhatsApp.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Email */}
        <div className="card flex flex-col items-center text-center">
          <div className="font-semibold mb-1">Email</div>
          <div className="text-sm text-gray-700 break-all">{EMAIL}</div>
          {/* ⬇️ Button moved slightly down via mt-6 */}
          <a
            className="btn btn-outline mt-6"
            href={gmailCompose}
            target="_blank"
            rel="noreferrer noopener"
            title="Open Gmail Compose"
          >
            Send Email
          </a>
        </div>

        {/* Phone */}
        <div className="card flex flex-col items-center text-center">
          <div className="font-semibold mb-1">Phone</div>
          <div className="text-sm text-gray-700">{PHONE}</div>
          {/* ⬇️ Button moved slightly down via mt-6 */}
          <a
            className="btn btn-outline mt-6"
            href={phoneDigits ? `tel:${phoneDigits}` : '#'}
            title="Call now"
          >
            Call Now
          </a>
        </div>

        {/* WhatsApp */}
        <div className="card flex flex-col items-center text-center">
          <div className="font-semibold mb-1">WhatsApp</div>
          <div className="text-sm text-gray-700">{WHATS}</div>
          {/* ⬇️ Button moved slightly down via mt-6 */}
          <a
            className="btn btn-outline mt-6"
            href={waLink}
            target="_blank"
            rel="noreferrer"
            title="Chat on WhatsApp"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        Business hours: 10:00 AM – 6:00 PM (Mon–Sat)
      </div>
    </div>
  );
}
