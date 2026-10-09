import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { useAuthStore, type UserRole } from '@/store/authStore';
import { useNetworkStore } from '@/store/networkStore';

type Mode = 'signin' | 'signup';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, quickDemoLogin, error, clearError } = useAuthStore();
  const { bloodBanks } = useNetworkStore();

  const [mode, setMode] = useState<Mode>('signin');
  const role: UserRole = 'operator';
  const [assignedBankId, setAssignedBankId] = useState<string>('bank-001');
  const [showPassword, setShowPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError();
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const goToDashboard = () => {
    navigate('/bank/inventory', { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === 'signin') {
        const ok = await signIn(form.email, form.password, role, assignedBankId);
        if (ok) {
          goToDashboard();
          return;
        }
      } else {
        const ok = await signUp(form.email, form.password, form.fullName, role, assignedBankId);
        if (ok) {
          const user = useAuthStore.getState().user;
          if (user) {
            goToDashboard();
            return;
          } else {
            setSignupSuccess(true);
          }
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoAccess = () => {
    quickDemoLogin('operator', assignedBankId);
    goToDashboard();
  };

  const switchMode = (m: Mode) => {
    clearError();
    setSignupSuccess(false);
    setMode(m);
    setForm({ email: '', password: '', fullName: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/70 via-sky-100/40 to-surface-50 flex items-center justify-center p-4 sm:p-8 font-sans selection:bg-red-500 selection:text-white">
      <div className="w-full max-w-md my-auto">
        {/* Brand Logo Header */}
        <div
          className="flex items-center justify-center gap-2.5 mb-6 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center text-white shadow-md shadow-red-500/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-red-700 via-red-600 to-red-500 bg-clip-text text-transparent block leading-tight">
              RAKTFLOW
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-red-600/90 block">
              Blood Bank Portal
            </span>
          </div>
        </div>

        {/* Demo Access Button — always works regardless of Supabase auth */}
        <button
          type="button"
          onClick={handleDemoAccess}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-surface-900 hover:bg-surface-800 text-white text-xs font-bold tracking-wide transition-all cursor-pointer shadow-md mb-4 group"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-current group-hover:scale-110 transition-transform" />
          <span>Enter as Demo Operator</span>
          <span className="text-surface-400 text-[10px] font-normal ml-1">(No sign-in needed)</span>
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-surface-200" />
          <span className="text-[10px] text-surface-500 font-semibold uppercase tracking-wider">or sign in with account</span>
          <div className="flex-1 h-px bg-surface-200" />
        </div>

        {/* Mode tabs */}
        <div className="flex rounded-xl bg-surface-100 border border-surface-200/90 p-1 mb-5">
          {(['signin', 'signup'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                mode === m
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-surface-600 hover:text-surface-900 font-semibold'
              }`}
            >
              {m === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Success state after sign-up */}
        {signupSuccess ? (
          <div className="text-center space-y-4 bg-white p-8 rounded-2xl border border-surface-200 shadow-md">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-surface-900">Account Created!</h2>
              <p className="text-xs text-surface-500 mt-1">
                Check your email to confirm your address, then sign in.
              </p>
            </div>
            <button
              onClick={() => switchMode('signin')}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Back to Sign In
            </button>
            <button
              onClick={handleDemoAccess}
              className="w-full py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-surface-800 text-xs font-bold transition-colors cursor-pointer"
            >
              Skip — Enter as Demo Operator Instead
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-surface-200/90 shadow-xl">
            <div>
              <h2 className="text-xl font-extrabold text-surface-900 tracking-tight">
                {mode === 'signin' ? 'Sign in to Blood Bank Portal' : 'Create Facility Operator Account'}
              </h2>
              <p className="text-xs text-surface-500 mt-0.5">
                {mode === 'signin'
                  ? 'Access your assigned facility inventory and requests.'
                  : 'Register to manage your blood bank facility.'}
              </p>
            </div>

            {/* Facility Selector */}
            <div className="space-y-1.5 p-3 rounded-xl bg-surface-50 border border-surface-200">
              <label className="text-[11px] font-bold text-surface-700 uppercase tracking-wider block">
                Assigned Blood Bank Facility
              </label>
              <select
                value={assignedBankId}
                onChange={(e) => setAssignedBankId(e.target.value)}
                className="w-full text-xs font-bold bg-white border border-surface-200 rounded-lg px-3 py-2 text-surface-900 focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600"
              >
                {bloodBanks.map((bank) => (
                  <option key={bank.id} value={bank.id}>
                    {bank.name} ({bank.shortName}) — {bank.city}
                  </option>
                ))}
              </select>
            </div>

            {/* Error banner */}
            {error && (
              <div className="space-y-2">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-800 leading-relaxed font-semibold">{error}</p>
                </div>
                {/* Fallback suggestion when auth fails */}
                <button
                  type="button"
                  onClick={handleDemoAccess}
                  className="w-full py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-surface-800 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Enter as Demo Operator instead
                </button>
              </div>
            )}

            {/* Full Name — signup only */}
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-surface-700 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Dr. Priya Sharma"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-xs text-surface-900 placeholder-surface-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-surface-700 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@bloodbank.org"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-xs text-surface-900 placeholder-surface-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-surface-700 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                  className="w-full pl-10 pr-12 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-xs text-surface-900 placeholder-surface-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold tracking-wide transition-all shadow-md shadow-red-600/20 cursor-pointer mt-2"
            >
              {isSubmitting
                ? mode === 'signin' ? 'Signing in…' : 'Creating account…'
                : mode === 'signin'
                ? 'Sign In to Portal'
                : 'Create Account & Launch'}
            </button>

            {/* Switch mode link */}
            <p className="text-center text-xs text-surface-500 pt-1">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-red-600 hover:text-red-700 font-bold transition-colors cursor-pointer"
              >
                {mode === 'signin' ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
