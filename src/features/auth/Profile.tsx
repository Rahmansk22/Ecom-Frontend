import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { updateUser } from '../../store/slices/authSlice';
import { fetchOrders } from '../../store/slices/orderSlice';
import API from '../../config/api';
import { Link } from 'react-router-dom';
import { 
  User as UserIcon, 
  MapPin, 
  Lock, 
  History, 
  Plus, 
  Trash2, 
  Check, 
  CheckCircle2, 
  AlertCircle,
  Package,
  Calendar,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import type { Address } from '../../types/auth';
import { useDialog } from '../../components/Dialog';

export const Profile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const { showAlert, showConfirm } = useDialog();

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'addresses' | 'security' | 'activity' | 'orders'>('profile');

  // Profile fields
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Address fields
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressIdToEdit, setAddressIdToEdit] = useState<string | null>(null);
  const [addressLabel, setAddressLabel] = useState('Home');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [pincode, setPincode] = useState('');
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);

  // Activity logs fields
  const [logs, setLogs] = useState<any[]>([]);
  const [logsPage, setLogsPage] = useState(0);

  // Redux orders
  const { orders, loading: ordersLoading } = useSelector((state: RootState) => state.order);

  // Load addresses, activity logs, or orders depending on active sub-tab
  useEffect(() => {
    if (activeSubTab === 'addresses') {
      void fetchAddresses();
    } else if (activeSubTab === 'activity') {
      void fetchLogs();
    } else if (activeSubTab === 'orders') {
      void dispatch(fetchOrders());
    }
  }, [activeSubTab, logsPage, dispatch]);

  const fetchAddresses = async () => {
    try {
      const response = await API.get('/users/addresses');
      setAddresses(response.data);
    } catch (err) {
      console.error('Error fetching addresses', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await API.get(`/users/activities?page=${logsPage}&size=8`);
      setLogs(response.data);
    } catch (err) {
      console.error('Error fetching logs', err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    try {
      const response = await API.put('/users/profile', {
        firstName,
        lastName,
        mobile,
      });
      dispatch(updateUser(response.data));
      setProfileMessage('Profile updated successfully!');
    } catch (err: any) {
      setProfileMessage(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    try {
      await API.post('/users/change-password', {
        oldPassword,
        newPassword,
      });
      setPasswordMessage('Password changed successfully! Other sessions revoked.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Password update failed');
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        label: addressLabel,
        addressLine1,
        addressLine2,
        city,
        state,
        country,
        pincode,
        isDefault: isDefaultAddress
      };

      if (addressIdToEdit) {
        await API.put(`/users/addresses/${addressIdToEdit}`, payload);
      } else {
        await API.post('/users/addresses', payload);
      }

      // Reset address form
      setShowAddressForm(false);
      setAddressIdToEdit(null);
      setAddressLine1('');
      setAddressLine2('');
      setCity('');
      setState('');
      setPincode('');
      setIsDefaultAddress(false);
      void fetchAddresses();
    } catch (err: any) {
      showAlert(err.response?.data?.message || 'Failed to save address', 'error');
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await API.patch(`/users/addresses/${id}/default`);
      void fetchAddresses();
    } catch (err) {
      console.error('Error setting default address', err);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    const confirmed = await showConfirm('Delete this address?');
    if (!confirmed) return;
    try {
      await API.delete(`/users/addresses/${id}`);
      void fetchAddresses();
    } catch (err) {
      console.error('Error deleting address', err);
    }
  };

  if (!user) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-slate-400" />
        <p className="text-slate-600 font-semibold">Please sign in to view your profile settings.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">Account Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Manage security settings, address books, and profile identifiers.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3.5 py-1 text-xs font-bold text-slate-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Active Role: {user.role}</span>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
        
        {/* Sidebar Nav */}
        <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 border-b lg:border-b-50 border-slate-200 pb-4 lg:pb-0">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all whitespace-nowrap lg:w-full ${
              activeSubTab === 'profile' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100/50' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserIcon className="h-4 w-4" />
            Profile Information
          </button>

          <button
            onClick={() => setActiveSubTab('orders')}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all whitespace-nowrap lg:w-full ${
              activeSubTab === 'orders' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100/50' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Package className="h-4 w-4" />
            My Orders
          </button>

          <button
            onClick={() => setActiveSubTab('addresses')}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all whitespace-nowrap lg:w-full ${
              activeSubTab === 'addresses' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100/50' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MapPin className="h-4 w-4" />
            Address Book
          </button>

          <button
            onClick={() => setActiveSubTab('security')}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all whitespace-nowrap lg:w-full ${
              activeSubTab === 'security' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100/50' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Lock className="h-4 w-4" />
            Security & Login
          </button>

          <button
            onClick={() => setActiveSubTab('activity')}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all whitespace-nowrap lg:w-full ${
              activeSubTab === 'activity' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100/50' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="h-4 w-4" />
            Activity & Audits
          </button>
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-3 rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          
          {activeSubTab === 'profile' && (
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">Profile Information</h2>
              <p className="text-xs text-slate-400 mt-1">Configure your personal contact fields and details.</p>

              {/* Profile Avatar Card */}
              <div className="mt-6 p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-slate-100 dark:border-slate-800/80 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl text-white bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-md flex-shrink-0">
                  {user.firstName[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white leading-tight">{user.firstName} {user.lastName || ''}</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{user.email}</p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-900/50">
                    {user.role} Account
                  </span>
                </div>
              </div>

              {profileMessage && (
                <div className="mt-4 rounded-xl bg-indigo-50/50 border border-indigo-100/35 p-3.5 text-xs font-semibold text-indigo-700">
                  {profileMessage}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4 max-w-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200/80 p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100/40 transition-all duration-200 bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200/80 p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100/40 transition-all duration-200 bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address (Read-only)</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="mt-1.5 w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-400 select-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile Number</label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+919876543210"
                    className="mt-1.5 w-full rounded-xl border border-slate-200/80 p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100/40 transition-all duration-200 bg-slate-50/50 focus:bg-white"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="submit"
                    className="rounded-2xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all duration-200"
                  >
                    Save Changes
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      const confirmed = await showConfirm('Are you sure you want to deactivate your account?');
                      if (confirmed) {
                        await API.post('/users/deactivate', {});
                        showAlert('Account deactivated. Signing out...', 'success');
                        setTimeout(() => window.location.reload(), 1500);
                      }
                    }}
                    className="rounded-2xl border border-rose-200 text-rose-600 px-4 py-2.5 text-xs font-bold hover:bg-rose-50/30 transition-all duration-200"
                  >
                    Deactivate Account
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSubTab === 'orders' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">My Orders</h2>
                <p className="text-xs text-slate-400 mt-1">Track active shipments, order history, and invoices.</p>
              </div>

              {ordersLoading && orders.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-50 border-b-50 border-indigo-600"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 rounded-3xl p-6 bg-slate-50/50">
                  <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs font-bold text-slate-700">No Orders Placed Yet</p>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto">Start exploring our catalog and place your first order!</p>
                  <Link
                    to="/"
                    className="inline-block mt-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 text-xs shadow-md"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-slate-100 rounded-2xl overflow-hidden bg-white hover:shadow-md transition-shadow duration-200"
                    >
                      {/* Top banner */}
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="leading-tight">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Order ID</span>
                          <p className="font-mono text-xs font-bold text-slate-700">{order.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700' :
                            order.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700' :
                            'bg-indigo-50 text-indigo-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                        <div className="space-y-1.5 text-xs text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-slate-400" />
                            <span>Date: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CreditCard size={13} className="text-slate-400" />
                            <span>Payment: {order.paymentMethod.replace('_', ' ')}</span>
                          </div>
                        </div>

                        {/* Image previews */}
                        <div className="flex gap-2 overflow-x-auto py-1">
                          {order.items.slice(0, 3).map((item) => (
                            <img
                              key={item.id}
                              src={item.imageUrl || ''}
                              alt={item.productTitle}
                              className="w-11 h-11 object-contain bg-slate-50 border border-slate-100 rounded-lg p-1"
                              title={item.productTitle}
                            />
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-11 h-11 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-[10px]">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>

                        {/* Total price and details button */}
                        <div className="flex justify-between sm:justify-end items-center sm:text-right gap-4">
                          <div className="sm:mr-4">
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Total</span>
                            <p className="text-sm font-black text-slate-800">₹{order.netAmount.toLocaleString('en-IN')}</p>
                          </div>
                          <Link
                            to={`/orders/${order.id}`}
                            className="flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-700"
                          >
                            Details
                            <ArrowRight size={13} className="ml-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'addresses' && (
            <div>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800">Address Book</h2>
                  <p className="text-xs text-slate-400 mt-1">Manage multiple delivery addresses for smooth checkouts.</p>
                </div>
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm transition-all"
                  >
                    <Plus className="h-4 w-4" /> Add New
                  </button>
                )}
              </div>

              {showAddressForm ? (
                /* Address creation form */
                <form onSubmit={handleAddressSubmit} className="mt-6 space-y-4 max-w-lg border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address Label</label>
                      <select 
                        value={addressLabel}
                        onChange={(e) => setAddressLabel(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100/40 transition-all duration-200"
                      >
                        <option value="Home">Home</option>
                        <option value="Work">Work/Office</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pincode</label>
                      <input
                        type="text"
                        required
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="e.g. 560001"
                        className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100/40 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address Line 1</label>
                    <input
                      type="text"
                      required
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="Flat, House no., Building, Company"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100/40 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address Line 2</label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="Area, Colony, Street, Sector"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100/40 transition-all duration-200"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">City</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100/40 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">State</label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="State"
                        className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100/40 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Country</label>
                      <input
                        type="text"
                        required
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100/40 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDefaultAddress"
                      checked={isDefaultAddress}
                      onChange={(e) => setIsDefaultAddress(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="isDefaultAddress" className="text-xs font-semibold text-slate-600 cursor-pointer">
                      Make this my default shipping address
                    </label>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition-all"
                    >
                      {addressIdToEdit ? 'Update Address' : 'Save Address'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false);
                        setAddressIdToEdit(null);
                      }}
                      className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 bg-white"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* Address items grid */
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.length === 0 ? (
                    <p className="text-xs text-slate-400 col-span-2">No addresses added yet.</p>
                  ) : (
                    addresses.map((addr) => (
                      <div 
                        key={addr.id}
                        className={`relative rounded-2xl border p-4 transition ${
                          addr.isDefault 
                            ? 'border-indigo-500 bg-indigo-50/5' 
                            : 'border-slate-200/60 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                            {addr.label}
                          </span>
                          {addr.isDefault && (
                            <span className="flex items-center gap-0.5 text-[10px] font-bold text-indigo-600">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Default
                            </span>
                          )}
                        </div>

                        <p className="mt-3 text-xs font-bold text-slate-800">{addr.addressLine1}</p>
                        {addr.addressLine2 && <p className="text-xs text-slate-400 mt-0.5">{addr.addressLine2}</p>}
                        <p className="text-xs text-slate-500 mt-1 font-semibold">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{addr.country}</p>

                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                          {!addr.isDefault ? (
                            <button
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="text-xs font-bold text-indigo-600 hover:underline"
                            >
                              Set as default
                            </button>
                          ) : (
                            <span />
                          )}

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                setAddressIdToEdit(addr.id);
                                setAddressLabel(addr.label);
                                setAddressLine1(addr.addressLine1);
                                setAddressLine2(addr.addressLine2 || '');
                                setCity(addr.city);
                                setState(addr.state);
                                setCountry(addr.country);
                                setPincode(addr.pincode);
                                setIsDefaultAddress(addr.isDefault);
                                setShowAddressForm(true);
                              }}
                              className="text-xs font-bold text-slate-400 hover:text-indigo-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-0.5"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'security' && (
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">Security Settings</h2>
              <p className="text-xs text-slate-400 mt-1">Modify login passwords and revoke device access keys.</p>

              {passwordMessage && (
                <div className="mt-4 rounded-xl bg-emerald-50/50 border border-emerald-100/35 p-3 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                  <Check className="h-4 w-4" />
                  {passwordMessage}
                </div>
              )}

              {passwordError && (
                <div className="mt-4 rounded-xl bg-rose-50/50 border border-rose-100/35 p-3 text-xs font-semibold text-rose-700">
                  {passwordError}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="mt-6 space-y-4 max-w-lg">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Password</label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200/80 p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100/40 transition-all duration-200 bg-slate-50/50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200/80 p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100/40 transition-all duration-200 bg-slate-50/50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200/80 p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100/40 transition-all duration-200 bg-slate-50/50 focus:bg-white"
                  />
                </div>

                <div className="pt-4 flex gap-2">
                  <button
                    type="submit"
                    className="rounded-2xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-md shadow-indigo-100/50"
                  >
                    Update Password
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      const confirmed = await showConfirm('Log out from all other devices?');
                      if (confirmed) {
                        await API.post('/auth/logout-all', {});
                        showAlert('Sessions logged out. Please log in again.', 'success');
                        setTimeout(() => window.location.reload(), 1500);
                      }
                    }}
                    className="rounded-2xl border border-slate-200 text-slate-500 px-4 py-2.5 text-xs font-bold hover:bg-slate-50"
                  >
                    Revoke Other Sessions
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSubTab === 'activity' && (
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">Security Audit Logs</h2>
              <p className="text-xs text-slate-400 mt-1">Audit active sessions, login timestamps, and changes on your account.</p>

              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
                <table className="w-full text-left text-xs text-slate-500">
                  <thead className="bg-slate-50 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">IP Address</th>
                      <th className="px-4 py-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-slate-400">No activity logs recorded.</td>
                      </tr>
                    ) : (
                      logs.map((logItem) => (
                        <tr key={logItem.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 whitespace-nowrap">{new Date(logItem.createdAt).toLocaleString()}</td>
                          <td className="px-4 py-3 font-bold text-slate-700">{logItem.action}</td>
                          <td className="px-4 py-3">{logItem.ipAddress || 'Internal'}</td>
                          <td className="px-4 py-3 text-slate-600">{logItem.details}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <button
                  disabled={logsPage === 0}
                  onClick={() => setLogsPage((prev) => Math.max(0, prev - 1))}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 disabled:opacity-40 hover:bg-slate-50 bg-white"
                >
                  Previous
                </button>
                <span className="text-xs font-bold text-slate-500">Page {logsPage + 1}</span>
                <button
                  disabled={logs.length < 8}
                  onClick={() => setLogsPage((prev) => prev + 1)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 disabled:opacity-40 hover:bg-slate-50 bg-white"
                >
                  Next
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
