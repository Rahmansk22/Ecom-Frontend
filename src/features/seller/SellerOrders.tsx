import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Calendar, User, CreditCard, Box } from 'lucide-react';
import API from '../../config/api';
import type { OrderResponse } from '../../types/order';

export const SellerOrders: React.FC = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get<OrderResponse[]>('/seller/orders');
      setOrders(res.data);
    } catch (err: any) {
      setError('Failed to fetch seller orders list');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-50 border-b-50 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/seller" className="flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-700 mb-1.5">
          <ArrowLeft size={14} className="mr-1" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <ShoppingBag className="text-indigo-600" />
          Customer Orders
        </h1>
        <p className="text-sm text-slate-500">Monitor and fulfill orders placed by customers for your product variants.</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400 rounded-2xl">
          {error}
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl text-slate-500">
            No customer orders placed yet.
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-6"
            >
              {/* Order Meta Info */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b dark:border-slate-800">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">ORDER ID</p>
                  <p className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-300">{order.id}</p>
                </div>
                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center text-slate-500 gap-1">
                    <Calendar size={14} />
                    <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                  </div>
                  <div className="flex items-center text-slate-500 gap-1">
                    <User size={14} />
                    <span>{order.shippingName}</span>
                  </div>
                  <div className="flex items-center text-slate-500 gap-1">
                    <CreditCard size={14} />
                    <span className="uppercase">{order.paymentMethod}</span>
                  </div>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === 'DELIVERED'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-500'
                      : order.status === 'CANCELLED'
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                      : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items Bought from this Seller */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Box size={14} className="text-slate-400" />
                  Package Items
                </h3>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 text-sm">
                      <div className="flex items-center space-x-3">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productTitle}
                            className="w-12 h-12 object-contain bg-slate-50 rounded p-1 border"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded p-1 border flex items-center justify-center">
                            <Box className="text-slate-400" size={20} />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{item.productTitle}</p>
                          <p className="text-xs text-slate-400">SKU: {item.sku} • Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 dark:text-white">
                          ₹{(item.priceAtPurchase * item.quantity).toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] text-slate-400">₹{item.priceAtPurchase.toLocaleString('en-IN')} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address Summary */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-200">Shipping Address Preserved Details:</p>
                <p>{order.shippingAddressLine1}{order.shippingAddressLine2 ? `, ${order.shippingAddressLine2}` : ''}</p>
                <p>{order.shippingCity}, {order.shippingState} - {order.shippingPincode}</p>
                <p>Phone: {order.shippingPhone}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
