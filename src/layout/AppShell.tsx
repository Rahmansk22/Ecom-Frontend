import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import { clearCart, addToCart } from '../store/slices/cartSlice';
import { Navbar } from './Navbar';
import { CategoryNav } from './CategoryNav';
import { Footer } from './Footer';

export const AppShell: React.FC = () => {
  const { pathname } = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (pathname !== '/checkout') {
      const saved = localStorage.getItem('saved_cart_before_buynow');
      if (saved) {
        localStorage.removeItem('saved_cart_before_buynow');
        try {
          const items = JSON.parse(saved);
          const restore = async () => {
            try {
              await dispatch(clearCart()).unwrap();
              for (const item of items) {
                await dispatch(
                  addToCart({
                    variantId: item.variantId,
                    quantity: item.quantity,
                    itemDetails: item,
                  })
                ).unwrap();
              }
            } catch (e) {
              console.error('Failed to restore cart', e);
            }
          };
          void restore();
        } catch (e) {
          console.error('Failed to parse saved cart', e);
        }
      }
    }
  }, [pathname, dispatch]);

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">
      <Navbar />
      <CategoryNav />
      <main className="flex-1 relative z-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
