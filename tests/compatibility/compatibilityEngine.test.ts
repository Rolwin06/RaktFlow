import { describe, it, expect } from 'vitest';
import { isCompatible, getCompatibleDonorGroups } from '../../src/features/compatibility/compatibilityEngine';

describe('Biological Compatibility Engine', () => {
  it('correctly validates RBC universal donors and recipients', () => {
    // O- can give to anyone
    expect(isCompatible('O-', 'B+', 'RBC')).toBe(true);
    expect(isCompatible('O-', 'AB+', 'RBC')).toBe(true);
    expect(isCompatible('O-', 'O-', 'RBC')).toBe(true);

    // AB+ can receive from anyone
    expect(isCompatible('A+', 'AB+', 'RBC')).toBe(true);
    expect(isCompatible('B-', 'AB+', 'RBC')).toBe(true);

    // Incompatible checks
    expect(isCompatible('A+', 'B+', 'RBC')).toBe(false);
    expect(isCompatible('B+', 'O+', 'RBC')).toBe(false);
    expect(isCompatible('O+', 'O-', 'RBC')).toBe(false);
  });

  it('correctly validates Platelet compatibility', () => {
    expect(isCompatible('B+', 'B+', 'Platelets')).toBe(true);
    expect(isCompatible('O+', 'B+', 'Platelets')).toBe(true);
    expect(isCompatible('A+', 'B+', 'Platelets')).toBe(false);
  });
});
