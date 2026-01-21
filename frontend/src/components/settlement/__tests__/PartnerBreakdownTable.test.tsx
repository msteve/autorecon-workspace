import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PartnerBreakdownTable } from '../PartnerBreakdownTable';
import type { PartnerSettlement } from '../../../types';

const mockPartners: PartnerSettlement[] = [
  {
    partnerId: '1',
    partnerName: 'Visa Merchant Services',
    partnerType: 'payment_processor',
    status: 'pending_approval',
    grossAmount: 125000.50,
    fees: 2500.00,
    adjustments: -150.25,
    netAmount: 122350.25,
    transactionCount: 450,
    currency: 'USD',
    paymentMethod: 'bank_transfer',
    bankAccount: '**** 1234',
    calculatedAt: '2024-01-15T10:30:00Z',
  },
  {
    partnerId: '2',
    partnerName: 'PayPal Business',
    partnerType: 'payment_processor',
    status: 'approved',
    grossAmount: 89000.00,
    fees: 1780.00,
    adjustments: 0,
    netAmount: 87220.00,
    transactionCount: 320,
    currency: 'USD',
    paymentMethod: 'ach',
    bankAccount: '**** 5678',
    calculatedAt: '2024-01-15T10:35:00Z',
  },
];

describe('PartnerBreakdownTable', () => {
  it('renders the table headers correctly', () => {
    render(<PartnerBreakdownTable partners={mockPartners} onPartnerClick={vi.fn()} />);
    
    expect(screen.getByText('Partner')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Gross Amount')).toBeInTheDocument();
    expect(screen.getByText('Fees')).toBeInTheDocument();
    expect(screen.getByText('Adjustments')).toBeInTheDocument();
    expect(screen.getByText('Net Amount')).toBeInTheDocument();
  });

  it('renders partner data correctly', () => {
    render(<PartnerBreakdownTable partners={mockPartners} onPartnerClick={vi.fn()} />);
    
    expect(screen.getByText('Visa Merchant Services')).toBeInTheDocument();
    expect(screen.getByText('PayPal Business')).toBeInTheDocument();
    expect(screen.getByText('450')).toBeInTheDocument();
    expect(screen.getByText('320')).toBeInTheDocument();
  });

  it('formats currency values correctly', () => {
    render(<PartnerBreakdownTable partners={mockPartners} onPartnerClick={vi.fn()} />);
    
    expect(screen.getByText('$125,000.50')).toBeInTheDocument();
    expect(screen.getByText('$2,500.00')).toBeInTheDocument();
    expect(screen.getByText('$122,350.25')).toBeInTheDocument();
  });

  it('displays adjustments with correct sign', () => {
    render(<PartnerBreakdownTable partners={mockPartners} onPartnerClick={vi.fn()} />);
    
    expect(screen.getByText('-$150.25')).toBeInTheDocument();
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('calculates and displays totals correctly', () => {
    render(<PartnerBreakdownTable partners={mockPartners} onPartnerClick={vi.fn()} />);
    
    // Total transactions: 450 + 320 = 770
    expect(screen.getByText('770')).toBeInTheDocument();
    
    // Total gross: 125000.50 + 89000.00 = 214000.50
    expect(screen.getByText('$214,000.50')).toBeInTheDocument();
    
    // Total fees: 2500.00 + 1780.00 = 4280.00
    expect(screen.getByText('$4,280.00')).toBeInTheDocument();
    
    // Total adjustments: -150.25 + 0 = -150.25
    expect(screen.getByText('-$150.25')).toBeInTheDocument();
    
    // Total net: 122350.25 + 87220.00 = 209570.25
    expect(screen.getByText('$209,570.25')).toBeInTheDocument();
  });

  it('calls onPartnerClick when a row is clicked', () => {
    const mockOnClick = vi.fn();
    render(<PartnerBreakdownTable partners={mockPartners} onPartnerClick={mockOnClick} />);
    
    const firstRow = screen.getByText('Visa Merchant Services').closest('tr');
    fireEvent.click(firstRow!);
    
    expect(mockOnClick).toHaveBeenCalledWith(mockPartners[0]);
  });

  it('applies hover styling to rows', () => {
    const { container } = render(<PartnerBreakdownTable partners={mockPartners} onPartnerClick={vi.fn()} />);
    
    const rows = container.querySelectorAll('tbody tr');
    rows.forEach(row => {
      expect(row.className).toContain('hover:bg-muted/50');
      expect(row.className).toContain('cursor-pointer');
    });
  });

  it('renders empty state when no partners provided', () => {
    render(<PartnerBreakdownTable partners={[]} onPartnerClick={vi.fn()} />);
    
    expect(screen.getByText('No partners found')).toBeInTheDocument();
  });

  it('displays status badges for each partner', () => {
    render(<PartnerBreakdownTable partners={mockPartners} onPartnerClick={vi.fn()} />);
    
    expect(screen.getByText('Pending Approval')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('formats partner type correctly', () => {
    render(<PartnerBreakdownTable partners={mockPartners} onPartnerClick={vi.fn()} />);
    
    const typeElements = screen.getAllByText('Payment Processor');
    expect(typeElements).toHaveLength(2);
  });

  it('handles different partner types', () => {
    const partnersWithDifferentTypes: PartnerSettlement[] = [
      { ...mockPartners[0], partnerType: 'acquirer' },
      { ...mockPartners[1], partnerType: 'gateway' },
    ];
    
    render(<PartnerBreakdownTable partners={partnersWithDifferentTypes} onPartnerClick={vi.fn()} />);
    
    expect(screen.getByText('Acquirer')).toBeInTheDocument();
    expect(screen.getByText('Gateway')).toBeInTheDocument();
  });

  it('handles large numbers correctly', () => {
    const partnersWithLargeAmounts: PartnerSettlement[] = [
      {
        ...mockPartners[0],
        grossAmount: 1234567.89,
        fees: 12345.67,
        adjustments: -1234.56,
        netAmount: 1220987.66,
      },
    ];
    
    render(<PartnerBreakdownTable partners={partnersWithLargeAmounts} onPartnerClick={vi.fn()} />);
    
    expect(screen.getByText('$1,234,567.89')).toBeInTheDocument();
    expect(screen.getByText('$12,345.67')).toBeInTheDocument();
    expect(screen.getByText('-$1,234.56')).toBeInTheDocument();
    expect(screen.getByText('$1,220,987.66')).toBeInTheDocument();
  });
});
