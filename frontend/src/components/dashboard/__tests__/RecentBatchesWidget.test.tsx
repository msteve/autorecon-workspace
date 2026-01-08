import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecentBatchesWidget } from '../RecentBatchesWidget';

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
  {
    id: 'batch-2',
    batchNumber: 'BATCH-2024-0108-002',
    status: 'processing' as const,
    uploadedAt: new Date('2024-01-08T11:00:00'),
    recordCount: 890,
    matchedCount: 0,
    unmatchedCount: 0,
    exceptionCount: 0,
  },
  {
    id: 'batch-3',
    batchNumber: 'BATCH-2024-0108-003',
    status: 'failed' as const,
    uploadedAt: new Date('2024-01-08T11:30:00'),
    recordCount: 500,
    matchedCount: 0,
    unmatchedCount: 0,
    exceptionCount: 0,
    errorMessage: 'Invalid file format',
  },
];

describe('RecentBatchesWidget', () => {
  it('renders all batches', () => {
    render(<RecentBatchesWidget batches={mockBatches} onViewDetails={vi.fn()} />);

    expect(screen.getByText('BATCH-2024-0108-001')).toBeInTheDocument();
    expect(screen.getByText('BATCH-2024-0108-002')).toBeInTheDocument();
    expect(screen.getByText('BATCH-2024-0108-003')).toBeInTheDocument();
  });

  it('displays correct status badges', () => {
    render(<RecentBatchesWidget batches={mockBatches} onViewDetails={vi.fn()} />);

    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Processing')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('displays record counts', () => {
    render(<RecentBatchesWidget batches={mockBatches} onViewDetails={vi.fn()} />);

    expect(screen.getByText('1,250')).toBeInTheDocument();
    expect(screen.getByText('890')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
  });

  it('displays match statistics for completed batches', () => {
    render(<RecentBatchesWidget batches={[mockBatches[0]]} onViewDetails={vi.fn()} />);

    expect(screen.getByText('1,180')).toBeInTheDocument(); // matched
    expect(screen.getByText('45')).toBeInTheDocument(); // unmatched
    expect(screen.getByText('25')).toBeInTheDocument(); // exceptions
  });

  it('displays processing time for completed batches', () => {
    render(<RecentBatchesWidget batches={[mockBatches[0]]} onViewDetails={vi.fn()} />);

    // 300000ms = 5 minutes
    expect(screen.getByText('5m 0s')).toBeInTheDocument();
  });

  it('displays error message for failed batches', () => {
    render(<RecentBatchesWidget batches={[mockBatches[2]]} onViewDetails={vi.fn()} />);

    expect(screen.getByText('Invalid file format')).toBeInTheDocument();
  });

  it('calls onViewDetails when View Details button is clicked', () => {
    const onViewDetails = vi.fn();
    render(<RecentBatchesWidget batches={mockBatches} onViewDetails={onViewDetails} />);

    const viewButtons = screen.getAllByText('View Details');
    fireEvent.click(viewButtons[0]);

    expect(onViewDetails).toHaveBeenCalledWith('batch-1');
  });

  it('shows empty state when no batches', () => {
    render(<RecentBatchesWidget batches={[]} onViewDetails={vi.fn()} />);

    expect(screen.getByText('No recent batches')).toBeInTheDocument();
    expect(
      screen.getByText('Upload a file to start reconciliation.')
    ).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    const { container } = render(
      <RecentBatchesWidget batches={[]} onViewDetails={vi.fn()} loading={true} />
    );

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('formats time correctly for different durations', () => {
    const batchWithLongProcessing = {
      ...mockBatches[0],
      processingTimeMs: 3723000, // 1h 2m 3s
    };

    render(
      <RecentBatchesWidget batches={[batchWithLongProcessing]} onViewDetails={vi.fn()} />
    );

    expect(screen.getByText('1h 2m 3s')).toBeInTheDocument();
  });

  it('applies correct styling for completed status', () => {
    const { container } = render(
      <RecentBatchesWidget batches={[mockBatches[0]]} onViewDetails={vi.fn()} />
    );

    // Check for green badge
    const badge = screen.getByText('Completed');
    expect(badge).toHaveClass('bg-green-100');
  });

  it('applies correct styling for processing status', () => {
    const { container } = render(
      <RecentBatchesWidget batches={[mockBatches[1]]} onViewDetails={vi.fn()} />
    );

    // Check for blue badge
    const badge = screen.getByText('Processing');
    expect(badge).toHaveClass('bg-blue-100');
  });

  it('applies correct styling for failed status', () => {
    const { container } = render(
      <RecentBatchesWidget batches={[mockBatches[2]]} onViewDetails={vi.fn()} />
    );

    // Check for red badge
    const badge = screen.getByText('Failed');
    expect(badge).toHaveClass('bg-red-100');
  });

  it('formats upload timestamp', () => {
    render(<RecentBatchesWidget batches={[mockBatches[0]]} onViewDetails={vi.fn()} />);

    // Check that timestamp is displayed (exact format may vary)
    const timeElement = screen.getByText(/ago/i);
    expect(timeElement).toBeInTheDocument();
  });
});
