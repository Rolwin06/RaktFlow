import { RBC_COMPATIBILITY, PLATELET_COMPATIBILITY } from '@/types/blood';
import type { BloodGroup, BloodComponent } from '@/types/blood';

/**
 * Validates biological blood compatibility between donor and recipient
 */
export function isCompatible(
  donorGroup: BloodGroup,
  recipientGroup: BloodGroup,
  component: BloodComponent
): boolean {
  if (component === 'RBC' || component === 'Whole Blood') {
    const validDonors = RBC_COMPATIBILITY[recipientGroup] || [];
    return validDonors.includes(donorGroup);
  }

  if (component === 'Platelets') {
    const validDonors = PLATELET_COMPATIBILITY[recipientGroup] || [];
    return validDonors.includes(donorGroup);
  }

  // Plasma has reversed rules: AB is universal donor, O is universal recipient
  if (component === 'Plasma') {
    const plasmaRules: Record<BloodGroup, BloodGroup[]> = {
      'O+':  ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
      'O-':  ['O-', 'A-', 'B-', 'AB-'],
      'A+':  ['A+', 'A-', 'AB+', 'AB-'],
      'A-':  ['A-', 'AB-'],
      'B+':  ['B+', 'B-', 'AB+', 'AB-'],
      'B-':  ['B-', 'AB-'],
      'AB+': ['AB+', 'AB-'],
      'AB-': ['AB-'],
    };
    return (plasmaRules[recipientGroup] || []).includes(donorGroup);
  }

  return donorGroup === recipientGroup;
}

/**
 * Returns all donor groups that are safe for the recipient
 */
export function getCompatibleDonorGroups(
  recipientGroup: BloodGroup,
  component: BloodComponent
): BloodGroup[] {
  if (component === 'RBC' || component === 'Whole Blood') {
    return RBC_COMPATIBILITY[recipientGroup] || [recipientGroup];
  }
  if (component === 'Platelets') {
    return PLATELET_COMPATIBILITY[recipientGroup] || [recipientGroup];
  }
  return [recipientGroup];
}
