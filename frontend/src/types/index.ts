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
  report_type: string;
  schedule?: string;
  last_run?: string;
  next_run?: string;
  status: 'active' | 'paused';
  created_at: string;
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
