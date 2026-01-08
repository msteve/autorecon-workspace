import { apiClient } from './apiClient';
import type { ReconciliationRule, PaginatedResponse } from '@/types';

export const ruleService = {
  getRules: async (page = 1, pageSize = 10): Promise<PaginatedResponse<ReconciliationRule>> => {
    return apiClient.get<PaginatedResponse<ReconciliationRule>>(`/rules?page=${page}&page_size=${pageSize}`);
  },

  getRuleById: async (id: string): Promise<ReconciliationRule> => {
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
