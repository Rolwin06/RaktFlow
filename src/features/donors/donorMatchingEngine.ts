import { isCompatible } from '@/features/compatibility/compatibilityEngine';
import { calculateDistanceKm } from '@/utils/distance';
import type { Donor } from '@/types/donor';
import type { BloodGroup, BloodComponent } from '@/types/blood';

export interface DonorMatchResult {
  donor: Donor;
  distanceKm: number;
  isEligible: boolean;
  score: number;
}

/**
 * Identifies eligible nearby donors when network stock is depleted
 */
export function findEligibleDonors(
  requestLocation: { latitude: number; longitude: number },
  bloodGroup: BloodGroup,
  component: BloodComponent,
  donors: Donor[],
  maxRadiusKm: number = 15
): DonorMatchResult[] {
  const matches: DonorMatchResult[] = [];

  for (const donor of donors) {
    // 1. Biological check
    if (!isCompatible(donor.bloodGroup, bloodGroup, component)) {
      continue;
    }

    // 2. Component eligibility
    if (!donor.eligibleComponents.includes(component)) {
      continue;
    }

    // 3. Proximity check
    const distanceKm = calculateDistanceKm(
      requestLocation.latitude,
      requestLocation.longitude,
      donor.latitude,
      donor.longitude
    );

    if (distanceKm > maxRadiusKm) {
      continue;
    }

    // 4. Scoring: Availability (40%), Distance (30%), General eligibility (30%)
    let score = 0;
    if (donor.availability === 'available') score += 40;
    else if (donor.availability === 'unknown') score += 15;

    score += Math.max(0, Math.round((1 - distanceKm / maxRadiusKm) * 30));
    if (donor.isEligible) score += 30;

    matches.push({
      donor: {
        ...donor,
        distanceKm,
      },
      distanceKm,
      isEligible: donor.isEligible && donor.availability === 'available',
      score,
    });
  }

  // Sort highest score first, then closest distance
  return matches.sort((a, b) => b.score - a.score || a.distanceKm - b.distanceKm);
}
