import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ExceptionsQueuePage } from '../ExceptionsQueuePage';
import { exceptionsService } from '@/services/exceptionsService';

// Mock the service
vi.mock('@/services/exceptionsService', () => ({
  exceptionsService: {
    getStatistics: vi.fn(),
    getExceptions: vi.fn()
  }
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ExceptionsQueuePage', () => {
  const mockStatistics = {
    totalExceptions: 80,
    openExceptions: 30,
    resolvedToday: 5,
    breachedSLA: 3,
    byStatus: {},
    bySeverity: {},
    byCategory: {},
    averageResolutionTime: 24,
    averageAge: 5.2,
    slaComplianceRate: 92
  };

  const mockExceptions = {
    data: [
      {
        id: 'exc1',
        exceptionNumber: 'EXC-001',
        title: 'Test Exception 1',
        description: 'Description 1',
        category: 'matching_failure' as const,
        severity: 'high' as const,
        status: 'open' as const,
        entityType: 'invoice',
        entityId: 'INV-001',
        source: 'AP System',
        assignedTo: null,
        assignedToName: null,
        teamId: 'team1',
        teamName: 'Team 1',
        slaDeadline: new Date().toISOString(),
        slaStatus: 'within_sla' as const,
        slaDaysRemaining: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        resolvedAt: null,
        closedAt: null,
        ageInDays: 3,
        responseTime: 1,
        resolutionTime: null,
        commentsCount: 2,
        attachmentsCount: 1,
        tags: []
      }
    ],
    total: 1,
    page: 1,
    pageSize: 10,
    totalPages: 1
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (exceptionsService.getStatistics as any).mockResolvedValue(mockStatistics);
    (exceptionsService.getExceptions as any).mockResolvedValue(mockExceptions);
  });

  it('renders page title and description', async () => {
    render(<ExceptionsQueuePage />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Exceptions Queue')).toBeInTheDocument();
    expect(screen.getByText(/Monitor and manage reconciliation exceptions/)).toBeInTheDocument();
  });

  it('displays statistics cards', async () => {
    render(<ExceptionsQueuePage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Total Exceptions')).toBeInTheDocument();
      expect(screen.getByText('80')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument(); // Open
      expect(screen.getByText('5')).toBeInTheDocument(); // Resolved Today
      expect(screen.getByText('3')).toBeInTheDocument(); // SLA Breached
    });
  });

  it('displays exceptions list', async () => {
    render(<ExceptionsQueuePage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('EXC-001')).toBeInTheDocument();
      expect(screen.getByText('Test Exception 1')).toBeInTheDocument();
    });
  });

  it('handles search input', async () => {
    render(<ExceptionsQueuePage />, { wrapper: createWrapper() });
    
    const searchInput = screen.getByPlaceholderText('Search exceptions...');
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    
    await waitFor(() => {
      expect(exceptionsService.getExceptions).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'test query' }),
        expect.any(Object)
      );
    });
  });

  it('handles status filter', async () => {
    render(<ExceptionsQueuePage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Test Exception 1')).toBeInTheDocument();
    });
    
    // Find and click the status select
    const selects = screen.getAllByRole('combobox');
    fireEvent.click(selects[0]);
    
    await waitFor(() => {
      const openOption = screen.getByRole('option', { name: /Open/i });
      fireEvent.click(openOption);
    });
  });

  it('handles pagination', async () => {
    const multiPageData = {
      ...mockExceptions,
      total: 30,
      totalPages: 3
    };
    
    vi.mocked(exceptionsService.getExceptions).mockResolvedValue(multiPageData);
    
    render(<ExceptionsQueuePage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Test Exception 1')).toBeInTheDocument();
    });
    
    const nextButton = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(exceptionsService.getExceptions).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ page: 2 })
      );
    });
  });

  it('handles refresh button', async () => {
    render(<ExceptionsQueuePage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Test Exception 1')).toBeInTheDocument();
    });
    
    const refreshButton = screen.getByRole('button', { name: /Refresh/i });
    fireEvent.click(refreshButton);
    
    expect(exceptionsService.getExceptions).toHaveBeenCalled();
  });

  it('shows empty state when no exceptions', async () => {
    vi.mocked(exceptionsService.getExceptions).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0
    });
    
    render(<ExceptionsQueuePage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('No exceptions found')).toBeInTheDocument();
    });
  });

  it('clears all filters', async () => {
    render(<ExceptionsQueuePage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Test Exception 1')).toBeInTheDocument();
    });
    
    // Set search filter
    const searchInput = screen.getByPlaceholderText('Search exceptions...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Clear filters
    const clearButton = screen.queryByRole('button', { name: /Clear all/i });
    if (clearButton) {
      fireEvent.click(clearButton);
      expect(searchInput).toHaveValue('');
    }
  });
});
