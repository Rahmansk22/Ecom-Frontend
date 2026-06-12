import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import API from '../../config/api';
import { ProductCard } from './ProductCard';
import type { ProductResponse } from '../../types/catalog';
import { SlidersHorizontal, Sparkles, FilterX } from 'lucide-react';

export const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  // Filter states
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [debouncedMin, setDebouncedMin] = useState<string>('');
  const [debouncedMax, setDebouncedMax] = useState<string>('');

  // Debounce price input queries to prevent spamming APIs on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedMin(minPrice);
      setDebouncedMax(maxPrice);
    }, 500);
    return () => clearTimeout(handler);
  }, [minPrice, maxPrice]);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', query, debouncedMin, debouncedMax],
    queryFn: async () => {
      const params: any = { q: query, page: 0, size: 20 };
      if (debouncedMin) params.minPrice = debouncedMin;
      if (debouncedMax) params.maxPrice = debouncedMax;

      const response = await API.get('/search', { params });
      return response.data.content as ProductResponse[];
    },
  });

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Search Header Info */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          {query ? `Search results for "${query}"` : 'All Products'}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {searchResults ? `${searchResults.length} items found` : 'Searching...'}
        </p>
      </div>

      {/* Two-Column Filter layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left: Filter Sidebar */}
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <SlidersHorizontal className="h-4 w-4 text-primary-500" /> Filters
            </span>
            {(minPrice || maxPrice) && (
              <button 
                onClick={clearFilters}
                className="text-[10px] font-bold text-rose-500 flex items-center gap-0.5 hover:underline"
              >
                <FilterX className="h-3 w-3" /> Clear
              </button>
            )}
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price Range</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min ($)"
                className="w-full rounded-lg border border-slate-200 p-2 text-xs outline-none focus:border-primary-500"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max ($)"
                className="w-full rounded-lg border border-slate-200 p-2 text-xs outline-none focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Right: Results Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-72 w-full rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {searchResults.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          ) : (
            <div className="flex h-60 flex-col items-center justify-center gap-4 text-center rounded-2xl border border-dashed border-slate-200 bg-white p-8">
              <Sparkles className="h-10 w-10 text-slate-300" />
              <div>
                <p className="text-sm font-semibold text-slate-700">No Matching Items</p>
                <p className="text-xs text-slate-400 mt-0.5">Try adjusting your pricing sliders or search parameters.</p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
