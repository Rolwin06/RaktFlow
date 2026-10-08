import { describe, it, expect } from 'vitest';
import { calculateFefoScore, assessExpiryRisk, getHoursUntilExpiry } from '../../src/features/expiry/expiryEngine';

describe('Expiry Engine & FEFO Scoring', () => {
  it('correctly calculates remaining shelf life in hours', () => {
    const futureIso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const hours = getHoursUntilExpiry(futureIso);
    expect(hours).toBe(24);
  });

  it('assesses high expiry risk for platelets expiring within 24 hours', () => {
    const expiryIso = new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString();
    const risk = assessExpiryRisk(expiryIso, 'Platelets');
    expect(risk).toBe('high');
  });

  it('gives higher FEFO score to units expiring sooner to prioritize salvage', () => {
    const nearExpiryIso = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
    const freshExpiryIso = new Date(Date.now() + 120 * 60 * 60 * 1000).toISOString();

    const nearScore = calculateFefoScore(nearExpiryIso);
    const freshScore = calculateFefoScore(freshExpiryIso);

    expect(nearScore).toBeGreaterThan(freshScore);
  });
});
