import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KPICard } from '../KPICard';
import { Activity } from 'lucide-react';

describe('KPICard', () => {
  it('renders with basic props', () => {
    render(
      <KPICard
        title="Total Transactions"
        value="125,430"
        icon={Activity}
        iconColor="text-blue-600"
      />
    );

    expect(screen.getByText('Total Transactions')).toBeInTheDocument();
    expect(screen.getByText('125,430')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(
      <KPICard
        title="Total Transactions"
        value="125,430"
        subtitle="This month"
        icon={Activity}
        iconColor="text-blue-600"
      />
    );

    expect(screen.getByText('This month')).toBeInTheDocument();
  });

  it('renders positive trend correctly', () => {
    render(
      <KPICard
        title="Total Transactions"
        value="125,430"
        icon={Activity}
        iconColor="text-blue-600"
        trend={{
          value: '8.3%',
          isPositive: true,
          label: 'vs last month',
        }}
      />
    );

    expect(screen.getByText('8.3%')).toBeInTheDocument();
    expect(screen.getByText('vs last month')).toBeInTheDocument();
    // Check for up arrow (TrendingUp icon is rendered for positive trends)
    const trendElement = screen.getByText('8.3%').closest('div');
    expect(trendElement).toHaveClass('text-green-600');
  });

  it('renders negative trend correctly', () => {
    render(
      <KPICard
        title="Active Exceptions"
        value="287"
        icon={Activity}
        iconColor="text-amber-600"
        trend={{
          value: '3.2%',
          isPositive: false,
          label: 'vs last month',
        }}
      />
    );

    expect(screen.getByText('3.2%')).toBeInTheDocument();
    const trendElement = screen.getByText('3.2%').closest('div');
    expect(trendElement).toHaveClass('text-red-600');
  });

  it('shows loading skeleton when loading prop is true', () => {
    const { container } = render(
      <KPICard
        title="Total Transactions"
        value="125,430"
        icon={Activity}
        iconColor="text-blue-600"
        loading={true}
      />
    );

    // Check for skeleton elements
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('does not show loading skeleton when loading prop is false', () => {
    render(
      <KPICard
        title="Total Transactions"
        value="125,430"
        icon={Activity}
        iconColor="text-blue-600"
        loading={false}
      />
    );

    // Value should be visible
    expect(screen.getByText('125,430')).toBeInTheDocument();
  });

  it('applies custom icon color', () => {
    const { container } = render(
      <KPICard
        title="Match Rate"
        value="92.5%"
        icon={Activity}
        iconColor="text-green-600"
      />
    );

    const iconContainer = container.querySelector('.text-green-600');
    expect(iconContainer).toBeInTheDocument();
  });
});
