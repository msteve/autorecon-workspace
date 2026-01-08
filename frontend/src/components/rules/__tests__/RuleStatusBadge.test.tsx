import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RuleStatusBadge } from '../RuleStatusBadge';
import { RuleStatus } from '@/services/ruleEngineService';

describe('RuleStatusBadge', () => {
  const statuses: RuleStatus[] = ['draft', 'pending_approval', 'approved', 'active', 'inactive', 'rejected'];

  it.each(statuses)('renders %s status correctly', (status) => {
    render(<RuleStatusBadge status={status} />);
    
    const badge = screen.getByText(new RegExp(status.replace('_', ' '), 'i'));
    expect(badge).toBeInTheDocument();
  });

  it('renders draft status with correct styling', () => {
    const { container } = render(<RuleStatusBadge status="draft" />);
    
    expect(screen.getByText(/draft/i)).toBeInTheDocument();
    const badge = container.querySelector('.bg-gray-100');
    expect(badge).toBeInTheDocument();
  });

  it('renders active status with correct styling', () => {
    const { container } = render(<RuleStatusBadge status="active" />);
    
    expect(screen.getByText(/active/i)).toBeInTheDocument();
    const badge = container.querySelector('.bg-green-600');
    expect(badge).toBeInTheDocument();
  });

  it('renders pending_approval status with correct styling', () => {
    const { container } = render(<RuleStatusBadge status="pending_approval" />);
    
    expect(screen.getByText(/pending approval/i)).toBeInTheDocument();
    const badge = container.querySelector('.bg-yellow-50');
    expect(badge).toBeInTheDocument();
  });

  it('renders rejected status with correct styling', () => {
    const { container } = render(<RuleStatusBadge status="rejected" />);
    
    expect(screen.getByText(/rejected/i)).toBeInTheDocument();
    const badge = container.querySelector('.bg-red-100');
    expect(badge).toBeInTheDocument();
  });

  it('renders with small size', () => {
    const { container } = render(<RuleStatusBadge status="active" size="sm" />);
    
    const badge = container.querySelector('.text-xs');
    expect(badge).toBeInTheDocument();
  });

  it('renders with medium size', () => {
    const { container } = render(<RuleStatusBadge status="active" size="md" />);
    
    const badge = container.querySelector('.text-sm');
    expect(badge).toBeInTheDocument();
  });

  it('renders with large size', () => {
    const { container } = render(<RuleStatusBadge status="active" size="lg" />);
    
    const badge = container.querySelector('.text-base');
    expect(badge).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<RuleStatusBadge status="active" className="custom-class" />);
    
    const badge = container.querySelector('.custom-class');
    expect(badge).toBeInTheDocument();
  });

  it('includes appropriate icon for each status', () => {
    const { container: draftContainer } = render(<RuleStatusBadge status="draft" />);
    expect(draftContainer.querySelector('svg')).toBeInTheDocument();

    const { container: activeContainer } = render(<RuleStatusBadge status="active" />);
    expect(activeContainer.querySelector('svg')).toBeInTheDocument();
  });
});
