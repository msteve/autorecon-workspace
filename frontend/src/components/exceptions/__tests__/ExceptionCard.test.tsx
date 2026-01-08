import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExceptionCard } from '../ExceptionCard';
import { Exception } from '@/services/exceptionsService';

describe('ExceptionCard', () => {
  const mockException: Exception = {
    id: 'exc-001',
    exceptionNumber: 'EXC-2024-001',
    title: 'Invoice Amount Mismatch',
    description: 'Invoice total does not match purchase order',
    category: 'matching_failure',
    severity: 'high',
    status: 'open',
    entityType: 'invoice',
    entityId: 'INV-123',
    source: 'AP System',
    assignedTo: null,
    assignedToName: null,
    teamId: 'team1',
    teamName: 'Reconciliation Team',
    slaDeadline: new Date('2024-12-31').toISOString(),
    slaStatus: 'approaching',
    slaDaysRemaining: 1,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-02').toISOString(),
    resolvedAt: null,
    closedAt: null,
    ageInDays: 5,
    responseTime: 2,
    resolutionTime: null,
    commentsCount: 3,
    attachmentsCount: 1,
    tags: ['urgent', 'finance']
  };

  it('renders exception details correctly', () => {
    render(<ExceptionCard exception={mockException} />);
    
    expect(screen.getByText('EXC-2024-001')).toBeInTheDocument();
    expect(screen.getByText('Invoice Amount Mismatch')).toBeInTheDocument();
    expect(screen.getByText(/Invoice total does not match/)).toBeInTheDocument();
  });

  it('displays status and severity badges', () => {
    render(<ExceptionCard exception={mockException} />);
    
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('shows SLA indicator', () => {
    render(<ExceptionCard exception={mockException} />);
    
    expect(screen.getByText('Due Soon')).toBeInTheDocument();
    expect(screen.getByText(/1 day remaining/)).toBeInTheDocument();
  });

  it('displays comment and attachment counts', () => {
    render(<ExceptionCard exception={mockException} />);
    
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const handleClick = vi.fn();
    render(<ExceptionCard exception={mockException} onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Invoice Amount Mismatch'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows assign button for unassigned exceptions', () => {
    const handleAssign = vi.fn();
    render(
      <ExceptionCard 
        exception={mockException} 
        onAssign={handleAssign}
        showActions
      />
    );
    
    const assignButton = screen.getByRole('button', { name: /Assign/i });
    fireEvent.click(assignButton);
    
    expect(handleAssign).toHaveBeenCalledWith('exc-001');
  });

  it('displays assigned user when exception is assigned', () => {
    const assignedException = {
      ...mockException,
      assignedTo: 'user1',
      assignedToName: 'John Doe'
    };
    
    render(<ExceptionCard exception={assignedException} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders category badge', () => {
    render(<ExceptionCard exception={mockException} />);
    expect(screen.getByText(/matching failure/i)).toBeInTheDocument();
  });

  it('renders tags', () => {
    render(<ExceptionCard exception={mockException} />);
    expect(screen.getByText('urgent')).toBeInTheDocument();
    expect(screen.getByText('finance')).toBeInTheDocument();
  });
});
