import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BatchStatusBadge } from '../BatchStatusBadge';

describe('BatchStatusBadge', () => {
  it('renders draft status correctly', () => {
    render(<BatchStatusBadge status="draft" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('renders pending_approval status correctly', () => {
    render(<BatchStatusBadge status="pending_approval" />);
    expect(screen.getByText('Pending Approval')).toBeInTheDocument();
  });

  it('renders approved status correctly', () => {
    render(<BatchStatusBadge status="approved" />);
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('renders posted status correctly', () => {
    render(<BatchStatusBadge status="posted" />);
    expect(screen.getByText('Posted')).toBeInTheDocument();
  });

  it('renders rejected status correctly', () => {
    render(<BatchStatusBadge status="rejected" />);
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  it('renders failed status correctly', () => {
    render(<BatchStatusBadge status="failed" />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('applies correct variant for draft', () => {
    const { container } = render(<BatchStatusBadge status="draft" />);
    const badge = container.querySelector('.bg-slate-100');
    expect(badge).toBeInTheDocument();
  });

  it('applies correct variant for pending_approval', () => {
    const { container } = render(<BatchStatusBadge status="pending_approval" />);
    const badge = container.querySelector('.bg-amber-100');
    expect(badge).toBeInTheDocument();
  });

  it('applies correct variant for approved', () => {
    const { container } = render(<BatchStatusBadge status="approved" />);
    const badge = container.querySelector('.bg-blue-100');
    expect(badge).toBeInTheDocument();
  });

  it('applies correct variant for posted', () => {
    const { container } = render(<BatchStatusBadge status="posted" />);
    const badge = container.querySelector('.bg-green-100');
    expect(badge).toBeInTheDocument();
  });

  it('applies correct variant for rejected', () => {
    const { container } = render(<BatchStatusBadge status="rejected" />);
    const badge = container.querySelector('.bg-red-100');
    expect(badge).toBeInTheDocument();
  });

  it('applies correct variant for failed', () => {
    const { container } = render(<BatchStatusBadge status="failed" />);
    const badge = container.querySelector('.bg-rose-100');
    expect(badge).toBeInTheDocument();
  });
});
