import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApprovalDecisionBar } from '../ApprovalDecisionBar';
import type { ApprovalRequest } from '@/types';

const mockPendingApproval: ApprovalRequest = {
  id: 'APR-000001',
  type: 'rule_change',
  title: 'Test Approval',
  description: 'Test description',
  status: 'pending',
  priority: 'high',
  requestor: {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com'
  },
  payload: {},
  metadata: {
    entity_type: 'rule',
    entity_id: 'RULE-001',
    risk_score: 50
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  history: [],
  logs: []
};

const mockApprovedApproval: ApprovalRequest = {
  ...mockPendingApproval,
  status: 'approved',
  approver: {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com'
  },
  approved_at: new Date().toISOString(),
  decision_comment: 'Looks good'
};

describe('ApprovalDecisionBar', () => {
  it('renders decision buttons for pending approvals', () => {
    render(
      <ApprovalDecisionBar
        approval={mockPendingApproval}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />
    );

    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
  });

  it('shows high risk warning for high risk score', () => {
    const highRiskApproval = {
      ...mockPendingApproval,
      metadata: { ...mockPendingApproval.metadata, risk_score: 80 }
    };

    render(
      <ApprovalDecisionBar
        approval={highRiskApproval}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />
    );

    expect(screen.getByText(/High risk score/)).toBeInTheDocument();
  });

  it('shows comment box when approve button is clicked', async () => {
    render(
      <ApprovalDecisionBar
        approval={mockPendingApproval}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />
    );

    const approveButton = screen.getByText('Approve');
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(screen.getByText('Approve Request')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Add a comment/)).toBeInTheDocument();
    });
  });

  it('shows comment box when reject button is clicked', async () => {
    render(
      <ApprovalDecisionBar
        approval={mockPendingApproval}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />
    );

    const rejectButton = screen.getByText('Reject');
    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(screen.getByText('Reject Request')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/reason for rejection/)).toBeInTheDocument();
    });
  });

  it('calls onApprove with comment when approved', async () => {
    const onApproveMock = vi.fn().mockResolvedValue(undefined);
    
    render(
      <ApprovalDecisionBar
        approval={mockPendingApproval}
        onApprove={onApproveMock}
        onReject={vi.fn()}
      />
    );

    // Click approve
    fireEvent.click(screen.getByText('Approve'));

    // Enter comment
    const textarea = await screen.findByPlaceholderText(/Add a comment/);
    fireEvent.change(textarea, { target: { value: 'Test comment' } });

    // Confirm
    const confirmButton = screen.getByText('Confirm Approval');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(onApproveMock).toHaveBeenCalledWith('Test comment');
    });
  });

  it('requires rejection reason', async () => {
    const onRejectMock = vi.fn().mockResolvedValue(undefined);
    
    render(
      <ApprovalDecisionBar
        approval={mockPendingApproval}
        onApprove={vi.fn()}
        onReject={onRejectMock}
      />
    );

    // Click reject
    fireEvent.click(screen.getByText('Reject'));

    // Try to confirm without comment
    const confirmButton = await screen.findByText('Confirm Rejection');
    expect(confirmButton).toBeDisabled();

    // Enter rejection reason
    const textarea = screen.getByPlaceholderText(/reason for rejection/);
    fireEvent.change(textarea, { target: { value: 'Not valid' } });

    // Now should be enabled
    expect(confirmButton).not.toBeDisabled();
  });

  it('displays approved status for approved requests', () => {
    render(
      <ApprovalDecisionBar
        approval={mockApprovedApproval}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />
    );

    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Looks good')).toBeInTheDocument();
  });

  it('disables buttons when disabled prop is true', () => {
    render(
      <ApprovalDecisionBar
        approval={mockPendingApproval}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        disabled={true}
      />
    );

    expect(screen.getByText('Approve')).toBeDisabled();
    expect(screen.getByText('Reject')).toBeDisabled();
  });

  it('allows cancelling comment entry', async () => {
    render(
      <ApprovalDecisionBar
        approval={mockPendingApproval}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />
    );

    // Click approve
    fireEvent.click(screen.getByText('Approve'));

    // Click cancel
    const cancelButton = await screen.findByText('Cancel');
    fireEvent.click(cancelButton);

    // Should be back to initial state
    await waitFor(() => {
      expect(screen.getByText('Approve')).toBeInTheDocument();
      expect(screen.queryByText('Approve Request')).not.toBeInTheDocument();
    });
  });
});
