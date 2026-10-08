import React, { useState, useEffect, useMemo } from 'react';
import {
  PlusCircle,
  Database,
  Calendar,
  Layers,
  Activity,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { useNetworkStore } from '@/store/networkStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { upsertInventoryInDb } from '@/services/api/inventoryApi';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import { ComponentBadge } from '@/components/blood/ComponentBadge';
import type { BloodGroup, BloodComponent } from '@/types/blood';
import type { InventoryRecord } from '@/types/inventory';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMPONENTS: BloodComponent[] = ['RBC', 'Platelets', 'Plasma', 'Whole Blood'];

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultBankId?: string;
  defaultBloodGroup?: BloodGroup;
  defaultComponent?: BloodComponent;
}

export const AddInventoryModal: React.FC<AddInventoryModalProps> = ({
  isOpen,
  onClose,
  defaultBankId,
  defaultBloodGroup = 'A+',
  defaultComponent = 'RBC',
}) => {
  const { bloodBanks, currentBankId } = useNetworkStore();
  const { inventory, upsertRecord } = useInventoryStore();

  const activeBankId = defaultBankId || currentBankId || bloodBanks[0]?.id || 'bank-001';

  const [bankId, setBankId] = useState<string>(activeBankId);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(defaultBloodGroup);
  const [component, setComponent] = useState<BloodComponent>(defaultComponent);
  const [availableUnits, setAvailableUnits] = useState<number>(10);
  const [averageDailyUsage, setAverageDailyUsage] = useState<number>(2.5);
  const [averageDailyDonations, setAverageDailyDonations] = useState<number>(2.0);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Check if there is an existing inventory record for this bank + group + component combination
  const existingRecord = useMemo<InventoryRecord | undefined>(() => {
    return inventory.find(
      (item) => item.bankId === bankId && item.bloodGroup === bloodGroup && item.component === component
    );
  }, [inventory, bankId, bloodGroup, component]);

  // When bankId, bloodGroup or component changes, prefill values if existing record is found
  useEffect(() => {
    if (existingRecord) {
      setAvailableUnits(existingRecord.availableUnits);
      setAverageDailyUsage(existingRecord.averageDailyUsage);
      setAverageDailyDonations(existingRecord.averageDailyDonations);
      if (existingRecord.nearestExpiry) {
        setExpiryDate(new Date(existingRecord.nearestExpiry).toISOString().slice(0, 16));
      }
    } else {
      // Set sensible defaults for new item
      setAvailableUnits(10);
      setAverageDailyUsage(2.5);
      setAverageDailyDonations(2.0);
      const defaultExp = new Date();
      defaultExp.setDate(defaultExp.getDate() + (component === 'Platelets' ? 5 : 35));
      setExpiryDate(defaultExp.toISOString().slice(0, 16));
    }
  }, [existingRecord, component]);

  // Real-time calculated preview fields
  const calculatedProtected = Math.ceil(averageDailyUsage * 2 * 1.2);
  const calculatedTransferable = Math.max(0, availableUnits - calculatedProtected);
  const calculatedDaysOfStock =
    averageDailyUsage > 0 ? (availableUnits / averageDailyUsage).toFixed(1) : '0';
  const stockHealth =
    Number(calculatedDaysOfStock) < 1
      ? { label: 'CRITICAL', color: 'bg-red-100 text-red-800 border-red-200' }
      : Number(calculatedDaysOfStock) < 3
      ? { label: 'WARNING / LOW', color: 'bg-amber-100 text-amber-800 border-amber-200' }
      : Number(calculatedDaysOfStock) < 7
      ? { label: 'HEALTHY', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
      : { label: 'SURPLUS / HIGH', color: 'bg-blue-100 text-blue-800 border-blue-200' };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (availableUnits < 0) {
      setErrorMsg('Available units cannot be negative.');
      return;
    }
    if (averageDailyUsage < 0) {
      setErrorMsg('Average daily usage cannot be negative.');
      return;
    }

    setIsSubmitting(true);
    try {
      const nearestExpiry = expiryDate ? new Date(expiryDate).toISOString() : null;

      const record = await upsertInventoryInDb({
        bankId,
        bloodGroup,
        component,
        availableUnits: Number(availableUnits),
        averageDailyUsage: Number(averageDailyUsage),
        averageDailyDonations: Number(averageDailyDonations),
        nearestExpiry,
        existingId: existingRecord?.id,
      });

      if (record) {
        upsertRecord(record);
        setSuccessMsg(
          `Successfully saved ${bloodGroup} ${component} stock (${record.availableUnits} units) to Supabase & Live Ledger.`
        );
        setTimeout(() => {
          onClose();
          setSuccessMsg(null);
        }, 1200);
      } else {
        setErrorMsg('Failed to persist inventory record to database.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save inventory';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAdd = (delta: number) => {
    setAvailableUnits((prev) => Math.max(0, prev + delta));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Blood Bank Inventory Management"
      description="Add or update live blood stock. Changes are synced with Supabase and the live ledger in real time."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Status Messages */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-800 font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Existing Record Indicator Banner */}
        <div
          className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
            existingRecord
              ? 'bg-amber-50/70 border-amber-200/80 text-amber-900'
              : 'bg-surface-50 border-surface-200 text-surface-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <RefreshCw
              className={`w-4 h-4 ${existingRecord ? 'text-amber-600' : 'text-surface-400'}`}
            />
            <span>
              {existingRecord ? (
                <>
                  Updating existing ledger entry: <strong className="font-mono">{existingRecord.id}</strong>
                </>
              ) : (
                'Creating new stock entry for this bank and blood group'
              )}
            </span>
          </div>
          {existingRecord && (
            <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold font-mono text-[10px]">
              Current: {existingRecord.availableUnits} units
            </span>
          )}
        </div>

        {/* Facility & Blood Bank Selector */}
        <div>
          <label className="block text-xs font-semibold text-surface-700 mb-1.5">
            Target Blood Bank Facility
          </label>
          <select
            value={bankId}
            onChange={(e) => setBankId(e.target.value)}
            className="w-full text-xs bg-white border border-surface-300 rounded-lg px-3 py-2 text-surface-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 font-medium"
          >
            {bloodBanks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.name} ({bank.shortName}) — {bank.city}
              </option>
            ))}
          </select>
        </div>

        {/* Blood Group Selection */}
        <div>
          <label className="block text-xs font-semibold text-surface-700 mb-1.5">
            Blood Group
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {BLOOD_GROUPS.map((group) => {
              const isSelected = bloodGroup === group;
              return (
                <button
                  key={group}
                  type="button"
                  onClick={() => setBloodGroup(group)}
                  className={`py-2 px-1 rounded-lg text-xs font-bold font-mono transition-all border text-center cursor-pointer ${
                    isSelected
                      ? 'bg-red-600 text-white border-red-700 shadow-xs ring-2 ring-red-400/30'
                      : 'bg-white text-surface-700 border-surface-200 hover:bg-surface-50 hover:border-surface-300'
                  }`}
                >
                  {group}
                </button>
              );
            })}
          </div>
        </div>

        {/* Component Selection */}
        <div>
          <label className="block text-xs font-semibold text-surface-700 mb-1.5">
            Component Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {COMPONENTS.map((comp) => {
              const isSelected = component === comp;
              return (
                <button
                  key={comp}
                  type="button"
                  onClick={() => setComponent(comp)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all border text-center cursor-pointer ${
                    isSelected
                      ? 'bg-surface-900 text-white border-surface-900 shadow-xs'
                      : 'bg-white text-surface-700 border-surface-200 hover:bg-surface-50'
                  }`}
                >
                  {comp}
                </button>
              );
            })}
          </div>
        </div>

        {/* Units Configuration */}
        <div className="p-4 bg-surface-50 rounded-xl border border-surface-200 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-surface-800">
                Physical Available Units in Cold Storage
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleQuickAdd(-5)}
                  className="px-2 py-0.5 text-[11px] font-mono font-semibold bg-white border border-surface-300 rounded hover:bg-surface-100 text-surface-700 cursor-pointer"
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdd(-1)}
                  className="px-2 py-0.5 text-[11px] font-mono font-semibold bg-white border border-surface-300 rounded hover:bg-surface-100 text-surface-700 cursor-pointer"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdd(1)}
                  className="px-2 py-0.5 text-[11px] font-mono font-semibold bg-white border border-surface-300 rounded hover:bg-surface-100 text-surface-700 cursor-pointer"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdd(5)}
                  className="px-2 py-0.5 text-[11px] font-mono font-semibold bg-white border border-surface-300 rounded hover:bg-surface-100 text-surface-700 cursor-pointer"
                >
                  +5
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdd(10)}
                  className="px-2 py-0.5 text-[11px] font-mono font-semibold bg-white border border-surface-300 rounded hover:bg-surface-100 text-surface-700 cursor-pointer"
                >
                  +10
                </button>
              </div>
            </div>
            <input
              type="number"
              min="0"
              value={availableUnits}
              onChange={(e) => setAvailableUnits(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full text-base font-mono font-bold bg-white border border-surface-300 rounded-lg px-3.5 py-2 text-surface-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-surface-700 mb-1">
                Avg Daily Usage (units/day)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={averageDailyUsage}
                onChange={(e) => setAverageDailyUsage(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full text-xs font-mono bg-white border border-surface-300 rounded-lg px-3 py-1.5 text-surface-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-surface-700 mb-1">
                Avg Daily Donations (units/day)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={averageDailyDonations}
                onChange={(e) => setAverageDailyDonations(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full text-xs font-mono bg-white border border-surface-300 rounded-lg px-3 py-1.5 text-surface-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-surface-700 mb-1">
              Nearest Unit Expiry Date & Time
            </label>
            <input
              type="datetime-local"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full text-xs font-mono bg-white border border-surface-300 rounded-lg px-3 py-1.5 text-surface-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
            />
          </div>
        </div>

        {/* Live Mathematical Projection & Guardrail Preview */}
        <div className="p-3.5 bg-surface-900 text-white rounded-xl space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-surface-400 uppercase tracking-wider font-mono text-[10px] font-bold">
              Autonomous Reserve Calculation
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${stockHealth.color}`}
            >
              {stockHealth.label}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
            <div className="p-2 bg-surface-800/80 rounded border border-surface-700">
              <span className="text-surface-400 text-[10px] block">Protected Units</span>
              <span className="text-sm font-bold text-amber-400 mt-0.5 block">
                {calculatedProtected}
              </span>
            </div>
            <div className="p-2 bg-surface-800/80 rounded border border-surface-700">
              <span className="text-surface-400 text-[10px] block">Safe Transferable</span>
              <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
                {calculatedTransferable}
              </span>
            </div>
            <div className="p-2 bg-surface-800/80 rounded border border-surface-700">
              <span className="text-surface-400 text-[10px] block">Days Coverage</span>
              <span className="text-sm font-bold text-blue-300 mt-0.5 block">
                {calculatedDaysOfStock}d
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-surface-200">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            leftIcon={
              isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Database className="w-4 h-4" />
              )
            }
          >
            {isSubmitting
              ? 'Synchronizing...'
              : existingRecord
              ? 'Update & Sync to Supabase'
              : 'Add Stock & Sync to Supabase'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
