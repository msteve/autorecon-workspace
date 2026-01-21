// Use static mock data when backend is unavailable
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
if (USE_MOCK_DATA) {
  console.info('📒 GL Posting Service: Using static mock data (backend unavailable)');
}

import type {
  JournalBatch,
  JournalEntry,
  JournalBatchSummary,
  GLPostingStats,
  CreateJournalBatchRequest,
  PaginatedResponse,
  GLAccount,
} from '../types';

// Mock GL accounts
const mockGLAccounts: GLAccount[] = [
  { code: '1000', name: 'Cash - Operating Account', type: 'asset', category: 'Current Assets', balance: 500000, currency: 'USD', isActive: true },
  { code: '1100', name: 'Accounts Receivable', type: 'asset', category: 'Current Assets', balance: 250000, currency: 'USD', isActive: true },
  { code: '1200', name: 'Inventory', type: 'asset', category: 'Current Assets', balance: 180000, currency: 'USD', isActive: true },
  { code: '1500', name: 'Fixed Assets', type: 'asset', category: 'Non-Current Assets', balance: 750000, currency: 'USD', isActive: true },
  { code: '2000', name: 'Accounts Payable', type: 'liability', category: 'Current Liabilities', balance: 150000, currency: 'USD', isActive: true },
  { code: '2100', name: 'Accrued Expenses', type: 'liability', category: 'Current Liabilities', balance: 45000, currency: 'USD', isActive: true },
  { code: '2500', name: 'Long-term Debt', type: 'liability', category: 'Non-Current Liabilities', balance: 300000, currency: 'USD', isActive: true },
  { code: '3000', name: 'Common Stock', type: 'equity', category: 'Equity', balance: 500000, currency: 'USD', isActive: true },
  { code: '3100', name: 'Retained Earnings', type: 'equity', category: 'Equity', balance: 685000, currency: 'USD', isActive: true },
  { code: '4000', name: 'Sales Revenue', type: 'revenue', category: 'Revenue', balance: 1200000, currency: 'USD', isActive: true },
  { code: '4100', name: 'Service Revenue', type: 'revenue', category: 'Revenue', balance: 350000, currency: 'USD', isActive: true },
  { code: '5000', name: 'Cost of Goods Sold', type: 'expense', category: 'Operating Expenses', balance: 480000, currency: 'USD', isActive: true },
  { code: '5100', name: 'Salaries & Wages', type: 'expense', category: 'Operating Expenses', balance: 280000, currency: 'USD', isActive: true },
  { code: '5200', name: 'Rent Expense', type: 'expense', category: 'Operating Expenses', balance: 60000, currency: 'USD', isActive: true },
  { code: '5300', name: 'Utilities Expense', type: 'expense', category: 'Operating Expenses', balance: 18000, currency: 'USD', isActive: true },
  { code: '5400', name: 'Marketing Expense', type: 'expense', category: 'Operating Expenses', balance: 45000, currency: 'USD', isActive: true },
  { code: '5500', name: 'Professional Fees', type: 'expense', category: 'Operating Expenses', balance: 32000, currency: 'USD', isActive: true },
  { code: '5600', name: 'Depreciation Expense', type: 'expense', category: 'Operating Expenses', balance: 75000, currency: 'USD', isActive: true },
  { code: '9999', name: 'Suspense Account', type: 'asset', category: 'Suspense', balance: 0, currency: 'USD', isActive: true },
];

// Generate mock journal entries
const generateMockEntries = (batchId: string, count: number): JournalEntry[] => {
  const entries: JournalEntry[] = [];
  const accountPool = mockGLAccounts.filter(acc => acc.code !== '9999');
  
  for (let i = 0; i < count; i++) {
    const account = accountPool[Math.floor(Math.random() * accountPool.length)];
    const amount = Math.floor(Math.random() * 50000) + 1000;
    const isDebit = Math.random() > 0.5;
    const isSuspense = Math.random() > 0.9; // 10% chance of suspense
    
    entries.push({
      id: `entry-${batchId}-${i + 1}`,
      batchId,
      lineNumber: i + 1,
      accountCode: isSuspense ? '9999' : account.code,
      accountName: isSuspense ? 'Suspense Account' : account.name,
      debitAmount: isDebit ? amount : 0,
      creditAmount: !isDebit ? amount : 0,
      description: isSuspense 
        ? 'Unidentified transaction - pending investigation'
        : `${account.type.toUpperCase()} transaction - ${account.name}`,
      costCenter: Math.random() > 0.5 ? `CC-${Math.floor(Math.random() * 10) + 1}` : undefined,
      department: Math.random() > 0.5 ? ['Finance', 'Sales', 'Operations', 'IT'][Math.floor(Math.random() * 4)] : undefined,
      project: Math.random() > 0.7 ? `PRJ-${Math.floor(Math.random() * 100) + 1}` : undefined,
      reference: `REF-${Math.floor(Math.random() * 100000)}`,
      suspenseFlag: isSuspense,
      suspenseReason: isSuspense ? ['Unmatched transaction', 'Missing documentation', 'Account verification required', 'Pending approval'][Math.floor(Math.random() * 4)] : undefined,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  
  return entries;
};

// Generate mock journal batches
const generateMockBatches = (count: number): JournalBatch[] => {
  const batches: JournalBatch[] = [];
  const statuses: JournalBatch['status'][] = ['draft', 'pending_approval', 'approved', 'posted', 'rejected', 'failed'];
  const users = ['John Smith', 'Jane Doe', 'Bob Johnson', 'Alice Williams', 'Charlie Brown'];
  
  for (let i = 0; i < count; i++) {
    const createdDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const entryCount = Math.floor(Math.random() * 50) + 5;
    const totalDebit = Math.floor(Math.random() * 500000) + 10000;
    const totalCredit = totalDebit + (Math.random() > 0.8 ? Math.floor(Math.random() * 1000) - 500 : 0); // Sometimes unbalanced
    
    const batch: JournalBatch = {
      id: `batch-${i + 1}`,
      batchNumber: `JB-2026-${String(i + 1).padStart(6, '0')}`,
      description: [
        'Monthly Settlement Reconciliation',
        'Partner Payment Processing',
        'Revenue Recognition Adjustment',
        'Expense Accrual - Period End',
        'Bank Reconciliation Entries',
        'Intercompany Transactions',
        'Fixed Asset Depreciation',
        'Inventory Adjustment',
      ][Math.floor(Math.random() * 8)],
      status,
      periodStart: new Date(createdDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      periodEnd: createdDate.toISOString().split('T')[0],
      totalDebit,
      totalCredit,
      entryCount,
      currency: 'USD',
      companyCode: ['C001', 'C002', 'C003'][Math.floor(Math.random() * 3)],
      fiscalYear: '2026',
      fiscalPeriod: String(createdDate.getMonth() + 1).padStart(2, '0'),
      createdBy: users[Math.floor(Math.random() * users.length)],
      createdAt: createdDate.toISOString(),
      externalReference: Math.random() > 0.5 ? `EXT-${Math.floor(Math.random() * 100000)}` : undefined,
      notes: Math.random() > 0.7 ? 'Batch requires special attention for reconciliation' : undefined,
    };
    
    // Add approval/posting/rejection details based on status
    if (status === 'approved' || status === 'posted') {
      batch.approvedBy = users[Math.floor(Math.random() * users.length)];
      batch.approvedAt = new Date(createdDate.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString();
    }
    
    if (status === 'posted') {
      batch.postedBy = users[Math.floor(Math.random() * users.length)];
      batch.postedAt = new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
    }
    
    if (status === 'rejected') {
      batch.rejectedBy = users[Math.floor(Math.random() * users.length)];
      batch.rejectedAt = new Date(createdDate.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString();
      batch.rejectionReason = [
        'Unbalanced entries detected',
        'Missing supporting documentation',
        'Incorrect account codes used',
        'Period already closed',
        'Duplicate batch submission',
      ][Math.floor(Math.random() * 5)];
    }
    
    batches.push(batch);
  }
  
  return batches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

const mockBatches = generateMockBatches(40);

// Store entries by batch ID
const mockEntriesByBatch = new Map<string, JournalEntry[]>();
mockBatches.forEach(batch => {
  mockEntriesByBatch.set(batch.id, generateMockEntries(batch.id, batch.entryCount));
});

export const glPostingService = {
  /**
   * Get paginated list of journal batches
   */
  getJournalBatches: async (params: {
    page?: number;
    pageSize?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<JournalBatch>> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const { page = 1, pageSize = 10, status, search } = params;
    
    let filtered = [...mockBatches];
    
    if (status) {
      filtered = filtered.filter(batch => batch.status === status);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(batch =>
        batch.batchNumber.toLowerCase().includes(searchLower) ||
        batch.description.toLowerCase().includes(searchLower) ||
        batch.createdBy.toLowerCase().includes(searchLower)
      );
    }
    
    const total = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = filtered.slice(startIndex, endIndex);
    
    return {
      items,
      total,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(total / pageSize),
    };
  },

  /**
   * Get a single journal batch by ID
   */
  getJournalBatchById: async (id: string): Promise<JournalBatch | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockBatches.find(batch => batch.id === id) || null;
  },

  /**
   * Get journal entries for a batch
   */
  getJournalEntries: async (batchId: string): Promise<JournalEntry[]> => {
    await new Promise(resolve => setTimeout(resolve, 250));
    return mockEntriesByBatch.get(batchId) || [];
  },

  /**
   * Get journal batch summary
   */
  getJournalBatchSummary: async (batchId: string): Promise<JournalBatchSummary | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const batch = mockBatches.find(b => b.id === batchId);
    const entries = mockEntriesByBatch.get(batchId);
    
    if (!batch || !entries) return null;
    
    const accountsAffected = new Set(entries.map(e => e.accountCode)).size;
    const suspenseCount = entries.filter(e => e.suspenseFlag).length;
    
    const byAccountType = {
      asset: 0,
      liability: 0,
      equity: 0,
      revenue: 0,
      expense: 0,
    };
    
    entries.forEach(entry => {
      const account = mockGLAccounts.find(acc => acc.code === entry.accountCode);
      if (account && account.type in byAccountType) {
        byAccountType[account.type] += entry.debitAmount + entry.creditAmount;
      }
    });
    
    return {
      batchId: batch.id,
      totalDebit: batch.totalDebit,
      totalCredit: batch.totalCredit,
      balance: batch.totalDebit - batch.totalCredit,
      entryCount: batch.entryCount,
      suspenseCount,
      accountsAffected,
      byAccountType,
    };
  },

  /**
   * Create a new journal batch
   */
  createJournalBatch: async (request: CreateJournalBatchRequest): Promise<JournalBatch> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newBatch: JournalBatch = {
      id: `batch-${mockBatches.length + 1}`,
      batchNumber: `JB-2026-${String(mockBatches.length + 1).padStart(6, '0')}`,
      description: request.description,
      status: 'draft',
      periodStart: request.periodStart,
      periodEnd: request.periodEnd,
      totalDebit: request.entries.reduce((sum, e) => sum + e.debitAmount, 0),
      totalCredit: request.entries.reduce((sum, e) => sum + e.creditAmount, 0),
      entryCount: request.entries.length,
      currency: 'USD',
      companyCode: request.companyCode,
      fiscalYear: request.fiscalYear,
      fiscalPeriod: request.fiscalPeriod,
      createdBy: 'Current User',
      createdAt: new Date().toISOString(),
      externalReference: request.externalReference,
      notes: request.notes,
    };
    
    mockBatches.unshift(newBatch);
    
    const newEntries = request.entries.map((entryReq, index) => {
      const account = mockGLAccounts.find(acc => acc.code === entryReq.accountCode);
      return {
        id: `entry-${newBatch.id}-${index + 1}`,
        batchId: newBatch.id,
        lineNumber: index + 1,
        accountCode: entryReq.accountCode,
        accountName: account?.name || 'Unknown Account',
        debitAmount: entryReq.debitAmount,
        creditAmount: entryReq.creditAmount,
        description: entryReq.description,
        costCenter: entryReq.costCenter,
        department: entryReq.department,
        project: entryReq.project,
        reference: entryReq.reference,
        taxCode: entryReq.taxCode,
        taxAmount: entryReq.taxAmount,
        suspenseFlag: entryReq.accountCode === '9999',
        suspenseReason: entryReq.accountCode === '9999' ? 'Manual suspense entry' : undefined,
        createdAt: new Date().toISOString(),
      };
    });
    
    mockEntriesByBatch.set(newBatch.id, newEntries);
    
    return newBatch;
  },

  /**
   * Update journal batch status
   */
  updateJournalBatchStatus: async (id: string, status: JournalBatch['status']): Promise<JournalBatch> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const batch = mockBatches.find(b => b.id === id);
    if (!batch) throw new Error('Batch not found');
    
    batch.status = status;
    
    if (status === 'approved') {
      batch.approvedBy = 'Current User';
      batch.approvedAt = new Date().toISOString();
    } else if (status === 'posted') {
      batch.postedBy = 'Current User';
      batch.postedAt = new Date().toISOString();
    }
    
    return batch;
  },

  /**
   * Reject a journal batch
   */
  rejectJournalBatch: async (id: string, reason: string): Promise<JournalBatch> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const batch = mockBatches.find(b => b.id === id);
    if (!batch) throw new Error('Batch not found');
    
    batch.status = 'rejected';
    batch.rejectedBy = 'Current User';
    batch.rejectedAt = new Date().toISOString();
    batch.rejectionReason = reason;
    
    return batch;
  },

  /**
   * Get GL posting statistics
   */
  getGLPostingStats: async (): Promise<GLPostingStats> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const totalBatches = mockBatches.length;
    const pendingApproval = mockBatches.filter(b => b.status === 'pending_approval').length;
    const approvedBatches = mockBatches.filter(b => b.status === 'approved').length;
    const postedBatches = mockBatches.filter(b => b.status === 'posted').length;
    
    const totalDebit = mockBatches.reduce((sum, b) => sum + b.totalDebit, 0);
    const totalCredit = mockBatches.reduce((sum, b) => sum + b.totalCredit, 0);
    
    let suspenseEntries = 0;
    mockEntriesByBatch.forEach(entries => {
      suspenseEntries += entries.filter(e => e.suspenseFlag).length;
    });
    
    const avgBatchSize = Math.floor(
      mockBatches.reduce((sum, b) => sum + b.entryCount, 0) / totalBatches
    );
    
    return {
      totalBatches,
      pendingApproval,
      approvedBatches,
      postedBatches,
      totalDebit,
      totalCredit,
      suspenseEntries,
      avgBatchSize,
    };
  },

  /**
   * Get GL accounts
   */
  getGLAccounts: async (search?: string): Promise<GLAccount[]> => {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    if (!search) return mockGLAccounts;
    
    const searchLower = search.toLowerCase();
    return mockGLAccounts.filter(acc =>
      acc.code.toLowerCase().includes(searchLower) ||
      acc.name.toLowerCase().includes(searchLower)
    );
  },

  /**
   * Export journal batch to CSV
   */
  exportBatchToCSV: async (batchId: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const batch = mockBatches.find(b => b.id === batchId);
    const entries = mockEntriesByBatch.get(batchId);
    
    if (!batch || !entries) throw new Error('Batch not found');
    
    let csv = 'Line,Account Code,Account Name,Debit,Credit,Description,Cost Center,Department,Reference,Suspense\n';
    
    entries.forEach(entry => {
      csv += `${entry.lineNumber},${entry.accountCode},${entry.accountName},${entry.debitAmount},${entry.creditAmount},"${entry.description}",${entry.costCenter || ''},${entry.department || ''},${entry.reference || ''},${entry.suspenseFlag ? 'Yes' : 'No'}\n`;
    });
    
    return csv;
  },
};
