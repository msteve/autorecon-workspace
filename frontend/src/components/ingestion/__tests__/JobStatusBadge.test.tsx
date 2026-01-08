import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JobStatusBadge } from '../JobStatusBadge';

describe('JobStatusBadge', () => {
  it('renders pending status correctly', () => {
    render(<JobStatusBadge status="pending" />);

    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders processing status with spinning icon', () => {
    const { container } = render(<JobStatusBadge status="processing" />);

    expect(screen.getByText('Processing')).toBeInTheDocument();
    
    const spinningIcon = container.querySelector('.animate-spin');
    expect(spinningIcon).toBeInTheDocument();
  });

  it('renders completed status correctly', () => {
    render(<JobStatusBadge status="completed" />);

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders failed status correctly', () => {
    render(<JobStatusBadge status="failed" />);

    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('renders cancelled status correctly', () => {
    render(<JobStatusBadge status="cancelled" />);

    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });

  it('hides icon when showIcon is false', () => {
    const { container } = render(<JobStatusBadge status="pending" showIcon={false} />);

    const icon = container.querySelector('svg');
    expect(icon).not.toBeInTheDocument();
  });

  it('applies small size correctly', () => {
    const { container } = render(<JobStatusBadge status="pending" size="sm" />);

    const badge = container.querySelector('.text-xs');
    expect(badge).toBeInTheDocument();
  });

  it('applies medium size correctly', () => {
    const { container } = render(<JobStatusBadge status="pending" size="md" />);

    const badge = container.querySelector('.text-sm');
    expect(badge).toBeInTheDocument();
  });

  it('applies large size correctly', () => {
    const { container } = render(<JobStatusBadge status="pending" size="lg" />);

    const badge = container.querySelector('.text-base');
    expect(badge).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <JobStatusBadge status="pending" className="custom-class" />
    );

    const badge = container.querySelector('.custom-class');
    expect(badge).toBeInTheDocument();
  });

  it('uses correct color scheme for each status', () => {
    const { container: pendingContainer } = render(
      <JobStatusBadge status="pending" />
    );
    expect(pendingContainer.querySelector('.bg-gray-100')).toBeInTheDocument();

    const { container: processingContainer } = render(
      <JobStatusBadge status="processing" />
    );
    expect(processingContainer.querySelector('.bg-blue-100')).toBeInTheDocument();

    const { container: completedContainer } = render(
      <JobStatusBadge status="completed" />
    );
    expect(completedContainer.querySelector('.bg-green-100')).toBeInTheDocument();

    const { container: failedContainer } = render(
      <JobStatusBadge status="failed" />
    );
    expect(failedContainer.querySelector('.bg-red-100')).toBeInTheDocument();

    const { container: cancelledContainer } = render(
      <JobStatusBadge status="cancelled" />
    );
    expect(cancelledContainer.querySelector('.bg-orange-100')).toBeInTheDocument();
  });
});
