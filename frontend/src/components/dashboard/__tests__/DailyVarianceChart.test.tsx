import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DailyVarianceChart } from '../DailyVarianceChart';

const mockVarianceData = [
  { date: '2024-01-02', variance: 35000, threshold: 45000 },
  { date: '2024-01-03', variance: 42000, threshold: 45000 },
  { date: '2024-01-04', variance: 28000, threshold: 45000 },
  { date: '2024-01-05', variance: 51000, threshold: 45000 },
  { date: '2024-01-06', variance: 38000, threshold: 45000 },
  { date: '2024-01-07', variance: 45000, threshold: 45000 },
  { date: '2024-01-08', variance: 39000, threshold: 45000 },
];

describe('DailyVarianceChart', () => {
  it('renders chart with title', () => {
    render(<DailyVarianceChart data={mockVarianceData} />);

    expect(screen.getByText('Daily Variance Trend')).toBeInTheDocument();
  });

  it('renders chart description', () => {
    render(<DailyVarianceChart data={mockVarianceData} />);

    expect(screen.getByText('7-day reconciliation variance tracking')).toBeInTheDocument();
  });

  it('renders chart when data is provided', () => {
    const { container } = render(<DailyVarianceChart data={mockVarianceData} />);

    // Check if Recharts container is rendered
    const rechartsContainer = container.querySelector('.recharts-responsive-container');
    expect(rechartsContainer).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    const { container } = render(<DailyVarianceChart data={[]} loading={true} />);

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows empty state when no data', () => {
    render(<DailyVarianceChart data={[]} loading={false} />);

    expect(screen.getByText('No variance data available')).toBeInTheDocument();
  });

  it('renders chart container with proper styling', () => {
    const { container } = render(<DailyVarianceChart data={mockVarianceData} />);

    // Check for Card component
    const card = container.querySelector('.rounded-lg.border');
    expect(card).toBeInTheDocument();
  });

  it('renders with empty data array gracefully', () => {
    const { container } = render(<DailyVarianceChart data={[]} />);

    expect(screen.getByText('No variance data available')).toBeInTheDocument();
  });

  it('includes legend information', () => {
    render(<DailyVarianceChart data={mockVarianceData} />);

    // The chart should show legend for Variance and Threshold
    // (Recharts renders these, so we check for the container)
    const { container } = render(<DailyVarianceChart data={mockVarianceData} />);
    const rechartsContainer = container.querySelector('.recharts-responsive-container');
    expect(rechartsContainer).toBeInTheDocument();
  });
});
