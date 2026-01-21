export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  permissions: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  requires_mfa: boolean;
}

export interface MFARequest {
  code: string;
  session_id: string;
}

export interface DashboardStats {
  total_reconciliations: number;
  matched_records: number;
  unmatched_records: number;
  pending_exceptions: number;
  pending_approvals: number;
  total_settlement_amount: number;
  reconciliation_rate: number;
  avg_processing_time: number;
}

export interface IngestionJob {
  id: string;
  file_name: string;
  file_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  records_count: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
  created_by: string;
}

export interface ReconciliationRule {
  id: string;
  name: string;
  description: string;
  rule_type: 'matching' | 'validation' | 'transformation';
  priority: number;
  is_active: boolean;
  conditions: Record<string, any>;
  actions: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MatchedRecord {
  id: string;
  source_record_id: string;
  target_record_id: string;
  match_score: number;
  match_type: 'exact' | 'fuzzy' | 'rule_based';
  matched_at: string;
  matched_by: string;
  status: 'matched' | 'verified' | 'disputed';
}

export interface Exception {
  id: string;
  exception_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  description: string;
  source_reference: string;
  amount?: number;
  currency?: string;
  assigned_to?: string;
  created_at: string;
  resolved_at?: string;
  comments: ExceptionComment[];
}

export interface ExceptionComment {
  id: string;
  exception_id: string;
  user_id: string;
  user_name: string;
  comment: string;
  created_at: string;
}

export interface Approval {
  id: string;
  approval_type: string;
  entity_type: string;
  entity_id: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_by: string;
  requested_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  comments?: string;
}

// Workflow & Approvals Types
export interface ApprovalRequest {
  id: string;
  type: 'rule_change' | 'exception_resolution' | 'settlement_approval' | 'gl_posting' | 'threshold_override';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requestor: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  approver?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  payload: Record<string, any>;
  changes?: ChangeSet;
  metadata: {
    entity_type: string;
    entity_id: string;
    amount?: number;
    currency?: string;
    risk_score?: number;
  };
  created_at: string;
  updated_at: string;
  due_date?: string;
  approved_at?: string;
  rejected_at?: string;
  decision_comment?: string;
  attachments?: ApprovalAttachment[];
  history: ApprovalHistoryEntry[];
  logs: ApprovalLog[];
}

export interface ChangeSet {
  before: Record<string, any>;
  after: Record<string, any>;
  diff: ChangeDiff[];
}

export interface ChangeDiff {
  path: string;
  field: string;
  old_value: any;
  new_value: any;
  change_type: 'added' | 'modified' | 'removed';
}

export interface ApprovalHistoryEntry {
  id: string;
  timestamp: string;
  action: 'created' | 'submitted' | 'approved' | 'rejected' | 'reassigned' | 'cancelled' | 'commented';
  actor: {
    id: string;
    name: string;
    avatar?: string;
  };
  comment?: string;
  metadata?: Record<string, any>;
}

export interface ApprovalLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  details?: Record<string, any>;
}

export interface ApprovalAttachment {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
  url: string;
}

export interface ApprovalStats {
  total_pending: number;
  total_approved: number;
  total_rejected: number;
  avg_approval_time: number;
  overdue_count: number;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
}

export interface SettlementBatch {
  id: string;
  batch_number: string;
  batch_date: string;
  total_amount: number;
  currency: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'processed';
  records_count: number;
  created_by: string;
  created_at: string;
}

// Settlement Module Types
export interface SettlementRun {
  id: string;
  run_number: string;
  run_date: string;
  period_start: string;
  period_end: string;
  status: 'draft' | 'calculating' | 'pending_review' | 'pending_approval' | 'approved' | 'processing' | 'completed' | 'failed';
  total_amount: number;
  total_transactions: number;
  partner_count: number;
  currency: string;
  payment_method: 'bank_transfer' | 'ach' | 'wire' | 'check';
  created_by: {
    id: string;
    name: string;
    email: string;
  };
  approved_by?: {
    id: string;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
  completed_at?: string;
  notes?: string;
  breakdown: PartnerSettlement[];
  summary: SettlementSummary;
}

export interface PartnerSettlement {
  id: string;
  settlement_run_id: string;
  partner: {
    id: string;
    code: string;
    name: string;
    type: string;
    bank_account?: string;
  };
  gross_amount: number;
  fees: number;
  adjustments: number;
  net_amount: number;
  transaction_count: number;
  currency: string;
  status: 'pending' | 'approved' | 'paid' | 'failed';
  transactions: SettlementTransaction[];
  payment_details?: {
    method: string;
    reference?: string;
    paid_at?: string;
  };
}

export interface SettlementTransaction {
  id: string;
  transaction_id: string;
  transaction_date: string;
  transaction_type: string;
  amount: number;
  fee: number;
  net_amount: number;
  currency: string;
  reference: string;
  description?: string;
}

export interface SettlementSummary {
  total_gross_amount: number;
  total_fees: number;
  total_adjustments: number;
  total_net_amount: number;
  total_transactions: number;
  partner_count: number;
  currency: string;
  by_partner_type: Record<string, {
    count: number;
    gross_amount: number;
    net_amount: number;
  }>;
  by_status: Record<string, number>;
  by_payment_method: Record<string, {
    count: number;
    amount: number;
  }>;
}

export interface CreateSettlementRunRequest {
  period_start: string;
  period_end: string;
  partner_ids?: string[];
  payment_method: string;
  notes?: string;
}

export interface SettlementStats {
  total_runs: number;
  pending_count: number;
  completed_count: number;
  total_settled_amount: number;
  avg_settlement_amount: number;
  total_partners: number;
  recent_runs: SettlementRun[];
}

export interface GLJournal {
  id: string;
  journal_number: string;
  posting_date: string;
  description: string;
  total_debit: number;
  total_credit: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'posted';
  entries: GLJournalEntry[];
  created_at: string;
}

export interface GLJournalEntry {
  id: string;
  account_code: string;
  account_name: string;
  debit_amount: number;
  credit_amount: number;
  description: string;
}

export interface Report {
  id: string;
  name: string;
  description: string;
  report_type: 'reconciliation' | 'matching' | 'exceptions' | 'settlement' | 'gl_posting' | 'audit' | 'performance';
  category: 'operational' | 'financial' | 'compliance' | 'analytics';
  format: 'pdf' | 'csv' | 'excel' | 'json';
  schedule?: ReportSchedule;
  parameters?: Record<string, any>;
  last_run?: string;
  next_run?: string;
  status: 'active' | 'paused' | 'draft';
  created_by: User;
  created_at: string;
  updated_at: string;
}

export interface ReportSchedule {
  id: string;
  report_id: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'on_demand';
  day_of_week?: number; // 0-6 for weekly
  day_of_month?: number; // 1-31 for monthly
  time: string; // HH:mm format
  timezone: string;
  recipients: string[];
  enabled: boolean;
}

export interface ReportExecution {
  id: string;
  report_id: string;
  report_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  duration?: number; // seconds
  file_url?: string;
  file_size?: number; // bytes
  error_message?: string;
  executed_by: User;
  parameters: Record<string, any>;
}

export interface ReportStats {
  total_reports: number;
  active_schedules: number;
  executions_today: number;
  total_downloads: number;
  avg_execution_time: number; // seconds
  failed_executions: number;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes: Record<string, any>;
  ip_address: string;
  timestamp: string;
}

export interface Partner {
  id: string;
  name: string;
  code: string;
  type: string;
  status: 'active' | 'inactive';
  contact_email: string;
  contact_phone: string;
  created_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  users_count: number;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ========================================
// GL Posting Types
// ========================================

export interface JournalBatch {
  id: string;
  batchNumber: string;
  description: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'posted' | 'rejected' | 'failed';
  periodStart: string;
  periodEnd: string;
  totalDebit: number;
  totalCredit: number;
  entryCount: number;
  currency: string;
  companyCode: string;
  fiscalYear: string;
  fiscalPeriod: string;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  postedBy?: string;
  postedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  externalReference?: string;
  notes?: string;
}

export interface JournalEntry {
  id: string;
  batchId: string;
  lineNumber: number;
  accountCode: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  description: string;
  costCenter?: string;
  department?: string;
  project?: string;
  reference?: string;
  taxCode?: string;
  taxAmount?: number;
  suspenseFlag: boolean;
  suspenseReason?: string;
  createdAt: string;
}

export interface GLAccount {
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  category: string;
  balance: number;
  currency: string;
  isActive: boolean;
}

export interface JournalBatchSummary {
  batchId: string;
  totalDebit: number;
  totalCredit: number;
  balance: number;
  entryCount: number;
  suspenseCount: number;
  accountsAffected: number;
  byAccountType: {
    asset: number;
    liability: number;
    equity: number;
    revenue: number;
    expense: number;
  };
}

export interface GLPostingStats {
  totalBatches: number;
  pendingApproval: number;
  approvedBatches: number;
  postedBatches: number;
  totalDebit: number;
  totalCredit: number;
  suspenseEntries: number;
  avgBatchSize: number;
}

export interface CreateJournalBatchRequest {
  description: string;
  periodStart: string;
  periodEnd: string;
  companyCode: string;
  fiscalYear: string;
  fiscalPeriod: string;
  externalReference?: string;
  notes?: string;
  entries: CreateJournalEntryRequest[];
}

export interface CreateJournalEntryRequest {
  accountCode: string;
  debitAmount: number;
  creditAmount: number;
  description: string;
  costCenter?: string;
  department?: string;
  project?: string;
  reference?: string;
  taxCode?: string;
  taxAmount?: number;
}

// ========================================
// Admin Module Types
// ========================================

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  username: string;
  roleId: string;
  roleName: string;
  status: 'active' | 'inactive' | 'locked' | 'pending';
  avatar?: string;
  phone?: string;
  department?: string;
  lastLogin?: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  mfaEnabled: boolean;
  emailVerified: boolean;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  module: string;
  description: string;
  category: 'read' | 'write' | 'delete' | 'admin';
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  permissionIds: string[];
  userCount: number;
  isSystem: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PartnerConfig {
  id: string;
  name: string;
  code: string;
  type: 'payment_processor' | 'acquirer' | 'gateway' | 'merchant' | 'bank';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  contactName?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  apiEndpoint?: string;
  apiKey?: string;
  settlementFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  currency: string;
  timezone: string;
  feePercentage?: number;
  contractStartDate?: string;
  contractEndDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SystemConfig {
  id: string;
  category: string;
  key: string;
  value: string;
  dataType: 'string' | 'number' | 'boolean' | 'json';
  description: string;
  isSecret: boolean;
  isEditable: boolean;
  defaultValue?: string;
  validationRules?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  username: string;
  roleId: string;
  phone?: string;
  department?: string;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  roleId?: string;
  phone?: string;
  department?: string;
  status?: 'active' | 'inactive' | 'locked';
  mfaEnabled?: boolean;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissionIds: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

export interface CreatePartnerRequest {
  name: string;
  code: string;
  type: 'payment_processor' | 'acquirer' | 'gateway' | 'merchant' | 'bank';
  contactEmail: string;
  contactName?: string;
  contactPhone?: string;
  address?: string;
  settlementFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  currency: string;
  timezone: string;
  feePercentage?: number;
}

export interface UpdatePartnerRequest {
  name?: string;
  contactEmail?: string;
  contactName?: string;
  contactPhone?: string;
  address?: string;
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  settlementFrequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  feePercentage?: number;
  apiEndpoint?: string;
  apiKey?: string;
  notes?: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  totalPartners: number;
  activePartners: number;
  pendingUsers: number;
}
