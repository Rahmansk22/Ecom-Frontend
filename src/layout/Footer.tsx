import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-500 mt-auto border-t border-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 text-xs">
          <div>
            <h3 className="font-bold text-slate-350 uppercase tracking-wider">AuraCart</h3>
            <ul className="mt-2.5 space-y-1.5">
              <li><a href="#" className="hover:text-slate-300 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-slate-300 transition-colors">Careers</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-350 uppercase tracking-wider">Sell</h3>
            <ul className="mt-2.5 space-y-1.5">
              <li><a href="#" className="hover:text-slate-350 transition-colors">Seller Hub</a></li>
              <li><a href="#" className="hover:text-slate-350 transition-colors">Become Partner</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-350 uppercase tracking-wider">Connect</h3>
            <ul className="mt-2.5 space-y-1.5">
              <li><a href="#" className="hover:text-slate-300 transition-colors">Facebook</a></li>
              <li><a href="#" className="hover:text-slate-300 transition-colors">Instagram</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-350 uppercase tracking-wider">Help</h3>
            <ul className="mt-2.5 space-y-1.5">
              <li><a href="#" className="hover:text-slate-300 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-slate-300 transition-colors">Returns</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-900 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-slate-300">
              AuraCart
            </span>
            <span className="text-slate-600">| Enterprise E-Commerce Platform</span>
          </div>
          <p className="text-slate-600">
            &copy; {new Date().getFullYear()} AuraCart Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
