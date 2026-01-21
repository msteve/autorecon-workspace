import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SuspenseBadge } from '../SuspenseBadge';

describe('SuspenseBadge', () => {
  it('renders nothing when isSuspense is false', () => {
    const { container } = render(<SuspenseBadge isSuspense={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders badge when isSuspense is true', () => {
    render(<SuspenseBadge isSuspense={true} />);
    expect(screen.getByText('Suspense')).toBeInTheDocument();
  });

  it('displays reason in title attribute', () => {
    const reason = 'Missing documentation';
    render(<SuspenseBadge isSuspense={true} reason={reason} />);
    const badge = screen.getByText('Suspense');
    expect(badge).toHaveAttribute('title', reason);
  });

  it('applies correct styling', () => {
    const { container } = render(<SuspenseBadge isSuspense={true} />);
    const badge = container.querySelector('.bg-amber-50');
    expect(badge).toBeInTheDocument();
    expect(badge?.className).toContain('text-amber-700');
    expect(badge?.className).toContain('border-amber-300');
  });

  it('renders without reason', () => {
    render(<SuspenseBadge isSuspense={true} />);
    const badge = screen.getByText('Suspense');
    expect(badge).toBeInTheDocument();
  });
});
