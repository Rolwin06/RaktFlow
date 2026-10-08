export interface NetworkMetrics {
  totalBanks: number;
  operationalBanks: number;
  totalUnits: number;
  lowStockAlerts: number;
  expiringSoon: number;
  activeRequests: number;
  pendingTransfers: number;
  averageMatchTimeMinutes: number;
  unitsSaved: number;
  requestsFulfilled: number;
  predictedShortages: number;
  transfersCompleted: number;
  donorResponses: number;
  freshInventoryPercent: number;
  staleInventoryCount: number;
  wastagePrevented: number;
  averageConfirmationAgeMinutes: number;
}

export interface ShortagePrediction {
  bankId: string;
  bankName: string;
  bloodGroup: string;
  component: string;
  currentStock: number;
  daysOfStock: number;
  predictedShortageHours: number;
  demandTrend: number;
  recommendedAction: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
