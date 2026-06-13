import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { fetchProductDetail } from './api';
import { ShoppingCart, Heart, Shield, CheckCircle, ArrowLeft } from 'lucide-react';
import type { ProductVariantDto } from '../../types/catalog';
import type { AppDispatch } from '../../store';
import { addToCart, clearCart, fetchCart } from '../../store/slices/cartSlice';
import { addToWishlist } from '../../store/slices/wishlistSlice';
import { ProductReviews } from './ProductReviews';
import { useToast } from '../../components/Toast';

const renderDescriptionPoints = (text: string) => {
  if (!text) return null;
  const points = text
    .split(/(?:\. |\n)+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return (
    <ul className="list-disc pl-5 space-y-2 text-xs text-slate-750 dark:text-slate-350 font-normal">
      {points.map((pt, idx) => {
        const cleanPt = pt.endsWith('.') ? pt : `${pt}.`;
        return (
          <li key={idx} className="leading-relaxed">
            {cleanPt}
          </li>
        );
      })}
    </ul>
  );
};

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { showCartToast, showWishlistToast } = useToast();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductDetail(slug!),
    enabled: !!slug,
  });

  // Selected option state (e.g. { color: 'Black Titanium', storage: '128GB' })
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantDto | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');

  // Extract unique options from all variants
  const [optionMatrix, setOptionMatrix] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (product && product.variants.length > 0) {
      const matrix: Record<string, string[]> = {};
      
      product.variants.forEach((variant) => {
        try {
          const attributes = JSON.parse(variant.attributesJson);
          Object.keys(attributes).forEach((key) => {
            const val = attributes[key];
            if (!matrix[key]) matrix[key] = [];
            if (!matrix[key].includes(val)) matrix[key].push(val);
          });
        } catch (e) {
          console.error('Failed to parse variant attributes', e);
        }
      });

      setOptionMatrix(matrix);

      // Pre-select the first variant's attributes
      try {
        const firstAttributes = JSON.parse(product.variants[0].attributesJson);
        setSelectedOptions(firstAttributes);
        setSelectedVariant(product.variants[0]);
        if (product.variants[0].imageUrls.length > 0) {
          setActiveImage(product.variants[0].imageUrls[0]);
        }
      } catch (e) {
        console.error('Failed to preselect attributes', e);
      }
    }
  }, [product]);

  // Update selected variant when options change
  const handleOptionSelect = (key: string, value: string) => {
    const updated = { ...selectedOptions, [key]: value };
    setSelectedOptions(updated);

    // Find matching variant
    const match = product?.variants.find((variant) => {
      try {
        const attr = JSON.parse(variant.attributesJson);
        return Object.keys(updated).every((k) => attr[k] === updated[k]);
      } catch (e) {
        return false;
      }
    });

    if (match) {
      setSelectedVariant(match);
      if (match.imageUrls.length > 0) {
        setActiveImage(match.imageUrls[0]);
      }
    } else {
      setSelectedVariant(null);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-slate-100 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 w-1/4 bg-slate-100 rounded" />
            <div className="h-8 w-3/4 bg-slate-100 rounded" />
            <div className="h-6 w-1/3 bg-slate-100 rounded" />
            <div className="h-24 w-full bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-red-500 font-bold">Failed to load product details. It may not exist.</p>
        <button onClick={() => navigate('/')} className="mt-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-white text-xs font-bold transition-all shadow-md">
          Back to storefront
        </button>
      </div>
    );
  }

  const discount = selectedVariant && selectedVariant.compareAtPrice
    ? Math.round(((selectedVariant.compareAtPrice - selectedVariant.price) / selectedVariant.compareAtPrice) * 100)
    : 0;

  const handleAddCurrentItem = async () => {
    if (!selectedVariant || selectedVariant.stock <= 0) return;

    await dispatch(
      addToCart({
        variantId: selectedVariant.id,
        quantity: 1,
        itemDetails: {
          variantId: selectedVariant.id,
          productTitle: product.title,
          sku: selectedVariant.sku,
          price: selectedVariant.price,
          stock: selectedVariant.stock,
          imageUrl: activeImage,
          attributesJson: selectedVariant.attributesJson,
          productSlug: product.slug,
        },
      })
    ).unwrap();
    showCartToast(product.title);
  };

  const handleBuyNow = async () => {
    if (!selectedVariant || selectedVariant.stock <= 0) return;

    try {
      const latestCart = await dispatch(fetchCart()).unwrap();
      if (latestCart && latestCart.length > 0) {
        localStorage.setItem('saved_cart_before_buynow', JSON.stringify(latestCart));
      } else {
        localStorage.removeItem('saved_cart_before_buynow');
      }
      await dispatch(clearCart()).unwrap();
      await dispatch(
        addToCart({
          variantId: selectedVariant.id,
          quantity: 1,
          itemDetails: {
            variantId: selectedVariant.id,
            productTitle: product.title,
            sku: selectedVariant.sku,
            price: selectedVariant.price,
            stock: selectedVariant.stock,
            imageUrl: activeImage,
            attributesJson: selectedVariant.attributesJson,
            productSlug: product.slug,
          },
        })
      ).unwrap();
      navigate('/checkout');
    } catch (err) {
      console.error('Failed to prepare buy-now checkout', err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      
      {/* Back button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors group"
        >
          <span className="flex items-center justify-center h-9 w-9 rounded-full border border-slate-200 bg-white shadow-sm group-hover:border-indigo-400 group-hover:shadow-md transition-all">
            <ArrowLeft className="h-4 w-4" />
          </span>
          Back
        </button>
      </div>

      {/* Main product view grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Image Gallery & CTA (takes 5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex gap-4">
            {/* Vertical Thumbnails strip (visible on desktop md and up) */}
            {selectedVariant && selectedVariant.imageUrls.length > 0 && (
              <div className="hidden md:flex flex-col gap-2.5 shrink-0 overflow-y-auto max-h-[450px]">
                {selectedVariant.imageUrls.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(url)}
                    className={`h-16 w-16 rounded-xl border-2 bg-white overflow-hidden p-1 flex items-center justify-center transition-all ${
                      activeImage === url ? 'border-indigo-600 shadow-sm scale-95' : 'border-slate-200 hover:border-slate-350'
                    }`}
                  >
                    <img src={url} alt="thumbnail" className="h-full w-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image Box */}
            <div className="relative aspect-square flex-1 rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-center overflow-hidden">
              {activeImage ? (
                <img 
                  src={activeImage} 
                  alt={product.title} 
                  className="h-full w-full object-contain max-h-[450px] transition-all hover:scale-105 duration-300 mix-blend-multiply"
                />
              ) : (
                <div className="text-xs text-slate-400">No Image Available</div>
              )}

              {/* Floating Wishlist Button */}
              <button 
                onClick={() => {
                  dispatch(addToWishlist(product.id));
                  showWishlistToast(product.title);
                }}
                className="absolute top-4 right-4 rounded-full border border-slate-200 bg-white p-2.5 text-slate-405 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/10 transition-all duration-200 shadow-sm z-10"
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Thumbnails fallback row for mobile view (hidden on md and up) */}
          {selectedVariant && selectedVariant.imageUrls.length > 0 && (
            <div className="flex md:hidden gap-3 overflow-x-auto py-1">
              {selectedVariant.imageUrls.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(url)}
                  className={`h-14 w-14 rounded-lg border-2 bg-white overflow-hidden p-1 flex items-center justify-center flex-shrink-0 ${
                    activeImage === url ? 'border-indigo-600' : 'border-slate-200'
                  }`}
                >
                  <img src={url} alt="thumbnail" className="h-full w-full object-contain mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}

          {/* Buying Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              disabled={!selectedVariant || selectedVariant.stock <= 0}
              onClick={() => { void handleAddCurrentItem(); }}
              className="flex-1 flex items-center justify-center gap-2 rounded-sm bg-[#ff9f00] hover:bg-[#f39700] py-3.5 text-sm font-bold text-white transition shadow-md shadow-orange-100/30 disabled:opacity-50 uppercase tracking-wider"
            >
              <ShoppingCart className="h-5 w-5" /> Add to Cart
            </button>

            <button
              disabled={!selectedVariant || selectedVariant.stock <= 0}
              onClick={handleBuyNow}
              className="flex-1 flex items-center justify-center gap-2 rounded-sm bg-[#fb641b] hover:bg-[#e25310] py-3.5 text-sm font-bold text-white transition shadow-md shadow-red-100/30 disabled:opacity-50 uppercase tracking-wider"
            >
              <svg className="h-5 w-5 fill-white stroke-none" viewBox="0 0 24 24">
                <path d="M13 2v9h7L11 22v-9H4L13 2z"/>
              </svg> Buy Now
            </button>
          </div>

          {/* Small security assurance items */}
          <div className="grid grid-cols-2 gap-4 text-[11px] text-slate-400 pt-4 border-t border-slate-100">
            <p className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-emerald-500" /> AuraCart Secure Warranty</p>
            <p className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" /> 100% Tax Compliant Invoice</p>
          </div>
        </div>

        {/* Right Column: Buying specs (takes 7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{product.brand}</span>
            <h1 className="text-lg font-medium text-slate-800 mt-1 leading-snug">{product.title}</h1>
            
            {/* Rating Summary Line */}
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-[#388e3c] text-white text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                4.2 ★
              </span>
              <span className="text-xs font-semibold text-slate-400">32 Ratings & 8 Reviews</span>
              
              {/* Flipkart Assured Badge */}
              <span className="inline-flex items-center gap-0.5 ml-2 bg-blue-50/30 px-1.5 py-0.5 rounded border border-blue-100/50">
                <span className="text-[10px] font-black italic text-blue-600">f</span>
                <span className="text-[9px] font-bold italic text-[#fb641b]">Assured</span>
              </span>
            </div>
          </div>

          {/* Pricing */}
          {selectedVariant ? (
            <div className="border-y border-slate-100 py-4 space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-slate-900">₹{selectedVariant.price.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
                {selectedVariant.compareAtPrice && (
                  <span className="text-sm text-slate-400 line-through">₹{selectedVariant.compareAtPrice.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
                )}
                {discount > 0 && (
                  <span className="text-sm font-semibold text-[#388e3c] ml-1">
                    {discount}% off
                  </span>
                )}
              </div>
              
              {/* Stock check */}
              <div>
                {selectedVariant.stock > 0 ? (
                  <span className="text-xs font-bold text-[#388e3c] flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> In Stock (Only {selectedVariant.stock} left!)
                  </span>
                ) : (
                  <span className="text-xs font-bold text-rose-500">Out of Stock</span>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-amber-50 p-3 text-xs font-bold text-amber-700">
              Selected combination is unavailable. Please select another option.
            </div>
          )}

          {/* Flipkart Available Offers */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Available Offers</p>
            <div className="space-y-2 text-xs text-slate-700">
              <p className="flex items-start gap-2">
                <svg className="h-4 w-4 text-[#388e3c] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 8.25c-.97 0-1.75-.78-1.75-1.75s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.75-1.75 1.75z"/>
                </svg>
                <span><strong className="text-slate-800">Bank Offer</strong> 5% Unlimited Cashback on Flipkart Axis Bank Credit Card <span className="text-blue-600 font-semibold cursor-pointer hover:underline">T&C</span></span>
              </p>
              <p className="flex items-start gap-2">
                <svg className="h-4 w-4 text-[#388e3c] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 8.25c-.97 0-1.75-.78-1.75-1.75s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.75-1.75 1.75z"/>
                </svg>
                <span><strong className="text-slate-800">Bank Offer</strong> 10% off on SBI Credit Card transactions, up to ₹1,250 on orders of ₹5,000 and above <span className="text-blue-600 font-semibold cursor-pointer hover:underline">T&C</span></span>
              </p>
              <p className="flex items-start gap-2">
                <svg className="h-4 w-4 text-[#388e3c] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 8.25c-.97 0-1.75-.78-1.75-1.75s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.75-1.75 1.75z"/>
                </svg>
                <span><strong className="text-slate-800">Special Price</strong> Get extra ₹2,000 off (price inclusive of cashback/coupon) <span className="text-blue-600 font-semibold cursor-pointer hover:underline">T&C</span></span>
              </p>
            </div>
          </div>

          {/* Delivery Check Pin Code */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Delivery Details</p>
            <div className="flex max-w-[280px] rounded-sm border border-slate-200 bg-white overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/40 transition-all">
              <input 
                type="text" 
                maxLength={6} 
                placeholder="Enter Pincode" 
                className="w-full px-3 py-2.5 text-xs bg-transparent outline-none text-slate-800 font-semibold"
              />
              <button className="px-4 py-2.5 text-xs font-bold text-[#2874f0] bg-blue-50/30 hover:bg-blue-50 border-l border-slate-200 transition-colors">
                Check
              </button>
            </div>
            <p className="text-[10px] text-slate-400">Delivery in 2-3 Days | COD (Cash on Delivery) available</p>
          </div>

          {/* Dynamic attributes selector matrix */}
          {Object.keys(optionMatrix).map((key) => {
            const optionKeyLower = key.toLowerCase();
            const isColorKey = optionKeyLower.includes('color');
            
            const getColorClass = (val: string) => {
              const v = val.toLowerCase();
              if (v.includes('icy blue')) return '#a5d8ff';
              if (v.includes('black')) return '#1e293b';
              if (v.includes('gray') || v.includes('grey')) return '#64748b';
              if (v.includes('yellow')) return '#fef08a';
              if (v.includes('blue')) return '#93c5fd';
              if (v.includes('emerald') || v.includes('green')) return '#10b981';
              if (v.includes('silver')) return '#cbd5e1';
              if (v.includes('white')) return '#ffffff';
              return '#94a3b8';
            };

            return (
              <div key={key} className="space-y-2 border-t border-slate-100 pt-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{key}</span>
                <div className="flex flex-wrap gap-2">
                  {optionMatrix[key].map((value) => {
                    const isSelected = selectedOptions[key] === value;
                    return (
                      <button
                        key={value}
                        onClick={() => handleOptionSelect(key, value)}
                        className={`rounded-sm px-4 py-2 text-xs font-bold border transition flex items-center gap-1.5 ${
                          isSelected 
                            ? 'border-[#2874f0] bg-[#f5f8fe] text-[#2874f0] shadow-sm' 
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-350'
                        }`}
                      >
                        {isColorKey && (
                          <span 
                            className="h-3 w-3 rounded-full border border-slate-300 shrink-0" 
                            style={{ backgroundColor: getColorClass(value) }}
                          />
                        )}
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Highlights & Easy Payment Options side-by-side */}
          <div className="flex flex-col sm:flex-row gap-6 border-t border-slate-100 pt-4">
            <div className="flex-1 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Highlights</span>
              <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-700 font-medium">
                {product.description ? product.description.split(/(?:\. |\n)+/).slice(0, 6).map((pt: string, idx: number) => {
                  const cleanPt = pt.trim();
                  if (!cleanPt) return null;
                  return <li key={idx} className="leading-relaxed">{cleanPt.endsWith('.') ? cleanPt : `${cleanPt}.`}</li>;
                }) : (
                  <>
                    <li>Standard product attributes apply.</li>
                  </>
                )}
              </ul>
            </div>
            <div className="flex-1 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Easy Payment Options</span>
              <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-700 font-medium">
                <li>No Cost EMI starts from ₹5,000/month</li>
                <li>Cash on Delivery available</li>
                <li>Net Banking & UPI available</li>
                <li>Flipkart Pay Later option available</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
      {/* Description & Technical Specs section */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-10 space-y-10">
        
        {/* Description */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white pb-2.5 border-b border-slate-100 dark:border-slate-800/60 mb-2">
            Product Description
          </h3>
          {renderDescriptionPoints(product.description)}
        </div>

        {/* Technical specs table */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white pb-2.5 border-b border-slate-100 dark:border-slate-800/60 mb-2">
            Specifications
          </h3>
          
          <div className="divide-y divide-slate-100">
            {/* Category Header: General */}
            <div className="py-2.5 text-xs font-bold text-[#2874f0] tracking-wide uppercase">
              General
            </div>
            
            <div className="flex py-3.5 text-xs gap-4 items-start">
              <span className="text-slate-400 w-28 sm:w-36 shrink-0 font-medium">Brand</span>
              <span className="text-slate-800 font-semibold flex-1">{product.brand}</span>
            </div>
            
            {product.countryOfOrigin && (
              <div className="flex py-3.5 text-xs gap-4 items-start">
                <span className="text-slate-400 w-28 sm:w-36 shrink-0 font-medium">Country of Origin</span>
                <span className="text-slate-800 font-semibold flex-1">{product.countryOfOrigin}</span>
              </div>
            )}
            
            {product.hsnCode && (
              <div className="flex py-3.5 text-xs gap-4 items-start">
                <span className="text-slate-400 w-28 sm:w-36 shrink-0 font-medium">HSN Code (Tax)</span>
                <span className="text-slate-800 font-mono font-semibold flex-1">{product.hsnCode}</span>
              </div>
            )}
            
            {selectedVariant && (
              <>
                <div className="flex py-3.5 text-xs gap-4 items-start">
                  <span className="text-slate-400 w-28 sm:w-36 shrink-0 font-medium">SKU Code</span>
                  <span className="text-slate-800 font-mono font-semibold flex-1">{selectedVariant.sku}</span>
                </div>
                {selectedVariant.attributesJson && (
                  <>
                    {/* Category Header: Variant Details */}
                    <div className="py-2.5 text-xs font-bold text-[#2874f0] tracking-wide uppercase pt-4">
                      Product Attributes
                    </div>
                    {Object.entries(JSON.parse(selectedVariant.attributesJson)).map(([key, val]: any) => (
                      <div 
                        key={key} 
                        className="flex py-3.5 text-xs gap-4 items-start"
                      >
                        <span className="text-slate-400 w-28 sm:w-36 shrink-0 font-medium capitalize">{key}</span>
                        <span className="text-slate-800 font-semibold flex-1">{val}</span>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Product Reviews */}
      {product && <ProductReviews productId={product.id} />}

    </div>
  );
};
