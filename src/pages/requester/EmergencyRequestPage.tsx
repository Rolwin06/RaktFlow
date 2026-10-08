import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { BLOOD_GROUPS, BLOOD_COMPONENTS, URGENCY_LEVELS } from '@/types/blood';
import type { BloodGroup, BloodComponent, UrgencyLevel } from '@/types/blood';
import { seedHospitals } from '@/data/seed/hospitals';
import { useNetworkStore } from '@/store/networkStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useRequestStore } from '@/store/requestStore';
import { evaluateAllocationSources } from '@/features/allocation/allocationEngine';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export const EmergencyRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { bloodBanks } = useNetworkStore();
  const { inventory } = useInventoryStore();
  const { createRequest, setCurrentOffers } = useRequestStore();

  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('B+');
  const [component, setComponent] = useState<BloodComponent>('Platelets');
  const [unitsNeeded, setUnitsNeeded] = useState<number>(2);
  const [urgency, setUrgency] = useState<UrgencyLevel>('emergency');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('hosp-001');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedHospital = seedHospitals.find((h) => h.id === selectedHospitalId) || seedHospitals[0];

  const handleFindBlood = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
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

      const offers = evaluateAllocationSources(newReq, bloodBanks, inventory);
      setCurrentOffers(offers);

      setIsSubmitting(false);
      navigate(`/request/results`);
    }, 300);
  };

  return (
    <div className="max-w-xl mx-auto py-6">
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-500 hover:text-surface-900 mb-4 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <Card className="shadow-sm border-surface-200">
        <div className="p-6 border-b border-surface-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-surface-900">Emergency Blood Request</h1>
            <p className="text-xs text-surface-500">Searches 8 blood banks within 50 km instantly</p>
          </div>
        </div>

        <CardContent className="p-6">
          <form onSubmit={handleFindBlood} className="space-y-5">
            {/* Blood Group */}
            <div>
              <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-2">
                1. Select Blood Group
              </label>
              <div className="grid grid-cols-4 gap-2">
                {BLOOD_GROUPS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setBloodGroup(g)}
                    className={`py-2 text-sm font-bold rounded-lg border transition-all cursor-pointer font-mono ${
                      bloodGroup === g
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-white text-surface-800 border-surface-200 hover:bg-surface-50'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Component */}
            <div>
              <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-2">
                2. Component Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Platelets', 'RBC'].map((comp) => (
                  <button
                    key={comp}
                    type="button"
                    onClick={() => setComponent(comp as BloodComponent)}
                    className={`py-2.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      component === comp
                        ? 'bg-surface-900 text-white border-surface-900'
                        : 'bg-white text-surface-700 border-surface-200 hover:bg-surface-50'
                    }`}
                  >
                    {comp === 'Platelets' ? 'Platelets (PLT)' : 'Red Blood Cells (RBC)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Units needed */}
            <div>
              <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-2">
                3. Quantity (Units)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setUnitsNeeded(num)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer font-mono ${
                      unitsNeeded === num
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white text-surface-700 border-surface-200 hover:bg-surface-50'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Destination */}
            <div>
              <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1.5">
                4. Receiving Hospital
              </label>
              <select
                value={selectedHospitalId}
                onChange={(e) => setSelectedHospitalId(e.target.value)}
                className="w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-xs font-semibold text-surface-900 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
              >
                {seedHospitals.map((hosp) => (
                  <option key={hosp.id} value={hosp.id}>
                    {hosp.name} ({hosp.address})
                  </option>
                ))}
              </select>
            </div>

            {/* Big Action Button */}
            <Button
              type="submit"
              size="lg"
              variant="primary"
              isLoading={isSubmitting}
              className="w-full text-sm font-bold py-3.5 shadow-md shadow-red-200 mt-2"
            >
              FIND BLOOD NOW →
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
