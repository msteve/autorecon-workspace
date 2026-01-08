import { apiClient } from './apiClient';
import type { Exception, ExceptionComment, PaginatedResponse } from '@/types';

export const exceptionService = {
  getExceptions: async (page = 1, pageSize = 10, filters?: any): Promise<PaginatedResponse<Exception>> => {
    const params = new URLSearchParams({ page: page.toString(), page_size: pageSize.toString(), ...filters });
    return apiClient.get<PaginatedResponse<Exception>>(`/exceptions?${params}`);
  },

  getExceptionById: async (id: string): Promise<Exception> => {
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
