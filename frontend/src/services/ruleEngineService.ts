import { apiClient } from './apiClient';

/**
 * Rule status types
 */
export type RuleStatus = 'draft' | 'pending_approval' | 'approved' | 'active' | 'inactive' | 'rejected';

/**
 * Rule approval status
 */
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

/**
 * Field data types for condition builder
 */
export type FieldType = 'string' | 'number' | 'date' | 'boolean' | 'amount';

/**
 * Comparators for different field types
 */
export type Comparator = 
  | 'equals' | 'not_equals'
  | 'contains' | 'not_contains' | 'starts_with' | 'ends_with'
  | 'greater_than' | 'less_than' | 'greater_than_or_equal' | 'less_than_or_equal'
  | 'between' | 'in' | 'not_in'
  | 'is_null' | 'is_not_null';

/**
 * Match strategy types
 */
export type MatchStrategy = 'exact' | 'fuzzy' | 'n_way' | 'ai_assisted';

/**
 * Condition in a rule
 */
export interface RuleCondition {
  id: string;
  field: string;
  fieldType: FieldType;
  comparator: Comparator;
  value?: any;
  value2?: any; // For "between" comparator
  logicalOperator?: 'AND' | 'OR'; // For combining with next condition
}

/**
 * Match configuration
 */
export interface MatchConfiguration {
  strategy: MatchStrategy;
  threshold?: number; // For fuzzy matching (0-100)
  keyFields?: string[]; // For n-way matching
  tolerance?: {
    amount?: number;
    percentage?: number;
  };
  aiModel?: string; // For AI-assisted matching
}

/**
 * Rule definition
 */
export interface Rule {
  id: string;
  ruleNumber: string;
  name: string;
  description: string;
  status: RuleStatus;
  version: number;
  conditions: RuleCondition[];
  matchConfiguration: MatchConfiguration;
  priority: number;
  isEnabled: boolean;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  tags: string[];
  appliesTo: {
    partners?: string[];
    reconciliationTypes?: string[];
  };
  statistics?: {
    timesApplied: number;
    successfulMatches: number;
    lastApplied?: string;
  };
}

/**
 * Rule version for history tracking
 */
export interface RuleVersion {
  id: string;
  ruleId: string;
  version: number;
  name: string;
  description: string;
  conditions: RuleCondition[];
  matchConfiguration: MatchConfiguration;
  changedBy: string;
  changedAt: string;
  changeType: 'created' | 'updated' | 'approved' | 'rejected' | 'activated' | 'deactivated';
  changeDescription: string;
  previousVersion?: number;
}

/**
 * Approval request
 */
export interface ApprovalRequest {
  id: string;
  ruleId: string;
  ruleName: string;
  ruleVersion: number;
  requestedBy: string;
  requestedAt: string;
  status: ApprovalStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

/**
 * Available field for condition builder
 */
export interface AvailableField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  category: string;
  description: string;
  allowedComparators: Comparator[];
  sampleValues?: string[];
}

/**
 * Filter options for rule list
 */
export interface RuleListFilters {
  status?: RuleStatus[];
  search?: string;
  tags?: string[];
  partners?: string[];
  reconciliationTypes?: string[];
  isEnabled?: boolean;
  createdBy?: string;
}

/**
 * Sort options for rule list
 */
export interface RuleSortOption {
  field: 'name' | 'ruleNumber' | 'priority' | 'createdAt' | 'updatedAt' | 'timesApplied';
  direction: 'asc' | 'desc';
}

// Mock data generators
const partners = ['Partner A', 'Partner B', 'Partner C', 'Partner D', 'Partner E'];
const reconciliationTypes = ['Bank Reconciliation', 'Invoice Matching', 'Payment Reconciliation', 'Inventory Reconciliation', 'GL Reconciliation'];
const users = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'Tom Brown'];
const tags = ['critical', 'automated', 'manual-review', 'high-value', 'daily', 'monthly'];

/**
 * Generate mock rule
 */
function generateMockRule(index: number, status: RuleStatus): Rule {
  const createdDate = new Date(2024, 0, index + 1);
  const updatedDate = new Date(2024, 6, index + 10);
  const version = Math.floor(Math.random() * 5) + 1;
  
  const conditions: RuleCondition[] = [
    {
      id: `cond-${index}-1`,
      field: 'transaction.amount',
      fieldType: 'amount',
      comparator: 'greater_than',
      value: 1000,
      logicalOperator: 'AND'
    },
    {
      id: `cond-${index}-2`,
      field: 'transaction.currency',
      fieldType: 'string',
      comparator: 'equals',
      value: 'USD',
      logicalOperator: 'AND'
    },
    {
      id: `cond-${index}-3`,
      field: 'transaction.date',
      fieldType: 'date',
      comparator: 'between',
      value: '2024-01-01',
      value2: '2024-12-31'
    }
  ];

  return {
    id: `rule-${index}`,
    ruleNumber: `RUL-${String(index).padStart(5, '0')}`,
    name: `Auto Match Rule ${index}`,
    description: `Automatically match transactions for ${partners[index % partners.length]} with amount greater than $1,000`,
    status,
    version,
    conditions,
    matchConfiguration: {
      strategy: ['exact', 'fuzzy', 'n_way'][index % 3] as MatchStrategy,
      threshold: 85,
      keyFields: ['transaction_id', 'amount', 'date'],
      tolerance: {
        amount: 0.01,
        percentage: 0.1
      }
    },
    priority: (index % 5) + 1,
    isEnabled: status === 'active',
    createdBy: users[index % users.length],
    createdAt: createdDate.toISOString(),
    updatedBy: users[(index + 1) % users.length],
    updatedAt: updatedDate.toISOString(),
    approvedBy: status === 'active' || status === 'approved' ? users[(index + 2) % users.length] : undefined,
    approvedAt: status === 'active' || status === 'approved' ? updatedDate.toISOString() : undefined,
    rejectedBy: status === 'rejected' ? users[(index + 2) % users.length] : undefined,
    rejectedAt: status === 'rejected' ? updatedDate.toISOString() : undefined,
    rejectionReason: status === 'rejected' ? 'Conditions too broad, may cause false positives' : undefined,
    tags: [tags[index % tags.length], tags[(index + 1) % tags.length]],
    appliesTo: {
      partners: [partners[index % partners.length]],
      reconciliationTypes: [reconciliationTypes[index % reconciliationTypes.length]]
    },
    statistics: {
      timesApplied: Math.floor(Math.random() * 1000) + 100,
      successfulMatches: Math.floor(Math.random() * 800) + 50,
      lastApplied: new Date(2024, 11, Math.floor(Math.random() * 30) + 1).toISOString()
    }
  };
}

/**
 * Generate mock rule versions
 */
function generateMockVersions(ruleId: string, currentVersion: number): RuleVersion[] {
  const versions: RuleVersion[] = [];
  
  for (let v = 1; v <= currentVersion; v++) {
    const changeDate = new Date(2024, 0, v * 10);
    versions.push({
      id: `version-${ruleId}-${v}`,
      ruleId,
      version: v,
      name: `Auto Match Rule (v${v})`,
      description: v === 1 ? 'Initial version' : `Updated conditions and match strategy`,
      conditions: [],
      matchConfiguration: {
        strategy: 'exact',
        threshold: 80 + (v * 5)
      },
      changedBy: users[v % users.length],
      changedAt: changeDate.toISOString(),
      changeType: v === 1 ? 'created' : v === currentVersion ? 'approved' : 'updated',
      changeDescription: v === 1 ? 'Rule created' : `Updated match threshold to ${80 + (v * 5)}%`,
      previousVersion: v > 1 ? v - 1 : undefined
    });
  }
  
  return versions;
}

/**
 * Generate mock approval requests
 */
function generateMockApprovalRequests(): ApprovalRequest[] {
  return [
    {
      id: 'approval-1',
      ruleId: 'rule-3',
      ruleName: 'Auto Match Rule 3',
      ruleVersion: 2,
      requestedBy: 'John Doe',
      requestedAt: new Date(2024, 11, 15).toISOString(),
      status: 'pending',
      changes: [
        {
          field: 'matchConfiguration.threshold',
          oldValue: 80,
          newValue: 90
        },
        {
          field: 'priority',
          oldValue: 3,
          newValue: 1
        }
      ]
    },
    {
      id: 'approval-2',
      ruleId: 'rule-5',
      ruleName: 'Auto Match Rule 5',
      ruleVersion: 3,
      requestedBy: 'Jane Smith',
      requestedAt: new Date(2024, 11, 10).toISOString(),
      status: 'approved',
      reviewedBy: 'Mike Johnson',
      reviewedAt: new Date(2024, 11, 12).toISOString(),
      comments: 'Approved. Changes look good.',
      changes: [
        {
          field: 'conditions',
          oldValue: '2 conditions',
          newValue: '3 conditions'
        }
      ]
    }
  ];
}

// Mock data storage
let mockRules: Rule[] = [
  generateMockRule(1, 'active'),
  generateMockRule(2, 'active'),
  generateMockRule(3, 'pending_approval'),
  generateMockRule(4, 'active'),
  generateMockRule(5, 'draft'),
  generateMockRule(6, 'inactive'),
  generateMockRule(7, 'active'),
  generateMockRule(8, 'rejected'),
  generateMockRule(9, 'approved'),
  generateMockRule(10, 'active'),
  generateMockRule(11, 'draft'),
  generateMockRule(12, 'pending_approval')
];

/**
 * Available fields for condition builder
 */
export const AVAILABLE_FIELDS: AvailableField[] = [
  {
    id: 'transaction.id',
    name: 'transaction.id',
    label: 'Transaction ID',
    type: 'string',
    category: 'Transaction',
    description: 'Unique transaction identifier',
    allowedComparators: ['equals', 'not_equals', 'contains', 'in', 'not_in'],
    sampleValues: ['TXN-001', 'TXN-002']
  },
  {
    id: 'transaction.amount',
    name: 'transaction.amount',
    label: 'Transaction Amount',
    type: 'amount',
    category: 'Transaction',
    description: 'Transaction amount in base currency',
    allowedComparators: ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_than_or_equal', 'less_than_or_equal', 'between'],
    sampleValues: ['100.00', '1000.00', '5000.00']
  },
  {
    id: 'transaction.currency',
    name: 'transaction.currency',
    label: 'Currency',
    type: 'string',
    category: 'Transaction',
    description: 'Transaction currency code',
    allowedComparators: ['equals', 'not_equals', 'in', 'not_in'],
    sampleValues: ['USD', 'EUR', 'GBP']
  },
  {
    id: 'transaction.date',
    name: 'transaction.date',
    label: 'Transaction Date',
    type: 'date',
    category: 'Transaction',
    description: 'Date of transaction',
    allowedComparators: ['equals', 'not_equals', 'greater_than', 'less_than', 'between'],
    sampleValues: ['2024-01-01', '2024-06-15']
  },
  {
    id: 'transaction.type',
    name: 'transaction.type',
    label: 'Transaction Type',
    type: 'string',
    category: 'Transaction',
    description: 'Type of transaction',
    allowedComparators: ['equals', 'not_equals', 'in', 'not_in'],
    sampleValues: ['PAYMENT', 'REFUND', 'TRANSFER']
  },
  {
    id: 'partner.id',
    name: 'partner.id',
    label: 'Partner ID',
    type: 'string',
    category: 'Partner',
    description: 'Partner identifier',
    allowedComparators: ['equals', 'not_equals', 'in', 'not_in'],
    sampleValues: ['PARTNER-A', 'PARTNER-B']
  },
  {
    id: 'partner.name',
    name: 'partner.name',
    label: 'Partner Name',
    type: 'string',
    category: 'Partner',
    description: 'Partner name',
    allowedComparators: ['equals', 'not_equals', 'contains', 'starts_with', 'in'],
    sampleValues: ['Partner A', 'Partner B']
  },
  {
    id: 'account.number',
    name: 'account.number',
    label: 'Account Number',
    type: 'string',
    category: 'Account',
    description: 'Bank account number',
    allowedComparators: ['equals', 'not_equals', 'contains', 'starts_with'],
    sampleValues: ['1234567890', '9876543210']
  },
  {
    id: 'account.type',
    name: 'account.type',
    label: 'Account Type',
    type: 'string',
    category: 'Account',
    description: 'Type of account',
    allowedComparators: ['equals', 'not_equals', 'in', 'not_in'],
    sampleValues: ['CHECKING', 'SAVINGS', 'CREDIT']
  },
  {
    id: 'reconciliation.status',
    name: 'reconciliation.status',
    label: 'Reconciliation Status',
    type: 'string',
    category: 'Reconciliation',
    description: 'Current reconciliation status',
    allowedComparators: ['equals', 'not_equals', 'in', 'not_in'],
    sampleValues: ['MATCHED', 'UNMATCHED', 'PARTIAL']
  }
];

/**
 * Get comparator label
 */
export function getComparatorLabel(comparator: Comparator): string {
  const labels: Record<Comparator, string> = {
    equals: 'Equals',
    not_equals: 'Not Equals',
    contains: 'Contains',
    not_contains: 'Does Not Contain',
    starts_with: 'Starts With',
    ends_with: 'Ends With',
    greater_than: 'Greater Than',
    less_than: 'Less Than',
    greater_than_or_equal: 'Greater Than or Equal',
    less_than_or_equal: 'Less Than or Equal',
    between: 'Between',
    in: 'In List',
    not_in: 'Not In List',
    is_null: 'Is Empty',
    is_not_null: 'Is Not Empty'
  };
  return labels[comparator];
}

/**
 * Get all rules with optional filtering and sorting
 */
export async function getRules(
  filters?: RuleListFilters,
  sort?: RuleSortOption
): Promise<Rule[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filtered = [...mockRules];
  
  // Apply filters
  if (filters) {
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(r => filters.status!.includes(r.status));
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(search) ||
        r.description.toLowerCase().includes(search) ||
        r.ruleNumber.toLowerCase().includes(search)
      );
    }
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(r => 
        r.tags.some(tag => filters.tags!.includes(tag))
      );
    }
    if (filters.isEnabled !== undefined) {
      filtered = filtered.filter(r => r.isEnabled === filters.isEnabled);
    }
  }
  
  // Apply sorting
  if (sort) {
    filtered.sort((a, b) => {
      let aVal: any = a[sort.field as keyof Rule];
      let bVal: any = b[sort.field as keyof Rule];
      
      if (sort.field === 'timesApplied') {
        aVal = a.statistics?.timesApplied || 0;
        bVal = b.statistics?.timesApplied || 0;
      }
      
      if (typeof aVal === 'string') {
        return sort.direction === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }
  
  return filtered;
}

/**
 * Get rule by ID
 */
export async function getRuleById(ruleId: string): Promise<Rule | null> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockRules.find(r => r.id === ruleId) || null;
}

/**
 * Create new rule
 */
export async function createRule(rule: Omit<Rule, 'id' | 'ruleNumber' | 'version' | 'createdAt' | 'updatedAt' | 'statistics'>): Promise<Rule> {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const newRule: Rule = {
    ...rule,
    id: `rule-${mockRules.length + 1}`,
    ruleNumber: `RUL-${String(mockRules.length + 1).padStart(5, '0')}`,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    statistics: {
      timesApplied: 0,
      successfulMatches: 0
    }
  };
  
  mockRules.push(newRule);
  return newRule;
}

/**
 * Update existing rule
 */
export async function updateRule(ruleId: string, updates: Partial<Rule>): Promise<Rule> {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const index = mockRules.findIndex(r => r.id === ruleId);
  if (index === -1) {
    throw new Error('Rule not found');
  }
  
  mockRules[index] = {
    ...mockRules[index],
    ...updates,
    version: mockRules[index].version + 1,
    updatedAt: new Date().toISOString()
  };
  
  return mockRules[index];
}

/**
 * Delete rule
 */
export async function deleteRule(ruleId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 400));
  mockRules = mockRules.filter(r => r.id !== ruleId);
}

/**
 * Toggle rule enabled/disabled status
 */
export async function toggleRuleStatus(ruleId: string): Promise<Rule> {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const rule = mockRules.find(r => r.id === ruleId);
  if (!rule) {
    throw new Error('Rule not found');
  }
  
  rule.isEnabled = !rule.isEnabled;
  rule.status = rule.isEnabled ? 'active' : 'inactive';
  rule.updatedAt = new Date().toISOString();
  
  return rule;
}

/**
 * Get rule version history
 */
export async function getRuleVersions(ruleId: string): Promise<RuleVersion[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const rule = mockRules.find(r => r.id === ruleId);
  if (!rule) {
    return [];
  }
  
  return generateMockVersions(ruleId, rule.version);
}

/**
 * Submit rule for approval
 */
export async function submitForApproval(ruleId: string, comments?: string): Promise<ApprovalRequest> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const rule = mockRules.find(r => r.id === ruleId);
  if (!rule) {
    throw new Error('Rule not found');
  }
  
  rule.status = 'pending_approval';
  rule.updatedAt = new Date().toISOString();
  
  return {
    id: `approval-${Date.now()}`,
    ruleId,
    ruleName: rule.name,
    ruleVersion: rule.version,
    requestedBy: rule.updatedBy,
    requestedAt: new Date().toISOString(),
    status: 'pending',
    comments,
    changes: []
  };
}

/**
 * Approve rule
 */
export async function approveRule(ruleId: string, approvedBy: string, comments?: string): Promise<Rule> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const rule = mockRules.find(r => r.id === ruleId);
  if (!rule) {
    throw new Error('Rule not found');
  }
  
  rule.status = 'approved';
  rule.approvedBy = approvedBy;
  rule.approvedAt = new Date().toISOString();
  rule.updatedAt = new Date().toISOString();
  
  return rule;
}

/**
 * Reject rule
 */
export async function rejectRule(ruleId: string, rejectedBy: string, reason: string): Promise<Rule> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const rule = mockRules.find(r => r.id === ruleId);
  if (!rule) {
    throw new Error('Rule not found');
  }
  
  rule.status = 'rejected';
  rule.rejectedBy = rejectedBy;
  rule.rejectedAt = new Date().toISOString();
  rule.rejectionReason = reason;
  rule.updatedAt = new Date().toISOString();
  
  return rule;
}

/**
 * Get pending approval requests
 */
export async function getPendingApprovals(): Promise<ApprovalRequest[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return generateMockApprovalRequests().filter(a => a.status === 'pending');
}

/**
 * Get all tags
 */
export async function getAllTags(): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return tags;
}

/**
 * Validate rule conditions
 */
export async function validateRule(rule: Partial<Rule>): Promise<{ valid: boolean; errors: string[] }> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const errors: string[] = [];
  
  if (!rule.name || rule.name.trim() === '') {
    errors.push('Rule name is required');
  }
  
  if (!rule.conditions || rule.conditions.length === 0) {
    errors.push('At least one condition is required');
  }
  
  if (!rule.matchConfiguration || !rule.matchConfiguration.strategy) {
    errors.push('Match strategy is required');
  }
  
  if (rule.priority !== undefined && (rule.priority < 1 || rule.priority > 10)) {
    errors.push('Priority must be between 1 and 10');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Test rule against sample data
 */
export async function testRule(ruleId: string, sampleData: any): Promise<{ matched: boolean; details: string }> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Simulate rule testing
  const matched = Math.random() > 0.5;
  
  return {
    matched,
    details: matched 
      ? 'Rule conditions matched successfully. 3/3 conditions passed.'
      : 'Rule conditions did not match. Failed on condition 2: amount not in range.'
  };
}
