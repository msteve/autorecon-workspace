import { apiClient } from './apiClient';
import type { ReconciliationRule, PaginatedResponse } from '@/types';

// Use static mock data when backend is unavailable
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
if (USE_MOCK_DATA) {
  console.info('📋 Rule Service: Using static mock data (backend unavailable)');
}

// Mock data
const mockRules: ReconciliationRule[] = [
  {
    id: '1',
    name: 'Transaction Amount Match',
    description: 'Match transactions by exact amount and date',
    type: 'automated',
    status: 'active',
    priority: 1,
    conditions: [],
    actions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Reference Number Match',
    description: 'Match by transaction reference number',
    type: 'automated',
    status: 'active',
    priority: 2,
    conditions: [],
    actions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const ruleService = {
  getRules: async (page = 1, pageSize = 10): Promise<PaginatedResponse<ReconciliationRule>> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        items: mockRules.slice((page - 1) * pageSize, page * pageSize),
        total: mockRules.length,
        page,
        page_size: pageSize,
        total_pages: Math.ceil(mockRules.length / pageSize),
      };
    }
    return apiClient.get<PaginatedResponse<ReconciliationRule>>(`/rules?page=${page}&page_size=${pageSize}`);
  },

  getRuleById: async (id: string): Promise<ReconciliationRule> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const rule = mockRules.find(r => r.id === id);
      if (!rule) throw new Error('Rule not found');
      return rule;
    }
    return apiClient.get<ReconciliationRule>(`/rules/${id}`);
  },

  createRule: async (rule: Partial<ReconciliationRule>): Promise<ReconciliationRule> => {
    return apiClient.post<ReconciliationRule>('/rules', rule);
  },

  updateRule: async (id: string, rule: Partial<ReconciliationRule>): Promise<ReconciliationRule> => {
    return apiClient.put<ReconciliationRule>(`/rules/${id}`, rule);
  },

  deleteRule: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/rules/${id}`);
  },

  toggleRule: async (id: string, isActive: boolean): Promise<ReconciliationRule> => {
    return apiClient.patch<ReconciliationRule>(`/rules/${id}/toggle`, { is_active: isActive });
  },
};
