import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartHandshake,
  ArrowLeft,
  ShieldCheck,
  PhoneCall,
  CheckCircle2,
  Clock,
  MapPin,
  Send
} from 'lucide-react';
import { seedDonors } from '@/data/seed/donors';
import { findEligibleDonors } from '@/features/donors/donorMatchingEngine';
import { DEMO_CENTER } from '@/app/constants';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';

export const DonorFallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [alertSent, setAlertSent] = useState<string | null>(null);

  // Match synthetic B+ Platelet donors
  const matches = findEligibleDonors(
    { latitude: DEMO_CENTER.latitude, longitude: DEMO_CENTER.longitude },
    'B+',
    'Platelets',
    seedDonors,
    15
  );

  const handleContactDonor = (donorId: string) => {
    setAlertSent(donorId);
    setTimeout(() => {
      setAlertSent(null);
    }, 4000);
  };

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-500 hover:text-surface-900 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Request</span>
      </button>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl p-6 shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-200 mb-1">
          <HeartHandshake className="w-4 h-4" />
          Autonomous Donor Fallback Protocol
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Volunteer Donor Outreach
        </h1>


        <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-red-500/60 font-mono text-center">
          <div>
            <span className="text-[10px] text-red-200 uppercase">Alerts Dispatched</span>
            <span className="text-xl font-bold block">8 Sent</span>
          </div>
          <div>
            <span className="text-[10px] text-red-200 uppercase">Immediate Responses</span>
            <span className="text-xl font-bold block">2 Received</span>
          </div>
          <div>
            <span className="text-[10px] text-red-200 uppercase">Ready Donors</span>
            <span className="text-xl font-bold text-emerald-300 block">1 Available</span>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-surface-100 border border-surface-200 rounded-lg p-3 text-xs text-surface-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Zero-Leak Privacy:</strong> Donor telephone numbers and addresses remain cryptographically masked. Contact is facilitated through RaktFlow's IVR bridge.
          </span>
        </div>
      </div>

      {/* Donor Match List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-surface-500">
          ELIGIBLE NEARBY DONORS ({matches.length})
        </h3>

        {matches.map(({ donor, distanceKm, isEligible, score }) => (
          <Card key={donor.id} className="p-4 hover:border-surface-300 transition-colors bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center font-bold text-red-700 font-mono text-xs shrink-0">
                  {donor.bloodGroup}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-surface-900">{donor.anonymousId}</h4>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        donor.availability === 'available'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-surface-100 text-surface-600'
                      }`}
                    >
                      {donor.availability === 'available' ? '● Available Right Now' : donor.availability}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-surface-500 mt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-surface-400" />
                      {distanceKm} km away
                    </span>
                    <span>·</span>
                    <span className="text-surface-700 font-bold">{donor.maskedPhone}</span>
                    <span>·</span>
                    <span>Match Score: {score}/100</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                {alertSent === donor.id ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Automated Call Triggered
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant={donor.availability === 'available' ? 'primary' : 'outline'}
                    leftIcon={<PhoneCall className="w-3.5 h-3.5" />}
                    onClick={() => handleContactDonor(donor.id)}
                    disabled={donor.availability !== 'available'}
                  >
                    Contact via System
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
