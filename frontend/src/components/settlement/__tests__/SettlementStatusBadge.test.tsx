import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SettlementStatusBadge } from '../SettlementStatusBadge';

describe('SettlementStatusBadge', () => {
  it('renders draft status correctly', () => {
    render(<SettlementStatusBadge status="draft" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('renders pending status correctly', () => {
    render(<SettlementStatusBadge status="pending_approval" />);
    expect(screen.getByText('Pending Approval')).toBeInTheDocument();
  });

  it('renders approved status correctly', () => {
    render(<SettlementStatusBadge status="approved" />);
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('renders processing status correctly', () => {
    render(<SettlementStatusBadge status="processing" />);
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('renders completed status correctly', () => {
    render(<SettlementStatusBadge status="completed" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders failed status correctly', () => {
    render(<SettlementStatusBadge status="failed" />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('renders cancelled status correctly', () => {
    render(<SettlementStatusBadge status="cancelled" />);
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });

  it('renders partially_paid status correctly', () => {
    render(<SettlementStatusBadge status="partially_paid" />);
    expect(screen.getByText('Partially Paid')).toBeInTheDocument();
  });

  it('renders paid status correctly', () => {
    render(<SettlementStatusBadge status="paid" />);
    expect(screen.getByText('Paid')).toBeInTheDocument();
  });

  it('renders reconciled status correctly', () => {
    render(<SettlementStatusBadge status="reconciled" />);
    expect(screen.getByText('Reconciled')).toBeInTheDocument();
  });

  it('renders disputed status correctly', () => {
    render(<SettlementStatusBadge status="disputed" />);
    expect(screen.getByText('Disputed')).toBeInTheDocument();
  });

  it('applies correct variant for draft', () => {
    const { container } = render(<SettlementStatusBadge status="draft" />);
    const badge = container.querySelector('.bg-slate-100');
    expect(badge).toBeInTheDocument();
  });

  it('applies correct variant for pending_approval', () => {
    const { container } = render(<SettlementStatusBadge status="pending_approval" />);
    const badge = container.querySelector('.bg-amber-100');
    expect(badge).toBeInTheDocument();
  });

  it('applies correct variant for approved', () => {
    const { container } = render(<SettlementStatusBadge status="approved" />);
    const badge = container.querySelector('.bg-blue-100');
    expect(badge).toBeInTheDocument();
  });

  it('applies correct variant for processing', () => {
    const { container } = render(<SettlementStatusBadge status="processing" />);
    const badge = container.querySelector('.bg-indigo-100');
    expect(badge).toBeInTheDocument();
  });

  it('applies correct variant for completed', () => {
    const { container } = render(<SettlementStatusBadge status="completed" />);
    const badge = container.querySelector('.bg-green-100');
    expect(badge).toBeInTheDocument();
  });

  it('applies correct variant for failed', () => {
    const { container } = render(<SettlementStatusBadge status="failed" />);
    const badge = container.querySelector('.bg-red-100');
    expect(badge).toBeInTheDocument();
  });

  it('applies correct variant for cancelled', () => {
    const { container } = render(<SettlementStatusBadge status="cancelled" />);
    const badge = container.querySelector('.bg-gray-100');
    expect(badge).toBeInTheDocument();
  });

  it('applies correct variant for paid', () => {
    const { container } = render(<SettlementStatusBadge status="paid" />);
    const badge = container.querySelector('.bg-emerald-100');
    expect(badge).toBeInTheDocument();
  });

  it('applies correct variant for reconciled', () => {
    const { container } = render(<SettlementStatusBadge status="reconciled" />);
    const badge = container.querySelector('.bg-teal-100');
    expect(badge).toBeInTheDocument();
  });

  it('applies correct variant for disputed', () => {
    const { container } = render(<SettlementStatusBadge status="disputed" />);
    const badge = container.querySelector('.bg-rose-100');
    expect(badge).toBeInTheDocument();
  });
});
