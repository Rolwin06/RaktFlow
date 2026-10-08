import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, Sparkles, Building, LocateFixed } from 'lucide-react';
import { BLOOD_GROUPS, BLOOD_COMPONENTS, URGENCY_LEVELS } from '@/types/blood';
import type { BloodGroup, BloodComponent, UrgencyLevel } from '@/types/blood';
import { seedHospitals } from '@/data/seed/hospitals';
import { useNetworkStore } from '@/store/networkStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useRequestStore } from '@/store/requestStore';
import { evaluateAllocationSources } from '@/features/allocation/allocationEngine';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';

export const EmergencyRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { bloodBanks } = useNetworkStore();
  const { inventory } = useInventoryStore();
  const { createRequest, setCurrentOffers } = useRequestStore();

  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('B+');
  const [component, setComponent] = useState<BloodComponent>('Platelets');
  const [unitsNeeded, setUnitsNeeded] = useState<number>(2);
  const [urgency, setUrgency] = useState<UrgencyLevel>('emergency');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('hosp-001'); // District General Hospital
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedHospital = seedHospitals.find((h) => h.id === selectedHospitalId) || seedHospitals[0];

  const handleFindBlood = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      // 1. Create the request
      const newReq = createRequest({
        requesterId: selectedHospital.id,
        requesterName: selectedHospital.name,
        requesterType: 'hospital',
        bloodGroup,
        component,
        unitsNeeded,
        urgency,
        latitude: selectedHospital.latitude,
        longitude: selectedHospital.longitude,
        location: selectedHospital.address,
        status: 'searching',
      });

      // 2. Run deterministic multi-factor allocation ranking
      const offers = evaluateAllocationSources(newReq, bloodBanks, inventory);
      setCurrentOffers(offers);

      setIsSubmitting(false);
      navigate(`/request/results`);
    }, 400); // quick transition for tactile feedback
  };

  return (
    <div className="max-w-2xl mx-auto py-4">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-500 hover:text-surface-900 mb-4 cursor-pointer transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Portal</span>
      </button>

      <Card className="shadow-lg border-surface-300/80">
        <CardHeader className="bg-red-50/50 border-b border-red-100/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-red-200">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-surface-900">
                URGENT BLOOD REQUEST
              </CardTitle>
              <CardDescription className="text-xs text-surface-600">
                Direct emergency dispatch. No login wall. Autonomous 50 km source matching.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleFindBlood} className="space-y-5">
            {/* Component and Blood Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Component Needed"
                value={component}
                onChange={(e) => setComponent(e.target.value as BloodComponent)}
                options={BLOOD_COMPONENTS.map((c) => ({ value: c, label: c }))}
              />

              <Select
                label="Blood Group"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                options={BLOOD_GROUPS.map((g) => ({ value: g, label: `${g} Blood Type` }))}
              />
            </div>

            {/* Units & Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                  Quantity Required (Units)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setUnitsNeeded(num)}
                      className={`flex-1 py-2 text-xs font-mono font-bold rounded-md border transition-all cursor-pointer ${
                        unitsNeeded === num
                          ? 'bg-red-600 text-white border-red-600 shadow-xs'
                          : 'bg-surface-50 text-surface-700 border-surface-300 hover:bg-surface-100'
                      }`}
                    >
                      {num} {num === 1 ? 'unit' : 'units'}
                    </button>
                  ))}
                </div>
              </div>

              <Select
                label="Urgency Level"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                options={URGENCY_LEVELS.map((u) => ({
                  value: u,
                  label: u.toUpperCase(),
                }))}
              />
            </div>

            {/* Hospital / Delivery Location */}
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                Hospital / Destination
              </label>
              <div className="space-y-2">
                <select
                  value={selectedHospitalId}
                  onChange={(e) => setSelectedHospitalId(e.target.value)}
                  className="w-full rounded-md border border-surface-300 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-sans cursor-pointer"
                >
                  {seedHospitals.map((hosp) => (
                    <option key={hosp.id} value={hosp.id}>
                      {hosp.name} — {hosp.address}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2 text-xs text-surface-500 bg-surface-50 p-2.5 rounded border border-surface-200">
                  <LocateFixed className="w-4 h-4 text-surface-400 shrink-0" />
                  <span>
                    Coordinates: {selectedHospital.latitude.toFixed(4)}°N, {selectedHospital.longitude.toFixed(4)}°E (50 km grid anchor)
                  </span>
                </div>
              </div>
            </div>

            {/* Hint Box for Judges */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Hackathon Demo Default:</strong> Requesting{' '}
                <span className="font-mono font-bold">2 units of B+ Platelets</span> triggers RaktFlow's
                signature scenario, demonstrating why Bank C (10 units, stale) is deprioritized below Bank A (3 units, 18h expiry).
              </div>
            </div>

            {/* Submit CTA */}
            <Button
              type="submit"
              size="lg"
              variant="primary"
              isLoading={isSubmitting}
              className="w-full font-bold shadow-md shadow-red-200 text-sm py-3"
            >
              FIND BLOOD (EVALUATE NETWORK SOURCES)
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
