import { FRESHNESS_THRESHOLDS, CONFIDENCE_DECAY_PER_HOUR, BASE_CONFIDENCE } from '@/app/constants';
import type { FreshnessStatus } from '@/types/blood';

/**
 * Calculates current freshness status given the last stock confirmation timestamp
 */
export function calculateFreshnessStatus(lastConfirmedAt: string): FreshnessStatus {
  const lastTime = new Date(lastConfirmedAt).getTime();
  const now = Date.now();
  const elapsedHours = (now - lastTime) / (1000 * 60 * 60);

  if (elapsedHours < FRESHNESS_THRESHOLDS.fresh) {
    return 'fresh';
  }
  if (elapsedHours < FRESHNESS_THRESHOLDS.aging) {
    return 'aging';
  }
  if (elapsedHours < FRESHNESS_THRESHOLDS.confirmationRequired) {
    return 'stale';
  }
  return 'confirmation_required';
}

/**
 * Calculates dynamic confidence score (0–100) decaying with time since confirmation
 */
export function calculateConfidenceScore(lastConfirmedAt: string): number {
  const lastTime = new Date(lastConfirmedAt).getTime();
  const now = Date.now();
  const elapsedHours = Math.max(0, (now - lastTime) / (1000 * 60 * 60));

  // Base confidence decays over time
  const penalty = elapsedHours * CONFIDENCE_DECAY_PER_HOUR;
  const score = Math.round(Math.max(20, Math.min(100, BASE_CONFIDENCE - penalty)));
  return score;
}

/**
 * Returns hours elapsed since last confirmation
 */
export function getElapsedHoursSinceConfirmation(lastConfirmedAt: string): number {
  const lastTime = new Date(lastConfirmedAt).getTime();
  const now = Date.now();
  return Math.max(0, Math.round(((now - lastTime) / (1000 * 60 * 60)) * 10) / 10);
}
