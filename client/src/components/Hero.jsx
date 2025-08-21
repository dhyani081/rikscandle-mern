// client/src/components/Hero.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Hero() {
  // You can override with env URLs later
  const slides = useMemo(() => [
    import.meta.env.VITE_HERO1 || 'https://res.cloudinary.com/dio2oq6xm/image/upload/v1755702286/rikscandle/q9mnrvythvrftv5ndy6e.jpg?w=1400&q=80&auto=format&fit=crop',
    import.meta.env.VITE_HERO2 || 'https://res.cloudinary.com/dio2oq6xm/image/upload/v1755702311/rikscandle/wroe4kpfwfguksnrlkr2.jpg?w=1400&q=80&auto=format&fit=crop',
    import.meta.env.VITE_HERO3 || 'https://res.cloudinary.com/dio2oq6xm/image/upload/v1755279755/rikscandle/products/j1mceq6s3qprjh5wv3bd.jpg?w=1400&q=80&auto=format&fit=crop',
  ], []);
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI(prev => (prev + 1) % slides.length), 4000);
    return () => clearInterval(t);
  }, [slides.length]);

  const goto = (n) => setI((n + slides.length) % slides.length);

  return (
    <section className="bg-gradient-to-br from-amber-100 via-white to-amber-300">
      <div className="container py-10 md:py-14 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-amber-800 leading-tight">
            Hand‑poured <span className=" text-orange-600">Soy Candles</span> for Cozy Nights
          </h1>
          <p className="mt-8 font-semibold text-gray-800">
            Crafted in small batches with natural wax and premium fragrances. Treat your space to warm, comforting aromas.
          </p>
          <h2 className="mt-10 text-2xl font-bold text-amber-700">
    ✨ Why Choose Us?
  </h2>

  {/* ✅ update: Added features grid */}
  <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
    <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-2xl shadow-sm">
      <span className="text-2xl">🌱</span>
      <p className="font-medium text-gray-800">100% Natural Soy Wax</p>
    </div>
    <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-2xl shadow-sm">
      <span className="text-2xl">🕯</span>
      <p className="font-medium text-gray-800">Hand-Poured with Love</p>
    </div>
    <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-2xl shadow-sm">
      <span className="text-2xl">🌸</span>
      <p className="font-medium text-gray-800">Premium Fragrances</p>
    </div>
    <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-2xl shadow-sm">
      <span className="text-2xl">⏳</span>
      <p className="font-medium text-gray-800">Slow & Clean Burn</p>
    </div>
    <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-2xl shadow-sm">
      <span className="text-2xl">🎁</span>
      <p className="font-medium text-gray-800">Perfect for Gifting</p>
    </div>
    <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-2xl shadow-sm">
      <span className="text-2xl">🇮🇳</span>
      <p className="font-medium text-gray-800">Made in India</p>
    </div>
  </div>
          <div className="mt-6 flex gap-3">
            <Link to="/shop" className="btn btn-primary">Shop Now</Link>
            <a href="#bestsellers" className="btn btn-outline">Best Sellers</a>
          </div>
        </div>

        <div className="relative rounded-lg overflow-hidden shadow-lg">
          {/* slides */}
          <div className="relative h-72 md:h-96">
            {slides.map((src, idx) => (
              <img
                key={src}
                src={src}
                alt=""
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${idx===i ? 'opacity-100' : 'opacity-0'}`}
              />
            ))}
          </div>

          {/* controls */}
          <button className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-700 rounded-full w-9 h-9 grid place-items-center"
            onClick={() => goto(i-1)} aria-label="Prev">‹</button>
          <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-700 rounded-full w-9 h-9 grid place-items-center"
            onClick={() => goto(i+1)} aria-label="Next">›</button>

          {/* dots */}
          <div className="absolute bottom-3 inset-x-0 flex justify-center gap-2">
            {slides.map((_, idx) => (
              <button key={idx}
                className={`w-2.5 h-2.5 rounded-full ${idx===i ? 'bg-white' : 'bg-white/60'}`}
                onClick={() => setI(idx)}
                aria-label={`Go to slide ${idx+1}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
