import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AlertsWidget } from '../AlertsWidget';

const mockAlerts = [
  {
    id: '1',
    type: 'error' as const,
    title: 'High Variance Detected',
    message: 'Daily variance exceeded threshold by $15,234',
    timestamp: new Date('2024-01-08T10:30:00'),
    actionLabel: 'Review',
  },
  {
    id: '2',
    type: 'warning' as const,
    title: 'Settlement Delay',
    message: '3 settlements pending for more than 24 hours',
    timestamp: new Date('2024-01-08T09:15:00'),
    actionLabel: 'View Settlements',
  },
  {
    id: '3',
    type: 'info' as const,
    title: 'System Maintenance',
    message: 'Scheduled maintenance on Jan 15, 2024 at 2:00 AM',
    timestamp: new Date('2024-01-08T08:00:00'),
  },
];

describe('AlertsWidget', () => {
  it('renders all alerts', () => {
    render(<AlertsWidget alerts={mockAlerts} onDismiss={vi.fn()} />);

    expect(screen.getByText('High Variance Detected')).toBeInTheDocument();
    expect(screen.getByText('Settlement Delay')).toBeInTheDocument();
    expect(screen.getByText('System Maintenance')).toBeInTheDocument();
  });

  it('renders alert messages', () => {
    render(<AlertsWidget alerts={mockAlerts} onDismiss={vi.fn()} />);

    expect(
      screen.getByText('Daily variance exceeded threshold by $15,234')
    ).toBeInTheDocument();
    expect(
      screen.getByText('3 settlements pending for more than 24 hours')
    ).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<AlertsWidget alerts={mockAlerts} onDismiss={onDismiss} />);

    const dismissButtons = screen.getAllByLabelText(/dismiss alert/i);
    fireEvent.click(dismissButtons[0]);

    expect(onDismiss).toHaveBeenCalledWith('1');
  });

  it('calls onAction when action button is clicked', () => {
    const alertsWithAction = mockAlerts.map((alert) => ({
      ...alert,
      onAction: vi.fn(),
    }));
    render(<AlertsWidget alerts={alertsWithAction} onDismiss={vi.fn()} />);

    const reviewButton = screen.getByText('Review');
    fireEvent.click(reviewButton);

    expect(alertsWithAction[0].onAction).toHaveBeenCalled();
  });

  it('shows empty state when no alerts', () => {
    render(<AlertsWidget alerts={[]} onDismiss={vi.fn()} />);

    expect(screen.getByText('No active alerts')).toBeInTheDocument();
    expect(
      screen.getByText('All systems are operating normally.')
    ).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    const { container } = render(
      <AlertsWidget alerts={[]} onDismiss={vi.fn()} loading={true} />
    );

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('applies correct styling for error alerts', () => {
    const errorAlert = [mockAlerts[0]];
    const { container } = render(
      <AlertsWidget alerts={errorAlert} onDismiss={vi.fn()} />
    );

    const alertElement = container.querySelector('.border-red-200');
    expect(alertElement).toBeInTheDocument();
  });

  it('applies correct styling for warning alerts', () => {
    const warningAlert = [mockAlerts[1]];
    const { container } = render(
      <AlertsWidget alerts={warningAlert} onDismiss={vi.fn()} />
    );

    const alertElement = container.querySelector('.border-amber-200');
    expect(alertElement).toBeInTheDocument();
  });

  it('formats timestamp correctly', () => {
    render(<AlertsWidget alerts={[mockAlerts[0]]} onDismiss={vi.fn()} />);

    // Check that some time-related text is displayed
    const timeElement = screen.getByText(/ago/i);
    expect(timeElement).toBeInTheDocument();
  });

  it('does not show action button when actionLabel is not provided', () => {
    const alertWithoutAction = [mockAlerts[2]]; // info alert has no actionLabel
    render(<AlertsWidget alerts={alertWithoutAction} onDismiss={vi.fn()} />);

    // Should not find "Review" or "View Settlements" buttons
    expect(screen.queryByText('Review')).not.toBeInTheDocument();
    expect(screen.queryByText('View Settlements')).not.toBeInTheDocument();
  });
});
