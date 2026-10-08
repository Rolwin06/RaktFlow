// ──────────────────────────────────────────────
// Seed Data: Donors (synthetic, privacy-protected)
// ──────────────────────────────────────────────

import type { Donor } from '@/types/donor';

export const seedDonors: Donor[] = [
  { id: 'donor-001', anonymousId: 'Donor #A192', bloodGroup: 'B+', eligibleComponents: ['Platelets', 'RBC'], latitude: 12.9710, longitude: 77.6020, distanceKm: 2.8, availability: 'available', lastDonationAt: '2024-08-15T00:00:00Z', isEligible: true, maskedPhone: '+91 ******421', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'donor-002', anonymousId: 'Donor #B481', bloodGroup: 'B+', eligibleComponents: ['Platelets', 'RBC'], latitude: 12.9650, longitude: 77.6150, distanceKm: 4.1, availability: 'available', lastDonationAt: '2024-07-20T00:00:00Z', isEligible: true, maskedPhone: '+91 ******839', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'donor-003', anonymousId: 'Donor #C882', bloodGroup: 'B+', eligibleComponents: ['RBC'], latitude: 12.9820, longitude: 77.5800, distanceKm: 7.2, availability: 'unavailable', lastDonationAt: '2024-09-01T00:00:00Z', isEligible: true, maskedPhone: '+91 ******156', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'donor-004', anonymousId: 'Donor #D337', bloodGroup: 'B+', eligibleComponents: ['Platelets', 'RBC'], latitude: 12.9550, longitude: 77.6300, distanceKm: 5.5, availability: 'available', lastDonationAt: '2024-06-10T00:00:00Z', isEligible: true, maskedPhone: '+91 ******744', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'donor-005', anonymousId: 'Donor #E219', bloodGroup: 'O-', eligibleComponents: ['RBC', 'Platelets'], latitude: 12.9900, longitude: 77.5950, distanceKm: 3.4, availability: 'available', lastDonationAt: '2024-05-22T00:00:00Z', isEligible: true, maskedPhone: '+91 ******912', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'donor-006', anonymousId: 'Donor #F653', bloodGroup: 'O+', eligibleComponents: ['RBC'], latitude: 12.9400, longitude: 77.5700, distanceKm: 6.8, availability: 'busy', lastDonationAt: '2024-09-15T00:00:00Z', isEligible: false, maskedPhone: '+91 ******287', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'donor-007', anonymousId: 'Donor #G104', bloodGroup: 'A+', eligibleComponents: ['RBC', 'Platelets'], latitude: 13.0010, longitude: 77.6100, distanceKm: 4.8, availability: 'available', lastDonationAt: '2024-04-01T00:00:00Z', isEligible: true, maskedPhone: '+91 ******530', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'donor-008', anonymousId: 'Donor #H798', bloodGroup: 'B-', eligibleComponents: ['RBC'], latitude: 12.9300, longitude: 77.6400, distanceKm: 8.9, availability: 'unknown', lastDonationAt: null, isEligible: true, maskedPhone: '+91 ******615', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'donor-009', anonymousId: 'Donor #J456', bloodGroup: 'AB+', eligibleComponents: ['Platelets'], latitude: 12.9780, longitude: 77.5880, distanceKm: 2.1, availability: 'available', lastDonationAt: '2024-07-05T00:00:00Z', isEligible: true, maskedPhone: '+91 ******073', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'donor-010', anonymousId: 'Donor #K321', bloodGroup: 'O-', eligibleComponents: ['RBC', 'Platelets'], latitude: 12.9600, longitude: 77.5750, distanceKm: 5.0, availability: 'available', lastDonationAt: '2024-03-18T00:00:00Z', isEligible: true, maskedPhone: '+91 ******348', createdAt: '2024-01-01T00:00:00Z' },
];
