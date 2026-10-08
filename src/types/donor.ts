// ──────────────────────────────────────────────
// Donor Entity
// ──────────────────────────────────────────────

import type { BloodGroup, BloodComponent } from './blood';

export type DonorAvailability = 'available' | 'unavailable' | 'busy' | 'unknown';

export interface Donor {
  id: string;
  anonymousId: string;           // e.g. "Donor #A192"
  bloodGroup: BloodGroup;
  eligibleComponents: BloodComponent[];
  latitude: number;
  longitude: number;
  distanceKm?: number;
  availability: DonorAvailability;
  lastDonationAt: string | null;
  isEligible: boolean;
  maskedPhone: string;           // e.g. "+91 ******421"
  createdAt: string;
}

export interface DonorResponse {
  id: string;
  donorId: string;
  requestId: string;
  response: 'accepted' | 'declined' | 'no_response';
  respondedAt: string | null;
  createdAt: string;
}

export interface DonorAlert {
  id: string;
  requestId: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  totalAlertsSent: number;
  totalResponses: number;
  availableDonors: number;
  status: 'active' | 'resolved' | 'expired';
  createdAt: string;
}
