import type { InventoryRecord } from '@/types/inventory';

/**
 * Calculates hours until nearest expiry
 */
export function getHoursUntilExpiry(expiryIso: string | null): number | null {
  if (!expiryIso) return null;
  const expiry = new Date(expiryIso).getTime();
  const now = Date.now();
  return Math.round((expiry - now) / (1000 * 60 * 60));
}

/**
 * Assesses expiry risk level:
 * - 'high': unit expires in < 24 hours (or platelets expiring in < 36h)
 * - 'medium': unit expires in 24–72 hours
 * - 'low': > 72 hours
 */
export function assessExpiryRisk(
  expiryIso: string | null,
  component: string
): 'low' | 'medium' | 'high' {
  const hours = getHoursUntilExpiry(expiryIso);
  if (hours === null) return 'low';
  if (hours <= 0) return 'high';

  if (component === 'Platelets') {
    if (hours <= 24) return 'high';
    if (hours <= 48) return 'medium';
    return 'low';
  }

  // RBCs
  if (hours <= 48) return 'high';
  if (hours <= 120) return 'medium';
  return 'low';
}

/**
 * FEFO (First Expire, First Out) score: 0 to 1
 * Units expiring sooner receive higher prioritization to prevent biological waste,
 * PROVIDED safety constraints allow transit.
 */
export function calculateFefoScore(expiryIso: string | null): number {
  const hours = getHoursUntilExpiry(expiryIso);
  if (hours === null || hours <= 0) return 0.1;

  // If expiring within 24h, high score (0.9–1.0)
  if (hours <= 24) return 1.0;
  if (hours <= 48) return 0.85;
  if (hours <= 72) return 0.70;
  if (hours <= 168) return 0.50; // 1 week
  return 0.30;
}
