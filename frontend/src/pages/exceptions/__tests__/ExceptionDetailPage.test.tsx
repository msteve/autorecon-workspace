import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ExceptionDetailPage } from '../ExceptionDetailPage';
import { exceptionsService } from '@/services/exceptionsService';

vi.mock('@/services/exceptionsService', () => ({
  exceptionsService: {
    getExceptionById: vi.fn(),
    getTimeline: vi.fn(),
    getComments: vi.fn(),
    getAttachments: vi.fn(),
    updateStatus: vi.fn()
  }
}));

const createWrapper = (exceptionId = 'exc1') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/exceptions/:id" element={children} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ExceptionDetailPage', () => {
  const mockException = {
    id: 'exc1',
    exceptionNumber: 'EXC-001',
    title: 'Test Exception',
    description: 'Test Description',
    category: 'matching_failure' as const,
    severity: 'high' as const,
    status: 'open' as const,
    entityType: 'invoice',
    entityId: 'INV-001',
    source: 'AP System',
    assignedTo: 'user1',
    assignedToName: 'John Doe',
    teamId: 'team1',
    teamName: 'Team 1',
    slaDeadline: new Date('2024-12-31').toISOString(),
    slaStatus: 'within_sla' as const,
    slaDaysRemaining: 5,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-02').toISOString(),
    resolvedAt: null,
    closedAt: null,
    ageInDays: 3,
    responseTime: 1,
    resolutionTime: null,
    commentsCount: 2,
    attachmentsCount: 1,
    tags: ['urgent']
  };

  const mockTimeline = [
    {
      id: 'timeline1',
      exceptionId: 'exc1',
      eventType: 'created' as const,
      description: 'Exception created',
      userId: 'user1',
      userName: 'John Doe',
      timestamp: new Date('2024-01-01').toISOString(),
      metadata: {}
    }
  ];

  const mockComments = [
    {
      id: 'comment1',
      exceptionId: 'exc1',
      userId: 'user1',
      userName: 'John Doe',
      userAvatar: null,
      content: 'Test comment',
      isInternal: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const mockAttachments = [
    {
      id: 'att1',
      exceptionId: 'exc1',
      fileName: 'test.pdf',
      fileSize: 1024,
      fileType: 'application/pdf',
      uploadedBy: 'user1',
      uploadedByName: 'John Doe',
      uploadedAt: new Date().toISOString(),
      url: 'https://example.com/test.pdf'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (exceptionsService.getExceptionById as any).mockResolvedValue(mockException);
    (exceptionsService.getTimeline as any).mockResolvedValue(mockTimeline);
    (exceptionsService.getComments as any).mockResolvedValue(mockComments);
    (exceptionsService.getAttachments as any).mockResolvedValue(mockAttachments);
  });

  it('renders exception details', async () => {
    window.history.pushState({}, '', '/exceptions/exc1');
    
    render(<ExceptionDetailPage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('EXC-001')).toBeInTheDocument();
      expect(screen.getByText('Test Exception')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });
  });

  it('displays tabs correctly', async () => {
    window.history.pushState({}, '', '/exceptions/exc1');
    
    render(<ExceptionDetailPage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText(/Details/)).toBeInTheDocument();
      expect(screen.getByText(/Timeline/)).toBeInTheDocument();
      expect(screen.getByText(/Comments/)).toBeInTheDocument();
      expect(screen.getByText(/Attachments/)).toBeInTheDocument();
    });
  });

  it('switches between tabs', async () => {
    window.history.pushState({}, '', '/exceptions/exc1');
    
    render(<ExceptionDetailPage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Test Exception')).toBeInTheDocument();
    });
    
    const timelineTab = screen.getByRole('tab', { name: /Timeline/i });
    fireEvent.click(timelineTab);
    
    await waitFor(() => {
      expect(screen.getByText('Exception created')).toBeInTheDocument();
    });
  });

  it('displays SLA indicator', async () => {
    window.history.pushState({}, '', '/exceptions/exc1');
    
    render(<ExceptionDetailPage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('On Track')).toBeInTheDocument();
      expect(screen.getByText(/5 days remaining/)).toBeInTheDocument();
    });
  });

  it('handles status updates', async () => {
    vi.mocked(exceptionsService.updateStatus).mockResolvedValue({
      ...mockException,
      status: 'in_progress'
    });
    
    window.history.pushState({}, '', '/exceptions/exc1');
    
    render(<ExceptionDetailPage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Test Exception')).toBeInTheDocument();
    });
    
    // Find status select and change
    const statusSelect = screen.getAllByRole('combobox')[0];
    fireEvent.click(statusSelect);
    
    await waitFor(() => {
      const inProgressOption = screen.getByRole('option', { name: /In Progress/i });
      fireEvent.click(inProgressOption);
    });
    
    await waitFor(() => {
      expect(exceptionsService.updateStatus).toHaveBeenCalledWith('exc1', 'in_progress');
    });
  });

  it('displays exception metadata', async () => {
    window.history.pushState({}, '', '/exceptions/exc1');
    
    render(<ExceptionDetailPage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('matching failure')).toBeInTheDocument();
      expect(screen.getByText('AP System')).toBeInTheDocument();
      expect(screen.getByText('invoice')).toBeInTheDocument();
    });
  });

  it('shows back navigation button', async () => {
    window.history.pushState({}, '', '/exceptions/exc1');
    
    render(<ExceptionDetailPage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      const backButtons = screen.getAllByRole('button');
      const backButton = backButtons.find(btn => 
        btn.querySelector('svg')?.getAttribute('class')?.includes('ArrowLeft')
      );
      expect(backButton).toBeDefined();
    });
  });
});
