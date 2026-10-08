import { describe, it, expect } from 'vitest';
import { evaluateAllocationSources } from '../../src/features/allocation/allocationEngine';
import type { BloodBank } from '../../src/types/bloodBank';
import type { InventoryRecord } from '../../src/types/inventory';
import type { BloodRequest } from '../../src/types/request';

describe('RaktFlow Multi-Factor Allocation Engine', () => {
  const dummyRequest: BloodRequest = {
    id: 'req-test-1',
    requesterId: 'hosp-1',
    requesterName: 'Trauma Center',
    requesterType: 'hospital',
    bloodGroup: 'B+',
    component: 'Platelets',
    unitsNeeded: 2,
    urgency: 'emergency',
    latitude: 12.9716,
    longitude: 77.5946,
    location: 'Bangalore Central',
    status: 'searching',
    escalationHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const testBanks: BloodBank[] = [
    {
      id: 'bank-near-stale',
      name: 'Bank Near But Stale',
      shortName: 'Bank Near',
      type: 'private',
      address: '2km away',
      city: 'Bangalore',
      state: 'Karnataka',
      latitude: 12.9730,
      longitude: 77.5960,
      phone: '111',
      email: 'a@b.com',
      status: 'operational',
      operatingHours: '24/7',
      lastConfirmedAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(), // 15h ago -> stale!
      confidenceScore: 50,
      freshnessStatus: 'stale',
      totalUnits: 10,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'bank-far-fresh',
      name: 'Bank Far But Fresh & Expiring',
      shortName: 'Bank Far',
      type: 'government',
      address: '5km away',
      city: 'Bangalore',
      state: 'Karnataka',
      latitude: 13.0000,
      longitude: 77.6100,
      phone: '222',
      email: 'c@d.com',
      status: 'operational',
      operatingHours: '24/7',
      lastConfirmedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 min ago -> fresh!
      confidenceScore: 98,
      freshnessStatus: 'fresh',
      totalUnits: 8,
      createdAt: '',
      updatedAt: '',
    },
  ];

  const testInventory: InventoryRecord[] = [
    {
      id: 'inv-near-stale',
      bankId: 'bank-near-stale',
      bloodGroup: 'B+',
      component: 'Platelets',
      availableUnits: 10,
      reservedUnits: 0,
      protectedUnits: 5,
      transferableUnits: 5,
      averageDailyUsage: 3,
      averageDailyDonations: 3,
      daysOfStock: 3.3,
      stockStatus: 'healthy',
      freshnessStatus: 'stale',
      confidenceScore: 50,
      lastConfirmedAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
      nearestExpiry: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      expiringWithin24h: 0,
      expiringWithin48h: 0,
      demandTrend: 0,
      updatedAt: '',
    },
    {
      id: 'inv-far-fresh',
      bankId: 'bank-far-fresh',
      bloodGroup: 'B+',
      component: 'Platelets',
      availableUnits: 8,
      reservedUnits: 0,
      protectedUnits: 4,
      transferableUnits: 4,
      averageDailyUsage: 2.5,
      averageDailyDonations: 2.5,
      daysOfStock: 3.2,
      stockStatus: 'healthy',
      freshnessStatus: 'fresh',
      confidenceScore: 98,
      lastConfirmedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      nearestExpiry: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(), // 18h left -> FEFO priority!
      expiringWithin24h: 2,
      expiringWithin48h: 2,
      demandTrend: 5,
      updatedAt: '',
    },
  ];

  it('prioritizes fresh and near-expiry stock over nearer bank with stale inventory', () => {
    const offers = evaluateAllocationSources(dummyRequest, testBanks, testInventory);

    expect(offers.length).toBe(2);
    // Bank Far But Fresh must win Rank #1 due to FEFO salvage + high confidence score
    expect(offers[0].bankId).toBe('bank-far-fresh');
    expect(offers[0].rank).toBe(1);
    expect(offers[0].explanation.hardConstraintsPassed).toBe(true);

    // Bank Near must be lower ranked due to stale penalty
    expect(offers[1].bankId).toBe('bank-near-stale');
    expect(offers[1].rank).toBe(2);
  });

  it('eliminates banks with zero transferable stock through hard constraints', () => {
    const zeroTransferableBank: BloodBank = {
      ...testBanks[0],
      id: 'bank-zero',
      freshnessStatus: 'fresh',
      lastConfirmedAt: new Date().toISOString(),
    };
    const zeroTransferableInv: InventoryRecord = {
      ...testInventory[0],
      bankId: 'bank-zero',
      availableUnits: 4,
      protectedUnits: 4,
      transferableUnits: 0, // No transferable stock!
    };

    const offers = evaluateAllocationSources(dummyRequest, [zeroTransferableBank], [zeroTransferableInv]);
    expect(offers.length).toBe(1);
    expect(offers[0].explanation.hardConstraintsPassed).toBe(false);
    expect(offers[0].score).toBe(0);
  });
});
