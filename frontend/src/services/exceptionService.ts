import { apiClient } from './apiClient';
import type { Exception, ExceptionComment, PaginatedResponse } from '@/types';

// Use static mock data when backend is unavailable
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
if (USE_MOCK_DATA) {
  console.info('⚠️ Exception Service (Legacy): Using static mock data (backend unavailable)');
}

// Mock data
const mockExceptions: Exception[] = [
  {
    id: '1',
    title: 'Amount Mismatch',
    description: 'Transaction amounts do not match',
    type: 'mismatch',
    status: 'open',
    priority: 'high',
    assignedTo: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Missing Transaction',
    description: 'Transaction found in source but not in destination',
    type: 'missing',
    status: 'open',
    priority: 'medium',
    assignedTo: 'user-2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const exceptionService = {
  getExceptions: async (page = 1, pageSize = 10, filters?: any): Promise<PaginatedResponse<Exception>> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        items: mockExceptions.slice((page - 1) * pageSize, page * pageSize),
        total: mockExceptions.length,
        page,
        page_size: pageSize,
        total_pages: Math.ceil(mockExceptions.length / pageSize),
      };
    }
    const params = new URLSearchParams({ page: page.toString(), page_size: pageSize.toString(), ...filters });
    return apiClient.get<PaginatedResponse<Exception>>(`/exceptions?${params}`);
  },

  getExceptionById: async (id: string): Promise<Exception> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const exception = mockExceptions.find(e => e.id === id);
      if (!exception) throw new Error('Exception not found');
      return exception;
    }
    return apiClient.get<Exception>(`/exceptions/${id}`);
  },

  updateException: async (id: string, data: Partial<Exception>): Promise<Exception> => {
    return apiClient.patch<Exception>(`/exceptions/${id}`, data);
  },

  addComment: async (exceptionId: string, comment: string): Promise<ExceptionComment> => {
    return apiClient.post<ExceptionComment>(`/exceptions/${exceptionId}/comments`, { comment });
  },

  assignException: async (id: string, userId: string): Promise<Exception> => {
    return apiClient.post<Exception>(`/exceptions/${id}/assign`, { user_id: userId });
  },

  resolveException: async (id: string, resolution: string): Promise<Exception> => {
    return apiClient.post<Exception>(`/exceptions/${id}/resolve`, { resolution });
  },
};
