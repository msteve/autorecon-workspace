import { apiClient } from './apiClient';

// Use static mock data when backend is unavailable
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
if (USE_MOCK_DATA) {
  console.info('🔄 Matching Service: Using static mock data (backend unavailable)');
}

/**
 * Match types
 */
export type MatchType = 'exact' | 'fuzzy' | 'partial' | 'manual' | 'n_way';

/**
 * Match status
 */
export type MatchStatus = 'matched' | 'unmatched' | 'potential' | 'under_review' | 'approved' | 'rejected';

/**
 * Transaction source
 */
export type TransactionSource = 'source_a' | 'source_b' | 'source_c' | 'bank' | 'erp' | 'payment_gateway';

/**
 * Transaction data
 */
export interface Transaction {
  id: string;
  transactionNumber: string;
  source: TransactionSource;
  date: string;
  amount: number;
  currency: string;
  description: string;
  reference: string;
  partnerId: string;
  partnerName: string;
  accountNumber: string;
  status: MatchStatus;
  matchType?: MatchType;
  matchId?: string;
  matchConfidence?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Match group (for matched transactions)
 */
export interface MatchGroup {
  id: string;
  matchNumber: string;
  matchType: MatchType;
  matchConfidence: number;
  status: MatchStatus;
  transactions: Transaction[];
  totalAmount: number;
  variance: number;
  variancePercentage: number;
  createdAt: string;
  createdBy: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  ruleApplied?: string;
}

/**
 * Potential match suggestion
 */
export interface PotentialMatch {
  id: string;
  sourceTransaction: Transaction;
  candidateTransactions: {
    transaction: Transaction;
    confidence: number;
    matchReasons: string[];
  }[];
  suggestedMatchType: MatchType;
  overallConfidence: number;
}

/**
 * N-way match configuration
 */
export interface NWayMatchConfig {
  sources: TransactionSource[];
  keyFields: string[];
  tolerance: {
    amount?: number;
    percentage?: number;
    days?: number;
  };
}

/**
 * Filter options
 */
export interface MatchingFilters {
  status?: MatchStatus[];
  matchType?: MatchType[];
  source?: TransactionSource[];
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  partnerId?: string;
  search?: string;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Match statistics
 */
export interface MatchingStatistics {
  totalTransactions: number;
  matched: number;
  unmatched: number;
  underReview: number;
  matchRate: number;
  exactMatches: number;
  fuzzyMatches: number;
  partialMatches: number;
  manualMatches: number;
  nWayMatches: number;
  totalVariance: number;
  averageConfidence: number;
}

// Mock data generators
const sources: TransactionSource[] = ['source_a', 'source_b', 'source_c', 'bank', 'erp'];
const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
const partners = ['Acme Corp', 'Global Industries', 'Tech Solutions', 'Finance Group', 'Retail Partners'];
const descriptions = [
  'Payment for Invoice #',
  'Refund for Order #',
  'Transfer to Account',
  'Subscription Payment',
  'Service Fee',
  'Product Purchase',
  'Monthly Charge'
];

/**
 * Generate random transaction
 */
function generateTransaction(index: number, source: TransactionSource, status: MatchStatus): Transaction {
  const date = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
  const amount = Math.round((Math.random() * 9000 + 1000) * 100) / 100;
  const partnerId = `PARTNER-${String(Math.floor(Math.random() * 5) + 1).padStart(3, '0')}`;
  
  return {
    id: `txn-${source}-${index}`,
    transactionNumber: `TXN-${String(index).padStart(6, '0')}`,
    source,
    date: date.toISOString().split('T')[0],
    amount,
    currency: currencies[Math.floor(Math.random() * currencies.length)],
    description: `${descriptions[Math.floor(Math.random() * descriptions.length)]}${1000 + index}`,
    reference: `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    partnerId,
    partnerName: partners[Math.floor(Math.random() * partners.length)],
    accountNumber: `ACC${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    status,
    createdAt: new Date(date.getTime() - 86400000).toISOString(),
    updatedAt: date.toISOString()
  };
}

/**
 * Generate match group
 */
function generateMatchGroup(index: number, matchType: MatchType): MatchGroup {
  const baseAmount = Math.round((Math.random() * 9000 + 1000) * 100) / 100;
  const variance = matchType === 'exact' ? 0 : Math.round((Math.random() * 10 + 1) * 100) / 100;
  
  const txn1 = generateTransaction(index * 3, 'source_a', 'matched');
  const txn2 = generateTransaction(index * 3 + 1, 'source_b', 'matched');
  
  txn1.amount = baseAmount;
  txn2.amount = baseAmount + (matchType === 'exact' ? 0 : variance);
  txn1.matchType = matchType;
  txn2.matchType = matchType;
  txn1.matchId = `match-${index}`;
  txn2.matchId = `match-${index}`;
  
  const confidence = matchType === 'exact' ? 100 : matchType === 'fuzzy' ? 85 + Math.random() * 10 : 70 + Math.random() * 15;
  txn1.matchConfidence = confidence;
  txn2.matchConfidence = confidence;
  
  const transactions = [txn1, txn2];
  
  // For n-way matches, add third transaction
  if (matchType === 'n_way') {
    const txn3 = generateTransaction(index * 3 + 2, 'source_c', 'matched');
    txn3.amount = baseAmount - variance / 2;
    txn3.matchType = matchType;
    txn3.matchId = `match-${index}`;
    txn3.matchConfidence = confidence;
    transactions.push(txn3);
  }
  
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const avgAmount = totalAmount / transactions.length;
  const actualVariance = Math.max(...transactions.map(t => Math.abs(t.amount - avgAmount)));
  
  return {
    id: `match-${index}`,
    matchNumber: `MATCH-${String(index).padStart(6, '0')}`,
    matchType,
    matchConfidence: Math.round(confidence * 100) / 100,
    status: 'matched',
    transactions,
    totalAmount,
    variance: Math.round(actualVariance * 100) / 100,
    variancePercentage: Math.round((actualVariance / avgAmount) * 10000) / 100,
    createdAt: new Date(2024, 11, Math.floor(Math.random() * 30) + 1).toISOString(),
    createdBy: 'system',
    approvedAt: Math.random() > 0.5 ? new Date(2024, 11, Math.floor(Math.random() * 30) + 1).toISOString() : undefined,
    approvedBy: Math.random() > 0.5 ? 'john.doe' : undefined,
    ruleApplied: matchType !== 'manual' ? `Rule ${Math.floor(Math.random() * 10) + 1}` : undefined
  };
}

/**
 * Generate potential match
 */
function generatePotentialMatch(sourceTransaction: Transaction): PotentialMatch {
  const candidates = [];
  const numCandidates = Math.floor(Math.random() * 3) + 1;
  
  for (let i = 0; i < numCandidates; i++) {
    const candidate = generateTransaction(Math.floor(Math.random() * 1000), 'source_b', 'unmatched');
    candidate.amount = sourceTransaction.amount + (Math.random() * 20 - 10);
    candidate.currency = sourceTransaction.currency;
    candidate.partnerId = sourceTransaction.partnerId;
    
    const confidence = 60 + Math.random() * 35;
    const reasons = [];
    
    if (Math.abs(candidate.amount - sourceTransaction.amount) < 5) {
      reasons.push('Amount similarity: ' + Math.abs(candidate.amount - sourceTransaction.amount).toFixed(2));
    }
    if (candidate.partnerId === sourceTransaction.partnerId) {
      reasons.push('Same partner');
    }
    if (candidate.reference.substring(0, 3) === sourceTransaction.reference.substring(0, 3)) {
      reasons.push('Reference match');
    }
    
    candidates.push({
      transaction: candidate,
      confidence: Math.round(confidence * 100) / 100,
      matchReasons: reasons
    });
  }
  
  candidates.sort((a, b) => b.confidence - a.confidence);
  
  return {
    id: `potential-${sourceTransaction.id}`,
    sourceTransaction,
    candidateTransactions: candidates,
    suggestedMatchType: candidates[0].confidence > 90 ? 'exact' : candidates[0].confidence > 75 ? 'fuzzy' : 'partial',
    overallConfidence: Math.round(candidates[0].confidence * 100) / 100
  };
}

// Mock data storage
let mockMatchGroups: MatchGroup[] = [
  ...Array.from({ length: 30 }, (_, i) => generateMatchGroup(i + 1, 'exact')),
  ...Array.from({ length: 20 }, (_, i) => generateMatchGroup(i + 31, 'fuzzy')),
  ...Array.from({ length: 15 }, (_, i) => generateMatchGroup(i + 51, 'partial')),
  ...Array.from({ length: 10 }, (_, i) => generateMatchGroup(i + 66, 'n_way')),
  ...Array.from({ length: 5 }, (_, i) => generateMatchGroup(i + 76, 'manual'))
];

let mockUnmatchedTransactions: Transaction[] = Array.from({ length: 50 }, (_, i) => 
  generateTransaction(i + 1000, sources[Math.floor(Math.random() * sources.length)], 'unmatched')
);

/**
 * Get matched transactions with pagination
 */
export async function getMatchedTransactions(
  filters?: MatchingFilters,
  pagination?: PaginationOptions
): Promise<PaginatedResponse<MatchGroup>> {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  let filtered = [...mockMatchGroups];
  
  // Apply filters
  if (filters) {
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(m => filters.status!.includes(m.status));
    }
    if (filters.matchType && filters.matchType.length > 0) {
      filtered = filtered.filter(m => filters.matchType!.includes(m.matchType));
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(m => m.createdAt >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(m => m.createdAt <= filters.dateTo!);
    }
    if (filters.amountMin !== undefined) {
      filtered = filtered.filter(m => m.totalAmount >= filters.amountMin!);
    }
    if (filters.amountMax !== undefined) {
      filtered = filtered.filter(m => m.totalAmount <= filters.amountMax!);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(m => 
        m.matchNumber.toLowerCase().includes(search) ||
        m.transactions.some(t => 
          t.transactionNumber.toLowerCase().includes(search) ||
          t.description.toLowerCase().includes(search) ||
          t.reference.toLowerCase().includes(search)
        )
      );
    }
  }
  
  // Apply sorting
  if (pagination?.sortBy) {
    filtered.sort((a, b) => {
      let aVal: any = a[pagination.sortBy as keyof MatchGroup];
      let bVal: any = b[pagination.sortBy as keyof MatchGroup];
      
      if (typeof aVal === 'string') {
        return pagination.sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      return pagination.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }
  
  // Apply pagination
  const page = pagination?.page || 1;
  const pageSize = pagination?.pageSize || 20;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = filtered.slice(start, end);
  
  return {
    data: paginatedData,
    total: filtered.length,
    page,
    pageSize,
    totalPages: Math.ceil(filtered.length / pageSize)
  };
}

/**
 * Get unmatched transactions with pagination
 */
export async function getUnmatchedTransactions(
  filters?: MatchingFilters,
  pagination?: PaginationOptions
): Promise<PaginatedResponse<Transaction>> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filtered = [...mockUnmatchedTransactions];
  
  // Apply filters
  if (filters) {
    if (filters.source && filters.source.length > 0) {
      filtered = filtered.filter(t => filters.source!.includes(t.source));
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(t => t.date >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(t => t.date <= filters.dateTo!);
    }
    if (filters.amountMin !== undefined) {
      filtered = filtered.filter(t => t.amount >= filters.amountMin!);
    }
    if (filters.amountMax !== undefined) {
      filtered = filtered.filter(t => t.amount <= filters.amountMax!);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.transactionNumber.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search) ||
        t.reference.toLowerCase().includes(search) ||
        t.partnerName.toLowerCase().includes(search)
      );
    }
  }
  
  // Apply sorting
  if (pagination?.sortBy) {
    filtered.sort((a, b) => {
      let aVal: any = a[pagination.sortBy as keyof Transaction];
      let bVal: any = b[pagination.sortBy as keyof Transaction];
      
      if (typeof aVal === 'string') {
        return pagination.sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      return pagination.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }
  
  // Apply pagination
  const page = pagination?.page || 1;
  const pageSize = pagination?.pageSize || 20;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = filtered.slice(start, end);
  
  return {
    data: paginatedData,
    total: filtered.length,
    page,
    pageSize,
    totalPages: Math.ceil(filtered.length / pageSize)
  };
}

/**
 * Get match group by ID
 */
export async function getMatchGroupById(matchId: string): Promise<MatchGroup | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockMatchGroups.find(m => m.id === matchId) || null;
}

/**
 * Get transaction by ID
 */
export async function getTransactionById(transactionId: string): Promise<Transaction | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Check matched transactions
  for (const match of mockMatchGroups) {
    const txn = match.transactions.find(t => t.id === transactionId);
    if (txn) return txn;
  }
  
  // Check unmatched transactions
  return mockUnmatchedTransactions.find(t => t.id === transactionId) || null;
}

/**
 * Get potential matches for a transaction
 */
export async function getPotentialMatches(transactionId: string): Promise<PotentialMatch | null> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const transaction = await getTransactionById(transactionId);
  if (!transaction) return null;
  
  return generatePotentialMatch(transaction);
}

/**
 * Create manual match
 */
export async function createManualMatch(transactionIds: string[]): Promise<MatchGroup> {
  await new Promise(resolve => setTimeout(resolve, 700));
  
  const transactions: Transaction[] = [];
  
  for (const id of transactionIds) {
    const txn = await getTransactionById(id);
    if (txn) {
      txn.status = 'matched';
      txn.matchType = 'manual';
      transactions.push(txn);
    }
  }
  
  const matchId = `match-${mockMatchGroups.length + 1}`;
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const avgAmount = totalAmount / transactions.length;
  const variance = Math.max(...transactions.map(t => Math.abs(t.amount - avgAmount)));
  
  const newMatch: MatchGroup = {
    id: matchId,
    matchNumber: `MATCH-${String(mockMatchGroups.length + 1).padStart(6, '0')}`,
    matchType: 'manual',
    matchConfidence: 100,
    status: 'matched',
    transactions,
    totalAmount,
    variance: Math.round(variance * 100) / 100,
    variancePercentage: Math.round((variance / avgAmount) * 10000) / 100,
    createdAt: new Date().toISOString(),
    createdBy: 'current.user'
  };
  
  mockMatchGroups.push(newMatch);
  mockUnmatchedTransactions = mockUnmatchedTransactions.filter(t => !transactionIds.includes(t.id));
  
  return newMatch;
}

/**
 * Unmatch a match group
 */
export async function unmatchGroup(matchId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const match = mockMatchGroups.find(m => m.id === matchId);
  if (!match) throw new Error('Match not found');
  
  // Move transactions back to unmatched
  match.transactions.forEach(txn => {
    txn.status = 'unmatched';
    txn.matchType = undefined;
    txn.matchId = undefined;
    txn.matchConfidence = undefined;
    mockUnmatchedTransactions.push(txn);
  });
  
  // Remove match group
  mockMatchGroups = mockMatchGroups.filter(m => m.id !== matchId);
}

/**
 * Approve match
 */
export async function approveMatch(matchId: string, approvedBy: string): Promise<MatchGroup> {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const match = mockMatchGroups.find(m => m.id === matchId);
  if (!match) throw new Error('Match not found');
  
  match.status = 'approved';
  match.approvedAt = new Date().toISOString();
  match.approvedBy = approvedBy;
  
  return match;
}

/**
 * Reject match
 */
export async function rejectMatch(matchId: string, rejectedBy: string, reason: string): Promise<MatchGroup> {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const match = mockMatchGroups.find(m => m.id === matchId);
  if (!match) throw new Error('Match not found');
  
  match.status = 'rejected';
  match.rejectedAt = new Date().toISOString();
  match.rejectedBy = rejectedBy;
  match.rejectionReason = reason;
  
  return match;
}

/**
 * Get matching statistics
 */
export async function getMatchingStatistics(): Promise<MatchingStatistics> {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const allTransactions = [
    ...mockMatchGroups.flatMap(m => m.transactions),
    ...mockUnmatchedTransactions
  ];
  
  const matched = mockMatchGroups.flatMap(m => m.transactions).length;
  const unmatched = mockUnmatchedTransactions.length;
  
  return {
    totalTransactions: allTransactions.length,
    matched,
    unmatched,
    underReview: mockMatchGroups.filter(m => m.status === 'under_review').length,
    matchRate: Math.round((matched / allTransactions.length) * 10000) / 100,
    exactMatches: mockMatchGroups.filter(m => m.matchType === 'exact').length,
    fuzzyMatches: mockMatchGroups.filter(m => m.matchType === 'fuzzy').length,
    partialMatches: mockMatchGroups.filter(m => m.matchType === 'partial').length,
    manualMatches: mockMatchGroups.filter(m => m.matchType === 'manual').length,
    nWayMatches: mockMatchGroups.filter(m => m.matchType === 'n_way').length,
    totalVariance: Math.round(mockMatchGroups.reduce((sum, m) => sum + m.variance, 0) * 100) / 100,
    averageConfidence: Math.round(
      mockMatchGroups.reduce((sum, m) => sum + m.matchConfidence, 0) / mockMatchGroups.length * 100
    ) / 100
  };
}

/**
 * Run n-way matching
 */
export async function runNWayMatching(config: NWayMatchConfig): Promise<MatchGroup[]> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate n-way matching logic
  const newMatches: MatchGroup[] = [];
  
  // This is a simplified simulation
  for (let i = 0; i < 5; i++) {
    const match = generateMatchGroup(mockMatchGroups.length + i + 1, 'n_way');
    newMatches.push(match);
    mockMatchGroups.push(match);
  }
  
  return newMatches;
}

/**
 * Export matches to CSV
 */
export async function exportMatches(filters?: MatchingFilters): Promise<Blob> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const response = await getMatchedTransactions(filters);
  const matches = response.data;
  
  const csv = [
    ['Match Number', 'Match Type', 'Status', 'Transactions', 'Total Amount', 'Variance', 'Confidence', 'Created At'].join(','),
    ...matches.map(m => [
      m.matchNumber,
      m.matchType,
      m.status,
      m.transactions.length,
      m.totalAmount,
      m.variance,
      m.matchConfidence,
      m.createdAt
    ].join(','))
  ].join('\n');
  
  return new Blob([csv], { type: 'text/csv' });
}
