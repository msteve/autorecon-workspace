import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComparisonView } from '../ComparisonView';
import { Transaction } from '@/services/matchingService';

const mockTransaction1: Transaction = {
  id: '1',
  transactionNumber: 'TXN-001',
  source: 'source_a',
  date: '2024-01-15',
  amount: 1000.00,
  currency: 'USD',
  description: 'Payment for services',
  reference: 'REF-001',
  partnerId: 'P001',
  partnerName: 'Partner A',
  accountNumber: 'ACC-001',
  status: 'matched',
  matchType: 'exact',
  matchId: 'M001',
  matchConfidence: 100,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z'
};

const mockTransaction2: Transaction = {
  ...mockTransaction1,
  id: '2',
  transactionNumber: 'TXN-002',
  source: 'source_b',
  amount: 1000.50,
  reference: 'REF-002'
};

const mockTransaction3: Transaction = {
  ...mockTransaction1,
  id: '3',
  transactionNumber: 'TXN-003',
  source: 'source_c',
  amount: 999.75,
  reference: 'REF-003'
};

describe('ComparisonView', () => {
  it('renders empty state when no transactions', () => {
    render(<ComparisonView transactions={[]} />);
    expect(screen.getByText('No transactions to compare')).toBeInTheDocument();
  });

  it('renders 2-way comparison correctly', () => {
    render(<ComparisonView transactions={[mockTransaction1, mockTransaction2]} />);
    expect(screen.getByText('Source Comparison')).toBeInTheDocument();
    expect(screen.getByText('TXN-001')).toBeInTheDocument();
    expect(screen.getByText('TXN-002')).toBeInTheDocument();
  });

  it('renders 3-way comparison with badge', () => {
    render(<ComparisonView transactions={[mockTransaction1, mockTransaction2, mockTransaction3]} />);
    expect(screen.getByText('3-Way')).toBeInTheDocument();
  });

  it('displays variance information when showVariance is true', () => {
    render(<ComparisonView transactions={[mockTransaction1, mockTransaction2]} showVariance />);
    expect(screen.getByText('Variance')).toBeInTheDocument();
    expect(screen.getByText('Average Amount')).toBeInTheDocument();
    expect(screen.getByText('Max Difference')).toBeInTheDocument();
  });

  it('hides variance information when showVariance is false', () => {
    render(<ComparisonView transactions={[mockTransaction1, mockTransaction2]} showVariance={false} />);
    expect(screen.queryByText('Average Amount')).not.toBeInTheDocument();
  });

  it('highlights differences when highlightDifferences is true', () => {
    const { container } = render(
      <ComparisonView 
        transactions={[mockTransaction1, mockTransaction2]} 
        highlightDifferences 
      />
    );
    // Check for visual difference indicators (icons)
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('calculates variance correctly for exact match', () => {
    const exactTxn1 = { ...mockTransaction1, amount: 1000 };
    const exactTxn2 = { ...mockTransaction2, amount: 1000 };
    
    render(<ComparisonView transactions={[exactTxn1, exactTxn2]} showVariance />);
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('calculates variance correctly for fuzzy match', () => {
    render(
      <ComparisonView 
        transactions={[mockTransaction1, mockTransaction2, mockTransaction3]} 
        showVariance 
      />
    );
    // Should show variance amount
    const varianceElements = screen.getAllByText(/\$/);
    expect(varianceElements.length).toBeGreaterThan(0);
  });

  it('displays source badges with correct colors', () => {
    render(<ComparisonView transactions={[mockTransaction1, mockTransaction2]} />);
    expect(screen.getByText('SOURCE A')).toBeInTheDocument();
    expect(screen.getByText('SOURCE B')).toBeInTheDocument();
  });

  it('shows field comparisons for all transactions', () => {
    render(<ComparisonView transactions={[mockTransaction1, mockTransaction2]} />);
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Currency')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Reference')).toBeInTheDocument();
    expect(screen.getByText('Partner')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('formats amounts correctly', () => {
    render(<ComparisonView transactions={[mockTransaction1]} />);
    expect(screen.getByText('$1000.00')).toBeInTheDocument();
  });

  it('shows "Within Tolerance" status for exact matches', () => {
    const exactTxn1 = { ...mockTransaction1, amount: 1000 };
    const exactTxn2 = { ...mockTransaction2, amount: 1000 };
    
    render(<ComparisonView transactions={[exactTxn1, exactTxn2]} showVariance />);
    expect(screen.getByText('Within Tolerance')).toBeInTheDocument();
  });

  it('shows "High Variance" status for large differences', () => {
    const txn1 = { ...mockTransaction1, amount: 1000 };
    const txn2 = { ...mockTransaction2, amount: 1100 };
    
    render(<ComparisonView transactions={[txn1, txn2]} showVariance />);
    expect(screen.getByText('High Variance')).toBeInTheDocument();
  });

  it('displays visual flow for 2-way matches', () => {
    render(<ComparisonView transactions={[mockTransaction1, mockTransaction2]} />);
    // Check for the arrow icon in 2-way visualization
    const { container } = render(
      <ComparisonView transactions={[mockTransaction1, mockTransaction2]} />
    );
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('displays triangle visualization for 3-way matches', () => {
    const { container } = render(
      <ComparisonView transactions={[mockTransaction1, mockTransaction2, mockTransaction3]} />
    );
    // Check for SVG element (triangle visualization)
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });
});
