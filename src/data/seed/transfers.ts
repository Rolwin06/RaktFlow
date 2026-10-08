import type { Transfer } from '@/types/transfer';

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60 * 1000).toISOString();

export const seedTransfers: Transfer[] = [
  {
    id: 'trf-001',
    sourceBankId: 'bank-001',
    sourceBankName: 'City Blood Bank',
    destinationBankId: 'bank-002',
    destinationBankName: 'District Blood Centre',
    bloodGroup: 'B+',
    component: 'Platelets',
    units: 3,
    status: 'recommended',
    distanceKm: 6.2,
    etaMinutes: 18,
    reason: 'Projected surplus at source (expires in 18h) + critical recipient shortage (0.24 days stock)',
    sourceExpiryHours: 18,
    recipientDaysOfStock: 0.24,
    isEmergency: false,
    requiresApproval: true,
    timeline: [
      {
        status: 'recommended',
        timestamp: minutesAgo(20),
        note: 'Greedy redistribution engine flagged surplus/shortage imbalance',
      },
    ],
    createdAt: minutesAgo(20),
    updatedAt: minutesAgo(20),
  },
  {
    id: 'trf-002',
    sourceBankId: 'bank-005',
    sourceBankName: 'Red Cross Blood Bank',
    destinationBankId: 'bank-004',
    destinationBankName: 'Hope Foundation Blood Bank',
    bloodGroup: 'O+',
    component: 'RBC',
    units: 5,
    status: 'in_transit',
    distanceKm: 21.4,
    etaMinutes: 38,
    reason: 'High stock rebalance to regional coverage outpost',
    sourceExpiryHours: 336,
    recipientDaysOfStock: 1.4,
    isEmergency: false,
    requiresApproval: false,
    approvedBy: 'Auto-Network Protocol',
    timeline: [
      {
        status: 'recommended',
        timestamp: hoursAgo(2),
        note: 'Scheduled regional rebalance',
      },
      {
        status: 'approved',
        timestamp: hoursAgo(1.5),
        note: 'Approved by Dispatcher',
      },
      {
        status: 'reserved',
        timestamp: hoursAgo(1.4),
        note: '5 units reserved in Red Cross Bank inventory',
      },
      {
        status: 'in_transit',
        timestamp: minutesAgo(30),
        note: 'Courier en route via cold-chain transit #KA-04-TR-912',
      },
    ],
    createdAt: hoursAgo(2),
    updatedAt: minutesAgo(30),
  },
];
