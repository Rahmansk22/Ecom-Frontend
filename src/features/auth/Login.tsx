import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { authStart, authSuccess, authFailure, clearError } from '../../store/slices/authSlice';
import { mergeCartOnLogin } from '../../store/slices/cartSlice';
import API from '../../config/api';
import { Mail, Lock, Phone, Key } from 'lucide-react';
import { useDialog } from '../../components/Dialog';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, user } = useSelector((state: RootState) => state.auth);
  const { showAlert } = useDialog();

  const [activeTab, setActiveTab] = useState<'password' | 'otp'>('password');
  
  // Password inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // OTP inputs
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    // Clear auth errors when landing on this page
    dispatch(clearError());
    
    // Redirect if already logged in
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate, dispatch]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(authStart());
    try {
      const response = await API.post('/auth/login', { email, password });
      dispatch(authSuccess(response.data));
      try {
        await dispatch(mergeCartOnLogin()).unwrap();
      } catch {
        // Keep login success even if guest cart merge is unavailable.
      }
      navigate('/profile');
    } catch (err: any) {
      dispatch(authFailure(err.response?.data?.message || 'Login failed'));
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile) return;
    try {
      // Simulate/Trigger Twilio OTP SMS on backend
      // await API.post('/auth/otp/send', { mobile });
      setOtpSent(true);
      showAlert('Mock OTP sent to ' + mobile + ' (Use 123456 to verify)', 'info');
    } catch (err: any) {
      showAlert(err.response?.data?.message || 'Failed to send OTP', 'error');
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(authStart());
    try {
      if (otp !== '123456') {
        throw new Error('Invalid OTP code');
      }

      const email = `${mobile}@phone-user.com`;
      const password = 'password123';

      let response;
      try {
        // Try logging in
        response = await API.post('/auth/login', { email, password });
      } catch (loginErr) {
        // If login fails, register first
        await API.post('/auth/register', {
          email,
          password,
          firstName: 'Phone',
          lastName: 'User',
          mobile,
          role: 'CUSTOMER',
        });
        // Now login
        response = await API.post('/auth/login', { email, password });
      }

      dispatch(authSuccess(response.data));
      try {
        await dispatch(mergeCartOnLogin()).unwrap();
      } catch {
        // Keep OTP login success even if cart merge is unavailable.
      }
      navigate('/profile');
    } catch (err: any) {
      dispatch(authFailure(err.response?.data?.message || err.message || 'OTP verification failed'));
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative w-full max-w-md">
        
        {/* Glow effect backgrounds */}
        <div className="absolute -top-10 -left-10 h-72 w-72 rounded-full bg-primary-400/20 blur-3xl" />
        <div className="absolute -bottom-10 -right-10 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />

        {/* Card */}
        <div className="relative border border-slate-200/50 bg-white/80 p-8 shadow-2xl backdrop-blur-lg rounded-2xl">
          
          <div className="text-center">
            <h2 className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Access your enterprise dashboard & personalized catalogs.
            </p>
          </div>

          {/* Login Mode Toggle */}
          <div className="mt-6 flex rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => { setActiveTab('password'); dispatch(clearError()); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'password' 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Email & Password
            </button>
            <button
              onClick={() => { setActiveTab('otp'); dispatch(clearError()); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'otp' 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Mobile OTP
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-600">
              {error}
            </div>
          )}

          {activeTab === 'password' ? (
            /* Email Login Form */
            <form onSubmit={handlePasswordLogin} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Email Address</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-primary-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Password</label>
                  <a href="#" className="text-xs font-semibold text-primary-600 hover:underline">Forgot password?</a>
                </div>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-primary-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  Remember me for 30 days
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 shadow-md shadow-primary-200 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In with Password'}
              </button>
            </form>
          ) : (
            /* OTP Login Form */
            <form onSubmit={otpSent ? handleOtpVerify : handleSendOtp} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Mobile Number</label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    disabled={otpSent}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+919876543210"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-primary-500 focus:bg-white"
                  />
                </div>
              </div>

              {otpSent && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Verification OTP</label>
                  <div className="relative mt-1">
                    <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="6-digit code (e.g. 123456)"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-primary-500 focus:bg-white"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 shadow-md shadow-primary-200"
              >
                {loading ? 'Verifying...' : otpSent ? 'Verify & Login' : 'Request OTP Code'}
              </button>

              {otpSent && (
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  Change mobile number
                </button>
              )}
            </form>
          )}

          {/* Social Logins */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              type="button" 
              onClick={() => showAlert('Social Login is not configured locally', 'info')}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.6 15 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99C6.16 6.94 8.87 5.04 12 5.04z" />
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.45c-.28 1.48-1.11 2.73-2.36 3.58l3.66 2.84c2.14-1.97 3.38-4.88 3.38-8.52z" />
                <path fill="#FBBC05" d="M5.24 14.59c-.25-.76-.4-1.57-.4-2.4 0-.83.15-1.64.4-2.4L1.39 6.8C.5 8.56 0 10.53 0 12.6s.5 4.04 1.39 5.8l3.85-3.01z" />
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.08-4.3 1.08-3.13 0-5.84-1.9-6.76-4.51l-3.85 3.01C3.37 20.33 7.35 23 12 23z" />
              </svg>
              <span>Google</span>
            </button>
            <button 
              type="button"
              onClick={() => showAlert('Social Login is not configured locally', 'info')}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <svg className="h-4 w-4" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>
          </div>

          {/* Redirect to Register */}
          <p className="mt-8 text-center text-xs text-slate-500">
            New to AuraCart?{' '}
            <Link to="/signup" className="font-bold text-primary-600 hover:underline">
              Create an account
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};
