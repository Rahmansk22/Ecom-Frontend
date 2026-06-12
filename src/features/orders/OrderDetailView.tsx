import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, CreditCard, ShieldCheck, XCircle } from 'lucide-react';
import type { RootState, AppDispatch } from '../../store';
import { fetchOrderDetails, cancelOrder } from '../../store/slices/orderSlice';
import { useDialog } from '../../components/Dialog';

export const OrderDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useDialog();

  const { currentOrder, loading, error } = useSelector((state: RootState) => state.order);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const isSuccess = searchParams.get('status') === 'success';

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (id) {
      dispatch(fetchOrderDetails(id));
    }
  }, [dispatch, id, user, navigate]);

  const handleCancelOrder = async () => {
    if (!id) return;
    const confirmed = await showConfirm('Are you sure you want to cancel this order?');
    if (confirmed) {
      try {
        await dispatch(cancelOrder(id)).unwrap();
        showAlert('Order cancelled successfully.', 'success');
      } catch (err: any) {
        showAlert(err || 'Failed to cancel order.', 'error');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !currentOrder) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-50 border-b-50 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !currentOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-rose-50 text-rose-500 mb-6">
          <XCircle size={48} />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Order Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
          We couldn't retrieve the details for order {id}.
        </p>
        <Link
          to="/orders"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all duration-300"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  // Stepper helper
  const steps = ['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const currentStepIndex = steps.indexOf(currentOrder.status);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Success Notification */}
      {isSuccess && (
        <div className="mb-8 p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-3xl shadow-lg flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-2xl">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Order Placed Successfully!</h2>
            <p className="text-sm text-emerald-100">
              Thank you for your purchase. We are processing your order.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link
          to="/orders"
          className="flex items-center text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to My Orders
        </Link>
        {(currentOrder.status === 'PLACED' || currentOrder.status === 'PROCESSING') && (
          <button
            onClick={handleCancelOrder}
            className="flex items-center text-sm font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-4 py-2 rounded-xl border border-rose-100 dark:border-rose-900/50 transition-colors"
          >
            Cancel Order
          </button>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-mono font-bold text-slate-900 dark:text-white">
          Order ID: {currentOrder.id}
        </h2>
        <div className="flex items-center text-xs text-slate-400 mt-1.5">
          <Calendar size={14} className="mr-1" />
          <span>Placed on {formatDate(currentOrder.createdAt)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Tracker / Stepper */}
          {currentOrder.status !== 'CANCELLED' ? (
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-6">Delivery Tracker</h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative">
                {/* Horizontal line for stepper */}
                <div className="hidden sm:block absolute left-4 right-4 top-1/2 h-0.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 -z-10"></div>
                {steps.map((step, idx) => (
                  <div key={step} className="flex sm:flex-col items-center gap-3 sm:gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-colors duration-300 ${
                        idx <= currentStepIndex
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx < currentStepIndex ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        idx <= currentStepIndex
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-3xl flex items-center space-x-3 text-rose-700 dark:text-rose-400">
              <XCircle size={24} />
              <div className="font-bold">This order has been cancelled and refunded if payment was completed.</div>
            </div>
          )}

          {/* Ordered items list */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Items in Order</h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentOrder.items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.imageUrl || 'https://via.placeholder.com/150'}
                      alt={item.productTitle}
                      className="w-16 h-16 object-contain bg-slate-50 border rounded-xl p-1"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                        {item.productTitle}
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">SKU: {item.sku}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white">
                      ₹{item.priceAtPurchase.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shipping details and calculations */}
        <div className="space-y-6">
          {/* Shipping details */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center">
              <MapPin size={18} className="mr-2 text-indigo-600" /> Shipping Info
            </h3>
            <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">{currentOrder.shippingName}</p>
              <p>{currentOrder.shippingAddressLine1}</p>
              {currentOrder.shippingAddressLine2 && <p>{currentOrder.shippingAddressLine2}</p>}
              <p>
                {currentOrder.shippingCity}, {currentOrder.shippingState} - {currentOrder.shippingPincode}
              </p>
              <p className="text-xs text-slate-400 mt-2">Country: {currentOrder.shippingCountry}</p>
              {currentOrder.shippingPhone && (
                <p className="text-xs text-slate-400">Phone: {currentOrder.shippingPhone}</p>
              )}
            </div>
          </div>

          {/* Payment info */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center">
              <CreditCard size={18} className="mr-2 text-indigo-600" /> Payment Info
            </h3>
            <div className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="font-bold text-slate-950 dark:text-white">
                  {currentOrder.paymentMethod.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-bold text-slate-950 dark:text-white">
                  {currentOrder.paymentStatus}
                </span>
              </div>
              {currentOrder.transactionId && (
                <div className="border-t border-slate-100 dark:border-slate-800 pt-2 text-[10px] text-slate-400 break-all">
                  <span>Txn ID: {currentOrder.transactionId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order pricing breakdown */}
          <div className="p-6 bg-slate-900 text-white rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl"></div>

            <h3 className="font-bold mb-4 text-base">Bill Summary</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>₹{currentOrder.totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery Charge</span>
                <span>{currentOrder.shippingCharge === 0 ? 'FREE' : `₹${currentOrder.shippingCharge}`}</span>
              </div>
              <hr className="border-slate-800" />
              <div className="flex justify-between items-center text-base font-bold">
                <span>Net Amount Paid</span>
                <span className="text-xl text-indigo-300">
                  ₹{currentOrder.netAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
