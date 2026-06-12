import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X, ShoppingCart, Heart } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning' | 'cart' | 'wishlist';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  showCartToast: (productName?: string) => void;
  showWishlistToast: (productName?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-emerald-400" />,
  error: <XCircle className="h-5 w-5 text-rose-400" />,
  info: <Info className="h-5 w-5 text-blue-400" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-400" />,
  cart: <ShoppingCart className="h-5 w-5 text-indigo-400" />,
  wishlist: <Heart className="h-5 w-5 text-rose-400" />,
};

const colorMap: Record<ToastType, string> = {
  success: 'border-emerald-500/30 bg-slate-900',
  error: 'border-rose-500/30 bg-slate-900',
  info: 'border-blue-500/30 bg-slate-900',
  warning: 'border-amber-500/30 bg-slate-900',
  cart: 'border-indigo-500/30 bg-slate-900',
  wishlist: 'border-rose-500/30 bg-slate-900',
};

const barMap: Record<ToastType, string> = {
  success: 'bg-emerald-500',
  error: 'bg-rose-500',
  info: 'bg-blue-500',
  warning: 'bg-amber-500',
  cart: 'bg-indigo-500',
  wishlist: 'bg-rose-500',
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const duration = toast.duration ?? 3500;

  useEffect(() => {
    // Trigger entrance animation
    const t1 = setTimeout(() => setVisible(true), 10);
    // Start exit
    const t2 = setTimeout(() => setLeaving(true), duration - 300);
    // Remove from DOM
    const t3 = setTimeout(() => onRemove(toast.id), duration);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [toast.id, duration, onRemove]);

  return (
    <div
      className={`relative overflow-hidden flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-2xl min-w-[280px] max-w-[360px] backdrop-blur-lg transition-all duration-300 ${colorMap[toast.type]} ${
        visible && !leaving
          ? 'opacity-100 translate-x-0 scale-100'
          : 'opacity-0 translate-x-8 scale-95'
      }`}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">{iconMap[toast.type]}</div>

      {/* Message */}
      <p className="flex-1 text-sm font-medium text-slate-100 leading-relaxed">{toast.message}</p>

      {/* Close button */}
      <button
        onClick={() => { setLeaving(true); setTimeout(() => onRemove(toast.id), 300); }}
        className="flex-shrink-0 text-slate-400 hover:text-white transition-colors mt-0.5"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${barMap[toast.type]} animate-shrink`}
        style={{ animationDuration: `${duration}ms` }}
      />
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success', duration = 3500) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-4), { id, message, type, duration }]);
  }, []);

  const showCartToast = useCallback((productName?: string) => {
    showToast(
      productName ? `"${productName}" added to cart!` : 'Item added to your cart!',
      'cart',
      3000
    );
  }, [showToast]);

  const showWishlistToast = useCallback((productName?: string) => {
    showToast(
      productName ? `"${productName}" saved to wishlist!` : 'Item added to wishlist!',
      'wishlist',
      3000
    );
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showCartToast, showWishlistToast }}>
      {children}
      {/* Toast Portal */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};
