import { describe, it, expect } from 'vitest';
import { calculateFreshnessStatus, calculateConfidenceScore } from '../../src/features/freshness/freshnessEngine';

describe('Freshness & Confidence Decay Engine', () => {
  it('assigns fresh status to inventory verified within 2 hours', () => {
    const recentIso = new Date(Date.now() - 30 * 60 * 1000).toISOString(); // 30 min ago
    expect(calculateFreshnessStatus(recentIso)).toBe('fresh');
  });

  it('assigns stale status to inventory unverified for 14 hours', () => {
    const staleIso = new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString();
    expect(calculateFreshnessStatus(staleIso)).toBe('stale');
  });

  it('decays confidence score over time', () => {
    const freshIso = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const oldIso = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();

    const freshConfidence = calculateConfidenceScore(freshIso);
    const oldConfidence = calculateConfidenceScore(oldIso);

    expect(freshConfidence).toBeGreaterThan(oldConfidence);
    expect(oldConfidence).toBeLessThan(70);
  });
});
