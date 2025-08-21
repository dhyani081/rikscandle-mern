// client/src/components/ProductCard.jsx
import { Link } from 'react-router-dom';

export default function ProductCard({ p }) {
  const pickImage = (prod) => {
    if (prod.image) return prod.image;
    if (Array.isArray(prod.images) && prod.images.length) {
      const first = prod.images[0];
      return typeof first === 'string' ? first : first?.url;
    }
    return '';
  };

  const img = pickImage(p);
  const mrp = Number(p.mrp ?? p.price ?? 0);
  const price = Number(p.price ?? 0);
  const hasDiscount = mrp > price && price > 0;
  const discount = hasDiscount ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <Link to={`/product/${p._id}`} className="block border rounded-lg hover:shadow transition bg-white">
      {img
        ? <img src={img} alt={p.name} className="w-full h-52 object-cover rounded-t-lg" />
        : <div className="w-full h-52 rounded-t-lg bg-gray-100" />
      }
      <div className="p-3">
        <div className="font-medium line-clamp-1">{p.name}</div>

        <div className="mt-2 flex items-baseline gap-2">
          <div className="text-amber-700 font-bold">₹{price.toFixed(0)}</div>
          {hasDiscount && (
            <>
              <div className="text-sm line-through text-gray-400">₹{mrp.toFixed(0)}</div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                {discount}% off
              </span>
            </>
          )}
        </div>

        {p.countInStock <= 0 && <div className="text-xs mt-1 text-red-600">Out of stock</div>}
      </div>
    </Link>
  );
}
