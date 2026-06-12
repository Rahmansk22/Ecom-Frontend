import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  ChevronDown,
  Smartphone,
  Laptop,
  Tv,
  Shirt,
  ShoppingBag,
  Baby,
  Sofa,
  Trophy,
  ShoppingBasket,
  Plane,
  Grid,
} from 'lucide-react';

// ── Exact Flipkart category list with Lucide Icons ─────────────────────────────
export const CATEGORIES = [
  {
    name: 'Mobiles',
    slug: 'mobiles',
    icon: Smartphone,
    sub: ['Smartphones', 'Feature Phones', 'Accessories', 'Tablets', 'Smart Watches'],
  },
  {
    name: 'Electronics',
    slug: 'electronics',
    icon: Laptop,
    sub: ['Laptops', 'Cameras', 'Headphones', 'Speakers', 'Gaming', 'Hard Drives'],
  },
  {
    name: 'TVs & Appliances',
    slug: 'tvs-appliances',
    icon: Tv,
    sub: ['Televisions', 'Washing Machines', 'Refrigerators', 'ACs', 'Microwaves', 'Chimneys'],
  },
  {
    name: "Men's Fashion",
    slug: 'men',
    icon: Shirt,
    sub: ["T-Shirts", "Shirts", "Jeans", "Trousers", 'Ethnic Wear', 'Sports Wear', 'Shoes'],
  },
  {
    name: "Women's Fashion",
    slug: 'women',
    icon: ShoppingBag,
    sub: ["Sarees", "Kurtis", "Jeans", "Western Wear", 'Nightwear', 'Ethnic', 'Shoes & Heels'],
  },
  {
    name: 'Baby & Kids',
    slug: 'baby-kids',
    icon: Baby,
    sub: ['Baby Clothing', "Boy's Clothing", "Girl's Clothing", 'Toys', 'Baby Care', 'School Bags'],
  },
  {
    name: 'Home & Furniture',
    slug: 'home-furniture',
    icon: Sofa,
    sub: ['Furniture', 'Beds & Wardrobes', 'Kitchen', 'Lighting', 'Decor', 'Dining & Serveware'],
  },
  {
    name: 'Sports & Books',
    slug: 'sports-books',
    icon: Trophy,
    sub: ['Sports & Fitness', 'Books', 'Gaming', 'Stationery', 'Gym Equipment', 'Cycling'],
  },
  {
    name: 'Grocery',
    slug: 'grocery',
    icon: ShoppingBasket,
    sub: ['Fruits & Vegetables', 'Dairy & Bread', 'Cold Drinks', 'Snacks', 'Breakfast', 'Masala & Spices'],
  },
  {
    name: 'Flights & Hotels',
    slug: 'travel',
    icon: Plane,
    sub: ['Flights', 'Hotels', 'Bus Tickets', 'Cabs', 'Holiday Packages'],
  },
];

// ── Portal-based dropdown that escapes all parent overflow constraints ──────────
interface DropdownPortalProps {
  anchorRef: React.RefObject<HTMLDivElement | null>;
  cat: typeof CATEGORIES[number];
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onNavigate: (path: string) => void;
}

const DropdownPortal: React.FC<DropdownPortalProps> = ({ anchorRef, cat, onMouseEnter, onMouseLeave, onNavigate }) => {
  const [style, setStyle] = useState<React.CSSProperties | null>(null);

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const dropdownWidth = 170;
      const spaceOnRight = window.innerWidth - rect.left;
      
      let leftPos = rect.left;
      // If close to the right edge of desktop screen, align to the right edge of the button
      if (spaceOnRight < dropdownWidth) {
        leftPos = rect.right - dropdownWidth;
      }

      setStyle({
        top: rect.bottom,
        left: leftPos,
        minWidth: dropdownWidth,
        width: dropdownWidth,
        zIndex: 9990,
      });
    }
  }, [anchorRef]);

  if (!style) return null;

  return createPortal(
    <div
      className="fixed rounded-b-xl overflow-hidden bg-white border border-slate-200/80 shadow-2xl animate-slide-down"
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="px-4 pt-3 pb-1 text-[9px] font-extrabold uppercase tracking-widest text-indigo-600">
        {cat.name}
      </div>
      <div className="pb-1">
        {cat.sub.map((sub) => (
          <button
            key={sub}
            onClick={() => onNavigate(`/categories/${cat.slug}?sub=${encodeURIComponent(sub)}`)}
            className="w-full text-left px-4 py-2 text-[12px] transition-colors text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
          >
            {sub}
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
};

export const CategoryNav: React.FC = () => {
  const [active, setActive] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  // Store refs for each category trigger element
  const catRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const open = (key: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActive(key);
  };

  const close = () => {
    timerRef.current = setTimeout(() => setActive(null), 140);
  };

  const keepOpen = (key: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActive(key);
  };

  const handleNavigate = (path: string) => {
    setActive(null);
    navigate(path);
  };

  return (
    <nav
      className="hidden md:block w-full bg-white/70 backdrop-blur-md border-b border-slate-200/50 sticky top-[60px]"
      style={{ zIndex: 90 }}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div
          className="flex items-center overflow-x-auto no-scrollbar"
        >

          {/* ── Home Button ── */}
          <Link
            to="/"
            className="flex flex-col items-center justify-center flex-shrink-0 px-4 py-2 h-[58px] group transition-all duration-150 relative"
            style={{ minWidth: 64 }}
          >
            <Home
              size={18}
              className="mb-1 group-hover:scale-110 transition-transform duration-150 text-indigo-600"
            />
            <span
              className="text-[11px] font-bold tracking-wide text-indigo-600"
            >
              Home
            </span>
            <span
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600 rounded-full"
            />
          </Link>

          {/* ── Divider ── */}
          <span className="h-6 w-px flex-shrink-0 bg-slate-200" />

          {/* ── Category items ── */}
          {CATEGORIES.map((cat) => {
            const isOpen = active === cat.name;
            return (
              <div
                key={cat.name}
                className="relative flex-shrink-0"
                ref={(el) => { catRefs.current[cat.name] = el; }}
                onMouseEnter={() => open(cat.name)}
                onMouseLeave={close}
              >
                <Link
                  to={`/categories/${cat.slug}`}
                  className="flex flex-col items-center justify-center px-4 h-[58px] transition-all duration-150 relative group"
                  style={{ minWidth: 'max-content' }}
                >
                  <div
                    className="h-[28px] w-[28px] rounded-lg flex items-center justify-center transition-all duration-150 mb-0.5 bg-slate-50 group-hover:bg-indigo-50/50"
                  >
                    <cat.icon
                      size={14}
                      className={`transition-colors duration-150 ${isOpen ? 'text-indigo-600' : 'text-slate-500'}`}
                    />
                  </div>

                  {/* Label + chevron */}
                  <span
                    className={`flex items-center gap-0.5 text-[11px] font-semibold tracking-wide whitespace-nowrap leading-none transition-colors ${isOpen ? 'text-indigo-600' : 'text-slate-600 group-hover:text-slate-800'}`}
                  >
                    {cat.name}
                    {cat.sub.length > 0 && (
                      <ChevronDown
                        className={`h-3 w-3 mt-px flex-shrink-0 transition-transform duration-200 ${isOpen ? 'text-indigo-600' : 'text-slate-400'}`}
                        style={{
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                      />
                    )}
                  </span>

                  {/* Active Underline */}
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-full transition-all duration-200 ${isOpen ? 'bg-indigo-600' : 'bg-transparent'}`}
                  />
                </Link>

                {/* ── Dropdown rendered via portal ── */}
                {isOpen && cat.sub.length > 0 && (
                  <DropdownPortal
                    anchorRef={{ current: catRefs.current[cat.name] ?? null }}
                    cat={cat}
                    onMouseEnter={() => keepOpen(cat.name)}
                    onMouseLeave={close}
                    onNavigate={handleNavigate}
                  />
                )}
              </div>
            );
          })}

          {/* ── All Products ── */}
          <Link
            to="/"
            className="flex flex-col items-center justify-center flex-shrink-0 px-4 h-[58px] group transition-all duration-150 relative"
            style={{ minWidth: 'max-content' }}
          >
            <Grid
              size={18}
              className="mb-0.5 group-hover:scale-110 transition-transform duration-150 text-slate-500"
            />
            <span
              className="text-[11px] font-semibold tracking-wide text-slate-600 leading-none mt-1"
            >
              All Products
            </span>
          </Link>

        </div>
      </div>
    </nav>
  );
};
