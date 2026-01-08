import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MatchingBadge } from './MatchingBadge';

describe('MatchingBadge', () => {
  it('renders exact match badge correctly', () => {
    render(<MatchingBadge matchType="exact" confidence={100} />);
    expect(screen.getByText('Exact Match')).toBeInTheDocument();
  });

  it('renders fuzzy match badge correctly', () => {
    render(<MatchingBadge matchType="fuzzy" confidence={85} />);
    expect(screen.getByText('Fuzzy Match')).toBeInTheDocument();
  });

  it('renders partial match badge correctly', () => {
    render(<MatchingBadge matchType="partial" confidence={75} />);
    expect(screen.getByText('Partial Match')).toBeInTheDocument();
  });

  it('renders manual match badge correctly', () => {
    render(<MatchingBadge matchType="manual" confidence={100} />);
    expect(screen.getByText('Manual Match')).toBeInTheDocument();
  });

  it('renders n-way match badge correctly', () => {
    render(<MatchingBadge matchType="n_way" confidence={90} />);
    expect(screen.getByText('N-Way Match')).toBeInTheDocument();
  });

  it('shows confidence when showConfidence is true', () => {
    render(<MatchingBadge matchType="fuzzy" confidence={85} showConfidence />);
    expect(screen.getByText(/85%/)).toBeInTheDocument();
  });

  it('hides confidence when showConfidence is false', () => {
    render(<MatchingBadge matchType="fuzzy" confidence={85} showConfidence={false} />);
    expect(screen.queryByText(/85%/)).not.toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<MatchingBadge matchType="exact" size="sm" />);
    expect(screen.getByText('Exact Match').parentElement).toHaveClass('text-xs');

    rerender(<MatchingBadge matchType="exact" size="md" />);
    expect(screen.getByText('Exact Match').parentElement).toHaveClass('text-sm');

    rerender(<MatchingBadge matchType="exact" size="lg" />);
    expect(screen.getByText('Exact Match').parentElement).toHaveClass('text-base');
  });

  it('applies custom className', () => {
    render(<MatchingBadge matchType="exact" className="custom-class" />);
    expect(screen.getByText('Exact Match').parentElement).toHaveClass('custom-class');
  });

  it('applies correct confidence color for high confidence', () => {
    render(<MatchingBadge matchType="exact" confidence={95} showConfidence />);
    const confidenceText = screen.getByText(/95%/);
    expect(confidenceText).toHaveClass('text-green-200');
  });

  it('applies correct confidence color for medium confidence', () => {
    render(<MatchingBadge matchType="fuzzy" confidence={80} showConfidence />);
    const confidenceText = screen.getByText(/80%/);
    expect(confidenceText).toHaveClass('text-yellow-200');
  });

  it('applies correct confidence color for low confidence', () => {
    render(<MatchingBadge matchType="partial" confidence={70} showConfidence />);
    const confidenceText = screen.getByText(/70%/);
    expect(confidenceText).toHaveClass('text-orange-200');
  });

  it('handles missing confidence gracefully', () => {
    render(<MatchingBadge matchType="exact" showConfidence />);
    expect(screen.getByText('Exact Match')).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });
});
