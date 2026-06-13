import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, ShieldCheck, MapPin, Plus, Check, Lock, QrCode, X, ArrowLeft, ShoppingCart } from 'lucide-react';
import type { RootState, AppDispatch } from '../../store';
import { checkoutOrder } from '../../store/slices/orderSlice';
import { clearCart } from '../../store/slices/cartSlice';
import type { PaymentMethod } from '../../types/order';
import type { Address } from '../../types/auth';
import API from '../../config/api';
import { useDialog } from '../../components/Dialog';

export const CheckoutView: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { showAlert } = useDialog();

  const { items } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);

  // States
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [loading, setLoading] = useState<boolean>(false);
  const [placingOrder, setPlacingOrder] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Payment Simulation States
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentProcessing, setPaymentProcessing] = useState<boolean>(false);
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [cardHolder, setCardHolder] = useState<string>('');

  // Add address form state
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [label, setLabel] = useState<string>('Home');
  const [addressLine1, setAddressLine1] = useState<string>('');
  const [addressLine2, setAddressLine2] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [stateName, setStateName] = useState<string>('');
  const [country, setCountry] = useState<string>('India');
  const [pincode, setPincode] = useState<string>('');

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=checkout');
      return;
    }
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
    loadAddresses();
  }, [user, items, navigate]);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const res = await API.get<Address[]>('/users/addresses');
      setAddresses(res.data);
      if (res.data.length > 0) {
        const defaultAddr = res.data.find((a) => a.isDefault);
        setSelectedAddressId(defaultAddr ? defaultAddr.id : res.data[0].id);
      }
    } catch (err: any) {
      setError('Failed to load shipping addresses.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressLine1 || !city || !stateName || !pincode) {
      showAlert('Please fill in all mandatory fields', 'warning');
      return;
    }

    try {
      const res = await API.post<Address>('/users/addresses', {
        label,
        addressLine1,
        addressLine2,
        city,
        state: stateName,
        country,
        pincode,
        isDefault: addresses.length === 0,
      });

      setAddresses((prev) => [...prev, res.data]);
      setSelectedAddressId(res.data.id);
      setShowAddForm(false);
      // Reset form
      setAddressLine1('');
      setAddressLine2('');
      setCity('');
      setStateName('');
      setPincode('');
    } catch (err: any) {
      showAlert(err.response?.data?.message || 'Failed to add address', 'error');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      showAlert('Please select or add a delivery address', 'warning');
      return;
    }

    if (paymentMethod === 'COD') {
      executeCheckout(undefined);
    } else {
      setShowPaymentModal(true);
    }
  };

  const executeCheckout = async (txnId?: string) => {
    setPlacingOrder(true);
    setError(null);

    try {
      const result = await dispatch(
        checkoutOrder({
          addressId: selectedAddressId,
          paymentMethod,
          transactionId: txnId,
        })
      ).unwrap();

      dispatch(clearCart());
      navigate(`/orders/${result.id}?status=success`);
    } catch (err: any) {
      setError(err || 'Failed to place order. Please check item stock.');
    } finally {
      setPlacingOrder(false);
      setShowPaymentModal(false);
      setPaymentProcessing(false);
    }
  };

  const handleSimulatedPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'CREDIT_CARD' && (!cardNumber || !cardExpiry || !cardCvv || !cardHolder)) {
      showAlert('Please fill in all credit card details', 'warning');
      return;
    }

    setPaymentProcessing(true);
    // Simulate contact with secure bank gateway
    setTimeout(() => {
      const mockTxnId = paymentMethod === 'CREDIT_CARD' 
        ? 'ch_stripe_mock_' + Math.random().toString(36).substring(2, 11)
        : 'pay_rzp_mock_' + Math.random().toString(36).substring(2, 11);
      executeCheckout(mockTxnId);
    }, 2000);
  };

  const itemsSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCharge = itemsSubtotal >= 500 ? 0 : 40;
  const totalAmount = itemsSubtotal + shippingCharge;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-50 border-b-50 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Back button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors group"
        >
          <span className="flex items-center justify-center h-9 w-9 rounded-full border border-slate-200 bg-white shadow-sm group-hover:border-indigo-400 group-hover:shadow-md transition-all">
            <ArrowLeft className="h-4 w-4" />
          </span>
          Back
        </button>
      </div>

      <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-8">Secure Checkout</h1>

      {error && (
        <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          {/* Address Step */}
          <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center">
                <MapPin className="mr-2.5 h-5 w-5 text-indigo-600" />
                1. Shipping Address
              </h2>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <Plus size={14} className="mr-1" /> Add Address
                </button>
              )}
            </div>

            {showAddForm ? (
              <form onSubmit={handleAddAddress} className="space-y-4 border-t border-slate-100 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">LABEL (e.g. Home, Office)</label>
                    <input
                      type="text"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100/40"
                      placeholder="e.g. Home"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">PINCODE</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100/40"
                      placeholder="6 digit pincode"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">ADDRESS LINE 1</label>
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100/40"
                    placeholder="House No, Flat, Building, Street address"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">ADDRESS LINE 2 (Optional)</label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100/40"
                    placeholder="Area, Locality, Landmark"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">CITY</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100/40"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">STATE</label>
                    <input
                      type="text"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100/40"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">COUNTRY</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100/40"
                      placeholder="Country"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-100 transition-all hover:scale-[1.02]"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {addresses.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    No shipping addresses found. Please add an address to proceed.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`cursor-pointer p-4 rounded-2xl border transition-all duration-300 relative ${
                          selectedAddressId === addr.id
                            ? 'border-indigo-600 bg-indigo-50/5 shadow-md shadow-indigo-100/20'
                            : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2.5">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            selectedAddressId === addr.id ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {addr.label}
                          </span>
                          {selectedAddressId === addr.id && (
                            <span className="text-indigo-600">
                              <Check size={16} />
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-800">
                          {addr.addressLine1}
                        </p>
                        {addr.addressLine2 && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {addr.addressLine2}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-1 font-semibold">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {addr.country}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment Step */}
          <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
            <h2 className="text-lg font-extrabold text-slate-800 flex items-center mb-6">
              <CreditCard className="mr-2.5 h-5 w-5 text-indigo-600" />
              2. Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {([
                { id: 'COD', label: 'Cash on Delivery', sub: 'Pay on receipt at door' },
                { id: 'CREDIT_CARD', label: 'Credit Card', sub: 'Simulated Stripe Gateway' },
                { id: 'UPI', label: 'UPI / Scan QR', sub: 'Simulated Razorpay Code' },
              ] as const).map((method) => (
                <div
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                    paymentMethod === method.id
                      ? 'border-indigo-600 bg-indigo-50/5 shadow-md shadow-indigo-100/20'
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-800">{method.label}</div>
                  <div className="text-[10px] text-slate-400 mt-1.5 leading-snug">{method.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order review & final calculations */}
        <div className="lg:col-span-1 space-y-6">
          {/* Items Preview */}
          <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
            <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider mb-4">Cart Items ({items.length})</h3>
            <div className="space-y-4.5 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
              {items.map((item) => (
                <div key={item.variantId} className="flex items-center space-x-3 text-xs">
                  <div className="w-11 h-11 bg-slate-50 border border-slate-100 rounded-lg p-1.5 flex items-center justify-center shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productTitle} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                    ) : (
                      <ShoppingCart className="h-4 w-4 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate leading-snug">{item.productTitle}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <div className="font-bold text-slate-800">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing detail and payment button */}
          <div className="p-6 bg-slate-900 text-white rounded-3xl shadow-xl relative overflow-hidden border border-slate-950">
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-indigo-400/10 rounded-full blur-3xl" />

            <h3 className="text-base font-extrabold mb-4 tracking-tight">Price Summary</h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal</span>
                <span>₹{itemsSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery Charge</span>
                <span>{shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}</span>
              </div>
              <hr className="border-slate-800" />
              <div className="flex justify-between items-center text-sm font-bold">
                <span>Order Total</span>
                <span className="text-lg text-indigo-300">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder}
              className="w-full mt-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/15 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              {placingOrder ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white"></div>
                  <span>Placing Order...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Place Your Order</span>
                </>
              )}
            </button>
            
            <div className="flex items-center justify-center space-x-1.5 mt-4 text-[9px] text-slate-500">
              <Truck size={10} className="text-indigo-400" />
              <span>Safe Delivery Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Gateway Simulation Modal */}
      {showPaymentModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 relative overflow-hidden transition-all duration-300 scale-100">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <Lock size={15} className="text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Secure Checkout</span>
              </div>
              {!paymentProcessing && (
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="p-1 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {paymentProcessing ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-50 border-b-50 border-indigo-600 mb-6"></div>
                <h3 className="text-base font-extrabold text-slate-800 mb-1.5">Processing Payment</h3>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  {paymentMethod === 'CREDIT_CARD' 
                    ? 'Connecting to secure Stripe nodes. Please do not close this window...' 
                    : 'Confirming UPI request callback and signatures...'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSimulatedPaymentSubmit} className="space-y-4">
                {paymentMethod === 'CREDIT_CARD' ? (
                  <>
                    <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-100 mb-4">
                      <CreditCard className="text-indigo-600" size={18} />
                      <h3 className="font-extrabold text-slate-800 text-sm">Stripe Payment Simulation</h3>
                    </div>

                    {/* Virtual Interactive Card Display */}
                    <div className="relative w-full aspect-[1.58/1] rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white p-5 shadow-xl flex flex-col justify-between overflow-hidden mb-6 border border-indigo-900/50">
                      <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl" />
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold tracking-widest text-indigo-300 uppercase">Stripe Sandbox Card</span>
                        <CreditCard size={22} className="text-indigo-300" />
                      </div>
                      
                      {/* Chip representation */}
                      <div className="w-9 h-7 bg-amber-400/25 border border-amber-300/20 rounded-md mt-2 flex items-center justify-center">
                        <div className="w-5 h-4 bg-amber-400/35 rounded" />
                      </div>

                      {/* Card number display */}
                      <p className="text-base font-mono tracking-widest text-indigo-100 mt-4">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </p>

                      <div className="flex justify-between items-end mt-2">
                        <div>
                          <p className="text-[8px] uppercase tracking-wider text-indigo-400 font-bold">Card Holder</p>
                          <p className="text-xs font-bold text-indigo-50 leading-none truncate max-w-[180px]">
                            {cardHolder.toUpperCase() || 'YOUR NAME'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] uppercase tracking-wider text-indigo-400 font-bold">Expires</p>
                          <p className="text-xs font-mono font-bold text-indigo-50 leading-none">
                            {cardExpiry || 'MM/YY'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-wider">CARDHOLDER NAME</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        required
                        placeholder="John Doe"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 text-slate-800 rounded-xl text-xs outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100/40"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-wider">CARD NUMBER</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim().substring(0, 19))}
                        required
                        placeholder="4242 4242 4242 4242"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 text-slate-800 rounded-xl text-xs outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100/40 tracking-wider font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-wider">EXPIRY DATE</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value.replace(/\D/g, '').replace(/(\d{2})/, '$1/').substring(0, 5))}
                          required
                          placeholder="MM/YY"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 text-slate-800 rounded-xl text-xs outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100/40 text-center font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-wider">CVV / CVC</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                          required
                          placeholder="•••"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 text-slate-800 rounded-xl text-xs outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100/40 text-center font-mono"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-100 mb-4">
                      <QrCode className="text-indigo-600" size={18} />
                      <h3 className="font-extrabold text-slate-800 text-sm">Razorpay UPI Simulation</h3>
                    </div>

                    <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-2xl p-4 border border-slate-100/50">
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/60 shadow-sm mb-3.5">
                        <div className="w-32 h-32 bg-slate-100 flex items-center justify-center relative overflow-hidden rounded-lg">
                          <div className="absolute inset-0 bg-[radial-gradient(#334155_20%,transparent_20%)] [background-size:6px_6px] opacity-75"></div>
                          <QrCode size={42} className="text-slate-800 z-10" />
                        </div>
                      </div>
                      <p className="text-xs font-extrabold text-slate-700">Scan QR Code to Pay</p>
                      <p className="text-[10px] text-slate-400 mt-1">Total Amount: ₹{totalAmount.toLocaleString('en-IN')}</p>
                    </div>

                    <div className="text-center text-[9px] text-slate-400 leading-snug">
                      Razorpay will trigger webhook payment listener to automatically clear checkout sequence when scan completes.
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full mt-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/15 transition-all flex items-center justify-center space-x-2"
                >
                  <ShieldCheck size={16} />
                  <span>Pay ₹{totalAmount.toLocaleString('en-IN')}</span>
                </button>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
