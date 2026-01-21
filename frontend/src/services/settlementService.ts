// Use static mock data when backend is unavailable
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
if (USE_MOCK_DATA) {
  console.info('💰 Settlement Service: Using static mock data (backend unavailable)');
}

import type {
  SettlementRun,
  PartnerSettlement,
  SettlementTransaction,
  SettlementSummary,
  SettlementStats,
  CreateSettlementRunRequest,
  PaginatedResponse
} from '@/types';

// Mock partners data
const mockPartners = [
  { id: 'P001', code: 'AMZN', name: 'Amazon Marketplace', type: 'marketplace', bank_account: '****1234' },
  { id: 'P002', code: 'EBAY', name: 'eBay Inc', type: 'marketplace', bank_account: '****5678' },
  { id: 'P003', code: 'SHOP', name: 'Shopify Stores', type: 'platform', bank_account: '****9012' },
  { id: 'P004', code: 'PYPL', name: 'PayPal Holdings', type: 'payment_processor', bank_account: '****3456' },
  { id: 'P005', code: 'STRP', name: 'Stripe Inc', type: 'payment_processor', bank_account: '****7890' },
  { id: 'P006', code: 'SQRE', name: 'Square', type: 'payment_processor', bank_account: '****2345' },
  { id: 'P007', code: 'ETSY', name: 'Etsy Marketplace', type: 'marketplace', bank_account: '****6789' },
  { id: 'P008', code: 'WLMT', name: 'Walmart Marketplace', type: 'marketplace', bank_account: '****0123' },
];

// Generate mock settlement transactions
const generateMockTransactions = (count: number, partnerId: string): SettlementTransaction[] => {
  const transactions: SettlementTransaction[] = [];
  
  for (let i = 0; i < count; i++) {
    const amount = 100 + Math.random() * 9900;
    const feeRate = 0.029 + Math.random() * 0.01; // 2.9% - 3.9%
    const fee = amount * feeRate;
    
    transactions.push({
      id: `TXN-${partnerId}-${String(i + 1).padStart(4, '0')}`,
      transaction_id: `${partnerId}-TXN-${Date.now()}-${i}`,
      transaction_date: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
      transaction_type: ['sale', 'refund', 'chargeback', 'fee'][Math.floor(Math.random() * 4)],
      amount,
      fee,
      net_amount: amount - fee,
      currency: 'USD',
      reference: `REF-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
      description: `Transaction ${i + 1} for ${partnerId}`
    });
  }
  
  return transactions;
};

// Generate mock partner settlements
const generatePartnerSettlement = (
  runId: string,
  partner: typeof mockPartners[0],
  status: PartnerSettlement['status']
): PartnerSettlement => {
  const txnCount = 50 + Math.floor(Math.random() * 200);
  const transactions = generateMockTransactions(txnCount, partner.id);
  
  const grossAmount = transactions.reduce((sum, txn) => sum + txn.amount, 0);
  const fees = transactions.reduce((sum, txn) => sum + txn.fee, 0);
  const adjustments = (Math.random() - 0.5) * 1000; // Random adjustment
  const netAmount = grossAmount - fees + adjustments;
  
  return {
    id: `PS-${runId}-${partner.id}`,
    settlement_run_id: runId,
    partner: {
      id: partner.id,
      code: partner.code,
      name: partner.name,
      type: partner.type,
      bank_account: partner.bank_account
    },
    gross_amount: grossAmount,
    fees,
    adjustments,
    net_amount: netAmount,
    transaction_count: txnCount,
    currency: 'USD',
    status,
    transactions,
    payment_details: status === 'paid' ? {
      method: 'bank_transfer',
      reference: `PAY-${Date.now()}`,
      paid_at: new Date().toISOString()
    } : undefined
  };
};

// Generate mock settlement runs
const generateMockSettlementRuns = (): SettlementRun[] => {
  const runs: SettlementRun[] = [];
  const statuses: SettlementRun['status'][] = [
    'draft',
    'calculating',
    'pending_review',
    'pending_approval',
    'approved',
    'processing',
    'completed',
    'failed'
  ];
  
  for (let i = 1; i <= 30; i++) {
    const runDate = new Date();
    runDate.setDate(runDate.getDate() - i * 7);
    
    const periodEnd = new Date(runDate);
    const periodStart = new Date(periodEnd);
    periodStart.setDate(periodStart.getDate() - 30);
    
    const status = i <= 5 ? statuses[Math.floor(Math.random() * 4)] : 'completed';
    const partnerCount = 3 + Math.floor(Math.random() * 5);
    const selectedPartners = mockPartners.slice(0, partnerCount);
    
    const breakdown = selectedPartners.map(partner =>
      generatePartnerSettlement(
        `SR-${String(i).padStart(6, '0')}`,
        partner,
        status === 'completed' ? 'paid' : 'pending'
      )
    );
    
    const totalGross = breakdown.reduce((sum, ps) => sum + ps.gross_amount, 0);
    const totalFees = breakdown.reduce((sum, ps) => sum + ps.fees, 0);
    const totalAdjustments = breakdown.reduce((sum, ps) => sum + ps.adjustments, 0);
    const totalNet = breakdown.reduce((sum, ps) => sum + ps.net_amount, 0);
    const totalTransactions = breakdown.reduce((sum, ps) => sum + ps.transaction_count, 0);
    
    const byPartnerType: Record<string, any> = {};
    breakdown.forEach(ps => {
      if (!byPartnerType[ps.partner.type]) {
        byPartnerType[ps.partner.type] = {
          count: 0,
          gross_amount: 0,
          net_amount: 0
        };
      }
      byPartnerType[ps.partner.type].count++;
      byPartnerType[ps.partner.type].gross_amount += ps.gross_amount;
      byPartnerType[ps.partner.type].net_amount += ps.net_amount;
    });
    
    const summary: SettlementSummary = {
      total_gross_amount: totalGross,
      total_fees: totalFees,
      total_adjustments: totalAdjustments,
      total_net_amount: totalNet,
      total_transactions: totalTransactions,
      partner_count: partnerCount,
      currency: 'USD',
      by_partner_type: byPartnerType,
      by_status: { pending: breakdown.filter(ps => ps.status === 'pending').length, paid: breakdown.filter(ps => ps.status === 'paid').length },
      by_payment_method: { bank_transfer: { count: partnerCount, amount: totalNet } }
    };
    
    runs.push({
      id: `SR-${String(i).padStart(6, '0')}`,
      run_number: `RUN-2024-${String(i).padStart(4, '0')}`,
      run_date: runDate.toISOString(),
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      status,
      total_amount: totalNet,
      total_transactions: totalTransactions,
      partner_count: partnerCount,
      currency: 'USD',
      payment_method: 'bank_transfer',
      created_by: {
        id: 'U001',
        name: 'Sarah Johnson',
        email: 'sarah.j@autorecon.com'
      },
      approved_by: status === 'completed' || status === 'approved' ? {
        id: 'U002',
        name: 'Mike Chen',
        email: 'mike.chen@autorecon.com'
      } : undefined,
      created_at: new Date(runDate.getTime() - 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: status === 'completed' ? runDate.toISOString() : undefined,
      notes: i % 3 === 0 ? 'Monthly settlement run with standard processing' : undefined,
      breakdown,
      summary
    });
  }
  
  return runs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

// Cache mock data
let mockSettlementRuns: SettlementRun[] | null = null;

const getMockSettlementRuns = (): SettlementRun[] => {
  if (!mockSettlementRuns) {
    mockSettlementRuns = generateMockSettlementRuns();
  }
  return mockSettlementRuns;
};

export const settlementService = {
  // Get paginated settlement runs
  getSettlementRuns: async (params?: {
    page?: number;
    page_size?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<SettlementRun>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filtered = [...getMockSettlementRuns()];
    
    if (params?.status) {
      filtered = filtered.filter(run => run.status === params.status);
    }
    
    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(run =>
        run.run_number.toLowerCase().includes(search) ||
        run.id.toLowerCase().includes(search)
      );
    }
    
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
  
  // Get single settlement run
  getSettlementRunById: async (id: string): Promise<SettlementRun> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const run = getMockSettlementRuns().find(r => r.id === id);
    if (!run) {
      throw new Error(`Settlement run ${id} not found`);
    }
    return run;
  },
  
  // Create new settlement run
  createSettlementRun: async (request: CreateSettlementRunRequest): Promise<SettlementRun> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newId = `SR-${String(getMockSettlementRuns().length + 1).padStart(6, '0')}`;
    const partnerCount = 3 + Math.floor(Math.random() * 5);
    const selectedPartners = mockPartners.slice(0, partnerCount);
    
    const breakdown = selectedPartners.map(partner =>
      generatePartnerSettlement(newId, partner, 'pending')
    );
    
    const totalGross = breakdown.reduce((sum, ps) => sum + ps.gross_amount, 0);
    const totalFees = breakdown.reduce((sum, ps) => sum + ps.fees, 0);
    const totalAdjustments = breakdown.reduce((sum, ps) => sum + ps.adjustments, 0);
    const totalNet = breakdown.reduce((sum, ps) => sum + ps.net_amount, 0);
    const totalTransactions = breakdown.reduce((sum, ps) => sum + ps.transaction_count, 0);
    
    const byPartnerType: Record<string, any> = {};
    breakdown.forEach(ps => {
      if (!byPartnerType[ps.partner.type]) {
        byPartnerType[ps.partner.type] = { count: 0, gross_amount: 0, net_amount: 0 };
      }
      byPartnerType[ps.partner.type].count++;
      byPartnerType[ps.partner.type].gross_amount += ps.gross_amount;
      byPartnerType[ps.partner.type].net_amount += ps.net_amount;
    });
    
    const newRun: SettlementRun = {
      id: newId,
      run_number: `RUN-2024-${String(getMockSettlementRuns().length + 1).padStart(4, '0')}`,
      run_date: new Date().toISOString(),
      period_start: request.period_start,
      period_end: request.period_end,
      status: 'draft',
      total_amount: totalNet,
      total_transactions: totalTransactions,
      partner_count: partnerCount,
      currency: 'USD',
      payment_method: request.payment_method as any,
      created_by: {
        id: 'current-user',
        name: 'Current User',
        email: 'user@autorecon.com'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: request.notes,
      breakdown,
      summary: {
        total_gross_amount: totalGross,
        total_fees: totalFees,
        total_adjustments: totalAdjustments,
        total_net_amount: totalNet,
        total_transactions: totalTransactions,
        partner_count: partnerCount,
        currency: 'USD',
        by_partner_type: byPartnerType,
        by_status: { pending: partnerCount, paid: 0 },
        by_payment_method: { [request.payment_method]: { count: partnerCount, amount: totalNet } }
      }
    };
    
    getMockSettlementRuns().unshift(newRun);
    return newRun;
  },
  
  // Update settlement run status
  updateSettlementRunStatus: async (id: string, status: SettlementRun['status']): Promise<SettlementRun> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const run = getMockSettlementRuns().find(r => r.id === id);
    if (!run) {
      throw new Error(`Settlement run ${id} not found`);
    }
    
    run.status = status;
    run.updated_at = new Date().toISOString();
    
    if (status === 'completed') {
      run.completed_at = new Date().toISOString();
      run.breakdown.forEach(ps => {
        ps.status = 'paid';
        ps.payment_details = {
          method: 'bank_transfer',
          reference: `PAY-${Date.now()}-${ps.partner.id}`,
          paid_at: new Date().toISOString()
        };
      });
    }
    
    return run;
  },
  
  // Get settlement statistics
  getSettlementStats: async (): Promise<SettlementStats> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const runs = getMockSettlementRuns();
    const completed = runs.filter(r => r.status === 'completed');
    const pending = runs.filter(r => r.status !== 'completed' && r.status !== 'failed');
    
    const totalSettled = completed.reduce((sum, r) => sum + r.total_amount, 0);
    const avgSettlement = completed.length > 0 ? totalSettled / completed.length : 0;
    
    const allPartners = new Set<string>();
    runs.forEach(r => r.breakdown.forEach(ps => allPartners.add(ps.partner.id)));
    
    return {
      total_runs: runs.length,
      pending_count: pending.length,
      completed_count: completed.length,
      total_settled_amount: totalSettled,
      avg_settlement_amount: avgSettlement,
      total_partners: allPartners.size,
      recent_runs: runs.slice(0, 5)
    };
  },
  
  // Get partner settlement details
  getPartnerSettlement: async (runId: string, partnerId: string): Promise<PartnerSettlement> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const run = getMockSettlementRuns().find(r => r.id === runId);
    if (!run) {
      throw new Error(`Settlement run ${runId} not found`);
    }
    
    const partnerSettlement = run.breakdown.find(ps => ps.partner.id === partnerId);
    if (!partnerSettlement) {
      throw new Error(`Partner ${partnerId} not found in settlement run ${runId}`);
    }
    
    return partnerSettlement;
  }
};
