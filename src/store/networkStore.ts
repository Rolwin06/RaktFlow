import { create } from 'zustand';
import { seedBloodBanks } from '@/data/seed/bloodBanks';
import type { BloodBank, BankStatus } from '@/types/bloodBank';

interface NetworkState {
  bloodBanks: BloodBank[];
  currentBankId: string;
  setCurrentBankId: (id: string) => void;
  confirmBankStock: (bankId: string) => void;
  setBankStatus: (bankId: string, status: BankStatus) => void;
  resetBanks: () => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  bloodBanks: seedBloodBanks,
  currentBankId: 'bank-001', // City Blood Bank by default

  setCurrentBankId: (id) => set({ currentBankId: id }),

  confirmBankStock: (bankId) => {
    set((state) => ({
      bloodBanks: state.bloodBanks.map((bank) => {
        if (bank.id === bankId) {
          return {
            ...bank,
            lastConfirmedAt: new Date().toISOString(),
            confidenceScore: 98,
            freshnessStatus: 'fresh',
          };
        }
        return bank;
      }),
    }));
  },

  setBankStatus: (bankId, status) => {
    set((state) => ({
      bloodBanks: state.bloodBanks.map((bank) =>
        bank.id === bankId ? { ...bank, status } : bank
      ),
    }));
  },

  resetBanks: () => set({ bloodBanks: seedBloodBanks }),
}));
