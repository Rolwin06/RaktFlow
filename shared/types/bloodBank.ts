import type { FreshnessStatus } from './blood';

export type BankStatus = 'operational' | 'limited' | 'offline';

export interface BloodBank {
  id: string;
  name: string;
  shortName: string;
  type: 'government' | 'private' | 'ngo' | 'hospital';
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  status: BankStatus;
  operatingHours: string;
  lastConfirmedAt: string;
  confidenceScore: number;
  freshnessStatus: FreshnessStatus;
  totalUnits: number;
  createdAt: string;
  updatedAt: string;
}

export interface Hospital {
  id: string;
  name: string;
  shortName: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string;
  type: 'government' | 'private' | 'clinic';
}
