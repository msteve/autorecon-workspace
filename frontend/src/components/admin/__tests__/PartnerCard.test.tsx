import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PartnerCard } from '../PartnerCard';
import type { PartnerConfig } from '../../../types';

const mockPartner: PartnerConfig = {
  id: '1',
  name: 'Chase Bank',
  code: 'CHASE',
  type: 'bank',
  status: 'active',
  contactEmail: 'contact@chase.com',
  contactPhone: '+1 555-1234',
  address: '123 Main St, New York, NY 10001',
  settlementFrequency: 'daily',
  feePercentage: 2.5,
  contactName: 'John Doe',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
};

describe('PartnerCard', () => {
  it('renders partner information correctly', () => {
    render(<PartnerCard partner={mockPartner} />);

    expect(screen.getByText('Chase Bank')).toBeInTheDocument();
    expect(screen.getByText('CHASE')).toBeInTheDocument();
    expect(screen.getByText('contact@chase.com')).toBeInTheDocument();
    expect(screen.getByText('+1 555-1234')).toBeInTheDocument();
    expect(screen.getByText('123 Main St, New York, NY 10001')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays correct status badge for active partner', () => {
    render(<PartnerCard partner={mockPartner} />);

    const statusBadge = screen.getByText('Active');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass('bg-green-100');
  });

  it('displays correct status badge for inactive partner', () => {
    const inactivePartner = { ...mockPartner, status: 'inactive' as const };
    render(<PartnerCard partner={inactivePartner} />);

    const statusBadge = screen.getByText('Inactive');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass('bg-gray-100');
  });

  it('displays correct type badge for different partner types', () => {
    render(<PartnerCard partner={mockPartner} />);
    expect(screen.getByText('Bank')).toBeInTheDocument();

    const { rerender } = render(
      <PartnerCard partner={{ ...mockPartner, type: 'merchant' }} />
    );
    expect(screen.getByText('Merchant')).toBeInTheDocument();
  });

  it('displays settlement frequency correctly', () => {
    render(<PartnerCard partner={mockPartner} />);
    expect(screen.getByText(/Daily/)).toBeInTheDocument();
  });

  it('displays fee percentage correctly', () => {
    render(<PartnerCard partner={mockPartner} />);
    expect(screen.getByText(/2\.5%/)).toBeInTheDocument();
  });

  it('renders edit button when onEdit is provided', () => {
    const onEdit = vi.fn();
    render(<PartnerCard partner={mockPartner} onEdit={onEdit} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toBeInTheDocument();
  });

  it('does not render edit button when onEdit is not provided', () => {
    render(<PartnerCard partner={mockPartner} />);

    const editButton = screen.queryByRole('button', { name: /edit/i });
    expect(editButton).not.toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();
    render(<PartnerCard partner={mockPartner} onEdit={onEdit} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    editButton.click();

    expect(onEdit).toHaveBeenCalledWith(mockPartner);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('handles missing optional fields gracefully', () => {
    const minimalPartner: PartnerConfig = {
      ...mockPartner,
      contactPhone: '',
      address: '',
      contactName: '',
    };

    render(<PartnerCard partner={minimalPartner} />);

    expect(screen.getByText('Chase Bank')).toBeInTheDocument();
    expect(screen.getByText('contact@chase.com')).toBeInTheDocument();
  });

  it('formats partner type correctly', () => {
    const gatewayPartner = { ...mockPartner, type: 'payment-gateway' as const };
    render(<PartnerCard partner={gatewayPartner} />);

    expect(screen.getByText('Payment Gateway')).toBeInTheDocument();
  });

  it('formats settlement frequency correctly', () => {
    const weeklyPartner = { ...mockPartner, settlementFrequency: 'weekly' as const };
    render(<PartnerCard partner={weeklyPartner} />);

    expect(screen.getByText(/Weekly/)).toBeInTheDocument();
  });
});
