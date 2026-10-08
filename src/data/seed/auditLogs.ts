import type { AuditLogEntry } from '@/types/audit';

const now = new Date();
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60 * 1000).toISOString();

export const seedAuditLogs: AuditLogEntry[] = [
  {
    id: 'log-001',
    category: 'request',
    severity: 'info',
    action: 'EMERGENCY_REQUEST_CREATED',
    description: 'District General Hospital requested 2 units of B+ Platelets (Urgency: Emergency)',
    entityId: 'req-101',
    entityType: 'BloodRequest',
    timestamp: minutesAgo(10),
  },
  {
    id: 'log-002',
    category: 'system',
    severity: 'info',
    action: 'SOURCE_RANKING_EVALUATED',
    description: 'RaktFlow evaluated 8 banks within 50 km: City Blood Bank ranked #1 (Score: 92.4)',
    entityId: 'req-101',
    entityType: 'BloodRequest',
    timestamp: minutesAgo(9),
  },
  {
    id: 'log-003',
    category: 'request',
    severity: 'info',
    action: 'OFFER_DISPATCHED',
    description: 'Request dispatched to City Blood Bank for 2 B+ Platelet units',
    bankId: 'bank-001',
    bankName: 'City Blood Bank',
    timestamp: minutesAgo(8),
  },
  {
    id: 'log-004',
    category: 'transfer',
    severity: 'warning',
    action: 'SURPLUS_REDISTRIBUTION_RECOMMENDED',
    description: 'Recommended transfer: 3 units of B+ Platelets from City Blood Bank to District Blood Centre',
    entityId: 'trf-001',
    entityType: 'Transfer',
    timestamp: minutesAgo(20),
  },
  {
    id: 'log-005',
    category: 'confirmation',
    severity: 'warning',
    action: 'INVENTORY_STALE_PENALTY_APPLIED',
    description: 'LifeLine Blood Bank inventory unconfirmed for >14h; confidence score penalized to 54%',
    bankId: 'bank-003',
    bankName: 'LifeLine Blood Bank',
    timestamp: minutesAgo(60),
  },
  {
    id: 'log-006',
    category: 'inventory',
    severity: 'info',
    action: 'STOCK_RESERVED',
    description: '3 units O- RBC reserved for Apollo Hospitals critical trauma intake',
    bankId: 'bank-001',
    bankName: 'City Blood Bank',
    timestamp: minutesAgo(25),
  },
];
