import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  ShieldCheck,
  Send,
  Info,
  ChevronDown,
  ChevronUp,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { useRequestStore } from '@/store/requestStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useNetworkStore } from '@/store/networkStore';
import { evaluateAllocationSources } from '@/features/allocation/allocationEngine';
import type { RequestOffer } from '@/types/request';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import { ComponentBadge } from '@/components/blood/ComponentBadge';

export const MatchResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentRequest, currentOffers, setCurrentOffers, acceptOffer, declineOffer } = useRequestStore();
  const { bloodBanks } = useNetworkStore();
  const { inventory } = useInventoryStore();

  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);
  const [selectedOfferForDetail, setSelectedOfferForDetail] = useState<RequestOffer | null>(null);

  // If page reloaded without active state, generate evaluation for default request
  let offers = currentOffers;
  let request = currentRequest;

  if (!request || offers.length === 0) {
    const dummyReq = {
      id: 'req-demo',
      requesterId: 'hosp-001',
      requesterName: 'District General Hospital',
      requesterType: 'hospital' as const,
      bloodGroup: 'B+' as const,
      component: 'Platelets' as const,
      unitsNeeded: 2,
      urgency: 'emergency' as const,
      latitude: 12.9680,
      longitude: 77.5990,
      location: '15 Victoria Road, Central Bangalore',
      status: 'searching' as const,
      escalationHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    request = dummyReq;
    offers = evaluateAllocationSources(dummyReq, bloodBanks, inventory);
  }

  const recommendedOffer = offers.find((o) => o.explanation.hardConstraintsPassed) || offers[0];
  const otherOffers = offers.filter((o) => o.id !== recommendedOffer.id);

  const handleDispatchOffer = (offer: RequestOffer) => {
    acceptOffer(request!.id, offer);
    navigate(`/request/tracking`);
  };

  const handleSimulateDecline = (offer: RequestOffer) => {
    // Demonstrates automatic escalation
    declineOffer(request!.id, offer, 'Simulated bank decline to demonstrate escalation');
    navigate(`/request/tracking`);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-200/80 pb-4">
        <div>
          <button
            onClick={() => navigate('/request/new')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-500 hover:text-surface-900 mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>New Search</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-surface-900">
              {request.unitsNeeded} {request.bloodGroup} {request.component.toUpperCase()} UNITS
            </h1>
            <BloodGroupBadge group={request.bloodGroup} size="sm" />
            <ComponentBadge component={request.component} size="sm" />
          </div>
          <p className="text-xs text-surface-500 mt-0.5">
            Evaluated {bloodBanks.length} connected blood banks within 50 km · Destination: {request.requesterName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2.5 py-1 bg-surface-100 rounded border border-surface-200 text-surface-600">
            Latency: <strong className="text-emerald-600">0.84s</strong>
          </span>
          <span className="text-xs font-mono px-2.5 py-1 bg-surface-100 rounded border border-surface-200 text-surface-600">
            Hard Constraints: <strong className="text-surface-900">Active</strong>
          </span>
        </div>
      </div>

      {/* RaktFlow Core Principle Callout */}
      <div className="bg-surface-900 text-white rounded-lg p-3.5 flex items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>RaktFlow Optimization Principle:</strong> Do not simply find the nearest blood. Find the safest, most useful source for the entire network.
          </span>
        </div>
        <span className="text-[11px] text-surface-400 shrink-0 hidden sm:inline">
          FEFO + Buffer Protection
        </span>
      </div>

      {/* #1 RECOMMENDED SOURCE CARD (Highlighted) */}
      {recommendedOffer && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              #1 HIGHEST RANKED SOURCE
            </span>
            <span className="text-xs font-mono text-surface-500">
              Composite Score: <strong className="text-emerald-700">{recommendedOffer.score}/100</strong>
            </span>
          </div>

          <Card className="border-2 border-emerald-500 shadow-md overflow-hidden bg-white">
            <div className="bg-emerald-50/80 px-5 py-3 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-emerald-600 text-white">
                  OPTIMAL MATCH
                </span>
                <span className="text-sm font-bold text-surface-900">
                  {recommendedOffer.bankName}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono text-surface-700">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-surface-500" />
                  {recommendedOffer.distanceKm} km away
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-surface-500" />
                  ETA: <strong>{recommendedOffer.etaMinutes} min</strong>
                </span>
              </div>
            </div>

            <CardContent className="p-5 space-y-4">
              {/* Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-50 p-3 rounded-lg border border-surface-200/80 font-mono text-xs">
                <div>
                  <span className="text-surface-500 text-[11px] block">Transferable Stock</span>
                  <span className="text-base font-bold text-emerald-700">
                    {recommendedOffer.transferableUnits} units
                  </span>
                </div>
                <div>
                  <span className="text-surface-500 text-[11px] block">Stock Confidence</span>
                  <span className="text-base font-bold text-surface-900">
                    {recommendedOffer.confidenceScore}% trust
                  </span>
                </div>
                <div>
                  <span className="text-surface-500 text-[11px] block">Source Supply Days</span>
                  <span className="text-base font-bold text-surface-900">
                    {recommendedOffer.sourceDaysOfStock} days
                  </span>
                </div>
                <div>
                  <span className="text-surface-500 text-[11px] block">FEFO Expiry Risk</span>
                  <span className="text-base font-bold text-amber-600">
                    Expires in 18h
                  </span>
                </div>
              </div>

              {/* WHY RECOMMENDED — Transparent Engine Reasoning */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-surface-700 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Why RaktFlow Recommends This Facility
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {recommendedOffer.explanation.reasons.map((reason, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 bg-emerald-50/50 border border-emerald-100 rounded p-2 text-surface-800"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-surface-100">
                <div className="text-xs text-surface-500">
                  Requesting will allocate <strong className="text-surface-900">{request.unitsNeeded} units</strong> and notify staff.
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSimulateDecline(recommendedOffer)}
                    className="text-xs text-rose-700 hover:bg-rose-50 border-rose-200"
                    title="Simulate bank declining to test automatic escalation"
                  >
                    Simulate Decline (Test Escalation)
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    leftIcon={<Send className="w-4 h-4" />}
                    onClick={() => handleDispatchOffer(recommendedOffer)}
                    className="font-bold flex-1 sm:flex-none shadow-sm"
                  >
                    REQUEST {request.unitsNeeded} UNITS
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* OTHER RANKED SOURCES */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-surface-500">
            OTHER SOURCES EVALUATED IN NETWORK ({otherOffers.length})
          </h3>
          <span className="text-[11px] text-surface-400">
            Penalties applied for stale data or low buffer
          </span>
        </div>

        <div className="space-y-3">
          {otherOffers.map((offer) => {
            const isExpanded = expandedOfferId === offer.id;
            const passed = offer.explanation.hardConstraintsPassed;

            return (
              <Card
                key={offer.id}
                className={`transition-all ${
                  !passed
                    ? 'opacity-70 bg-surface-50 border-dashed'
                    : 'bg-white hover:border-surface-300'
                }`}
              >
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-1 rounded shrink-0 ${
                        passed ? 'bg-surface-100 text-surface-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      #{offer.rank}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-surface-900">{offer.bankName}</h4>
                        {offer.freshnessStatus === 'stale' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                            🔴 Stale Inventory
                          </span>
                        )}
                        {!passed && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-200 text-surface-700">
                            Eliminated by Safety Constraint
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-surface-500 mt-1 font-mono">
                        <span>{offer.distanceKm} km away</span>
                        <span>·</span>
                        <span>ETA {offer.etaMinutes} min</span>
                        <span>·</span>
                        <span>{offer.transferableUnits} transferable units</span>
                        <span>·</span>
                        <span>{offer.confidenceScore}% confidence</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setExpandedOfferId(isExpanded ? null : offer.id)}
                      className="px-2.5 py-1.5 text-xs text-surface-600 bg-surface-100 hover:bg-surface-200 rounded font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <span>Why Ranked Here?</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {passed && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDispatchOffer(offer)}
                      >
                        Request
                      </Button>
                    )}
                  </div>
                </div>

                {/* Collapsible Explanations */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-surface-100 bg-surface-50/50 space-y-2 text-xs">
                    <div className="font-semibold text-surface-700">Evaluation Breakdown:</div>

                    {offer.explanation.warnings.map((warn, i) => (
                      <div key={i} className="flex items-center gap-2 text-rose-700 bg-rose-50/70 p-2 rounded">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{warn}</span>
                      </div>
                    ))}

                    {offer.explanation.reasons.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-surface-600 bg-white p-2 rounded border border-surface-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
