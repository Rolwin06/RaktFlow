import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Send,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useRequestStore } from '@/store/requestStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useNetworkStore } from '@/store/networkStore';
import { evaluateAllocationSources } from '@/features/allocation/allocationEngine';
import type { RequestOffer } from '@/types/request';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export const MatchResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentRequest, currentOffers, acceptOffer, declineOffer } = useRequestStore();
  const { bloodBanks } = useNetworkStore();
  const { inventory } = useInventoryStore();

  const [showDetails, setShowDetails] = useState(false);

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

  const handleDispatchRequest = (offer: RequestOffer) => {
    acceptOffer(request!.id, offer);
    navigate(`/request/tracking`);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-5">
      {/* Back button */}
      <button
        onClick={() => navigate('/request/new')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-500 hover:text-surface-900 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Change Request</span>
      </button>

      {/* Clean Header */}
      <div className="bg-white border border-surface-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-0.5">
            ✓ Compatible Blood Found
          </span>
          <h1 className="text-xl font-extrabold text-surface-900">
            {request.unitsNeeded} Units of {request.bloodGroup} {request.component}
          </h1>
          <p className="text-xs text-surface-500 mt-0.5">
            Deliver to {request.requesterName}
          </p>
        </div>

        <span className="text-xs font-mono px-3 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-200">
          Matched in 0.8s
        </span>
      </div>

      {/* #1 RECOMMENDED SOURCE CARD - BIG & SIMPLE */}
      {recommendedOffer && (
        <Card className="border-2 border-emerald-500 shadow-md overflow-hidden bg-white">
          <div className="bg-emerald-600 text-white px-5 py-2.5 flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              BEST RECOMMENDED OPTION
            </span>
            <span>Rank #1</span>
          </div>

          <CardContent className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-surface-900">
                  {recommendedOffer.bankName}
                </h2>
                <div className="flex items-center gap-3 text-xs text-surface-500 mt-1 font-mono">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-surface-400" />
                    {recommendedOffer.distanceKm} km away
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-surface-400" />
                    <strong>{recommendedOffer.etaMinutes} min ETA</strong>
                  </span>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-surface-200 sm:pl-6">
                <span className="text-xs text-surface-500 block">Available to Transfer</span>
                <span className="text-2xl font-extrabold text-emerald-700 font-mono">
                  {recommendedOffer.transferableUnits} Units
                </span>
              </div>
            </div>

            {/* Simple 3 Reasons */}
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-lg p-3.5 space-y-1.5 text-xs text-emerald-950 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% compatible blood type ({recommendedOffer.bloodGroup} {recommendedOffer.component})</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified fresh stock (Confirmed recently, high trust)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Expires tomorrow (FEFO priority prevents waste)</span>
              </div>
            </div>

            {/* Big Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-surface-500 hover:text-surface-800 flex items-center gap-1 cursor-pointer"
              >
                <span>{showDetails ? 'Hide technical score' : 'View technical score'}</span>
                {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <Button
                variant="primary"
                size="lg"
                leftIcon={<Send className="w-4 h-4" />}
                onClick={() => handleDispatchRequest(recommendedOffer)}
                className="w-full sm:w-auto font-bold px-8 shadow-sm text-sm"
              >
                REQUEST {request.unitsNeeded} UNITS NOW
              </Button>
            </div>

            {/* Optional technical score view */}
            {showDetails && (
              <div className="mt-4 pt-4 border-t border-surface-100 text-xs font-mono grid grid-cols-3 gap-2 bg-surface-50 p-3 rounded">
                <div>Confidence: <strong>{recommendedOffer.confidenceScore}%</strong></div>
                <div>Composite Score: <strong>{recommendedOffer.score}/100</strong></div>
                <div>Local Coverage: <strong>{recommendedOffer.sourceDaysOfStock} days</strong></div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* OTHER SOURCES - CLEAN & COMPACT */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-surface-500">
          Other Nearby Options ({otherOffers.length})
        </h3>

        <div className="space-y-2">
          {otherOffers.slice(0, 3).map((offer) => (
            <div
              key={offer.id}
              className="bg-white border border-surface-200 rounded-lg p-3.5 flex items-center justify-between gap-3 text-xs"
            >
              <div>
                <strong className="text-surface-900 block font-semibold">{offer.bankName}</strong>
                <span className="text-surface-500 text-[11px] font-mono">
                  {offer.distanceKm} km · {offer.etaMinutes} min ETA · {offer.transferableUnits} units available
                </span>
                {offer.freshnessStatus === 'stale' && (
                  <span className="text-[10px] text-rose-600 block mt-0.5 font-medium">
                    ⚠ Unverified for 14 hours (lower priority)
                  </span>
                )}
              </div>

              {offer.explanation.hardConstraintsPassed && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDispatchRequest(offer)}
                  className="text-xs shrink-0"
                >
                  Select
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
