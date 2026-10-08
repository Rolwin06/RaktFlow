import type { FreshnessStatus, StockStatus, UrgencyLevel } from '@/types/blood';
import type { RequestStatus } from '@/types/request';
import type { TransferStatus } from '@/types/transfer';

export function getFreshnessBadge(status: FreshnessStatus): {
  label: string;
  dotColor: string;
  badgeClass: string;
} {
  switch (status) {
    case 'fresh':
      return {
        label: 'Fresh',
        dotColor: 'bg-emerald-500',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    case 'aging':
      return {
        label: 'Aging',
        dotColor: 'bg-amber-500',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    case 'stale':
      return {
        label: 'Stale',
        dotColor: 'bg-rose-500',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      };
    case 'confirmation_required':
      return {
        label: 'Verify Stock',
        dotColor: 'bg-red-600',
        badgeClass: 'bg-red-50 text-red-800 border-red-300 animate-pulse',
      };
  }
}

export function getStockStatusBadge(status: StockStatus): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case 'critical':
      return {
        label: 'Critical Shortage',
        badgeClass: 'bg-red-100 text-red-800 border-red-300 font-semibold',
      };
    case 'warning':
      return {
        label: 'Low Buffer',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      };
    case 'healthy':
      return {
        label: 'Healthy Supply',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      };
    case 'high':
      return {
        label: 'Surplus',
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
      };
  }
}

export function getUrgencyBadge(urgency: UrgencyLevel): {
  label: string;
  badgeClass: string;
} {
  switch (urgency) {
    case 'critical':
      return { label: 'CRITICAL', badgeClass: 'bg-red-600 text-white font-bold' };
    case 'emergency':
      return { label: 'EMERGENCY', badgeClass: 'bg-red-500 text-white font-semibold' };
    case 'urgent':
      return { label: 'URGENT', badgeClass: 'bg-amber-500 text-white font-medium' };
    case 'routine':
      return { label: 'Routine', badgeClass: 'bg-surface-200 text-surface-700' };
  }
}

export function getRequestStatusMeta(status: RequestStatus): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case 'created':
      return { label: 'Created', badgeClass: 'bg-surface-100 text-surface-700' };
    case 'searching':
      return { label: 'Evaluating Sources...', badgeClass: 'bg-blue-50 text-blue-700 animate-pulse' };
    case 'matched':
      return { label: 'Best Match Dispatched', badgeClass: 'bg-indigo-50 text-indigo-700' };
    case 'sent':
      return { label: 'Awaiting Bank Response', badgeClass: 'bg-amber-50 text-amber-700' };
    case 'accepted':
      return { label: 'Bank Accepted', badgeClass: 'bg-emerald-100 text-emerald-800 font-semibold' };
    case 'preparing':
      return { label: 'Preparing Units', badgeClass: 'bg-emerald-50 text-emerald-700' };
    case 'ready':
      return { label: 'Ready for Pickup', badgeClass: 'bg-teal-100 text-teal-800' };
    case 'collected':
    case 'completed':
      return { label: 'Fulfilled', badgeClass: 'bg-emerald-600 text-white' };
    case 'declined':
      return { label: 'Declined — Auto Escalating', badgeClass: 'bg-rose-100 text-rose-800' };
    case 'timeout':
      return { label: 'Timeout — Escalated', badgeClass: 'bg-orange-100 text-orange-800' };
    case 'escalated':
      return { label: 'Escalating to Next Source', badgeClass: 'bg-purple-50 text-purple-700' };
    case 'no_stock':
      return { label: 'Network Depleted — Donor Fallback', badgeClass: 'bg-red-700 text-white' };
    case 'cancelled':
      return { label: 'Cancelled', badgeClass: 'bg-surface-300 text-surface-700' };
  }
}

export function getTransferStatusMeta(status: TransferStatus): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case 'recommended':
      return { label: 'Recommended', badgeClass: 'bg-indigo-50 text-indigo-700 border border-indigo-200' };
    case 'pending_approval':
      return { label: 'Pending Approval', badgeClass: 'bg-amber-50 text-amber-800 border border-amber-300 font-medium' };
    case 'approved':
      return { label: 'Approved', badgeClass: 'bg-blue-100 text-blue-800' };
    case 'reserved':
      return { label: 'Stock Reserved', badgeClass: 'bg-sky-100 text-sky-800' };
    case 'in_transit':
      return { label: 'In Transit', badgeClass: 'bg-amber-100 text-amber-900 animate-pulse' };
    case 'received':
      return { label: 'Received', badgeClass: 'bg-emerald-100 text-emerald-800' };
    case 'completed':
      return { label: 'Completed', badgeClass: 'bg-emerald-700 text-white' };
    case 'rejected':
      return { label: 'Rejected', badgeClass: 'bg-rose-100 text-rose-800' };
    case 'cancelled':
      return { label: 'Cancelled', badgeClass: 'bg-surface-200 text-surface-600' };
  }
}
