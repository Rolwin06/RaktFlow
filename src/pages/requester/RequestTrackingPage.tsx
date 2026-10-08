import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building,
  HeartHandshake
} from 'lucide-react';
import { useRequestStore } from '@/store/requestStore';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import { ComponentBadge } from '@/components/blood/ComponentBadge';
import { formatTimeAgo } from '@/utils/date';

export const RequestTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentRequest, requests } = useRequestStore();

  const req = currentRequest || requests[0];

  const steps = [
    { key: 'created', label: 'Request Broadcasted', desc: 'Evaluated 8 network nodes' },
    { key: 'matched', label: 'Source Accepted', desc: req.matchedBankName || 'City Blood Bank' },
    { key: 'preparing', label: 'Preparing Blood Units', desc: 'Cold storage retrieval & inspection' },
    { key: 'ready', label: 'Ready for Dispatch / Pickup', desc: 'Designated courier assigned' },
    { key: 'completed', label: 'Fulfilled & Logged', desc: 'Inventory deducted and audit verified' },
  ];

  const isAccepted = req.status === 'accepted' || req.status === 'preparing' || req.status === 'ready' || req.status === 'completed';
  const isNoStock = req.status === 'no_stock';

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      <button
        onClick={() => navigate('/request')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-500 hover:text-surface-900 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>All Requests</span>
      </button>

      <Card className="shadow-md">
        <CardHeader className="bg-surface-50/70 border-b border-surface-100 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-surface-500">REQUEST #{req.id}</span>
              <BloodGroupBadge group={req.bloodGroup} size="sm" />
              <ComponentBadge component={req.component} size="sm" />
            </div>
            <CardTitle className="text-lg font-bold text-surface-900">
              {req.unitsNeeded} Units for {req.requesterName}
            </CardTitle>
          </div>

          <div className="text-right">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                req.status === 'accepted'
                  ? 'bg-emerald-100 text-emerald-800'
                  : req.status === 'no_stock'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {req.status.toUpperCase()}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Timeline visualization */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-200">
            {steps.map((step, idx) => {
              const isPast =
                idx === 0 ||
                (idx === 1 && isAccepted) ||
                (idx === 2 && (req.status === 'preparing' || req.status === 'ready' || req.status === 'completed')) ||
                (idx >= 3 && req.status === 'completed');

              const isCurrent =
                (idx === 1 && req.status === 'accepted') ||
                (idx === 2 && req.status === 'preparing') ||
                (idx === 3 && req.status === 'ready');

              return (
                <div key={step.key} className="relative flex items-start gap-3">
                  <div
                    className={`absolute -left-6 mt-1 w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                      isPast
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-white border-red-600 animate-pulse'
                        : 'bg-white border-surface-300'
                    }`}
                  >
                    {isPast && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>

                  <div>
                    <h4
                      className={`text-sm font-bold ${
                        isCurrent ? 'text-red-600' : isPast ? 'text-surface-900' : 'text-surface-400'
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-xs text-surface-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ESCALATION HISTORY PANEL (Visual proof of autonomous fallback) */}
          {req.escalationHistory.length > 0 && (
            <div className="bg-surface-50 border border-surface-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-surface-800 uppercase tracking-wider">
                  Autonomous Escalation Trail
                </span>
                <span className="font-mono text-surface-500">
                  {req.escalationHistory.length} event(s)
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                {req.escalationHistory.map((step, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded bg-white border border-surface-200"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          step.status === 'accepted'
                            ? 'bg-emerald-500'
                            : step.status === 'declined'
                            ? 'bg-rose-500'
                            : 'bg-amber-500'
                        }`}
                      />
                      <span className="font-bold text-surface-900">{step.bankName}</span>
                      <span className="text-surface-500">({step.status})</span>
                    </div>
                    <span className="text-surface-400 text-[11px]">{formatTimeAgo(step.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NO STOCK / DONOR FALLBACK TRIGGER */}
          {isNoStock && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Network Inventory Depleted — Donor Fallback Active
              </div>
              <p className="text-xs text-rose-700">
                All 8 blood banks within 50 km are unable to fulfill this request. RaktFlow has activated nearby volunteer donor outreach.
              </p>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<HeartHandshake className="w-4 h-4" />}
                onClick={() => navigate('/request/donors')}
                className="w-full font-bold"
              >
                VIEW LIVE DONOR RESPONSES
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
