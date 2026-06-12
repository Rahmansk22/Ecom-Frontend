import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Package, AlertTriangle, TrendingUp, ChevronRight } from 'lucide-react';
import API from '../../config/api';

interface DashboardMetrics {
  totalRevenue: number;
  ordersCount: number;
  totalProducts: number;
  totalInventory: number;
  lowStockCount: number;
}

export const SellerDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await API.get<DashboardMetrics>('/seller/dashboard');
        setMetrics(res.data);
      } catch (err: any) {
        setError('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-50 border-b-50 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="p-6 text-center text-rose-500 bg-rose-50 rounded-2xl border border-rose-200">
        {error || 'No dashboard data available.'}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-8 text-white shadow-lg border border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Seller Hub</span>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Control Center</h1>
          <p className="text-sm text-slate-300 max-w-md">
            Manage your inventory, monitor earnings, and dispatch orders in real-time.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Revenue</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white">
              ₹{metrics.totalRevenue.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Orders Count</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white">{metrics.ordersCount}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <ShoppingBag className="h-6 w-6" />
          </div>
        </div>

        {/* Active Products */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Products</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white">{metrics.totalProducts}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Package className="h-6 w-6" />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Low Stock Alert</p>
            <p className={`text-2xl font-black ${metrics.lowStockCount > 0 ? 'text-amber-600' : 'text-slate-800 dark:text-white'}`}>
              {metrics.lowStockCount}
            </p>
          </div>
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
            metrics.lowStockCount > 0 
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' 
              : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500'
          }`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Actions & Analytics Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Links */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-600" />
            Quick Operations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link 
              to="products" 
              className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-indigo-600 transition-all flex justify-between items-center group"
            >
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Products Directory</p>
                <p className="text-xs text-slate-400">View or modify listings</p>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="orders" 
              className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-indigo-600 transition-all flex justify-between items-center group"
            >
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Customer Orders</p>
                <p className="text-xs text-slate-400">Monitor and update delivery</p>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Overview Inventory Card */}
        <div className="lg:col-span-1 p-6 bg-indigo-950 text-white rounded-3xl shadow-lg relative overflow-hidden border border-indigo-900">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
          <h3 className="font-bold text-base mb-4 text-indigo-300">Inventory Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-indigo-900 pb-3">
              <span className="text-slate-400 text-sm">Total Pieces</span>
              <span className="font-extrabold text-lg">{metrics.totalInventory}</span>
            </div>
            <div className="flex justify-between items-center border-b border-indigo-900 pb-3">
              <span className="text-slate-400 text-sm">Active SKU Variants</span>
              <span className="font-extrabold text-lg">{metrics.totalProducts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Low Stock Items</span>
              <span className={`font-extrabold text-lg ${metrics.lowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {metrics.lowStockCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
