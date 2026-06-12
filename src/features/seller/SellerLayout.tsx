import React, { useState } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LayoutDashboard, Package, ShoppingBag, Store, ArrowLeft, Calendar, Building, CheckCircle } from 'lucide-react';
import type { RootState } from '../../store';
import { updateUser } from '../../store/slices/authSlice';
import API from '../../config/api';
import { useDialog } from '../../components/Dialog';

export const SellerLayout: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { showAlert } = useDialog();

  // Registration Form States
  const [shopName, setShopName] = useState('');
  const [gstin, setGstin] = useState('');
  const [pincode, setPincode] = useState('');
  const [registering, setRegistering] = useState(false);
  const [success, setSuccess] = useState(false);

  // Route security guard: If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login?redirect=seller" replace />;
  }

  const handleRegisterAsSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim() || !gstin.trim() || !pincode.trim()) {
      showAlert('Please fill in all registration fields', 'warning');
      return;
    }
    setRegistering(true);
    try {
      const response = await API.post('/users/become-seller');
      dispatch(updateUser(response.data));
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate('/seller');
      }, 1500);
    } catch (err: any) {
      showAlert(err.response?.data?.message || 'Failed to register as a seller', 'error');
    } finally {
      setRegistering(false);
    }
  };

  // If customer, render onboarding page
  if (user.role === 'CUSTOMER') {
    if (success) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl max-w-md w-full space-y-6">
            <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
              <CheckCircle size={36} className="animate-bounce" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-800">Registration Successful!</h2>
            <p className="text-xs text-slate-400">Upgrading your account to SELLER and setting up your workspace dashboard...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50/50 pb-16">
        {/* Onboarding Header */}
        <div className="bg-indigo-950 text-white py-12 px-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 px-3.5 py-1 text-xs font-bold text-indigo-300">
                <Store size={14} /> Sell on AuraCart
              </div>
              <h1 className="text-2xl sm:text-3xl font-black leading-tight">Launch Your Seller Account Instantly</h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                Join over 14 Lakh+ sellers selling products to crores of active customers across India with 0% Commission and instant settlements.
              </p>
            </div>
            <Link
              to="/"
              className="flex items-center text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} className="mr-2" /> Back to Storefront
            </Link>
          </div>
        </div>

        {/* Onboarding Content */}
        <div className="max-w-5xl mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Left: Why Sell list */}
          <div className="md:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-extrabold text-sm text-slate-800 tracking-tight uppercase border-b border-slate-50 pb-3">Seller Benefits</h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 font-extrabold">%</div>
                <div>
                  <p className="font-bold text-slate-800">0% Commission</p>
                  <p className="text-slate-400 mt-0.5">Keep 100% of your product margins. No hidden fees.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0"><Calendar size={15} /></div>
                <div>
                  <p className="font-bold text-slate-800">7-Day Payments</p>
                  <p className="text-slate-400 mt-0.5">Receive settlements directly to your bank account in 7 days.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0"><Building size={15} /></div>
                <div>
                  <p className="font-bold text-slate-800">Crores of Customers</p>
                  <p className="text-slate-400 mt-0.5">Get national visibility from buyers in all pin codes of India.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Center/Right: Registration Form */}
          <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-extrabold text-slate-800">Register as a Seller</h3>
            <p className="text-xs text-slate-400 mt-1">Complete your registration to unlock the seller portal dashboard.</p>

            <form onSubmit={handleRegisterAsSeller} className="space-y-4 max-w-lg">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shop Name</label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Aura Electronics Hub"
                  className="mt-1.5 w-full rounded-xl border border-slate-200/80 p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100/40 bg-slate-50/50 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GSTIN / TAX ID</label>
                  <input
                    type="text"
                    required
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="e.g. 29AAAAA1111A1Z1"
                    className="mt-1.5 w-full rounded-xl border border-slate-200/80 p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100/40 bg-slate-50/50 focus:bg-white transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pickup Pincode</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 560001"
                    className="mt-1.5 w-full rounded-xl border border-slate-200/80 p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100/40 bg-slate-50/50 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  required
                  id="agreeSellerTerms"
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <label htmlFor="agreeSellerTerms" className="text-[10px] font-bold text-slate-500 cursor-pointer select-none leading-relaxed">
                  I agree to the AuraCart Seller Agreement and consent to setting up a seller profile linked to my email.
                </label>
              </div>

              <button
                type="submit"
                disabled={registering}
                className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white text-xs font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/10 transition-all flex items-center justify-center gap-2"
              >
                {registering ? 'Setting up shop...' : 'Start Selling Now'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { path: '/seller', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/seller/products', label: 'Products', icon: Package, exact: false },
    { path: '/seller/orders', label: 'Orders', icon: ShoppingBag, exact: false },
  ];

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          {/* Seller Brand */}
          <div className="flex items-center space-x-2 pb-4 border-b dark:border-slate-800">
            <Store className="text-indigo-600 h-6 w-6" />
            <span className="font-extrabold text-lg text-slate-800 dark:text-white">Seller Portal</span>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Back Link */}
        <div className="pt-8 border-t dark:border-slate-800 mt-8">
          <Link
            to="/"
            className="flex items-center text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={14} className="mr-2" />
            Back to AuraCart
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
