import React, { useState } from 'react';
import {
  PlayCircle,
  RotateCcw,
  FastForward,
  AlertTriangle,
  ArrowRightLeft,
  Sparkles,
  TrendingDown,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useSimulationStore } from '@/store/simulationStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useNetworkStore } from '@/store/networkStore';
import { useTransferStore } from '@/store/transferStore';
import { formatClockTime, formatTimeAgo } from '@/utils/date';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export const SimulationPage: React.FC = () => {
  const {
    simulationTime,
    isRunning,
    unitsSaved,
    events,
    toggleRunning,
    fastForwardHours,
    addEvent,
    incrementUnitsSaved,
    resetSimulation,
  } = useSimulationStore();
  const { inventory, resetInventory } = useInventoryStore();
  const { bloodBanks, resetBanks } = useNetworkStore();
  const { resetTransfers } = useTransferStore();

  const [activeScenario, setActiveScenario] = useState<string>('DETERMINISTIC_DEMO');
  const [isRunningScenario, setIsRunningScenario] = useState(false);
  const [scenarioStep, setScenarioStep] = useState<number>(0);

  const handleResetAll = () => {
    resetSimulation();
    resetInventory();
    resetBanks();
    resetTransfers();
    setScenarioStep(0);
  };

  // Run the Signature Hackathon Demo Scenario
  const runDeterministicDemo = () => {
    setIsRunningScenario(true);
    setScenarioStep(1);

    addEvent({
      type: 'demo_start',
      message: '--- SIGNATURE HACKATHON DEMO INITIATED ---',
      timestamp: new Date().toISOString(),
    });

    // Step 1: Scan
    setTimeout(() => {
      setScenarioStep(2);
      addEvent({
        type: 'algorithm',
        message: 'RaktFlow evaluated 8 banks for B+ Platelets across 50 km.',
        timestamp: new Date().toISOString(),
      });
    }, 1200);

    // Step 2: Penalize Bank C
    setTimeout(() => {
      setScenarioStep(3);
      addEvent({
        type: 'penalty',
        message: 'Bank C (LifeLine) reported 10 units BUT inventory unconfirmed for 14h → Trust score penalized to 54%. Deprioritized!',
        timestamp: new Date().toISOString(),
      });
    }, 2500);

    // Step 3: Identify Bank A surplus + Bank B deficit
    setTimeout(() => {
      setScenarioStep(4);
      addEvent({
        type: 'match',
        message: 'Bank A (City BB) has 3 units near expiry (18h). Bank B (District BC) has critical shortage (<0.3d coverage).',
        timestamp: new Date().toISOString(),
      });
    }, 4000);

    // Step 4: Transfer recommendation
    setTimeout(() => {
      setScenarioStep(5);
      incrementUnitsSaved(3);
      addEvent({
        type: 'recommendation',
        message: 'RECOMMENDATION: Proactively transfer 3 B+ units from Bank A → Bank B. Prevented expiry! (+3 Units Saved)',
        timestamp: new Date().toISOString(),
      });
      setIsRunningScenario(false);
    }, 5500);
  };

  // Quick Scenarios
  const handleSimulateEmergency = () => {
    addEvent({
      type: 'emergency',
      message: 'SIMULATED: Mass-casualty trauma alert reported at Victoria Hospital. 12 units O- RBC demanded.',
      timestamp: new Date().toISOString(),
    });
  };

  const handleSimulateLowStock = () => {
    addEvent({
      type: 'shortage',
      message: 'SIMULATED: Red Cross Blood Bank reserves dropped to 0.4 days of stock for Platelets.',
      timestamp: new Date().toISOString(),
    });
  };

  const handleSimulateDemandSpike = () => {
    addEvent({
      type: 'demand_spike',
      message: 'SIMULATED: Dengue seasonal outbreak in East Bangalore node; platelet demand increased by +45%.',
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Simulation Command Center Bar */}
      <div className="bg-surface-900 text-white rounded-xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
              Autonomous Hackathon Demo Simulator
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Deterministic Network Simulation
          </h1>
          <p className="text-xs text-surface-300 mt-1">
            Test greedy redistribution, confidence decay penalties, and emergency fallback without external dependencies.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="bg-surface-800 border border-surface-700 rounded-lg px-3.5 py-1.5 font-mono text-xs">
            <span className="text-[10px] text-surface-400 uppercase block">Virtual Time</span>
            <span className="text-sm font-bold text-white">{formatClockTime(simulationTime)}</span>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => fastForwardHours(2)}
            leftIcon={<FastForward className="w-3.5 h-3.5" />}
            className="text-white border-surface-700 hover:bg-surface-800 text-xs"
          >
            +2 Hours
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={handleResetAll}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-xs font-bold"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Main Grid: Signature Scenario + Quick Controls + Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: The Signature Scenario & Interactive Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* SEEDED HACKATHON DEMO CARD (Blueprint Section 31) */}
          <Card className="border-2 border-red-500 shadow-md bg-white">
            <CardHeader className="bg-red-50/70 border-b border-red-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-surface-900">
                  Signature Scenario: The Perishable Trilemma
                </CardTitle>
                <p className="text-xs text-surface-600 mt-0.5">
                  Proves why RaktFlow never simply selects the nearest or largest inventory reporter.
                </p>
              </div>

              <Button
                size="md"
                variant="primary"
                isLoading={isRunningScenario}
                leftIcon={<PlayCircle className="w-4 h-4" />}
                onClick={runDeterministicDemo}
                className="font-bold text-xs"
              >
                RUN SIGNATURE DEMO
              </Button>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {/* 3 Banks Involved */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                {/* Bank A */}
                <div
                  className={`p-3 rounded-lg border transition-all ${
                    scenarioStep >= 4 ? 'bg-emerald-50 border-emerald-400' : 'bg-surface-50 border-surface-200'
                  }`}
                >
                  <strong className="text-surface-900 block font-sans">Bank A (City BB)</strong>
                  <span className="text-surface-600 block mt-1">3 B+ Platelets</span>
                  <span className="text-amber-700 font-bold block mt-0.5">Expires in 18h</span>
                  <span className="text-emerald-700 block mt-0.5">Verified fresh</span>
                </div>

                {/* Bank B */}
                <div
                  className={`p-3 rounded-lg border transition-all ${
                    scenarioStep >= 4 ? 'bg-blue-50 border-blue-400' : 'bg-surface-50 border-surface-200'
                  }`}
                >
                  <strong className="text-surface-900 block font-sans">Bank B (District BC)</strong>
                  <span className="text-surface-600 block mt-1">Near-zero stock</span>
                  <span className="text-rose-700 font-bold block mt-0.5">&lt;0.3d coverage</span>
                  <span className="text-red-600 block mt-0.5">High surge usage</span>
                </div>

                {/* Bank C */}
                <div
                  className={`p-3 rounded-lg border transition-all ${
                    scenarioStep >= 3 ? 'bg-rose-50 border-rose-300 line-through text-surface-400' : 'bg-surface-50 border-surface-200'
                  }`}
                >
                  <strong className="text-surface-900 block font-sans">Bank C (LifeLine)</strong>
                  <span className="block mt-1">10 units reported</span>
                  <span className="text-rose-600 font-bold block mt-0.5">Stale for 14 hours!</span>
                  <span className="block mt-0.5">54% confidence</span>
                </div>
              </div>

              {/* Step Progress Indicators */}
              <div className="bg-surface-50 p-3.5 rounded-lg border border-surface-200/80 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-surface-500 uppercase text-[10px] font-bold">
                  <span>Engine Evaluation Sequence</span>
                  <span>Step {scenarioStep} of 5</span>
                </div>

                <div className="space-y-1.5">
                  <div className={`flex items-center gap-2 ${scenarioStep >= 1 ? 'text-surface-900 font-bold' : 'text-surface-400'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${scenarioStep >= 1 ? 'text-emerald-600' : 'text-surface-300'}`} />
                    <span>1. Autonomous 50 km broadcast evaluation initialized</span>
                  </div>
                  <div className={`flex items-center gap-2 ${scenarioStep >= 3 ? 'text-surface-900 font-bold' : 'text-surface-400'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${scenarioStep >= 3 ? 'text-emerald-600' : 'text-surface-300'}`} />
                    <span>2. Bank C penalized for unconfirmed stale data (trust penalty applied)</span>
                  </div>
                  <div className={`flex items-center gap-2 ${scenarioStep >= 4 ? 'text-surface-900 font-bold' : 'text-surface-400'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${scenarioStep >= 4 ? 'text-emerald-600' : 'text-surface-300'}`} />
                    <span>3. FEFO flags Bank A expiring platelets matching Bank B deficit</span>
                  </div>
                  <div className={`flex items-center gap-2 ${scenarioStep >= 5 ? 'text-emerald-700 font-bold' : 'text-surface-400'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${scenarioStep >= 5 ? 'text-emerald-600' : 'text-surface-300'}`} />
                    <span>4. Proactive inter-facility transfer generated (+3 Units Saved)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QUICK TRIGGER SCENARIO BUTTONS */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-surface-700 font-mono">
                Interactive Stress-Test Scenarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  onClick={handleSimulateEmergency}
                  className="p-3 rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-100 text-left transition-colors cursor-pointer"
                >
                  <strong className="text-xs font-bold text-red-900 block">Simulate Emergency</strong>
                  <span className="text-[11px] text-red-700 mt-1 block">Mass trauma spike</span>
                </button>

                <button
                  onClick={handleSimulateLowStock}
                  className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-100 text-left transition-colors cursor-pointer"
                >
                  <strong className="text-xs font-bold text-amber-900 block">Simulate Stockout</strong>
                  <span className="text-[11px] text-amber-700 mt-1 block">Drop below 1d buffer</span>
                </button>

                <button
                  onClick={handleSimulateDemandSpike}
                  className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-left transition-colors cursor-pointer"
                >
                  <strong className="text-xs font-bold text-blue-900 block">Demand Outbreak</strong>
                  <span className="text-[11px] text-blue-700 mt-1 block">+45% platelet demand</span>
                </button>

                <button
                  onClick={() => fastForwardHours(24)}
                  className="p-3 rounded-lg border border-surface-200 bg-surface-50 hover:bg-surface-100 text-left transition-colors cursor-pointer font-sans"
                >
                  <strong className="text-xs font-bold text-surface-900 block">Advance 24 Hours</strong>
                  <span className="text-[11px] text-surface-500 mt-1 block">Test FEFO expirations</span>
                </button>

                <button
                  onClick={() => addEvent({ type: 'offline', message: 'SIMULATED: Yelahanka Blood Centre offline for maintenance.', timestamp: new Date().toISOString() })}
                  className="p-3 rounded-lg border border-surface-200 bg-surface-50 hover:bg-surface-100 text-left transition-colors cursor-pointer font-sans"
                >
                  <strong className="text-xs font-bold text-surface-900 block">Facility Closure</strong>
                  <span className="text-[11px] text-surface-500 mt-1 block">Reroutes all traffic</span>
                </button>

                <button
                  onClick={handleResetAll}
                  className="p-3 rounded-lg border border-surface-200 bg-surface-50 hover:bg-surface-100 text-left transition-colors cursor-pointer font-sans"
                >
                  <strong className="text-xs font-bold text-surface-900 block">Reset Network</strong>
                  <span className="text-[11px] text-surface-500 mt-1 block">Restore seed baseline</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Live Chronological Event Stream (Blueprint Section 32) */}
        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-surface-800 font-mono">
                Live Simulation Feed
              </CardTitle>
              <span className="text-[11px] text-surface-400">Chronological telemetry</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-2.5 font-mono text-xs max-h-[600px]">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="p-2.5 rounded bg-surface-50 border border-surface-200 text-surface-800 space-y-1"
              >
                <div className="flex items-center justify-between text-[10px] text-surface-400">
                  <span className="uppercase font-bold text-surface-600">{evt.type}</span>
                  <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="leading-snug text-surface-900">{evt.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
