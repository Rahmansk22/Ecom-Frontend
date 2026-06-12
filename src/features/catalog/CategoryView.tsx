import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from './api';
import { ProductCard } from './ProductCard';
import { SlidersHorizontal, AlertCircle } from 'lucide-react';

export const CategoryView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', slug],
    queryFn: () => fetchProducts(slug),
  });

  const formattedTitle = slug 
    ? slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') 
    : 'Category';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Category Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{formattedTitle} Department</h1>
          <p className="text-xs text-slate-400 mt-1">Discover items in this specific section.</p>
        </div>
        
        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-72 w-full rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : productsData?.content && productsData.content.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productsData.content.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      ) : (
        <div className="flex h-60 flex-col items-center justify-center gap-4 text-center rounded-2xl border border-dashed border-slate-200 bg-white p-8">
          <AlertCircle className="h-10 w-10 text-slate-300" />
          <div>
            <p className="text-sm font-semibold text-slate-700">No Products Found</p>
            <p className="text-xs text-slate-400 mt-0.5">There are no active listings in this department currently.</p>
          </div>
          <Link to="/" className="rounded-full bg-primary-600 px-5 py-2 text-xs font-semibold text-white hover:bg-primary-700">
            Back to Home
          </Link>
        </div>
      )}

    </div>
  );
};
