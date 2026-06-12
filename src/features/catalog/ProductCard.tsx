import React from 'react';
import { Link } from 'react-router-dom';
import type { ProductResponse } from '../../types/catalog';
import { Star, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: ProductResponse;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const discount = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.minPrice) / product.compareAtPrice) * 100) 
    : 0;

  const ratingVal = (3.8 + (product.title.charCodeAt(0) % 12) * 0.1).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white p-3.5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-200 hover:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.08)] sm:p-4"
    >
      {/* Product Image Container */}
      <Link 
        to={`/products/${product.slug}`}
        className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-50/50 flex items-center justify-center p-4 border border-slate-200/30 transition-all duration-300 group-hover:bg-slate-50/80"
      >
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.title} 
            className="max-h-full max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-105 mix-blend-multiply"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-300 bg-slate-100/30 rounded-lg">
            <ShoppingCart className="h-6 w-6 opacity-20" />
            <span className="text-[9px] font-bold uppercase tracking-widest">No Image</span>
          </div>
        )}

        {/* Quick View Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="translate-y-2 rounded-xl bg-indigo-600 px-3.5 py-2 text-[10px] font-bold text-white shadow-lg shadow-indigo-500/20 transition-transform duration-300 group-hover:translate-y-0 hover:bg-indigo-700">
            View Details
          </span>
        </div>
      </Link>

      {/* Details Section */}
      <div className="mt-4 flex flex-1 flex-col px-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
            {product.brand}
          </span>
          {/* Subtle Rating */}
          <div className="flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 border border-amber-200/20">
            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
            <span className="text-[9px] font-bold text-amber-800">{ratingVal}</span>
          </div>
        </div>

        <Link 
          to={`/products/${product.slug}`}
          className="mt-2"
        >
          <h3 className="line-clamp-2 min-h-[38px] text-[13px] font-semibold text-slate-800 leading-snug transition-colors group-hover:text-indigo-600">
            {product.title}
          </h3>
        </Link>

        {/* Pricing Section */}
        <div className="mt-auto pt-3 flex items-end justify-between border-t border-slate-100/80">
          <div className="flex flex-col">
            {product.compareAtPrice && discount > 0 && (
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-medium text-slate-400 line-through">
                  ₹{product.compareAtPrice.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                </span>
                <span className="rounded-md bg-emerald-500/10 px-1 py-0.5 text-[8px] font-bold tracking-wide text-emerald-600">
                  {discount}% OFF
                </span>
              </div>
            )}
            <span className="text-base font-extrabold tracking-tight text-slate-900">
              ₹{product.minPrice.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
