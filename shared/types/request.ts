import type { BloodGroup, BloodComponent, UrgencyLevel, FreshnessStatus } from './blood';

export type RequestStatus =
  | 'created'
  | 'searching'
  | 'matched'
  | 'sent'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'collected'
  | 'completed'
  | 'declined'
  | 'timeout'
  | 'escalated'
  | 'no_stock'
  | 'cancelled';

export interface BloodRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterType: 'hospital' | 'clinic' | 'individual';
  bloodGroup: BloodGroup;
  component: BloodComponent;
  unitsNeeded: number;
  urgency: UrgencyLevel;
  latitude: number;
  longitude: number;
  location: string;
  status: RequestStatus;
  currentOfferId?: string;
  matchedBankId?: string;
  matchedBankName?: string;
  escalationHistory: EscalationStep[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface EscalationStep {
  bankId: string;
  bankName: string;
  status: 'sent' | 'accepted' | 'declined' | 'timeout';
  reason?: string;
  timestamp: string;
}

export interface RequestOffer {
  id: string;
  requestId: string;
  bankId: string;
  bankName: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  offeredUnits: number;
  rank: number;
  score: number;
  distanceKm: number;
  etaMinutes: number;
  transferableUnits: number;
  protectedUnits: number;
  sourceDaysOfStock: number;
  freshnessStatus: FreshnessStatus;
  confidenceScore: number;
  expiryRisk: 'low' | 'medium' | 'high';
  demandTrend: number;
  explanation: AllocationExplanation;
  status: 'pending' | 'sent' | 'accepted' | 'declined' | 'timeout' | 'cancelled';
  createdAt: string;
}

export interface AllocationExplanation {
  compatible: boolean;
  transferableUnits: number;
  sourceDaysOfStock: number;
  recipientDaysOfStock: number;
  freshnessMinutes: number;
  confidence: number;
  etaMinutes: number;
  expiryRisk: 'low' | 'medium' | 'high';
  reasons: string[];
  warnings: string[];
  hardConstraintsPassed: boolean;
}
