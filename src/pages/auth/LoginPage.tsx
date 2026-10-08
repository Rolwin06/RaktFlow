import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuthStore, type UserRole } from '@/store/authStore';
import { useNetworkStore } from '@/store/networkStore';

type Mode = 'signin' | 'signup';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, quickDemoLogin, isLoading, error, clearError } = useAuthStore();
  const { bloodBanks } = useNetworkStore();

  const [mode, setMode] = useState<Mode>('signin');
  const [role, setRole] = useState<UserRole>('owner');
  const [assignedBankId, setAssignedBankId] = useState<string>('bank-001');
  const [showPassword, setShowPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError();
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signin') {
      const ok = await signIn(form.email, form.password, role, role === 'operator' ? assignedBankId : null);
      if (ok) {
        navigate(role === 'owner' ? '/bank/owner-dashboard' : '/bank/inventory', { replace: true });
      }
    } else {
      const ok = await signUp(form.email, form.password, form.fullName, role, role === 'operator' ? assignedBankId : null);
      if (ok) {
        navigate(role === 'owner' ? '/bank/owner-dashboard' : '/bank/inventory', { replace: true });
      }
    }
  };

  const handleQuickDemo = (demoRole: UserRole, demoBankId: string = 'bank-001') => {
    quickDemoLogin(demoRole, demoBankId);
    navigate(demoRole === 'owner' ? '/bank/owner-dashboard' : '/bank/inventory', { replace: true });
  };

  const switchMode = (m: Mode) => {
    clearError();
    setSignupSuccess(false);
    setMode(m);
    setForm({ email: '', password: '', fullName: '' });
  };

  return (
    <div className="min-h-screen bg-surface-950 flex">
      {/* ── Left Hero Panel ──────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[50%] relative flex-col justify-between p-12 overflow-hidden">
        {/* Background gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-surface-950 to-surface-900" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-red-900/20 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-red-800/10 blur-3xl" />
        </div>

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-900/50">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white block leading-tight">RAKTFLOW</span>
            <span className="text-[11px] uppercase tracking-widest text-red-400/80 font-semibold">Supply Intelligence</span>
          </div>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/30 border border-red-800/40">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <span className="text-xs font-mono font-semibold text-red-300 uppercase tracking-wider">
                Multi-Role Supply Intelligence
              </span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-tight">
              Two Tailored Dashboards.
              <br />
              <span className="text-red-500">One Unified Network.</span>
            </h1>
            <p className="text-sm text-surface-400 leading-relaxed max-w-md">
              Whether you oversee multiple blood banks across the metropolitan node or operate a single dedicated facility, RaktFlow equips you with autonomous inventory guardrails and real-time emergency dispatch.
            </p>
          </div>

          {/* Persona Descriptions */}
          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-surface-900/70 border border-surface-800/80 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-900/40 border border-red-700/50 flex items-center justify-center text-red-400 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Multi-Facility Owner / Director</span>
                <span className="text-[11px] text-surface-400">
                  Monitor all your blood banks on a unified command dashboard, rebalance stock, and dispatch hospital emergencies from any facility.
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-900/70 border border-surface-800/80 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-800 border border-surface-700 flex items-center justify-center text-surface-300 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Single Blood Bank Operator</span>
                <span className="text-[11px] text-surface-400">
                  Focused dashboard locked to your assigned facility for local inventory logging, verification, and dedicated incoming requests.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom attribution */}
        <div className="relative z-10 text-[11px] text-surface-600 font-mono">
          RaktFlow · Intelligent Blood Distribution · Supabase Realtime Connected
        </div>
      </div>

      {/* ── Right Auth Panel ─────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">RAKTFLOW</span>
          </div>

          {/* Quick Demo Switcher Cards (Instant 1-Click Access) */}
          <div className="p-3.5 rounded-xl bg-surface-900 border border-surface-800 mb-6 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-surface-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Instant Role Demo Access
              </span>
              <span className="text-[10px] text-surface-500 font-mono">1-Click Sign In</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('owner')}
                className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/60 hover:bg-red-900/40 hover:border-red-600 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-red-400" />
                    Multi-Bank Owner
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-red-400 transition-transform group-hover:translate-x-0.5" />
                </div>
                <span className="text-[10px] text-surface-400 block mt-0.5">All 8 Facilities</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('operator', 'bank-001')}
                className="p-2.5 rounded-lg bg-surface-800/80 border border-surface-700 hover:bg-surface-700/80 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Single Bank Operator
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-surface-400 transition-transform group-hover:translate-x-0.5" />
                </div>
                <span className="text-[10px] text-surface-400 block mt-0.5">City Blood Bank</span>
              </button>
            </div>
          </div>

          {/* Mode tabs */}
          <div className="flex rounded-xl bg-surface-900/80 border border-surface-800 p-1 mb-6">
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  mode === m
                    ? 'bg-red-600 text-white shadow-md shadow-red-900/50'
                    : 'text-surface-500 hover:text-surface-300'
                }`}
              >
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Success state after sign-up */}
          {signupSuccess ? (
            <div className="text-center space-y-4 py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-900/30 border border-emerald-700/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Account Created!</h2>
                <p className="text-sm text-surface-400 mt-1">
                  Check your email to confirm your address, then sign in.
                </p>
              </div>
              <button
                onClick={() => switchMode('signin')}
                className="mt-4 w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  {mode === 'signin' ? 'Sign in to your dashboard' : 'Create your RaktFlow account'}
                </h2>
                <p className="text-xs text-surface-500 mt-0.5">
                  Select your account role to launch your customized workspace.
                </p>
              </div>

              {/* Role Selection Cards */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">
                  Select Your Account Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('owner')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      role === 'owner'
                        ? 'bg-red-950/60 border-red-600 ring-2 ring-red-500/20 text-white'
                        : 'bg-surface-900 border-surface-800 text-surface-400 hover:bg-surface-850'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Building2 className={`w-4 h-4 ${role === 'owner' ? 'text-red-400' : 'text-surface-500'}`} />
                      <span className="text-xs font-bold">Multi-Bank Owner</span>
                    </div>
                    <span className="text-[10px] text-surface-400 leading-tight block">
                      Manage multiple banks
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('operator')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      role === 'operator'
                        ? 'bg-red-950/60 border-red-600 ring-2 ring-red-500/20 text-white'
                        : 'bg-surface-900 border-surface-800 text-surface-400 hover:bg-surface-850'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <ShieldCheck className={`w-4 h-4 ${role === 'operator' ? 'text-red-400' : 'text-surface-500'}`} />
                      <span className="text-xs font-bold">Single-Bank Operator</span>
                    </div>
                    <span className="text-[10px] text-surface-400 leading-tight block">
                      Bound to 1 assigned bank
                    </span>
                  </button>
                </div>
              </div>

              {/* If Single Bank Operator: Facility Picker */}
              {role === 'operator' && (
                <div className="space-y-1.5 p-3 rounded-xl bg-surface-900 border border-surface-800">
                  <label className="text-[11px] font-semibold text-surface-300 uppercase tracking-wider block">
                    Your Assigned Blood Bank Facility
                  </label>
                  <select
                    value={assignedBankId}
                    onChange={(e) => setAssignedBankId(e.target.value)}
                    className="w-full text-xs font-semibold bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-600"
                  >
                    {bloodBanks.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.name} ({bank.shortName}) — {bank.city}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Error banner */}
              {error && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-950/60 border border-red-800/60">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-300 leading-relaxed">{error}</p>
                </div>
              )}

              {/* Full Name — signup only */}
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-600" />
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                      placeholder="Dr. Priya Sharma"
                      className="w-full pl-10 pr-4 py-2.5 bg-surface-900 border border-surface-700 rounded-xl text-xs text-white placeholder-surface-600 focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-600" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@bloodbank.org"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-900 border border-surface-700 rounded-xl text-xs text-white placeholder-surface-600 focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-600" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                    className="w-full pl-10 pr-12 py-2.5 bg-surface-900 border border-surface-700 rounded-xl text-xs text-white placeholder-surface-600 focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-600 hover:text-surface-400 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold tracking-wide transition-all shadow-lg shadow-red-900/40 cursor-pointer mt-2"
              >
                {isLoading
                  ? mode === 'signin' ? 'Signing in…' : 'Creating account…'
                  : mode === 'signin'
                  ? `Sign In as ${role === 'owner' ? 'Multi-Bank Owner' : 'Single-Bank Operator'}`
                  : 'Create Account & Launch'}
              </button>

              {/* Switch mode link */}
              <p className="text-center text-xs text-surface-500">
                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
                  className="text-red-400 hover:text-red-300 font-semibold transition-colors cursor-pointer"
                >
                  {mode === 'signin' ? 'Create one' : 'Sign in'}
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
