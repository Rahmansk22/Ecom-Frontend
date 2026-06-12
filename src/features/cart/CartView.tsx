import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import type { RootState, AppDispatch } from '../../store';
import { fetchCart, updateCartItemQuantity, removeCartItem, syncFromLocalStorage, mergeCartOnLogin } from '../../store/slices/cartSlice';

const getProductUrl = (slug: string | null | undefined, title: string) => {
  if (slug && slug !== 'null' && slug.trim() !== '') return `/products/${slug}`;
  const slugified = (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return `/products/${slugified}`;
};

export const CartView: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        try {
          await dispatch(mergeCartOnLogin()).unwrap();
        } catch {
          // Keep rendering with the best cart state available.
        }
        dispatch(fetchCart());
        return;
      }

      dispatch(syncFromLocalStorage());
    };

    void loadCart();
  }, [dispatch, user]);

  const handleQuantityChange = (variantId: string, newQty: number, stock: number) => {
    if (newQty < 1) return;
    if (newQty > stock) return;
    dispatch(updateCartItemQuantity({ variantId, quantity: newQty }));
  };

  const handleRemove = (variantId: string) => {
    dispatch(removeCartItem(variantId));
  };

  const parseAttributes = (jsonStr: string) => {
    try {
      const attrs = JSON.parse(jsonStr);
      return Object.entries(attrs).map(([key, value]) => `${key}: ${value}`).join(' | ');
    } catch {
      return '';
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const itemsSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCharge = itemsSubtotal >= 500 ? 0 : itemsSubtotal > 0 ? 40 : 0;
  const netAmount = itemsSubtotal + shippingCharge;

  const handleCheckoutRedirect = () => {
    if (!user) navigate('/login?redirect=checkout');
    else navigate('/checkout');
  };

  // ── Loading spinner ──
  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-50 border-b-50 border-blue-600 mx-auto" />
          <p className="text-sm text-slate-400">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // ── Connection / Load Error (only for logged-in users whose API call failed) ──
  if (user && error && items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#f8fafc]">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-100 shadow-xl">
          <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-slate-50 rounded-full border border-slate-100">
            <ShoppingBag size={40} className="text-slate-400" />
          </div>
          <h2 className="text-lg font-extrabold mb-2 text-slate-800">Couldn't Load Cart</h2>
          <p className="text-xs mb-6 px-4 text-slate-400 leading-relaxed">
            There was a problem connecting to the server. Your cart may still have items.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => dispatch(fetchCart())}
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
              style={{ minWidth: '120px' }}
            >
              Retry
            </button>
            <Link
              to="/"
              className="px-6 py-2.5 rounded-xl font-bold text-xs border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-all"
              style={{ minWidth: '120px' }}
            >
              Go Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Empty cart ──
  if (!loading && items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 bg-slate-50 border border-slate-100">
          <ShoppingBag size={40} className="text-slate-400" />
        </div>
        <h2 className="text-xl font-extrabold mb-2 text-slate-800">Your cart is empty!</h2>
        <p className="text-xs mb-8 text-slate-400">
          Explore our products and add items to your cart.
        </p>
        <Link
          to="/"
          className="inline-block px-10 py-3 rounded-2xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02]"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  // ── Cart with items ──
  return (
    <div className="min-h-screen pb-16 bg-[#f8fafc]">
      <div className="mx-auto max-w-5xl px-4 py-6">

        {/* Continue Shopping button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-bold mb-4 text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <ArrowLeft size={14} /> Continue Shopping
        </button>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Items list ── */}
          <div className="flex-1">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100">
                <h1 className="text-base font-extrabold text-slate-800">
                  My Cart{' '}
                  <span className="text-xs font-semibold text-slate-400 ml-1">
                    ({totalItems} item{totalItems !== 1 ? 's' : ''})
                  </span>
                </h1>
              </div>

              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex items-start gap-4 px-6 py-5 border-b border-slate-100 last:border-b-50"
                >
                  {/* Image */}
                  <Link
                    to={getProductUrl(item.productSlug, item.productTitle)}
                    className="w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden border border-slate-100 p-1 bg-white flex items-center justify-center hover:opacity-90 hover:border-slate-200 transition-all"
                  >
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productTitle} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-50">
                        <ShoppingBag size={24} className="text-slate-300" />
                      </div>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={getProductUrl(item.productSlug, item.productTitle)}
                      className="hover:text-indigo-600 transition-colors"
                    >
                      <p className="font-bold text-xs text-slate-800 leading-snug mb-1 line-clamp-2">
                        {item.productTitle}
                      </p>
                    </Link>
                    {item.attributesJson && (
                      <p className="text-[10px] text-slate-400 mb-2 font-medium">
                        {parseAttributes(item.attributesJson)}
                      </p>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-base font-extrabold text-slate-800">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-[10px] text-slate-400 font-semibold">
                          (₹{item.price.toLocaleString('en-IN')} each)
                        </span>
                      )}
                    </div>

                    {/* Qty controls */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-slate-200/80 rounded-xl overflow-hidden bg-slate-50/50">
                        <button
                          onClick={() => handleQuantityChange(item.variantId, item.quantity - 1, item.stock)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center text-indigo-600 disabled:text-slate-300 disabled:bg-transparent hover:bg-slate-100 transition-colors"
                        >
                          <Minus size={13} />
                        </button>
                        <span
                          className="w-10 h-8 flex items-center justify-center text-xs font-bold border-x border-slate-200/80 bg-white text-slate-800"
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.variantId, item.quantity + 1, item.stock)}
                          disabled={item.quantity >= item.stock}
                          className="w-8 h-8 flex items-center justify-center text-indigo-600 disabled:text-slate-300 disabled:bg-transparent hover:bg-slate-100 transition-colors"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemove(item.variantId)}
                        className="flex items-center gap-1 text-[10px] font-extrabold tracking-wider text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={13} /> REMOVE
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Delivery note */}
              <div className="px-6 py-3 text-right bg-emerald-50/20 border-t border-emerald-100/30">
                <span className="text-xs font-bold text-emerald-600">
                  ✓ {shippingCharge === 0 ? 'Free delivery on this order' : `₹${shippingCharge} delivery charge`}
                </span>
              </div>
            </div>
          </div>

          {/* ── Price summary ── */}
          <div className="lg:w-80">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden sticky top-20">
              <div
                className="px-6 py-4 border-b border-slate-100 text-[10px] font-extrabold tracking-widest uppercase text-slate-400"
              >
                Price Details
              </div>
              <div className="px-6 py-4 space-y-3.5">
                <div className="flex justify-between text-xs font-semibold text-slate-500">
                  <span>Price ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
                  <span className="text-slate-800">₹{itemsSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-slate-500">
                  <span>Delivery Charges</span>
                  <span className={shippingCharge === 0 ? 'text-emerald-600 font-bold' : 'text-slate-800'}>
                    {shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}
                  </span>
                </div>
                <hr className="border-slate-100" />
                <div
                  className="flex justify-between text-sm font-extrabold text-slate-800 pt-1.5"
                >
                  <span>Total Amount</span>
                  <span className="text-indigo-600 text-base">₹{netAmount.toLocaleString('en-IN')}</span>
                </div>
                {shippingCharge === 0 && itemsSubtotal > 0 && (
                  <p className="text-[10px] font-bold text-emerald-600 text-right mt-1 bg-emerald-50 border border-emerald-100 rounded-lg py-1 px-2.5">
                    🎉 You saved ₹40 on delivery!
                  </p>
                )}
              </div>
              <div className="px-6 pb-6">
                <button
                  onClick={handleCheckoutRedirect}
                  className="w-full py-3.5 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/10"
                >
                  Place Order <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
