import React from 'react';
import { Users, HeartHandshake, PhoneCall, ShieldCheck, MapPin } from 'lucide-react';
import { seedDonors } from '@/data/seed/donors';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';

export const DonorsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-surface-900">
              Registered Donors & Outreach
            </h1>
            <span className="text-xs font-mono font-bold bg-surface-100 text-surface-800 border border-surface-200 px-2.5 py-0.5 rounded-full">
              Volunteer Registry
            </span>
          </div>
          <p className="text-xs text-surface-500 mt-1">
            Zero-leak donor database. Personal phone numbers remain masked; communication triggers through synthetic IVR bridges.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="bg-white p-3.5 rounded-lg border border-surface-200">
          <span className="text-[10px] uppercase text-surface-500 block">Registered Donors</span>
          <div className="text-xl font-bold text-surface-900 mt-1">{seedDonors.length} Volunteers</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-surface-200">
          <span className="text-[10px] uppercase text-emerald-700 block">Available Right Now</span>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            {seedDonors.filter((d) => d.availability === 'available').length} Donors
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-surface-200">
          <span className="text-[10px] uppercase text-surface-500 block">Active Alerts</span>
          <div className="text-xl font-bold text-surface-900 mt-1">8 Sent</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-surface-200">
          <span className="text-[10px] uppercase text-indigo-700 block">Response Rate</span>
          <div className="text-xl font-bold text-indigo-600 mt-1">25.0%</div>
        </div>
      </div>

      {/* Donors Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-surface-700 font-mono">
            Volunteer Donor Records
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {seedDonors.map((donor) => (
            <div
              key={donor.id}
              className="p-3.5 rounded-lg border border-surface-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <BloodGroupBadge group={donor.bloodGroup} size="sm" />
                <div>
                  <strong className="text-surface-900 font-bold block">{donor.anonymousId}</strong>
                  <span className="text-surface-500 font-mono text-[11px]">
                    Eligible for: {donor.eligibleComponents.join(', ')} · Masked ID: {donor.maskedPhone}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono ${
                    donor.availability === 'available'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-surface-100 text-surface-600'
                  }`}
                >
                  {donor.availability === 'available' ? '● AVAILABLE' : donor.availability.toUpperCase()}
                </span>
                <span className="text-surface-500 font-mono text-[11px]">{donor.distanceKm || 3.2} km</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
