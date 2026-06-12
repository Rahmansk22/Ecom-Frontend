import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { logoutUser } from '../store/slices/authSlice';
import { fetchCart } from '../store/slices/cartSlice';
import { fetchWishlist } from '../store/slices/wishlistSlice';
import { NotificationBell } from '../features/notifications/NotificationBell';
import {
  Search,
  ShoppingCart,
  User as UserIcon,
  LogOut,
  ShoppingBag,
  Heart,
  ChevronDown,
  Package,
  MapPin,
  Plane,
  ShoppingBasket,
  Menu,
  X,
} from 'lucide-react';
import API from '../config/api';
import { CATEGORIES } from './CategoryNav';

export const Navbar: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    setShowDropdown(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    dispatch(fetchCart());
    if (user) dispatch(fetchWishlist());
  }, [dispatch, user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideDesktop = desktopDropdownRef.current?.contains(target);
      const insideMobile = mobileDropdownRef.current?.contains(target);
      if (!insideDesktop && !insideMobile) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    try { await API.post('/auth/logout', {}); } catch { /* ignore */ }
    dispatch(logoutUser());
    setShowDropdown(false);
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const renderUserDropdown = () => {
    if (!user) return null;
    return (
      <div
        className="absolute right-0 top-[calc(100%+8px)] rounded-xl shadow-xl bg-white overflow-hidden border border-slate-200/80 border-t-4 border-t-blue-600 animate-slide-down"
        style={{ minWidth: '220px', zIndex: 110 }}
      >
        {/* User info header */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
          <p className="text-xs font-bold text-slate-800 leading-tight">{user.firstName} {user.lastName}</p>
          <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
        </div>

        <div className="py-1.5">
          <p className="px-4 pt-1.5 pb-1 text-[9px] font-extrabold uppercase tracking-wider text-blue-600">
            My Account
          </p>
          {[
            { to: '/profile', icon: UserIcon, label: 'My Profile' },
            { to: '/orders', icon: Package, label: 'Orders' },
            { to: '/wishlist', icon: Heart, label: 'Wishlist' },
          ].map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-600"
            >
              <Icon className="h-3.5 w-3.5 text-slate-400" />
              {label}
            </Link>
          ))}

          {(user.role === 'SELLER' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
            <>
              <hr className="my-1.5 border-slate-100" />
              <Link
                to="/seller"
                className="flex items-center gap-3 px-4 py-2 text-xs font-bold transition-colors hover:bg-indigo-50/30 text-indigo-600"
              >
                <ShoppingBag className="h-3.5 w-3.5" /> Seller Hub
              </Link>
            </>
          )}
          {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
            <Link
              to="/admin"
              className="flex items-center gap-3 px-4 py-2 text-xs font-bold transition-colors hover:bg-red-50/30 text-rose-600"
            >
              <UserIcon className="h-3.5 w-3.5" /> Admin Console
            </Link>
          )}
        </div>

        <hr className="border-slate-100" />
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold transition-colors hover:bg-red-50/40 text-rose-600"
        >
          <LogOut className="h-3.5 w-3.5" /> Logout
        </button>
      </div>
    );
  };

  const renderGuestDropdown = () => {
    return (
      <div
        className="absolute right-0 top-[calc(100%+8px)] rounded-xl shadow-xl bg-white overflow-hidden border border-slate-200/80 border-t-4 border-t-blue-600 animate-slide-down"
        style={{ minWidth: '200px', zIndex: 110 }}
      >
        <div className="p-4">
          <p className="text-xs text-slate-500 mb-3 font-semibold">
            New customer?{' '}
            <Link to="/signup" className="font-bold text-indigo-600 hover:text-indigo-700">
              Sign Up
            </Link>
          </p>
          <Link
            to="/login"
            className="block w-full text-center py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all hover:scale-[1.02]"
          >
            Login
          </Link>
        </div>
        <hr className="border-slate-100" />
        <div className="py-1.5">
          {[
            { to: '/profile', label: 'My Profile' },
            { to: '/orders', label: 'Orders' },
            { to: '/wishlist', label: 'Wishlist' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="block px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <header 
      className="sticky top-0 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md"
      style={{ zIndex: 100 }}
    >
      <div className="mx-auto max-w-7xl px-4">

        {/* ── Desktop Header (Visible on md and up) ── */}
        <div className="hidden md:flex items-center h-[60px] gap-4">

          {/* Logo Area */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link to="/" className="flex flex-col items-start leading-none">
              <span
                className="font-black text-[22px] tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent"
                style={{ fontFamily: '"Inter", sans-serif' }}
              >
                AuraCart
              </span>
              <span className="text-[9px] tracking-widest uppercase font-bold text-slate-400 mt-0.5">
                ENTERPRISE
              </span>
            </Link>

            {/* Quick tabs - Travel & Grocery */}
            <div className="hidden lg:flex items-center gap-1.5 ml-3">
              <Link
                to="/categories/travel"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                style={{ color: '#475569' }}
              >
                <Plane className="h-3 w-3 text-indigo-500" /> Travel
              </Link>
              <Link
                to="/categories/grocery"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                style={{ color: '#475569' }}
              >
                <ShoppingBasket className="h-3 w-3 text-indigo-500" /> Grocery
              </Link>
            </div>
          </div>

          {/* Delivery location */}
          {user && (
            <div className="hidden md:flex items-center gap-1.5 flex-shrink-0 cursor-pointer group px-2 py-1 hover:bg-slate-50 rounded-lg transition-colors">
              <MapPin className="h-4 w-4 text-indigo-500" />
              <div className="leading-none">
                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Deliver to</p>
                <p className="text-xs font-semibold text-slate-700 group-hover:text-indigo-600">
                  {user.firstName}
                </p>
              </div>
            </div>
          )}

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 min-w-0">
            <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50/50 focus-within:border-indigo-500/80 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100/40 transition-all duration-200">
              <Search className="absolute left-3.5 h-4 w-4 flex-shrink-0 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search premium products, brands, and categories..."
                className="w-full pl-10 pr-4 h-[38px] bg-transparent outline-none text-xs text-slate-800"
                style={{ caretColor: '#4f46e5' }}
              />
            </div>
          </form>

          {/* Right side actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">

            {/* Login / Account */}
            {user ? (
              <div className="relative" ref={desktopDropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-1.5 px-3 h-[36px] rounded-xl text-xs font-bold transition-all duration-200 hover:bg-slate-50 text-slate-700"
                >
                  <div
                    className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-indigo-600 mr-1.5"
                  >
                    {user.firstName[0].toUpperCase()}
                  </div>
                  <span>{user.firstName}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
                </button>
                {showDropdown && renderUserDropdown()}
              </div>
            ) : (
              <div className="relative" ref={desktopDropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-1 px-4 h-[36px] rounded-xl text-xs font-bold border border-indigo-600 text-indigo-600 hover:bg-indigo-50/30 transition-all"
                >
                  Login
                  <ChevronDown className="h-3.5 w-3.5 ml-1" />
                </button>
                {showDropdown && renderGuestDropdown()}
              </div>
            )}

            {/* Become a Seller */}
            <Link
              to="/seller"
              className="flex items-center h-[36px] px-3 text-xs font-bold transition-colors hover:bg-slate-50 rounded-xl text-slate-700 whitespace-nowrap"
            >
              Become a Seller
            </Link>

            {/* Notification */}
            {user && <NotificationBell />}

            {/* Wishlist */}
            {user && (
              <Link
                to="/wishlist"
                className="relative flex items-center gap-1.5 h-[36px] px-3 rounded-xl text-xs font-bold transition-colors hover:bg-slate-50 text-slate-700"
              >
                <div className="relative">
                  <Heart className="h-5 w-5" />
                  {wishlistItems.length > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center rounded-full text-[9px] font-bold text-white bg-rose-500"
                    >
                      {wishlistItems.length}
                    </span>
                  )}
                </div>
                <span>Wishlist</span>
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center gap-1.5 h-[36px] px-3 rounded-xl text-xs font-bold transition-colors hover:bg-slate-50 text-slate-700"
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-2 -right-2 h-[18px] min-w-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-extrabold text-white bg-rose-500"
                  >
                    {cartCount}
                  </span>
                )}
              </div>
              <span>Cart</span>
            </Link>

          </div>
        </div>

        {/* ── Mobile/Tablet Header (Visible below md) ── */}
        <div className="flex md:hidden flex-col py-2.5 gap-2.5">
          {/* Row 1: Menu + Logo + Actions */}
          <div className="flex items-center justify-between gap-2">
            
            <div className="flex items-center gap-1">
              {/* Hamburger Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors flex-shrink-0"
              >
                <Menu size={20} />
              </button>

              {/* Logo */}
              <Link to="/" className="flex flex-col items-start leading-none ml-1">
                <span
                  className="font-black text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent"
                  style={{ fontFamily: '"Inter", sans-serif' }}
                >
                  AuraCart
                </span>
                <span className="text-[8px] tracking-widest uppercase font-bold text-slate-400 mt-0.5">
                  ENTERPRISE
                </span>
              </Link>
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              
              {/* Notification bell */}
              {user && <NotificationBell />}



              {/* Cart */}
              <Link
                to="/cart"
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-50 relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 flex items-center justify-center rounded-full text-[8px] font-bold text-white bg-rose-500">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown Toggle */}
              {user ? (
                <div className="relative" ref={mobileDropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold bg-indigo-600 ml-1 flex-shrink-0"
                  >
                    {user.firstName[0].toUpperCase()}
                  </button>
                  {showDropdown && renderUserDropdown()}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-2.5 py-1 border border-indigo-600 text-indigo-600 text-[11px] font-bold rounded-lg hover:bg-indigo-50/30 ml-1"
                >
                  Login
                </Link>
              )}

            </div>
          </div>

          {/* Row 2: Full Width Search Form */}
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50/50 focus-within:border-indigo-500/80 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100/40 transition-all duration-200">
              <Search className="absolute left-3.5 h-4 w-4 flex-shrink-0 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands..."
                className="w-full pl-10 pr-4 h-[36px] bg-transparent outline-none text-xs text-slate-800"
                style={{ caretColor: '#4f46e5' }}
              />
            </div>
          </form>
        </div>

      </div>

      {/* ── Slide-over Mobile menu / categories Drawer ── */}
      {createPortal(
        <>
          {/* Overlay */}
          <div
            className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9990] transition-opacity duration-300 ${
              isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div
            className={`fixed top-0 left-0 bottom-0 w-[300px] bg-white z-[9990] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex flex-col">
                <span className="font-black text-lg bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                  AuraCart
                </span>
                <span className="text-[8px] tracking-widest uppercase font-bold text-slate-400">
                  ENTERPRISE
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto py-4 px-4 space-y-6">
              {/* User Account Info */}
              <div className="pb-4 border-b border-slate-100">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold bg-indigo-600">
                        {user.firstName[0].toUpperCase()}
                      </div>
                      <div className="leading-tight">
                        <p className="font-bold text-slate-800 text-sm">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[180px]">{user.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Link
                        to="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-slate-50/50 hover:bg-slate-50"
                      >
                        <UserIcon size={13} /> Profile
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-slate-50/50 hover:bg-slate-50"
                      >
                        <Package size={13} /> Orders
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="col-span-2 flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-slate-50/50 hover:bg-slate-50"
                      >
                        <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> Wishlist ({wishlistItems.length})
                      </Link>
                    </div>
                    {user.role && ['SELLER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role) && (
                      <Link
                        to="/seller"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50/20 hover:bg-indigo-50/40 w-full"
                      >
                        <ShoppingBag size={13} /> Seller Hub
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        void handleLogout();
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 border border-red-100 rounded-xl text-xs font-bold text-rose-600 bg-rose-50/20 hover:bg-rose-50/40 w-full"
                    >
                      <LogOut size={13} /> Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <p className="text-xs text-slate-400 text-center font-medium">Log in for a personalized experience!</p>
                    <div className="flex gap-2">
                      <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1 text-center py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100"
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1 text-center py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Sign Up
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Categories list */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600">Shop By Category</h3>
                <div className="space-y-1">
                  {CATEGORIES.map((cat) => {
                    const isExpanded = expandedCategory === cat.name;
                    return (
                      <div key={cat.name} className="border-b border-slate-100/50 last:border-b-0 pb-1 pt-1">
                        <button
                          onClick={() => setExpandedCategory(isExpanded ? null : cat.name)}
                          className="w-full flex items-center justify-between py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 text-left transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <cat.icon size={15} className="text-slate-400" />
                            {cat.name}
                          </span>
                          <ChevronDown
                            size={14}
                            className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-indigo-600' : ''}`}
                          />
                        </button>
                        {isExpanded && (
                          <div className="pl-6 py-1.5 space-y-1.5 bg-slate-50/50 rounded-xl">
                            <Link
                              to={`/categories/${cat.slug}`}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block py-1 text-xs text-indigo-600 font-bold hover:underline"
                            >
                              View All {cat.name}
                            </Link>
                            {cat.sub.map((sub) => (
                              <button
                                key={sub}
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  navigate(`/categories/${cat.slug}?sub=${encodeURIComponent(sub)}`);
                                }}
                                className="w-full text-left py-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
                              >
                                {sub}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Links */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Quick Links</h3>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
                  <Link
                    to="/categories/travel"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60"
                  >
                    <Plane size={14} className="text-indigo-500" /> Travel
                  </Link>
                  <Link
                    to="/categories/grocery"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60"
                  >
                    <ShoppingBasket size={14} className="text-indigo-500" /> Grocery
                  </Link>
                </div>
                <Link
                  to="/seller"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center h-[36px] w-full border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 mt-2"
                >
                  Become a Seller
                </Link>
              </div>

            </div>
          </div>
        </>,
        document.body
      )}
    </header>
  );
};
