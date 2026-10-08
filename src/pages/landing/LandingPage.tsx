import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Heart,
  Droplets,
  ArrowRight
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuthStore();
  const isNavigatingRef = useRef(false);

  const handleEnterApp = () => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;

    if (user) {
      if (userRole === 'owner') {
        navigate('/bank/owner-dashboard');
      } else {
        navigate('/bank/inventory');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900 font-sans flex flex-col justify-between selection:bg-red-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-surface-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center text-white shadow-md shadow-red-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-red-700 via-red-600 to-red-500 bg-clip-text text-transparent">
              RAKTFLOW
            </span>
            <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider text-red-600/80 ml-2 px-1.5 py-0.5 rounded bg-red-50 border border-red-100">
              Live Network
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section - Full Landing View */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-16 bg-gradient-to-b from-sky-50/70 via-sky-100/40 to-surface-50 overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-400/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-sky-300/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center z-10 w-full my-auto">
          {/* Main Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold mb-6 shadow-xs">
            <Droplets className="w-4 h-4 text-red-600 animate-pulse" />
            <span>Real-Time Blood Inventory &amp; Emergency Response Network</span>
          </div>

          {/* Title & Headline */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-surface-900 leading-[1.1] mb-5">
            RAKTFLOW <br />
            <span className="bg-gradient-to-r from-red-600 via-red-500 to-rose-600 bg-clip-text text-transparent">
              Connecting Lives, Saving Seconds
            </span>
          </h1>

          <p className="text-base sm:text-lg text-surface-600 max-w-2xl mx-auto font-medium leading-relaxed mb-8">
            Empowering connected blood banks with real-time stock tracking, instant emergency requests, and zero-waste automated dispatching.
          </p>

          {/* Hero Banner Illustration */}
          <div
            onClick={handleEnterApp}
            className="relative max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-white/80 bg-sky-100 mb-8 cursor-pointer group hover:scale-[1.01] transition-transform duration-500"
          >
            <img
              src="/hero_illustration.jpg"
              alt="RaktFlow Blood Network Illustration"
              className="w-full h-auto max-h-[380px] object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white font-medium text-xs sm:text-sm">
              <span className="flex items-center gap-1.5 font-bold tracking-wide">
                <Heart className="w-4 h-4 text-red-400 fill-current animate-pulse" />
                Live 50km Integrated Blood Network
              </span>
              <span className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[11px] border border-white/20">
                8 Facilities Connected
              </span>
            </div>
          </div>

          {/* Enter Portal Action Button */}
          <div className="z-10 pt-2 flex flex-col items-center">
            <button
              onClick={handleEnterApp}
              className="group flex items-center gap-2.5 font-bold text-sm px-7 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-600/30 transition-all cursor-pointer hover:scale-105"
            >
              <span>{user ? 'Enter Main Dashboard' : 'Enter Portal / Sign In'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="py-4 px-4 border-t border-surface-200/80 bg-white text-center text-xs text-surface-400 font-medium z-10">
        <span>RaktFlow · Real-Time Blood Inventory &amp; Emergency Dispatch Network</span>
      </footer>
    </div>
  );
};
