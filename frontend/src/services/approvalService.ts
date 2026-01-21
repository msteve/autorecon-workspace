// Use static mock data when backend is unavailable
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
if (USE_MOCK_DATA) {
  console.info('✅ Approval Service: Using static mock data (backend unavailable)');
}

import type { ApprovalRequest, ApprovalStats, PaginatedResponse } from '@/types';

// Mock data generator
const generateMockApprovals = (): ApprovalRequest[] => {
  const types: ApprovalRequest['type'][] = [
    'rule_change',
    'exception_resolution',
    'settlement_approval',
    'gl_posting',
    'threshold_override'
  ];

  const priorities: ApprovalRequest['priority'][] = ['low', 'medium', 'high', 'urgent'];
  const statuses: ApprovalRequest['status'][] = ['pending', 'approved', 'rejected'];

  const users = [
    { id: '1', name: 'John Smith', email: 'john.smith@autorecon.com', avatar: undefined },
    { id: '2', name: 'Sarah Johnson', email: 'sarah.j@autorecon.com', avatar: undefined },
    { id: '3', name: 'Mike Chen', email: 'mike.chen@autorecon.com', avatar: undefined },
    { id: '4', name: 'Emily Davis', email: 'emily.d@autorecon.com', avatar: undefined },
  ];

  const approvals: ApprovalRequest[] = [];

  for (let i = 1; i <= 25; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const status = i <= 15 ? 'pending' : statuses[Math.floor(Math.random() * statuses.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const requestor = users[Math.floor(Math.random() * users.length)];
    const approver = status !== 'pending' ? users[Math.floor(Math.random() * users.length)] : undefined;

    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30));

    let payload: Record<string, any> = {};
    let changes: any = undefined;
    let metadata: any = {};

    switch (type) {
      case 'rule_change':
        payload = {
          rule_id: `RULE-${1000 + i}`,
          rule_name: `Matching Rule ${i}`,
          version: '2.0'
        };
        changes = {
          before: { threshold: 0.85, tolerance: 0.05, enabled: true },
          after: { threshold: 0.90, tolerance: 0.03, enabled: true },
          diff: [
            { path: 'threshold', field: 'Match Threshold', old_value: 0.85, new_value: 0.90, change_type: 'modified' },
            { path: 'tolerance', field: 'Tolerance', old_value: 0.05, new_value: 0.03, change_type: 'modified' }
          ]
        };
        metadata = { entity_type: 'rule', entity_id: `RULE-${1000 + i}`, risk_score: 65 };
        break;

      case 'exception_resolution':
        payload = {
          exception_id: `EXC-${2000 + i}`,
          resolution_type: 'manual_match',
          matched_transaction_id: `TXN-${3000 + i}`
        };
        changes = {
          before: { status: 'open', assigned_to: null },
          after: { status: 'resolved', assigned_to: requestor.id },
          diff: [
            { path: 'status', field: 'Status', old_value: 'open', new_value: 'resolved', change_type: 'modified' }
          ]
        };
        metadata = { 
          entity_type: 'exception', 
          entity_id: `EXC-${2000 + i}`,
          amount: 15000 + Math.random() * 50000,
          currency: 'USD',
          risk_score: 45
        };
        break;

      case 'settlement_approval':
        payload = {
          batch_id: `BATCH-${4000 + i}`,
          batch_number: `STL-2024-${String(i).padStart(4, '0')}`,
          total_records: 150 + Math.floor(Math.random() * 500)
        };
        metadata = { 
          entity_type: 'settlement', 
          entity_id: `BATCH-${4000 + i}`,
          amount: 500000 + Math.random() * 2000000,
          currency: 'USD',
          risk_score: 30
        };
        break;

      case 'gl_posting':
        payload = {
          journal_id: `JNL-${5000 + i}`,
          journal_number: `GL-2024-${String(i).padStart(5, '0')}`,
          entry_count: 10 + Math.floor(Math.random() * 50)
        };
        metadata = { 
          entity_type: 'gl_journal', 
          entity_id: `JNL-${5000 + i}`,
          amount: 100000 + Math.random() * 1000000,
          currency: 'USD',
          risk_score: 20
        };
        break;

      case 'threshold_override':
        payload = {
          override_type: 'variance_threshold',
          current_value: 5000,
          new_value: 10000,
          duration: '30 days'
        };
        changes = {
          before: { variance_threshold: 5000, enabled: true },
          after: { variance_threshold: 10000, enabled: true },
          diff: [
            { path: 'variance_threshold', field: 'Variance Threshold', old_value: 5000, new_value: 10000, change_type: 'modified' }
          ]
        };
        metadata = { entity_type: 'system_config', entity_id: 'variance_config', risk_score: 55 };
        break;
    }

    const dueDate = new Date(createdDate);
    dueDate.setDate(dueDate.getDate() + (priority === 'urgent' ? 1 : priority === 'high' ? 3 : 7));

    const history: ApprovalRequest['history'] = [
      {
        id: `${i}-1`,
        timestamp: createdDate.toISOString(),
        action: 'created',
        actor: requestor,
        comment: 'Approval request created'
      },
      {
        id: `${i}-2`,
        timestamp: new Date(createdDate.getTime() + 60000).toISOString(),
        action: 'submitted',
        actor: requestor,
        comment: 'Submitted for approval'
      }
    ];

    const logs: ApprovalRequest['logs'] = [
      {
        id: `${i}-log-1`,
        timestamp: createdDate.toISOString(),
        level: 'info',
        message: 'Approval request created successfully',
        details: { type, priority }
      },
      {
        id: `${i}-log-2`,
        timestamp: new Date(createdDate.getTime() + 30000).toISOString(),
        level: 'info',
        message: 'Validation checks passed',
        details: { validation_result: 'passed' }
      },
      {
        id: `${i}-log-3`,
        timestamp: new Date(createdDate.getTime() + 60000).toISOString(),
        level: 'info',
        message: 'Notification sent to approvers',
        details: { notification_count: 2 }
      }
    ];

    if (status === 'approved') {
      const approvedDate = new Date(createdDate.getTime() + Math.random() * 86400000 * 3);
      history.push({
        id: `${i}-3`,
        timestamp: approvedDate.toISOString(),
        action: 'approved',
        actor: approver!,
        comment: 'Approved after review'
      });
      logs.push({
        id: `${i}-log-4`,
        timestamp: approvedDate.toISOString(),
        level: 'info',
        message: 'Request approved',
        details: { approver: approver!.name }
      });
    } else if (status === 'rejected') {
      const rejectedDate = new Date(createdDate.getTime() + Math.random() * 86400000 * 2);
      history.push({
        id: `${i}-3`,
        timestamp: rejectedDate.toISOString(),
        action: 'rejected',
        actor: approver!,
        comment: 'Insufficient documentation provided'
      });
      logs.push({
        id: `${i}-log-4`,
        timestamp: rejectedDate.toISOString(),
        level: 'warning',
        message: 'Request rejected',
        details: { approver: approver!.name, reason: 'Insufficient documentation' }
      });
    }

    approvals.push({
      id: `APR-${String(i).padStart(6, '0')}`,
      type,
      title: getTitleForType(type, i),
      description: getDescriptionForType(type, i),
      status,
      priority,
      requestor,
      approver,
      payload,
      changes,
      metadata,
      created_at: createdDate.toISOString(),
      updated_at: new Date().toISOString(),
      due_date: dueDate.toISOString(),
      approved_at: status === 'approved' ? history[history.length - 1].timestamp : undefined,
      rejected_at: status === 'rejected' ? history[history.length - 1].timestamp : undefined,
      decision_comment: status === 'approved' ? 'Approved after review' : status === 'rejected' ? 'Insufficient documentation provided' : undefined,
      history,
      logs
    });
  }

  return approvals.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

const getTitleForType = (type: ApprovalRequest['type'], index: number): string => {
  const titles: Record<ApprovalRequest['type'], string> = {
    rule_change: `Rule Change Request - Matching Rule ${index}`,
    exception_resolution: `Exception Resolution - EXC-${2000 + index}`,
    settlement_approval: `Settlement Batch Approval - STL-2024-${String(index).padStart(4, '0')}`,
    gl_posting: `GL Journal Posting - GL-2024-${String(index).padStart(5, '0')}`,
    threshold_override: `Threshold Override Request - Variance Limit`
  };
  return titles[type];
};

const getDescriptionForType = (type: ApprovalRequest['type'], index: number): string => {
  const descriptions: Record<ApprovalRequest['type'], string> = {
    rule_change: 'Request to modify matching rule parameters to improve accuracy and reduce false positives.',
    exception_resolution: 'Manual resolution of unmatched exception requires approval before finalizing.',
    settlement_approval: 'Settlement batch ready for approval before processing payments to partners.',
    gl_posting: 'General ledger journal entries require approval before posting to accounting system.',
    threshold_override: 'Temporary override of variance threshold to accommodate known data quality issues.'
  };
  return descriptions[type];
};

// Cache for mock data
let mockApprovals: ApprovalRequest[] | null = null;

const getMockApprovals = (): ApprovalRequest[] => {
  if (!mockApprovals) {
    mockApprovals = generateMockApprovals();
  }
  return mockApprovals;
};

export const approvalService = {
  // Get paginated list of approval requests
  getApprovals: async (params?: {
    page?: number;
    page_size?: number;
    status?: string;
    type?: string;
    priority?: string;
    search?: string;
  }): Promise<PaginatedResponse<ApprovalRequest>> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    let filtered = [...getMockApprovals()];

    // Apply filters
    if (params?.status) {
      filtered = filtered.filter(a => a.status === params.status);
    }
    if (params?.type) {
      filtered = filtered.filter(a => a.type === params.type);
    }
    if (params?.priority) {
      filtered = filtered.filter(a => a.priority === params.priority);
    }
    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(search) ||
        a.description.toLowerCase().includes(search) ||
        a.id.toLowerCase().includes(search)
      );
    }

    // Pagination
    const page = params?.page || 1;
    const page_size = params?.page_size || 10;
    const start = (page - 1) * page_size;
    const end = start + page_size;
    const items = filtered.slice(start, end);

    return {
      items,
      total: filtered.length,
      page,
      page_size,
      total_pages: Math.ceil(filtered.length / page_size)
    };
  },

  // Get single approval request by ID
  getApprovalById: async (id: string): Promise<ApprovalRequest> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const approval = getMockApprovals().find(a => a.id === id);
    if (!approval) {
      throw new Error(`Approval request ${id} not found`);
    }
    return approval;
  },

  // Approve a request
  approveRequest: async (id: string, comment?: string): Promise<ApprovalRequest> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const approval = getMockApprovals().find(a => a.id === id);
    if (!approval) {
      throw new Error(`Approval request ${id} not found`);
    }

    const now = new Date().toISOString();
    const approver = {
      id: 'current-user',
      name: 'Current User',
      email: 'approver@autorecon.com'
    };

    approval.status = 'approved';
    approval.approver = approver;
    approval.approved_at = now;
    approval.decision_comment = comment || 'Approved';
    approval.updated_at = now;

    approval.history.push({
      id: `${approval.history.length + 1}`,
      timestamp: now,
      action: 'approved',
      actor: approver,
      comment: comment || 'Approved'
    });

    approval.logs.push({
      id: `${approval.logs.length + 1}`,
      timestamp: now,
      level: 'info',
      message: 'Request approved successfully',
      details: { approver: approver.name }
    });

    return approval;
  },

  // Reject a request
  rejectRequest: async (id: string, comment: string): Promise<ApprovalRequest> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const approval = getMockApprovals().find(a => a.id === id);
    if (!approval) {
      throw new Error(`Approval request ${id} not found`);
    }

    const now = new Date().toISOString();
    const approver = {
      id: 'current-user',
      name: 'Current User',
      email: 'approver@autorecon.com'
    };

    approval.status = 'rejected';
    approval.approver = approver;
    approval.rejected_at = now;
    approval.decision_comment = comment;
    approval.updated_at = now;

    approval.history.push({
      id: `${approval.history.length + 1}`,
      timestamp: now,
      action: 'rejected',
      actor: approver,
      comment
    });

    approval.logs.push({
      id: `${approval.logs.length + 1}`,
      timestamp: now,
      level: 'warning',
      message: 'Request rejected',
      details: { approver: approver.name, reason: comment }
    });

    return approval;
  },

  // Get approval statistics
  getApprovalStats: async (): Promise<ApprovalStats> => {
    await new Promise(resolve => setTimeout(resolve, 400));

    const approvals = getMockApprovals();
    const pending = approvals.filter(a => a.status === 'pending');
    const approved = approvals.filter(a => a.status === 'approved');
    const rejected = approvals.filter(a => a.status === 'rejected');

    // Calculate average approval time
    const completedApprovals = [...approved, ...rejected];
    const approvalTimes = completedApprovals.map(a => {
      const created = new Date(a.created_at).getTime();
      const completed = new Date(a.approved_at || a.rejected_at || a.created_at).getTime();
      return completed - created;
    });
    const avg_approval_time = approvalTimes.length > 0
      ? approvalTimes.reduce((sum, time) => sum + time, 0) / approvalTimes.length
      : 0;

    // Count overdue
    const now = new Date().getTime();
    const overdue_count = pending.filter(a => 
      a.due_date && new Date(a.due_date).getTime() < now
    ).length;

    // Group by type and priority
    const by_type: Record<string, number> = {};
    const by_priority: Record<string, number> = {};

    pending.forEach(a => {
      by_type[a.type] = (by_type[a.type] || 0) + 1;
      by_priority[a.priority] = (by_priority[a.priority] || 0) + 1;
    });

    return {
      total_pending: pending.length,
      total_approved: approved.length,
      total_rejected: rejected.length,
      avg_approval_time: avg_approval_time / (1000 * 60 * 60), // Convert to hours
      overdue_count,
      by_type,
      by_priority
    };
  }
};
