export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export type BloodGroup = typeof BLOOD_GROUPS[number];

export const BLOOD_COMPONENTS = ['RBC', 'Platelets', 'Plasma', 'Whole Blood'] as const;
export type BloodComponent = typeof BLOOD_COMPONENTS[number];

export const RBC_COMPATIBILITY: Record<BloodGroup, BloodGroup[]> = {
  'A+':  ['A+', 'A-', 'O+', 'O-'],
  'A-':  ['A-', 'O-'],
  'B+':  ['B+', 'B-', 'O+', 'O-'],
  'B-':  ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+':  ['O+', 'O-'],
  'O-':  ['O-'],
};

export const PLATELET_COMPATIBILITY: Record<BloodGroup, BloodGroup[]> = {
  'A+':  ['A+', 'A-', 'O+', 'O-'],
  'A-':  ['A-', 'O-'],
  'B+':  ['B+', 'B-', 'O+', 'O-'],
  'B-':  ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+':  ['O+', 'O-'],
  'O-':  ['O-'],
};

export const COMPONENT_SHELF_LIFE: Record<BloodComponent, number> = {
  'RBC': 42,
  'Platelets': 5,
  'Plasma': 365,
  'Whole Blood': 35,
};

export const URGENCY_LEVELS = ['routine', 'urgent', 'emergency', 'critical'] as const;
export type UrgencyLevel = typeof URGENCY_LEVELS[number];

export const FRESHNESS_STATUSES = ['fresh', 'aging', 'stale', 'confirmation_required'] as const;
export type FreshnessStatus = typeof FRESHNESS_STATUSES[number];

export const STOCK_STATUSES = ['critical', 'warning', 'healthy', 'high'] as const;
export type StockStatus = typeof STOCK_STATUSES[number];
