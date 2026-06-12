import React from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShieldAlert, LayoutDashboard, ArrowLeft } from 'lucide-react';
import type { RootState } from '../../store';

export const AdminLayout: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // Route security guard for admin panel
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { path: '/admin', label: 'Admin Hub', icon: LayoutDashboard, exact: true },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          {/* Admin Brand */}
          <div className="flex items-center space-x-2 pb-4 border-b dark:border-slate-800">
            <ShieldAlert className="text-indigo-600 h-6 w-6" />
            <span className="font-extrabold text-lg text-slate-800 dark:text-white">Admin Console</span>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md'
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
