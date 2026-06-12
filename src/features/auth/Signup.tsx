import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { authStart, authSuccess, authFailure, clearError } from '../../store/slices/authSlice';
import { mergeCartOnLogin } from '../../store/slices/cartSlice';
import API from '../../config/api';
import { Mail, Lock, User as UserIcon, Phone } from 'lucide-react';
import type { Role } from '../../types/auth';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, user } = useSelector((state: RootState) => state.auth);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState<Role>('CUSTOMER');

  useEffect(() => {
    dispatch(clearError());
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate, dispatch]);

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(authStart());
    try {
      const response = await API.post('/auth/register', {
        email,
        password,
        mobile: mobile || undefined,
        firstName,
        lastName: lastName || undefined,
        role
      });
      dispatch(authSuccess(response.data));
      try {
        await dispatch(mergeCartOnLogin()).unwrap();
      } catch {
        // Keep registration successful even if cart merge is unavailable.
      }
      navigate('/profile');
    } catch (err: any) {
      dispatch(authFailure(err.response?.data?.message || 'Registration failed'));
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative w-full max-w-md">
        
        {/* Glow Effects */}
        <div className="absolute -top-10 -left-10 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute -bottom-10 -right-10 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" />

        {/* Card */}
        <div className="relative border border-slate-200/50 bg-white/80 p-8 shadow-2xl backdrop-blur-lg rounded-2xl">
          
          <div className="text-center">
            <h2 className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
              Create Account
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Join AuraCart to discover and purchase enterprise items.
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSignupSubmit} className="mt-6 space-y-4">
            
            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">First Name</label>
                <div className="relative mt-1">
                  <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-sm outline-none focus:border-primary-500 focus:bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Last Name</label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-4 text-sm outline-none focus:border-primary-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Email Address</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@domain.com"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-sm outline-none focus:border-primary-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Mobile (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Mobile Number</label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-sm outline-none focus:border-primary-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-sm outline-none focus:border-primary-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Role selection */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Register As</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full mt-1 rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-sm outline-none focus:border-primary-500 focus:bg-white"
              >
                <option value="CUSTOMER">Customer (Buying goods)</option>
                <option value="SELLER">Seller (Listing products)</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 shadow-md shadow-primary-200 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Redirect to Login */}
          <p className="mt-8 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary-600 hover:underline">
              Sign In
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};
