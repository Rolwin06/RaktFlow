import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Lock,
  HeartHandshake,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useSimulationStore } from '@/store/simulationStore';

export const EmergencySharingPage: React.FC = () => {
  const navigate = useNavigate();
  const { addEvent } = useSimulationStore();
  const [approved, setApproved] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const handleApprove = () => {
    setIsAuthorizing(true);
    setTimeout(() => {
      setApproved(true);
      setIsAuthorizing(false);
      addEvent({
        type: 'emergency_override',
        message: 'EMERGENCY OVERRIDE: Human authorized last-option stock sharing. Initiated donor replenishment bridge.',
        timestamp: new Date().toISOString(),
      });
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      {/* High-Risk Header Banner */}
      <div className="border-2 border-red-600 bg-red-50 rounded-xl p-6 shadow-md text-red-950 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-700">
          <ShieldAlert className="w-4 h-4 text-red-600" />
          PROTOCOL ESCALATION STAGE 4
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-red-900">
          Last-Option Emergency Sharing
        </h1>
      </div>

      <Card className="border-surface-300">
        <CardHeader className="bg-surface-50/70 border-b border-surface-200">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-surface-800 font-mono">
            Clinical Override Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          {/* Situation Details */}
          <div className="space-y-2 text-xs font-mono bg-surface-50 p-4 rounded-lg border border-surface-200">
            <div className="flex justify-between">
              <span className="text-surface-500">Emergency Request:</span>
              <strong className="text-surface-900">4 B+ RBC Units (Victoria Trauma ICU)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-500">Selected Source:</span>
              <strong className="text-surface-900">City Blood Bank</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-500">Current Stock:</span>
              <strong className="text-surface-900">10 units (Protected: 6)</strong>
            </div>
            <div className="flex justify-between text-rose-700 font-bold">
              <span>Post-Transfer Stock:</span>
              <span>6 units (Breaches local 2-day buffer!)</span>
            </div>
          </div>

          {/* Authorization Check */}
          {approved ? (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 text-xs font-mono space-y-2 text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
              <strong className="block text-sm">EMERGENCY SHARING AUTHORIZED</strong>
              <p className="text-emerald-700 font-sans">
                Transfer dispatch order generated under Override Ticket #EM-9921. Volunteer donor replenishment protocol triggered.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/bank/overview')}
                className="mt-2 text-xs"
              >
                Return to Facility Overview
              </Button>
            </div>
          ) : (
            <div className="pt-2 space-y-3">
              <div className="text-[11px] text-surface-500 text-center font-mono">
                THIS ACTION CANNOT BE AUTONOMOUSLY EXECUTED BY AI OR SOFTWARE.
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => navigate(-1)}
                >
                  Cancel Override
                </Button>
                <Button
                  variant="danger"
                  isLoading={isAuthorizing}
                  className="flex-1 text-xs font-bold"
                  onClick={handleApprove}
                >
                  APPROVE EMERGENCY OVERRIDE
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
