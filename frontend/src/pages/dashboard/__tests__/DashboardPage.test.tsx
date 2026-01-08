import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from '../DashboardPage';
import { dashboardService } from '@/services/dashboardService';

// Mock the dashboard service
vi.mock('@/services/dashboardService', () => ({
  dashboardService: {
    getStats: vi.fn(),
    getDailyVariance: vi.fn(),
    getPartnerPerformance: vi.fn(),
    getAlerts: vi.fn(),
    getRecentBatches: vi.fn(),
    dismissAlert: vi.fn(),
  },
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

const mockStats = {
  totalTransactions: 125430,
  matchedPercentage: 92.5,
  exceptionsCount: 287,
  settlementsPending: 12,
  trends: {
    transactions: { value: '8.3%', isPositive: true },
    matchRate: { value: '2.1%', isPositive: true },
    exceptions: { value: '3.2%', isPositive: false },
    settlements: { value: '1.5%', isPositive: false },
  },
};

const mockVarianceData = [
  { date: '2024-01-02', variance: 35000, threshold: 45000 },
  { date: '2024-01-03', variance: 42000, threshold: 45000 },
];

const mockPartnerData = [
  { partner: 'Bank A', matched: 15000, unmatched: 500, exceptions: 150 },
  { partner: 'Bank B', matched: 12000, unmatched: 300, exceptions: 100 },
];

const mockAlerts = [
  {
    id: '1',
    type: 'error' as const,
    title: 'High Variance Detected',
    message: 'Daily variance exceeded threshold',
    timestamp: new Date('2024-01-08T10:30:00'),
    actionLabel: 'Review',
  },
];

const mockBatches = [
  {
    id: 'batch-1',
    batchNumber: 'BATCH-2024-0108-001',
    status: 'completed' as const,
    uploadedAt: new Date('2024-01-08T10:30:00'),
    processedAt: new Date('2024-01-08T10:35:00'),
    recordCount: 1250,
    matchedCount: 1180,
    unmatchedCount: 45,
    exceptionCount: 25,
    processingTimeMs: 300000,
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BrowserRouter>
  );
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    (dashboardService.getStats as any).mockResolvedValue(mockStats);
    (dashboardService.getDailyVariance as any).mockResolvedValue(mockVarianceData);
    (dashboardService.getPartnerPerformance as any).mockResolvedValue(mockPartnerData);
    (dashboardService.getAlerts as any).mockResolvedValue(mockAlerts);
    (dashboardService.getRecentBatches as any).mockResolvedValue(mockBatches);
  });

  it('renders dashboard header', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(
      screen.getByText('Real-time overview of reconciliation operations')
    ).toBeInTheDocument();
  });

  it('renders all KPI cards with data', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Total Transactions')).toBeInTheDocument();
      expect(screen.getByText('125,430')).toBeInTheDocument();
    });

    expect(screen.getByText('Match Rate')).toBeInTheDocument();
    expect(screen.getByText('92.5%')).toBeInTheDocument();

    expect(screen.getByText('Active Exceptions')).toBeInTheDocument();
    expect(screen.getByText('287')).toBeInTheDocument();

    expect(screen.getByText('Pending Settlements')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('displays KPI trends', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('8.3%')).toBeInTheDocument();
      expect(screen.getByText('2.1%')).toBeInTheDocument();
    });
  });

  it('renders variance chart', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Daily Variance Trend')).toBeInTheDocument();
    });
  });

  it('renders partner performance chart', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Partner Performance')).toBeInTheDocument();
    });
  });

  it('renders alerts widget with alerts', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('High Variance Detected')).toBeInTheDocument();
      expect(screen.getByText('Daily variance exceeded threshold')).toBeInTheDocument();
    });
  });

  it('renders recent batches widget', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('BATCH-2024-0108-001')).toBeInTheDocument();
    });
  });

  it('calls refresh on refresh button click', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    // Services should be called again
    await waitFor(() => {
      expect(dashboardService.getStats).toHaveBeenCalled();
    });
  });

  it('renders upload data button', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    const uploadButton = screen.getByRole('button', { name: /upload data/i });
    expect(uploadButton).toBeInTheDocument();
  });

  it('renders quick action buttons', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Upload New File')).toBeInTheDocument();
    });

    expect(screen.getByText('Review Exceptions')).toBeInTheDocument();
    expect(screen.getByText('Pending Approvals')).toBeInTheDocument();
    expect(screen.getByText('Generate Report')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    // Should show loading skeletons (check for animate-pulse class)
    const { container } = render(<DashboardPage />, { wrapper: createWrapper() });
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('handles alert dismissal', async () => {
    (dashboardService.dismissAlert as any).mockResolvedValue(undefined);

    render(<DashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('High Variance Detected')).toBeInTheDocument();
    });

    const dismissButton = screen.getAllByLabelText(/dismiss alert/i)[0];
    fireEvent.click(dismissButton);

    await waitFor(() => {
      expect(dashboardService.dismissAlert).toHaveBeenCalledWith('1');
    });
  });

  it('fetches all data on mount', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(dashboardService.getStats).toHaveBeenCalled();
      expect(dashboardService.getDailyVariance).toHaveBeenCalled();
      expect(dashboardService.getPartnerPerformance).toHaveBeenCalled();
      expect(dashboardService.getAlerts).toHaveBeenCalled();
      expect(dashboardService.getRecentBatches).toHaveBeenCalled();
    });
  });

  it('handles API errors gracefully', async () => {
    (dashboardService.getStats as any).mockRejectedValue(new Error('API Error'));

    render(<DashboardPage />, { wrapper: createWrapper() });

    // Page should still render, just without data
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
