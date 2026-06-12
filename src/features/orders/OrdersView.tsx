import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ArrowRight, Calendar, CreditCard, ShoppingBag } from 'lucide-react';
import type { RootState, AppDispatch } from '../../store';
import { fetchOrders } from '../../store/slices/orderSlice';

export const OrdersView: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { orders, loading } = useSelector((state: RootState) => state.order);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=orders');
    } else {
      dispatch(fetchOrders());
    }
  }, [dispatch, user, navigate]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PLACED':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50';
      case 'PROCESSING':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50';
      case 'SHIPPED':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50';
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-950/20 dark:text-slate-400 border border-slate-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-50 border-b-50 border-indigo-600"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-6">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">No Orders Placed Yet</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
          You haven't placed any orders yet. Start shopping to fill your order list.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-8">Your Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Order ID</span>
                <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                  {order.id}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusBadgeClass(order.status)}`}>
                  {order.status}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {order.paymentStatus === 'COMPLETED' ? 'PAID' : order.paymentStatus}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Order Meta details */}
              <div className="space-y-3">
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                  <Calendar size={16} className="mr-2 text-slate-400" />
                  <span>Placed: {formatDate(order.createdAt)}</span>
                </div>
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                  <CreditCard size={16} className="mr-2 text-slate-400" />
                  <span>Payment: {order.paymentMethod.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                  <Package size={16} className="mr-2 text-slate-400" />
                  <span>Total Items: {order.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
              </div>

              {/* Order Items previews */}
              <div className="md:col-span-1 flex items-center gap-2 overflow-x-auto pb-2">
                {order.items.slice(0, 3).map((item) => (
                  <img
                    key={item.id}
                    src={item.imageUrl || 'https://via.placeholder.com/150'}
                    alt={item.productTitle}
                    className="w-16 h-16 object-contain bg-slate-50 border rounded-xl p-1"
                    title={item.productTitle}
                  />
                ))}
                {order.items.length > 3 && (
                  <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold text-sm">
                    +{order.items.length - 3}
                  </div>
                )}
              </div>

              {/* Total Price and Actions */}
              <div className="flex flex-col justify-between items-start md:items-end gap-4">
                <div className="space-y-0.5 md:text-right">
                  <span className="text-xs text-slate-400 font-semibold">Total Amount</span>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    ₹{order.netAmount.toLocaleString('en-IN')}
                  </p>
                </div>

                <Link
                  to={`/orders/${order.id}`}
                  className="flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  View Details
                  <ArrowRight size={16} className="ml-1.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
