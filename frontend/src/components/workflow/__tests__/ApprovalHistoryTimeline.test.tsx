import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ApprovalHistoryTimeline } from '../ApprovalHistoryTimeline';
import type { ApprovalHistoryEntry } from '@/types';

const mockHistory: ApprovalHistoryEntry[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    action: 'created',
    actor: {
      id: '1',
      name: 'John Doe',
      avatar: undefined
    },
    comment: 'Initial request created'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 3000000).toISOString(), // 50 mins ago
    action: 'submitted',
    actor: {
      id: '1',
      name: 'John Doe',
      avatar: undefined
    }
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 600000).toISOString(), // 10 mins ago
    action: 'approved',
    actor: {
      id: '2',
      name: 'Jane Smith',
      avatar: undefined
    },
    comment: 'Approved after review'
  }
];

describe('ApprovalHistoryTimeline', () => {
  it('renders all history entries', () => {
    render(<ApprovalHistoryTimeline history={mockHistory} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('displays action labels correctly', () => {
    render(<ApprovalHistoryTimeline history={mockHistory} />);

    expect(screen.getByText(/created/i)).toBeInTheDocument();
    expect(screen.getByText(/submitted/i)).toBeInTheDocument();
    expect(screen.getByText(/approved/i)).toBeInTheDocument();
  });

  it('shows comments when available', () => {
    render(<ApprovalHistoryTimeline history={mockHistory} />);

    expect(screen.getByText('Initial request created')).toBeInTheDocument();
    expect(screen.getByText('Approved after review')).toBeInTheDocument();
  });

  it('displays relative timestamps', () => {
    render(<ApprovalHistoryTimeline history={mockHistory} />);

    expect(screen.getByText(/ago/)).toBeInTheDocument();
  });

  it('shows total event count', () => {
    render(<ApprovalHistoryTimeline history={mockHistory} />);

    expect(screen.getByText('3 events recorded')).toBeInTheDocument();
  });

  it('displays empty state when no history', () => {
    render(<ApprovalHistoryTimeline history={[]} />);

    expect(screen.getByText('No history available')).toBeInTheDocument();
  });

  it('renders metadata when available', () => {
    const historyWithMetadata: ApprovalHistoryEntry[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        action: 'reassigned',
        actor: {
          id: '1',
          name: 'Admin User',
          avatar: undefined
        },
        metadata: {
          from: 'user1',
          to: 'user2'
        }
      }
    ];

    render(<ApprovalHistoryTimeline history={historyWithMetadata} />);

    expect(screen.getByText('View metadata')).toBeInTheDocument();
  });

  it('shows all action types correctly', () => {
    const allActions: ApprovalHistoryEntry[] = [
      { id: '1', timestamp: new Date().toISOString(), action: 'created', actor: { id: '1', name: 'User 1' } },
      { id: '2', timestamp: new Date().toISOString(), action: 'submitted', actor: { id: '1', name: 'User 1' } },
      { id: '3', timestamp: new Date().toISOString(), action: 'approved', actor: { id: '2', name: 'User 2' } },
      { id: '4', timestamp: new Date().toISOString(), action: 'rejected', actor: { id: '2', name: 'User 2' } },
      { id: '5', timestamp: new Date().toISOString(), action: 'reassigned', actor: { id: '3', name: 'User 3' } },
      { id: '6', timestamp: new Date().toISOString(), action: 'cancelled', actor: { id: '1', name: 'User 1' } },
      { id: '7', timestamp: new Date().toISOString(), action: 'commented', actor: { id: '4', name: 'User 4' } }
    ];

    render(<ApprovalHistoryTimeline history={allActions} />);

    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Submitted')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Rejected')).toBeInTheDocument();
    expect(screen.getByText('Reassigned')).toBeInTheDocument();
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
    expect(screen.getByText('Commented')).toBeInTheDocument();
  });

  it('displays user initials in avatars', () => {
    render(<ApprovalHistoryTimeline history={mockHistory} />);

    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.getByText('JS')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ApprovalHistoryTimeline history={mockHistory} className="custom-class" />
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
