import { apiClient } from '@/lib/apiClient';

// Use static mock data when backend is unavailable
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
if (USE_MOCK_DATA) {
  console.info('⚠️ Exceptions Service: Using static mock data (backend unavailable)');
}

/**
 * Exception Service
 * 
 * Handles exception management including queue management, SLA tracking,
 * assignments, comments, and attachments.
 */

// Types
export type ExceptionStatus = 'open' | 'in_progress' | 'resolved' | 'escalated' | 'closed';
export type ExceptionSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ExceptionCategory = 
  | 'matching_failure' 
  | 'data_quality' 
  | 'validation_error' 
  | 'system_error' 
  | 'manual_review' 
  | 'compliance';

export interface Exception {
  id: string;
  exceptionNumber: string;
  title: string;
  description: string;
  category: ExceptionCategory;
  severity: ExceptionSeverity;
  status: ExceptionStatus;
  
  // Context
  entityType: string;
  entityId: string;
  source: string;
  
  // Assignment
  assignedTo?: string;
  assignedToName?: string;
  teamId?: string;
  teamName?: string;
  
  // SLA
  slaDeadline: string;
  slaStatus: 'within_sla' | 'approaching' | 'breached';
  slaDaysRemaining: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  
  // Metrics
  ageInDays: number;
  responseTime?: number;
  resolutionTime?: number;
  
  // Related data
  commentsCount: number;
  attachmentsCount: number;
  tags: string[];
}

export interface ExceptionComment {
  id: string;
  exceptionId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExceptionAttachment {
  id: string;
  exceptionId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  url: string;
}

export interface ExceptionTimeline {
  id: string;
  exceptionId: string;
  eventType: 'created' | 'assigned' | 'status_changed' | 'comment_added' | 'attachment_added' | 'escalated' | 'resolved' | 'closed';
  description: string;
  userId?: string;
  userName?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ExceptionsFilters {
  status?: ExceptionStatus | ExceptionStatus[];
  severity?: ExceptionSeverity | ExceptionSeverity[];
  category?: ExceptionCategory | ExceptionCategory[];
  assignedTo?: string;
  teamId?: string;
  slaStatus?: 'within_sla' | 'approaching' | 'breached';
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  ageRange?: {
    min: number;
    max: number;
  };
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ExceptionStatistics {
  totalExceptions: number;
  openExceptions: number;
  resolvedToday: number;
  breachedSLA: number;
  
  byStatus: Record<ExceptionStatus, number>;
  bySeverity: Record<ExceptionSeverity, number>;
  byCategory: Record<ExceptionCategory, number>;
  
  averageResolutionTime: number;
  averageAge: number;
  slaComplianceRate: number;
}

export interface AgingBucket {
  label: string;
  range: { min: number; max: number };
  count: number;
  percentage: number;
  exceptions: Exception[];
}

export interface TeamAssignment {
  teamId: string;
  teamName: string;
  memberCount: number;
  activeExceptions: number;
  capacity: number;
  utilizationRate: number;
}

// Mock Data Generators
const generateException = (index: number, status: ExceptionStatus = 'open'): Exception => {
  const categories: ExceptionCategory[] = ['matching_failure', 'data_quality', 'validation_error', 'system_error', 'manual_review', 'compliance'];
  const severities: ExceptionSeverity[] = ['critical', 'high', 'medium', 'low'];
  const sources = ['Bank Feed', 'ERP System', 'Payment Gateway', 'Manual Entry', 'API Import'];
  
  const category = categories[Math.floor(Math.random() * categories.length)];
  const severity = severities[Math.floor(Math.random() * severities.length)];
  const source = sources[Math.floor(Math.random() * sources.length)];
  
  const ageInDays = Math.floor(Math.random() * 30);
  const slaDaysRemaining = severity === 'critical' ? 1 - ageInDays : 
                          severity === 'high' ? 3 - ageInDays : 
                          severity === 'medium' ? 7 - ageInDays : 14 - ageInDays;
  
  const slaStatus: 'within_sla' | 'approaching' | 'breached' = 
    slaDaysRemaining < 0 ? 'breached' :
    slaDaysRemaining <= 1 ? 'approaching' : 'within_sla';
  
  const createdAt = new Date(Date.now() - ageInDays * 24 * 60 * 60 * 1000).toISOString();
  const slaDeadline = new Date(Date.now() + slaDaysRemaining * 24 * 60 * 60 * 1000).toISOString();
  
  return {
    id: `exc-${index}`,
    exceptionNumber: `EXC-${String(index).padStart(6, '0')}`,
    title: `${category.replace('_', ' ')} - Transaction ${String(1000 + index)}`,
    description: `Exception detected in ${source}: ${category.replace('_', ' ')}. Requires immediate attention.`,
    category,
    severity,
    status,
    entityType: 'transaction',
    entityId: `txn-${index}`,
    source,
    assignedTo: status !== 'open' ? `user-${Math.floor(Math.random() * 5) + 1}` : undefined,
    assignedToName: status !== 'open' ? `Analyst ${Math.floor(Math.random() * 5) + 1}` : undefined,
    teamId: `team-${Math.floor(Math.random() * 3) + 1}`,
    teamName: ['Reconciliation Team', 'Operations Team', 'Compliance Team'][Math.floor(Math.random() * 3)],
    slaDeadline,
    slaStatus,
    slaDaysRemaining,
    createdAt,
    updatedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: status === 'resolved' || status === 'closed' ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() : undefined,
    closedAt: status === 'closed' ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() : undefined,
    ageInDays,
    responseTime: status !== 'open' ? Math.floor(Math.random() * 120) : undefined,
    resolutionTime: status === 'resolved' || status === 'closed' ? Math.floor(Math.random() * 480) : undefined,
    commentsCount: Math.floor(Math.random() * 10),
    attachmentsCount: Math.floor(Math.random() * 5),
    tags: ['urgent', 'needs_approval', 'high_value'].slice(0, Math.floor(Math.random() * 3) + 1)
  };
};

// Mock Data
const mockExceptions: Exception[] = [
  ...Array.from({ length: 30 }, (_, i) => generateException(i + 1, 'open')),
  ...Array.from({ length: 20 }, (_, i) => generateException(i + 31, 'in_progress')),
  ...Array.from({ length: 15 }, (_, i) => generateException(i + 51, 'resolved')),
  ...Array.from({ length: 10 }, (_, i) => generateException(i + 66, 'escalated')),
  ...Array.from({ length: 5 }, (_, i) => generateException(i + 76, 'closed'))
];

const mockComments: Record<string, ExceptionComment[]> = {};
const mockAttachments: Record<string, ExceptionAttachment[]> = {};
const mockTimeline: Record<string, ExceptionTimeline[]> = {};

// Initialize mock data for each exception
mockExceptions.forEach(exc => {
  mockComments[exc.id] = Array.from({ length: exc.commentsCount }, (_, i) => ({
    id: `comment-${exc.id}-${i}`,
    exceptionId: exc.id,
    userId: `user-${Math.floor(Math.random() * 5) + 1}`,
    userName: `User ${Math.floor(Math.random() * 5) + 1}`,
    content: `Comment ${i + 1} regarding this exception. ${i % 2 === 0 ? 'This is an internal note.' : 'This is visible to all.'}`,
    isInternal: i % 2 === 0,
    createdAt: new Date(Date.now() - (exc.commentsCount - i) * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - (exc.commentsCount - i) * 60 * 60 * 1000).toISOString()
  }));
  
  mockAttachments[exc.id] = Array.from({ length: exc.attachmentsCount }, (_, i) => ({
    id: `attachment-${exc.id}-${i}`,
    exceptionId: exc.id,
    fileName: `document_${i + 1}.pdf`,
    fileSize: Math.floor(Math.random() * 5000000) + 100000,
    fileType: 'application/pdf',
    uploadedBy: `user-${Math.floor(Math.random() * 5) + 1}`,
    uploadedByName: `User ${Math.floor(Math.random() * 5) + 1}`,
    uploadedAt: new Date(Date.now() - (exc.attachmentsCount - i) * 120 * 60 * 1000).toISOString(),
    url: `/api/attachments/${exc.id}/document_${i + 1}.pdf`
  }));
  
  const timeline: ExceptionTimeline[] = [
    {
      id: `timeline-${exc.id}-1`,
      exceptionId: exc.id,
      eventType: 'created',
      description: 'Exception created',
      userName: 'System',
      timestamp: exc.createdAt,
      metadata: { source: exc.source }
    }
  ];
  
  if (exc.assignedTo) {
    timeline.push({
      id: `timeline-${exc.id}-2`,
      exceptionId: exc.id,
      eventType: 'assigned',
      description: `Assigned to ${exc.assignedToName}`,
      userName: 'System',
      timestamp: new Date(new Date(exc.createdAt).getTime() + 60 * 60 * 1000).toISOString(),
      metadata: { assignedTo: exc.assignedTo }
    });
  }
  
  if (exc.status === 'in_progress') {
    timeline.push({
      id: `timeline-${exc.id}-3`,
      exceptionId: exc.id,
      eventType: 'status_changed',
      description: 'Status changed to In Progress',
      userName: exc.assignedToName,
      timestamp: new Date(new Date(exc.createdAt).getTime() + 120 * 60 * 1000).toISOString(),
      metadata: { oldStatus: 'open', newStatus: 'in_progress' }
    });
  }
  
  if (exc.status === 'resolved' || exc.status === 'closed') {
    timeline.push({
      id: `timeline-${exc.id}-4`,
      exceptionId: exc.id,
      eventType: 'resolved',
      description: 'Exception resolved',
      userName: exc.assignedToName,
      timestamp: exc.resolvedAt!,
      metadata: { resolutionTime: exc.resolutionTime }
    });
  }
  
  mockTimeline[exc.id] = timeline;
});

/**
 * Exception Service Methods
 */
export const exceptionsService = {
  /**
   * Get paginated list of exceptions with filters
   */
  async getExceptions(
    filters?: ExceptionsFilters,
    pagination: PaginationOptions = { page: 1, pageSize: 20 }
  ): Promise<PaginatedResponse<Exception>> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    let filtered = [...mockExceptions];
    
    // Apply filters
    if (filters?.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      filtered = filtered.filter(exc => statuses.includes(exc.status));
    }
    
    if (filters?.severity) {
      const severities = Array.isArray(filters.severity) ? filters.severity : [filters.severity];
      filtered = filtered.filter(exc => severities.includes(exc.severity));
    }
    
    if (filters?.category) {
      const categories = Array.isArray(filters.category) ? filters.category : [filters.category];
      filtered = filtered.filter(exc => categories.includes(exc.category));
    }
    
    if (filters?.assignedTo) {
      filtered = filtered.filter(exc => exc.assignedTo === filters.assignedTo);
    }
    
    if (filters?.teamId) {
      filtered = filtered.filter(exc => exc.teamId === filters.teamId);
    }
    
    if (filters?.slaStatus) {
      filtered = filtered.filter(exc => exc.slaStatus === filters.slaStatus);
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(exc => 
        exc.title.toLowerCase().includes(search) ||
        exc.description.toLowerCase().includes(search) ||
        exc.exceptionNumber.toLowerCase().includes(search)
      );
    }
    
    if (filters?.ageRange) {
      filtered = filtered.filter(exc => 
        exc.ageInDays >= filters.ageRange!.min && 
        exc.ageInDays <= filters.ageRange!.max
      );
    }
    
    // Sort
    const { sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    filtered.sort((a, b) => {
      const aVal = (a as any)[sortBy];
      const bVal = (b as any)[sortBy];
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    // Paginate
    const { page, pageSize } = pagination;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = filtered.slice(start, end);
    
    return {
      data,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize)
    };
  },

  /**
   * Get single exception by ID
   */
  async getExceptionById(id: string): Promise<Exception> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const exception = mockExceptions.find(exc => exc.id === id);
    if (!exception) {
      throw new Error('Exception not found');
    }
    
    return exception;
  },

  /**
   * Get comments for an exception
   */
  async getComments(exceptionId: string): Promise<ExceptionComment[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockComments[exceptionId] || [];
  },

  /**
   * Add comment to exception
   */
  async addComment(
    exceptionId: string,
    content: string,
    isInternal: boolean = false,
    userId: string = 'current-user'
  ): Promise<ExceptionComment> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const comment: ExceptionComment = {
      id: `comment-${Date.now()}`,
      exceptionId,
      userId,
      userName: 'Current User',
      content,
      isInternal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (!mockComments[exceptionId]) {
      mockComments[exceptionId] = [];
    }
    mockComments[exceptionId].unshift(comment);
    
    // Update exception comment count
    const exception = mockExceptions.find(e => e.id === exceptionId);
    if (exception) {
      exception.commentsCount++;
    }
    
    return comment;
  },

  /**
   * Get attachments for an exception
   */
  async getAttachments(exceptionId: string): Promise<ExceptionAttachment[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockAttachments[exceptionId] || [];
  },

  /**
   * Upload attachment
   */
  async uploadAttachment(
    exceptionId: string,
    file: File,
    userId: string = 'current-user'
  ): Promise<ExceptionAttachment> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const attachment: ExceptionAttachment = {
      id: `attachment-${Date.now()}`,
      exceptionId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedBy: userId,
      uploadedByName: 'Current User',
      uploadedAt: new Date().toISOString(),
      url: `/api/attachments/${exceptionId}/${file.name}`
    };
    
    if (!mockAttachments[exceptionId]) {
      mockAttachments[exceptionId] = [];
    }
    mockAttachments[exceptionId].unshift(attachment);
    
    // Update exception attachment count
    const exception = mockExceptions.find(e => e.id === exceptionId);
    if (exception) {
      exception.attachmentsCount++;
    }
    
    return attachment;
  },

  /**
   * Get timeline for an exception
   */
  async getTimeline(exceptionId: string): Promise<ExceptionTimeline[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockTimeline[exceptionId] || [];
  },

  /**
   * Assign exception to user
   */
  async assignException(
    exceptionId: string,
    userId: string,
    userName: string
  ): Promise<Exception> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const exception = mockExceptions.find(exc => exc.id === exceptionId);
    if (!exception) {
      throw new Error('Exception not found');
    }
    
    exception.assignedTo = userId;
    exception.assignedToName = userName;
    exception.status = 'in_progress';
    exception.updatedAt = new Date().toISOString();
    
    return exception;
  },

  /**
   * Update exception status
   */
  async updateStatus(
    exceptionId: string,
    status: ExceptionStatus
  ): Promise<Exception> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const exception = mockExceptions.find(exc => exc.id === exceptionId);
    if (!exception) {
      throw new Error('Exception not found');
    }
    
    exception.status = status;
    exception.updatedAt = new Date().toISOString();
    
    if (status === 'resolved') {
      exception.resolvedAt = new Date().toISOString();
    } else if (status === 'closed') {
      exception.closedAt = new Date().toISOString();
    }
    
    return exception;
  },

  /**
   * Get exception statistics
   */
  async getStatistics(): Promise<ExceptionStatistics> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const byStatus: Record<ExceptionStatus, number> = {
      open: 0,
      in_progress: 0,
      resolved: 0,
      escalated: 0,
      closed: 0
    };
    
    const bySeverity: Record<ExceptionSeverity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };
    
    const byCategory: Record<ExceptionCategory, number> = {
      matching_failure: 0,
      data_quality: 0,
      validation_error: 0,
      system_error: 0,
      manual_review: 0,
      compliance: 0
    };
    
    let totalResolutionTime = 0;
    let resolvedCount = 0;
    let totalAge = 0;
    let breachedSLA = 0;
    
    mockExceptions.forEach(exc => {
      byStatus[exc.status]++;
      bySeverity[exc.severity]++;
      byCategory[exc.category]++;
      totalAge += exc.ageInDays;
      
      if (exc.slaStatus === 'breached') {
        breachedSLA++;
      }
      
      if (exc.resolutionTime) {
        totalResolutionTime += exc.resolutionTime;
        resolvedCount++;
      }
    });
    
    const totalExceptions = mockExceptions.length;
    const withinSLA = mockExceptions.filter(e => e.slaStatus === 'within_sla').length;
    
    return {
      totalExceptions,
      openExceptions: byStatus.open + byStatus.in_progress,
      resolvedToday: Math.floor(Math.random() * 10),
      breachedSLA,
      byStatus,
      bySeverity,
      byCategory,
      averageResolutionTime: resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0,
      averageAge: totalAge / totalExceptions,
      slaComplianceRate: (withinSLA / totalExceptions) * 100
    };
  },

  /**
   * Get aging analysis
   */
  async getAgingAnalysis(): Promise<AgingBucket[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const buckets: AgingBucket[] = [
      { label: '0-3 days', range: { min: 0, max: 3 }, count: 0, percentage: 0, exceptions: [] },
      { label: '4-7 days', range: { min: 4, max: 7 }, count: 0, percentage: 0, exceptions: [] },
      { label: '8-14 days', range: { min: 8, max: 14 }, count: 0, percentage: 0, exceptions: [] },
      { label: '15-30 days', range: { min: 15, max: 30 }, count: 0, percentage: 0, exceptions: [] },
      { label: '30+ days', range: { min: 31, max: Infinity }, count: 0, percentage: 0, exceptions: [] }
    ];
    
    mockExceptions.forEach(exc => {
      const bucket = buckets.find(b => 
        exc.ageInDays >= b.range.min && exc.ageInDays <= b.range.max
      );
      if (bucket) {
        bucket.count++;
        bucket.exceptions.push(exc);
      }
    });
    
    const total = mockExceptions.length;
    buckets.forEach(bucket => {
      bucket.percentage = (bucket.count / total) * 100;
    });
    
    return buckets;
  },

  /**
   * Get team assignments
   */
  async getTeamAssignments(): Promise<TeamAssignment[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        teamId: 'team-1',
        teamName: 'Reconciliation Team',
        memberCount: 8,
        activeExceptions: mockExceptions.filter(e => e.teamId === 'team-1' && e.status !== 'closed').length,
        capacity: 50,
        utilizationRate: 0
      },
      {
        teamId: 'team-2',
        teamName: 'Operations Team',
        memberCount: 12,
        activeExceptions: mockExceptions.filter(e => e.teamId === 'team-2' && e.status !== 'closed').length,
        capacity: 75,
        utilizationRate: 0
      },
      {
        teamId: 'team-3',
        teamName: 'Compliance Team',
        memberCount: 5,
        activeExceptions: mockExceptions.filter(e => e.teamId === 'team-3' && e.status !== 'closed').length,
        capacity: 30,
        utilizationRate: 0
      }
    ].map(team => ({
      ...team,
      utilizationRate: (team.activeExceptions / team.capacity) * 100
    }));
  }
};
