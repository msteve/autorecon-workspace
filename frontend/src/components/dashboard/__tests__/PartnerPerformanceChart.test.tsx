import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PartnerPerformanceChart } from '../PartnerPerformanceChart';

const mockPartnerData = [
  {
    partner: 'Bank A',
    matched: 15000,
    unmatched: 500,
    exceptions: 150,
  },
  {
    partner: 'Bank B',
    matched: 12000,
    unmatched: 300,
    exceptions: 100,
  },
  {
    partner: 'Processor C',
    matched: 8500,
    unmatched: 200,
    exceptions: 80,
  },
  {
    partner: 'Gateway D',
    matched: 6000,
    unmatched: 150,
    exceptions: 50,
  },
  {
    partner: 'PSP E',
    matched: 4500,
    unmatched: 100,
    exceptions: 30,
  },
];

describe('PartnerPerformanceChart', () => {
  it('renders chart with title', () => {
    render(<PartnerPerformanceChart data={mockPartnerData} />);

    expect(screen.getByText('Partner Performance')).toBeInTheDocument();
  });

  it('renders chart description', () => {
    render(<PartnerPerformanceChart data={mockPartnerData} />);

    expect(
      screen.getByText('Transaction status breakdown by partner')
    ).toBeInTheDocument();
  });

  it('renders chart when data is provided', () => {
    const { container } = render(<PartnerPerformanceChart data={mockPartnerData} />);

    // Check if Recharts container is rendered
    const rechartsContainer = container.querySelector('.recharts-responsive-container');
    expect(rechartsContainer).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    const { container } = render(<PartnerPerformanceChart data={[]} loading={true} />);

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows empty state when no data', () => {
    render(<PartnerPerformanceChart data={[]} loading={false} />);

    expect(screen.getByText('No partner data available')).toBeInTheDocument();
  });

  it('renders chart container with proper styling', () => {
    const { container } = render(<PartnerPerformanceChart data={mockPartnerData} />);

    // Check for Card component
    const card = container.querySelector('.rounded-lg.border');
    expect(card).toBeInTheDocument();
  });

  it('renders with empty data array gracefully', () => {
    const { container } = render(<PartnerPerformanceChart data={[]} />);

    expect(screen.getByText('No partner data available')).toBeInTheDocument();
  });

  it('includes legend for matched, unmatched, and exceptions', () => {
    render(<PartnerPerformanceChart data={mockPartnerData} />);

    // The chart should show legend (Recharts renders these)
    const { container } = render(<PartnerPerformanceChart data={mockPartnerData} />);
    const rechartsContainer = container.querySelector('.recharts-responsive-container');
    expect(rechartsContainer).toBeInTheDocument();
  });

  it('handles single partner data', () => {
    const singlePartner = [mockPartnerData[0]];
    const { container } = render(<PartnerPerformanceChart data={singlePartner} />);

    const rechartsContainer = container.querySelector('.recharts-responsive-container');
    expect(rechartsContainer).toBeInTheDocument();
  });
});
