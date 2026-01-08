import { apiClient } from './apiClient';

export interface DashboardStats {
  totalTransactions: number;
  matchedPercentage: number;
  exceptionsCount: number;
  settlementsPending: number;
  trends: {
    transactions: { value: number; isPositive: boolean };
    matchRate: { value: number; isPositive: boolean };
    exceptions: { value: number; isPositive: boolean };
    settlements: { value: number; isPositive: boolean };
  };
}

export interface DailyVarianceData {
  date: string;
  variance: number;
  threshold: number;
}

export interface PartnerPerformanceData {
  partner: string;
  matched: number;
  unmatched: number;
  exceptions: number;
}

export interface DashboardAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  actionLabel?: string;
}

export interface RecentBatchData {
  id: string;
  batchNumber: string;
  fileName: string;
  status: 'completed' | 'processing' | 'failed';
  recordsCount: number;
  matchedCount: number;
  exceptionsCount: number;
  processedAt: string;
  processingTime: number;
}

// Mock data generator for development
const generateMockStats = (): DashboardStats => ({
  totalTransactions: 125430,
  matchedPercentage: 92.5,
  exceptionsCount: 287,
  settlementsPending: 12,
  trends: {
    transactions: { value: 8.3, isPositive: true },
    matchRate: { value: 2.1, isPositive: true },
    exceptions: { value: 5.2, isPositive: false },
    settlements: { value: 3.5, isPositive: false },
  },
});

const generateMockVarianceData = (): DailyVarianceData[] => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day) => ({
    date: day,
    variance: Math.random() * 50000 + 10000,
    threshold: 45000,
  }));
};

const generateMockPartnerData = (): PartnerPerformanceData[] => [
  { partner: 'Bank A', matched: 1250, unmatched: 45, exceptions: 12 },
  { partner: 'Bank B', matched: 980, unmatched: 32, exceptions: 8 },
  { partner: 'Processor C', matched: 1450, unmatched: 58, exceptions: 15 },
  { partner: 'Gateway D', matched: 875, unmatched: 28, exceptions: 5 },
  { partner: 'PSP E', matched: 1100, unmatched: 41, exceptions: 9 },
];

const generateMockAlerts = (): DashboardAlert[] => [
  {
    id: '1',
    type: 'error',
    title: 'High Variance Detected',
    message: 'Daily variance exceeded threshold by $12,450. Immediate review required.',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    actionLabel: 'Review',
  },
  {
    id: '2',
    type: 'warning',
    title: 'Settlement Delay',
    message: 'Batch #1234 settlement is pending approval for 2+ hours.',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    actionLabel: 'Approve',
  },
  {
    id: '3',
    type: 'info',
    title: 'Scheduled Maintenance',
    message: 'System maintenance scheduled for tonight at 2:00 AM EST.',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
];

const generateMockRecentBatches = (): RecentBatchData[] => [
  {
    id: '1',
    batchNumber: 'BATCH-2026-0108-001',
    fileName: 'daily_transactions_20260108.csv',
    status: 'completed',
    recordsCount: 12450,
    matchedCount: 11890,
    exceptionsCount: 28,
    processedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    processingTime: 145,
  },
  {
    id: '2',
    batchNumber: 'BATCH-2026-0108-002',
    fileName: 'partner_settlements_20260108.xlsx',
    status: 'processing',
    recordsCount: 8920,
    matchedCount: 7850,
    exceptionsCount: 0,
    processedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    processingTime: 0,
  },
  {
    id: '3',
    batchNumber: 'BATCH-2026-0107-005',
    fileName: 'gl_postings_20260107.csv',
    status: 'completed',
    recordsCount: 5680,
    matchedCount: 5450,
    exceptionsCount: 12,
    processedAt: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
    processingTime: 98,
  },
  {
    id: '4',
    batchNumber: 'BATCH-2026-0107-004',
    fileName: 'wire_transfers_20260107.txt',
    status: 'failed',
    recordsCount: 3200,
    matchedCount: 0,
    exceptionsCount: 3200,
    processedAt: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    processingTime: 12,
  },
];

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    // In production: return apiClient.get<DashboardStats>('/dashboard/stats');
    await new Promise((resolve) => setTimeout(resolve, 800));
    return generateMockStats();
  },

  getDailyVariance: async (): Promise<DailyVarianceData[]> => {
    // In production: return apiClient.get<DailyVarianceData[]>('/dashboard/variance');
    await new Promise((resolve) => setTimeout(resolve, 600));
    return generateMockVarianceData();
  },

  getPartnerPerformance: async (): Promise<PartnerPerformanceData[]> => {
    // In production: return apiClient.get<PartnerPerformanceData[]>('/dashboard/partners');
    await new Promise((resolve) => setTimeout(resolve, 600));
    return generateMockPartnerData();
  },

  getAlerts: async (): Promise<DashboardAlert[]> => {
    // In production: return apiClient.get<DashboardAlert[]>('/dashboard/alerts');
    await new Promise((resolve) => setTimeout(resolve, 500));
    return generateMockAlerts();
  },

  getRecentBatches: async (): Promise<RecentBatchData[]> => {
    // In production: return apiClient.get<RecentBatchData[]>('/dashboard/recent-batches');
    await new Promise((resolve) => setTimeout(resolve, 700));
    return generateMockRecentBatches();
  },

  dismissAlert: async (alertId: string): Promise<void> => {
    // In production: return apiClient.delete(`/dashboard/alerts/${alertId}`);
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log(`Alert ${alertId} dismissed`);
  },
};
