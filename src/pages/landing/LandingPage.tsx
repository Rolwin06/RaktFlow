import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ShieldAlert,
  Building2,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900 font-sans selection:bg-red-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-surface-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-sm shadow-red-200">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-surface-900 block leading-tight">
                RAKTFLOW
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-surface-400 block leading-tight">
                Intelligent Blood Supply Network
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/simulation')}
              className="text-xs font-semibold"
            >
              Demo Simulation
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/bank/overview')}
              className="text-xs font-semibold hidden sm:inline-flex"
            >
              Facility Portal
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}
              onClick={() => navigate('/request/new')}
              className="text-xs font-semibold"
            >
              Emergency Request
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold border border-red-200 mb-6 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          Autonomous 50km Distributed Blood Supply Optimization
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-surface-900 leading-[1.1] mb-6">
          Blood should flow where it is needed — <br className="hidden sm:inline" />
          <span className="text-red-600">before it becomes a shortage or waste.</span>
        </h1>

        <p className="text-base sm:text-lg text-surface-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Traditional directories merely find the nearest blood bank. RaktFlow continuously computes
          protected local reserves, biological compatibility, expiration hazard (FEFO), and delivery ETA to
          safeguard the entire metropolitan network.
        </p>

        {/* Primary Role Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-16">
          <Button
            size="lg"
            variant="primary"
            leftIcon={<ShieldAlert className="w-5 h-5" />}
            onClick={() => navigate('/request/new')}
            className="text-sm font-bold shadow-md shadow-red-200 px-6 py-3"
          >
            I NEED BLOOD (EMERGENCY)
          </Button>

          <Button
            size="lg"
            variant="outline"
            leftIcon={<Building2 className="w-5 h-5" />}
            onClick={() => navigate('/bank/overview')}
            className="text-sm font-semibold px-6 py-3"
          >
            I'M A BLOOD BANK
          </Button>

          <Button
            size="lg"
            variant="secondary"
            leftIcon={<BarChart3 className="w-5 h-5" />}
            onClick={() => navigate('/admin/overview')}
            className="text-sm font-semibold px-6 py-3"
          >
            ADMIN / JUDGE CENTER
          </Button>
        </div>

        {/* Live Network Trust Pill Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto text-left font-mono">
          <div className="bg-white border border-surface-200/80 rounded-lg p-3">
            <div className="text-[11px] text-surface-500 uppercase tracking-wider">Network Radius</div>
            <div className="text-lg font-bold text-surface-900 mt-0.5">50 Kilometers</div>
          </div>
          <div className="bg-white border border-surface-200/80 rounded-lg p-3">
            <div className="text-[11px] text-surface-500 uppercase tracking-wider">Connected Facilities</div>
            <div className="text-lg font-bold text-surface-900 mt-0.5">8 Blood Banks</div>
          </div>
          <div className="bg-white border border-surface-200/80 rounded-lg p-3">
            <div className="text-[11px] text-surface-500 uppercase tracking-wider">Matching Latency</div>
            <div className="text-lg font-bold text-emerald-600 mt-0.5">&lt; 1.2 Seconds</div>
          </div>
          <div className="bg-white border border-surface-200/80 rounded-lg p-3">
            <div className="text-[11px] text-surface-500 uppercase tracking-wider">Wastage Prevented</div>
            <div className="text-lg font-bold text-red-600 mt-0.5">+23 Units Saved</div>
          </div>
        </div>
      </section>

      {/* THE PROBLEM Section */}
      <section className="py-16 bg-white border-y border-surface-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 block mb-1">
              THE PERISHABLE LOGISTICS PARADOX
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-surface-900">
              One bank has excess expiring. <br />
              Another faces a critical shortage.
            </h2>
            <p className="text-xs sm:text-sm text-surface-500 mt-2">
              Nearest-bank searches cause stockouts and unnecessary expiry. RaktFlow connects and redistributes them proactively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Bank A: Surplus */}
            <div className="bg-surface-50 rounded-xl border border-surface-200 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-surface-500">
                    BANK A (City Blood Bank)
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-800 rounded">
                    Expiring in 18h
                  </span>
                </div>
                <h3 className="text-base font-bold text-surface-900 mb-2">Surplus B+ Platelets</h3>
                <p className="text-xs text-surface-600 leading-relaxed">
                  Has 8 available units with low weekend trauma projections. 2 units will expire tomorrow unless transferred or dispatched immediately.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-surface-200 flex items-center justify-between text-xs font-mono">
                <span className="text-surface-500">Local Burn Rate:</span>
                <span className="font-semibold text-surface-800">3.1 units/day</span>
              </div>
            </div>

            {/* RaktFlow Intelligence Layer */}
            <div className="bg-red-600 text-white rounded-xl p-6 flex flex-col justify-between shadow-lg shadow-red-200 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-white" />
                  <span className="text-xs font-bold uppercase tracking-wider text-red-100">
                    RAKTFLOW ENGINE
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">Automated Greedy Balancing</h3>
                <p className="text-xs text-red-100 leading-relaxed">
                  Calculates that Bank A can safely release 3 transferable units without endangering local safety buffers, rebalancing the entire 50km network.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-red-500/60 flex items-center justify-between text-xs font-mono text-red-100">
                <span>ETA Transit:</span>
                <span className="font-bold text-white">18 Minutes</span>
              </div>
            </div>

            {/* Bank B: Shortage */}
            <div className="bg-surface-50 rounded-xl border border-surface-200 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-surface-500">
                    BANK B (District Centre)
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-red-100 text-red-800 rounded">
                    Shortage in 10h
                  </span>
                </div>
                <h3 className="text-base font-bold text-surface-900 mb-2">0.24 Days of Stock Left</h3>
                <p className="text-xs text-surface-600 leading-relaxed">
                  Only 1 unit remaining with 4 incoming surgeries. Predicted total depletion in under 10 hours without inter-facility redistribution.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-surface-200 flex items-center justify-between text-xs font-mono">
                <span className="text-surface-500">Coverage Window:</span>
                <span className="font-semibold text-rose-600 font-bold">CRITICAL (&lt;1d)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW RAKTFLOW THINKS Section */}
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-surface-400 block mb-1">
            DECISION ARCHITECTURE
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-surface-900">
            How RaktFlow Thinks
          </h2>
          <p className="text-xs sm:text-sm text-surface-500 mt-2">
            Every match executes a deterministic multi-stage constraint pipeline in under 2 seconds.
          </p>
        </div>

        <div className="space-y-3 font-mono text-xs max-w-3xl mx-auto">
          {[
            { step: '01', title: 'Where is blood?', desc: 'Scans all operational blood banks within a strict 50 kilometer radius.' },
            { step: '02', title: 'Is it biologically compatible?', desc: 'Strict hard constraint: RBC & Platelet universal and cross-compatibility filtering.' },
            { step: '03', title: 'Can the bank safely release it?', desc: 'Computes Protected Local Stock = (Daily Usage × 2d) × 1.2 safety buffer. Never breaches local reserve.' },
            { step: '04', title: 'Is the inventory trustworthy?', desc: 'Penalizes confidence scores for records unconfirmed >8h. Stale records drop down ranking.' },
            { step: '05', title: 'Which units expire first?', desc: 'FEFO (First Expire, First Out) prioritizes near-expiry units before fresh units to prevent wastage.' },
            { step: '06', title: 'Can it reach the requester in time?', desc: 'Validates that driving ETA is strictly less than the units remaining biological shelf-life.' },
            { step: '07', title: 'Should surplus be redistributed?', desc: 'Greedy inter-bank rebalancing pairs surplus centers with projected shortage outposts.' },
            { step: '08', title: 'If nobody can help, which donors to alert?', desc: 'Fallback triggers privacy-masked SMS/push alerts to eligible nearby volunteer donors.' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-surface-200/80 rounded-lg p-3.5 flex items-start gap-4 hover:border-red-300 transition-colors"
            >
              <span className="text-red-600 font-bold shrink-0">{item.step}</span>
              <div className="flex-1">
                <span className="font-bold text-surface-900 font-sans block text-sm">
                  {item.title}
                </span>
                <span className="text-surface-500 font-sans text-xs mt-0.5 block">
                  {item.desc}
                </span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            </div>
          ))}
        </div>
      </section>

      {/* Role Selection Interactive Grid */}
      <section className="py-16 bg-surface-100/60 border-t border-surface-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-md mx-auto mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-surface-900">
              Select Your Operational Role
            </h2>
            <p className="text-xs text-surface-500 mt-1">
              Switch seamlessly between perspectives during judging and review.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Requester / Hospital */}
            <div
              onClick={() => navigate('/request/new')}
              className="bg-white rounded-xl border border-surface-200 p-6 hover:shadow-lg hover:border-red-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-surface-900 group-hover:text-red-600 transition-colors">
                  Hospital & Requesters
                </h3>
                <p className="text-xs text-surface-500 mt-2 leading-relaxed">
                  Fast 1-minute emergency requests without mandatory login barrier. Real-time ranking with transparent reasons.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-red-600">
                <span>Create Blood Request</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Blood Bank Facility */}
            <div
              onClick={() => navigate('/bank/overview')}
              className="bg-white rounded-xl border border-surface-200 p-6 hover:shadow-lg hover:border-red-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-surface-100 text-surface-700 flex items-center justify-center mb-4 group-hover:bg-surface-900 group-hover:text-white transition-colors">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-surface-900 group-hover:text-surface-900 transition-colors">
                  Blood Bank Staff
                </h3>
                <p className="text-xs text-surface-500 mt-2 leading-relaxed">
                  Manage inventory with Protected vs Transferable stock bars, confirm aging stock, and approve incoming redistribution requests.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-surface-800">
                <span>Enter Facility Portal</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Admin / Judge */}
            <div
              onClick={() => navigate('/admin/overview')}
              className="bg-white rounded-xl border border-surface-200 p-6 hover:shadow-lg hover:border-red-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-surface-900 group-hover:text-emerald-700 transition-colors">
                  Admin & Judge Center
                </h3>
                <p className="text-xs text-surface-500 mt-2 leading-relaxed">
                  View interactive 50km map, live event feed, simulation clock, Units Saved metric, and deterministic shortage scenarios.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <span>Open Control Center</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-200 bg-white py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-surface-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-surface-900">RaktFlow</span>
            <span>· Hackatopia 2026 Healthcare Track (HC-04)</span>
          </div>
          <div>
            <span>Prototype Demonstration · Synthetic Data Only · Not a Clinical Tool</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
