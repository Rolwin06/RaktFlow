// ──────────────────────────────────────────────
// Application Constants
// ──────────────────────────────────────────────

/** Network search radius in km */
export const NETWORK_RADIUS_KM = 50;

/** Protected stock protection window in days */
export const PROTECTION_WINDOW_DAYS = 2;

/** Safety buffer multiplier for protected stock */
export const SAFETY_BUFFER_MULTIPLIER = 1.2;

/** Freshness thresholds in hours */
export const FRESHNESS_THRESHOLDS = {
  fresh: 2,       // < 2 hours since confirmation
  aging: 8,       // 2–8 hours
  stale: 24,      // > 8 hours
  confirmationRequired: 48,
} as const;

/** Days-of-stock thresholds */
export const DAYS_OF_STOCK_THRESHOLDS = {
  critical: 1,
  warning: 3,
  healthy: 7,
} as const;

/** Confidence decay per hour since last confirmation */
export const CONFIDENCE_DECAY_PER_HOUR = 3;

/** Base confidence after fresh confirmation */
export const BASE_CONFIDENCE = 98;

/** Minimum confidence to be considered reliable */
export const MIN_CONFIDENCE_THRESHOLD = 50;

/** Request timeout in seconds before escalation */
export const REQUEST_TIMEOUT_SECONDS = 120;

/** Max escalation attempts before donor fallback */
export const MAX_ESCALATION_ATTEMPTS = 5;

/** Scoring weights for allocation ranking */
export const ALLOCATION_WEIGHTS = {
  expiryRisk: 0.20,
  surplus: 0.18,
  demand: 0.15,
  freshness: 0.15,
  confidence: 0.12,
  eta: 0.10,
  distance: 0.10,
} as const;

/** App roles */
export const ROLES = {
  requester: { label: 'Requester / Hospital', path: '/request' },
  bank: { label: 'Blood Bank', path: '/bank/overview' },
  admin: { label: 'Admin / Judge', path: '/admin/overview' },
} as const;

/** Demo simulation center coordinates (Bangalore, India) */
export const DEMO_CENTER = {
  latitude: 12.9716,
  longitude: 77.5946,
  city: 'Bangalore',
} as const;
