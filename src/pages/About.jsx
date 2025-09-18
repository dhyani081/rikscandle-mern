// client/src/pages/About.jsx
import { Link } from 'react-router-dom';

export default function About() {
  // note: logo public folder me 'facicon.svg' hai (aapne hi bataya tha)
  // fallback: '/favicon.svg' use ho jayega
  const onLogoError = (e) => { e.currentTarget.src = '/favicon.svg'; };

  return (
    <div className="bg-white">
      {/* ===== Top hero: text left + BIG logo right ===== */}
      <section className="bg-gradient-to-b from-amber-50  border-b via-white to-amber-300">
        <div className="container py-12 md:py-16 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-amber-800">
              About <span className="text-amber-600">RiksCandle</span>
            </h1>
            <p className="mt-3 text-gray-600 max-w-3xl">
              We’re a small, craft‑first candle studio with one simple idea:
              <span className="font-medium text-gray-800"> premium, honest, and mood‑lifting candles</span>—
              hand‑poured in small batches and delivered fresh to your home. Hum quality aur transparency ko
              sabse upar rakhte hain.
            </p>
          </div>

          {/* BIG logo on right */}
          <div className="flex justify-center md:justify-end">
            <div className="relative">
              {/* soft glow backdrop */}
              <div className="absolute -inset-6 -z-10 rounded-full blur-2xl bg-amber-100/70" aria-hidden="true" />
              <img
                src="/facicon.svg"
                onError={onLogoError}
                alt="RiksCandle logo"
                className="w-64 md:w-80 lg:w-[22rem] h-auto object-contain drop-shadow-sm select-none"
                draggable="false"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Our story ===== */}
      <section className="container py-10 md:py-14">
        <div className="grid md:grid-cols-2 gap-8 items-start ">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Our Story</h2>
            <p className="mt-3 text-gray-600">
              RiksCandle ki shuruat ek chhoti si kitchen‑table experiment se hui—friends & family ko pasand aayi
              fragrance blends ko perfect karte‑karte ye brand bana. Aaj bhi hum wahi approach follow karte hain:
              <span className="font-medium"> small batches, slow pour, and strict quality checks.</span>
            </p>
            <p className="mt-3 text-gray-600">
              Har candle ek artisan ke haath se banti hai—clean‑burn wax, IFRA‑compliant fragrances, aur cotton
              wicks ke saath; taaki aapko mile <span className="font-medium">soothing aroma, longer burn time</span>,
              aur ek warm, cozy experience.
            </p>
          </div>

          {/* Values card */}
          <div className="rounded-lg border p-6 bg-amber-50/40">
            <h3 className="text-lg font-bold text-amber-800">What We Stand For</h3>
            <ul className="mt-3 space-y-2 text-gray-700 list-disc pl-5">
              <li><span className="font-medium">Hand‑poured precision</span> — small‑batch quality in every jar.</li>
              <li><span className="font-medium">Clean ingredients</span> — premium wax & skin‑safe scents.</li>
              <li><span className="font-medium">Honest pricing</span> — value without cutting corners.</li>
              <li><span className="font-medium">Sustainable packaging</span> — reusable glass & minimal waste.</li>
              <li><span className="font-medium">Made in India</span> — local craft, local jobs.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ===== How we craft ===== */}
      <section className="bg-amber-50/30 border-y">
        <div className="container py-10 md:py-14">
          <h2 className="text-2xl font-bold text-gray-900">How We Craft Your Candles</h2>
          <div className="mt-5 grid md:grid-cols-4 gap-4">
            {[
              ['Blend', 'Fragrance oils ko right wax ke saath measured heat par blend kiya jata hai.'],
              ['Pour', 'Slow‑pour technique se even cooling aur smooth tops milte hain.'],
              ['Cure', 'Har batch ko cure time diya jata hai for deeper scent throw.'],
              ['Test', 'Burn tests se wick & throw tune kiya jata hai—quality pe zero compromise.'],
            ].map(([title, body], i) => (
              <div key={i} className="rounded-lg border bg-white p-5">
                <div className="text-amber-700 text-sm font-semibold">{String(i + 1).padStart(2, '0')}</div>
                <div className="mt-1 font-medium text-gray-900">{title}</div>
                <p className="mt-1.5 text-gray-600 text-sm">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Promise + CTA ===== */}
      <section className="container py-10 md:py-14">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900">Our Promise</h2>
            <p className="mt-3 text-gray-600">
              Aapke ghar ki vibe humari responsibility hai. Isliye hum har order ko personally check karte hain.
              Koi issue ho? <span className="font-medium">No‑hassle support</span>—hum turant fix karte hain.
            </p>
            <p className="mt-3 text-gray-600">
              Humari agenda simple hai: <span className="font-medium">better moods, calmer homes</span>.
              RiksCandle is here to make your everyday a little brighter.
            </p>
            <div className="mt-5">
              <Link to="/shop" className="btn btn-primary">Explore Bestsellers</Link>
            </div>
          </div>

          <div className="rounded-lg border p-6 bg-white">
            <h3 className="text-lg font-bold text-amber-800">Meet the Team</h3>
            <p className="mt-2 text-gray-600 text-sm">
              We’re a small founding team—makers first, marketers later. Aap jab bhi RiksCandle jalaate ho,
              you’re supporting local craft & mindful business.
            </p>
            <div className="mt-3 text-sm text-gray-700">
              — Team <span className="font-medium text-amber-700">RiksCandle</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
