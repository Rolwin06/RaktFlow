// ──────────────────────────────────────────────
// Seed Data: Hospitals / Requesters
// ──────────────────────────────────────────────

import type { Hospital } from '@/types/bloodBank';

export const seedHospitals: Hospital[] = [
  {
    id: 'hosp-001',
    name: 'District General Hospital',
    shortName: 'District GH',
    address: '15 Victoria Road, Central Bangalore',
    city: 'Bangalore',
    latitude: 12.9680,
    longitude: 77.5990,
    phone: '+91 80 3333 1111',
    type: 'government',
  },
  {
    id: 'hosp-002',
    name: 'Apollo Hospitals',
    shortName: 'Apollo',
    address: '154/11 Bannerghatta Road',
    city: 'Bangalore',
    latitude: 12.8950,
    longitude: 77.5970,
    phone: '+91 80 3333 2222',
    type: 'private',
  },
  {
    id: 'hosp-003',
    name: 'Fortis Hospital',
    shortName: 'Fortis',
    address: '14 Cunningham Road',
    city: 'Bangalore',
    latitude: 12.9850,
    longitude: 77.5850,
    phone: '+91 80 3333 3333',
    type: 'private',
  },
  {
    id: 'hosp-004',
    name: 'Community Health Centre',
    shortName: 'CHC Yelahanka',
    address: '22 Yelahanka',
    city: 'Bangalore',
    latitude: 13.0950,
    longitude: 77.5900,
    phone: '+91 80 3333 4444',
    type: 'government',
  },
  {
    id: 'hosp-005',
    name: 'Narayana Health',
    shortName: 'Narayana',
    address: '258/A Bommasandra',
    city: 'Bangalore',
    latitude: 12.8140,
    longitude: 77.6930,
    phone: '+91 80 3333 5555',
    type: 'private',
  },
];
