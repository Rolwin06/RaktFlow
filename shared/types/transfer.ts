import type { BloodGroup, BloodComponent } from './blood';

export type TransferStatus =
  | 'recommended'
  | 'pending_approval'
  | 'approved'
  | 'reserved'
  | 'in_transit'
  | 'received'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export interface Transfer {
  id: string;
  sourceBankId: string;
  sourceBankName: string;
  destinationBankId: string;
  destinationBankName: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  units: number;
  status: TransferStatus;
  distanceKm: number;
  etaMinutes: number;
  reason: string;
  sourceExpiryHours: number | null;
  recipientDaysOfStock: number;
  isEmergency: boolean;
  requiresApproval: boolean;
  approvedBy?: string;
  timeline: TransferTimelineStep[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface TransferTimelineStep {
  status: TransferStatus;
  timestamp: string;
  note?: string;
}

export interface TransferRecommendation {
  sourceBankId: string;
  sourceBankName: string;
  destinationBankId: string;
  destinationBankName: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  units: number;
  reason: string;
  sourceTransferable: number;
  sourceExpiry: number | null;
  recipientDaysOfStock: number;
  distanceKm: number;
  etaMinutes: number;
  score: number;
  expectedImpact: {
    unitsSaved: number;
    shortageRiskReduced: boolean;
    wastageReduced: number;
  };
}
