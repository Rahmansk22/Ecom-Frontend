import React, { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from './api';
import { ProductCard } from './ProductCard';
import { 
  Sparkles, Clock, Flame, ShieldCheck, Truck, RotateCcw, 
  ChevronLeft, ChevronRight, ArrowRight,
  Smartphone, Laptop, Tv, Shirt, ShoppingBag, Baby, Sofa, Trophy, ShoppingBasket, Plane, Grid
} from 'lucide-react';

interface Slide {
  title: string;
  subtitle: string;
  badge: string;
  buttonText: string;
  bgGradient: string;
  imageUrl: string;
}

export const Home: React.FC = () => {
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchProducts(),
  });

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Hero carousel slides
  const slides: Slide[] = [
    {
      title: "Apple iPhone 15 Pro",
      subtitle: "Titanium Strength. A17 Pro Chip. Advanced Camera System.",
      badge: "Deal of the Season",
      buttonText: "Shop iPhone Now",
      bgGradient: "from-slate-900 via-slate-800 to-indigo-950",
      imageUrl: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80",
    },
    {
      title: "Sony WH-1000XM5",
      subtitle: "Industry-leading noise cancellation. Exceptional sound quality.",
      badge: "Limited Flash Offer",
      buttonText: "Explore Audio Deals",
      bgGradient: "from-blue-950 via-indigo-900 to-slate-900",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    },
    {
      title: "Dell XPS 15",
      subtitle: "Core Power. OLED InfinityEdge display. Infinite creativity.",
      badge: "Back to School Specials",
      buttonText: "Shop Premium Laptops",
      bgGradient: "from-slate-950 via-zinc-900 to-slate-900",
      imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80",
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide effect
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, [slides.length]);

  // Deals countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 45, seconds: 12 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        clearInterval(timer);
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (t: typeof timeLeft) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(t.hours)}h : ${pad(t.minutes)}m : ${pad(t.seconds)}s`;
  };

  // horizontal scroll ref for deals row
  const scrollerRef = useRef<HTMLDivElement>(null);
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollerRef.current) {
      const { scrollLeft, clientWidth } = scrollerRef.current;
      const scrollAmt = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
      scrollerRef.current.scrollTo({ left: scrollLeft + scrollAmt, behavior: 'smooth' });
    }
  };

  // Flipkart-identical categories with Lucide Icons
  const categoryItems = [
    { name: 'Mobiles',           slug: 'mobiles',      icon: Smartphone },
    { name: 'Electronics',       slug: 'electronics',  icon: Laptop },
    { name: 'TVs & Appliances',  slug: 'tvs-appliances', icon: Tv },
    { name: "Men's Fashion",     slug: 'men',          icon: Shirt },
    { name: "Women's Fashion",   slug: 'women',        icon: ShoppingBag },
    { name: 'Baby & Kids',       slug: 'baby-kids',    icon: Baby },
    { name: 'Home & Furniture',  slug: 'home-furniture', icon: Sofa },
    { name: 'Sports & Books',    slug: 'sports-books', icon: Trophy },
    { name: 'Grocery',           slug: 'grocery',      icon: ShoppingBasket },
    { name: 'Flights & Hotels',  slug: 'travel',       icon: Plane },
  ];

  // Filtering products locally
  const filteredProducts = productsData?.content.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.categorySlug.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-16 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-[40vh] right-1/4 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* 2. Premium Auto-sliding Campaign Carousel */}
        <div className="relative overflow-hidden rounded-2xl shadow-lg bg-slate-950 aspect-[4/3] sm:aspect-[16/9] md:aspect-[24/9]">
          <div className="absolute inset-0 z-0 flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {slides.map((slide, idx) => (
              <div key={idx} className="relative w-full h-full shrink-0 select-none">
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient} opacity-95 z-0`} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-0" />
                
                <div className="relative z-10 h-full flex items-center justify-between px-6 sm:px-12 lg:px-16 gap-6">
                  <div className="space-y-3 sm:space-y-4 max-w-lg">
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 px-3 py-0.5 text-[10px] sm:text-xs font-bold text-indigo-300">
                      <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      {slide.badge}
                    </span>
                    <h2 className="text-lg sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                      {slide.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                      {slide.subtitle}
                    </p>
                    <button className="inline-flex items-center gap-2 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold px-4 py-2 text-xs sm:text-sm shadow-xl transition-all duration-200">
                      {slide.buttonText} <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Slide Graphic */}
                  <div className="hidden md:block w-72 lg:w-96 aspect-video rounded-xl overflow-hidden shadow-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm self-center">
                    <img 
                      src={slide.imageUrl} 
                      alt={slide.title} 
                      className="h-full w-full object-cover opacity-90 transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dot Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <button 
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-slate-900/30 hover:bg-slate-900/60 backdrop-blur-sm flex items-center justify-center text-white transition-colors border border-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-slate-900/30 hover:bg-slate-900/60 backdrop-blur-sm flex items-center justify-center text-white transition-colors border border-white/10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* 3. Flash Deals of the Day (Horizontal Scroller) */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white shadow-md shadow-rose-200">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Deals of the Day</h3>
                <p className="text-[11px] text-slate-400">Exclusive discount pricing valid for limited time</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Ends In:</span>
              <span className="rounded-lg bg-rose-600 px-3 py-1.5 font-mono text-xs font-bold text-white shadow-sm">
                {formatTime(timeLeft)}
              </span>
              
              {/* Scroller control buttons */}
              <div className="hidden sm:flex items-center gap-1.5 border-l border-slate-200 pl-4 ml-1">
                <button 
                  onClick={() => handleScroll('left')}
                  className="h-8 w-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 shadow-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleScroll('right')}
                  className="h-8 w-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 shadow-sm"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Horizontal Scroller Container */}
          <div 
            ref={scrollerRef}
            className="flex gap-6 overflow-x-auto px-6 py-6 scroll-smooth no-scrollbar"
          >
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="h-72 w-52 bg-slate-100 rounded-xl animate-pulse shrink-0" />
              ))
            ) : (
              productsData?.content.map((prod) => (
                <div key={prod.id} className="w-52 shrink-0">
                  <ProductCard product={prod} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* 4. Trust Badges Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm"><Truck className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-bold text-slate-700">Free Shipping</p>
              <p className="text-[10px] text-slate-400">On all orders above ₹500</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 shadow-sm"><RotateCcw className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-bold text-slate-700">30-Days Return</p>
              <p className="text-[10px] text-slate-400">Instant refund guarantee</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-sm"><ShieldCheck className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-bold text-slate-700">Secure Payments</p>
              <p className="text-[10px] text-slate-400">SSL tokenized transactions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shadow-sm"><Flame className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-bold text-slate-700">Original Brands</p>
              <p className="text-[10px] text-slate-400">Direct manufacturer warranty</p>
            </div>
          </div>
        </div>

        {/* 5. Main Catalog Grid & Category Filter Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Explore Trending Products</h2>
              <p className="text-xs text-slate-400 mt-0.5">Top-rated items handpicked for you</p>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${selectedCategory === 'all' ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'}`}
              >
                All
              </button>
              {categoryItems.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${selectedCategory === cat.slug ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Grid display */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-72 w-full rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">
              No products found in this category listing. Try choosing another tab filter!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
