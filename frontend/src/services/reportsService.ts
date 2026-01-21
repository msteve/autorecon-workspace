// Use static mock data when backend is unavailable
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
if (USE_MOCK_DATA) {
  console.info('✅ Reports Service: Using static mock data (backend unavailable)');
}

import type { Report, ReportExecution, ReportSchedule, ReportStats, PaginatedResponse, User } from '@/types';

// Mock data generator
const generateMockReports = (): Report[] => {
  const reportTypes: Report['report_type'][] = [
    'reconciliation',
    'matching',
    'exceptions',
    'settlement',
    'gl_posting',
    'audit',
    'performance'
  ];

  const categories: Report['category'][] = ['operational', 'financial', 'compliance', 'analytics'];
  const formats: Report['format'][] = ['pdf', 'csv', 'excel'];
  const statuses: Report['status'][] = ['active', 'paused', 'draft'];

  const users: User[] = [
    { id: '1', name: 'John Smith', email: 'john.smith@autorecon.com', avatar: undefined },
    { id: '2', name: 'Sarah Johnson', email: 'sarah.j@autorecon.com', avatar: undefined },
    { id: '3', name: 'Mike Chen', email: 'mike.chen@autorecon.com', avatar: undefined },
  ];

  const reports: Report[] = [
    {
      id: 'RPT-001',
      name: 'Daily Reconciliation Summary',
      description: 'Comprehensive daily reconciliation report showing matched and unmatched transactions',
      report_type: 'reconciliation',
      category: 'operational',
      format: 'pdf',
      status: 'active',
      schedule: {
        id: 'SCH-001',
        report_id: 'RPT-001',
        frequency: 'daily',
        time: '08:00',
        timezone: 'America/New_York',
        recipients: ['finance@company.com', 'ops@company.com'],
        enabled: true
      },
      parameters: { include_details: true, date_range: 'yesterday' },
      last_run: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      next_run: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      created_by: users[0],
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'RPT-002',
      name: 'Weekly Exception Analysis',
      description: 'Detailed analysis of all exceptions raised during the week with resolution status',
      report_type: 'exceptions',
      category: 'operational',
      format: 'excel',
      status: 'active',
      schedule: {
        id: 'SCH-002',
        report_id: 'RPT-002',
        frequency: 'weekly',
        day_of_week: 1, // Monday
        time: '09:00',
        timezone: 'America/New_York',
        recipients: ['exceptions@company.com'],
        enabled: true
      },
      parameters: { include_comments: true, group_by: 'type' },
      last_run: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      next_run: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: users[1],
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'RPT-003',
      name: 'Monthly Settlement Summary',
      description: 'Monthly partner settlement report with gross/net amounts and fee breakdowns',
      report_type: 'settlement',
      category: 'financial',
      format: 'pdf',
      status: 'active',
      schedule: {
        id: 'SCH-003',
        report_id: 'RPT-003',
        frequency: 'monthly',
        day_of_month: 1,
        time: '10:00',
        timezone: 'America/New_York',
        recipients: ['finance@company.com', 'partners@company.com'],
        enabled: true
      },
      parameters: { include_partner_breakdown: true },
      last_run: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      next_run: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: users[0],
      created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'RPT-004',
      name: 'GL Posting Audit Trail',
      description: 'Complete audit trail of all journal entries posted to the general ledger',
      report_type: 'gl_posting',
      category: 'compliance',
      format: 'excel',
      status: 'active',
      schedule: {
        id: 'SCH-004',
        report_id: 'RPT-004',
        frequency: 'monthly',
        day_of_month: 5,
        time: '16:00',
        timezone: 'America/New_York',
        recipients: ['audit@company.com'],
        enabled: true
      },
      parameters: { include_approvals: true },
      last_run: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      next_run: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: users[2],
      created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'RPT-005',
      name: 'Matching Performance Metrics',
      description: 'Performance analytics for auto-matching rules and manual matching productivity',
      report_type: 'performance',
      category: 'analytics',
      format: 'pdf',
      status: 'active',
      schedule: {
        id: 'SCH-005',
        report_id: 'RPT-005',
        frequency: 'weekly',
        day_of_week: 5, // Friday
        time: '15:00',
        timezone: 'America/New_York',
        recipients: ['ops@company.com', 'management@company.com'],
        enabled: true
      },
      parameters: { include_charts: true },
      last_run: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      next_run: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: users[1],
      created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'RPT-006',
      name: 'Compliance Audit Log',
      description: 'Complete system audit log for compliance and security reviews',
      report_type: 'audit',
      category: 'compliance',
      format: 'csv',
      status: 'active',
      schedule: {
        id: 'SCH-006',
        report_id: 'RPT-006',
        frequency: 'daily',
        time: '23:00',
        timezone: 'America/New_York',
        recipients: ['security@company.com'],
        enabled: true
      },
      parameters: { include_ip_addresses: true },
      last_run: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      next_run: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      created_by: users[2],
      created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'RPT-007',
      name: 'Ad-hoc Transaction Analysis',
      description: 'Custom transaction analysis report for specific date ranges',
      report_type: 'reconciliation',
      category: 'analytics',
      format: 'excel',
      status: 'draft',
      parameters: { custom_filters: true },
      created_by: users[0],
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'RPT-008',
      name: 'Partner Performance Scorecard',
      description: 'Monthly scorecard showing partner transaction volumes, success rates, and fees',
      report_type: 'performance',
      category: 'analytics',
      format: 'pdf',
      status: 'paused',
      schedule: {
        id: 'SCH-008',
        report_id: 'RPT-008',
        frequency: 'monthly',
        day_of_month: 15,
        time: '12:00',
        timezone: 'America/New_York',
        recipients: ['partners@company.com'],
        enabled: false
      },
      parameters: { include_trends: true },
      last_run: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: users[1],
      created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  return reports;
};

const generateMockExecutions = (): ReportExecution[] => {
  const reports = generateMockReports();
  const users: User[] = [
    { id: '1', name: 'John Smith', email: 'john.smith@autorecon.com', avatar: undefined },
    { id: '2', name: 'Sarah Johnson', email: 'sarah.j@autorecon.com', avatar: undefined },
  ];

  const executions: ReportExecution[] = [];

  for (let i = 0; i < 30; i++) {
    const report = reports[Math.floor(Math.random() * reports.length)];
    const status: ReportExecution['status'] = i < 25 ? 'completed' : i < 27 ? 'running' : i < 29 ? 'failed' : 'pending';
    const startDate = new Date(Date.now() - (i * 3 * 60 * 60 * 1000));
    const duration = status === 'completed' ? Math.floor(Math.random() * 300) + 30 : undefined;

    executions.push({
      id: `EXEC-${String(i + 1).padStart(3, '0')}`,
      report_id: report.id,
      report_name: report.name,
      status,
      started_at: startDate.toISOString(),
      completed_at: status === 'completed' ? new Date(startDate.getTime() + (duration! * 1000)).toISOString() : undefined,
      duration,
      file_url: status === 'completed' ? `/downloads/reports/${report.id}-${Date.now()}.${report.format}` : undefined,
      file_size: status === 'completed' ? Math.floor(Math.random() * 5000000) + 100000 : undefined,
      error_message: status === 'failed' ? 'Database connection timeout' : undefined,
      executed_by: users[Math.floor(Math.random() * users.length)],
      parameters: report.parameters || {}
    });
  }

  return executions.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
};

const mockReports = generateMockReports();
const mockExecutions = generateMockExecutions();

// Service implementation
export const reportsService = {
  // Get reports list with filtering and pagination
  getReports: async (params?: {
    page?: number;
    page_size?: number;
    status?: string;
    category?: string;
    report_type?: string;
    search?: string;
  }): Promise<PaginatedResponse<Report>> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    let filtered = [...mockReports];

    if (params?.status) {
      filtered = filtered.filter(r => r.status === params.status);
    }
    if (params?.category) {
      filtered = filtered.filter(r => r.category === params.category);
    }
    if (params?.report_type) {
      filtered = filtered.filter(r => r.report_type === params.report_type);
    }
    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(search) ||
        r.description.toLowerCase().includes(search) ||
        r.id.toLowerCase().includes(search)
      );
    }

    const page = params?.page || 1;
    const pageSize = params?.page_size || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      items: filtered.slice(start, end),
      total: filtered.length,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(filtered.length / pageSize)
    };
  },

  // Get single report by ID
  getReportById: async (id: string): Promise<Report> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const report = mockReports.find(r => r.id === id);
    if (!report) throw new Error('Report not found');
    return report;
  },

  // Get report executions
  getReportExecutions: async (params?: {
    page?: number;
    page_size?: number;
    report_id?: string;
    status?: string;
  }): Promise<PaginatedResponse<ReportExecution>> => {
    await new Promise(resolve => setTimeout(resolve, 400));

    let filtered = [...mockExecutions];

    if (params?.report_id) {
      filtered = filtered.filter(e => e.report_id === params.report_id);
    }
    if (params?.status) {
      filtered = filtered.filter(e => e.status === params.status);
    }

    const page = params?.page || 1;
    const pageSize = params?.page_size || 20;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      items: filtered.slice(start, end),
      total: filtered.length,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(filtered.length / pageSize)
    };
  },

  // Execute report
  executeReport: async (reportId: string, parameters?: Record<string, any>): Promise<ReportExecution> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const report = mockReports.find(r => r.id === reportId);
    if (!report) throw new Error('Report not found');

    const execution: ReportExecution = {
      id: `EXEC-${String(mockExecutions.length + 1).padStart(3, '0')}`,
      report_id: reportId,
      report_name: report.name,
      status: 'running',
      started_at: new Date().toISOString(),
      executed_by: { id: '1', name: 'Current User', email: 'user@autorecon.com', avatar: undefined },
      parameters: parameters || report.parameters || {}
    };

    mockExecutions.unshift(execution);
    return execution;
  },

  // Download report
  downloadReport: async (executionId: string): Promise<Blob> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const execution = mockExecutions.find(e => e.id === executionId);
    if (!execution || execution.status !== 'completed') {
      throw new Error('Report not available for download');
    }

    // Create a mock file
    const content = `Report: ${execution.report_name}\nGenerated: ${execution.completed_at}\nStatus: ${execution.status}`;
    return new Blob([content], { type: 'text/plain' });
  },

  // Create report
  createReport: async (data: Partial<Report>): Promise<Report> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const newReport: Report = {
      id: `RPT-${String(mockReports.length + 1).padStart(3, '0')}`,
      name: data.name || 'New Report',
      description: data.description || '',
      report_type: data.report_type || 'reconciliation',
      category: data.category || 'operational',
      format: data.format || 'pdf',
      status: data.status || 'draft',
      schedule: data.schedule,
      parameters: data.parameters,
      created_by: { id: '1', name: 'Current User', email: 'user@autorecon.com', avatar: undefined },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockReports.push(newReport);
    return newReport;
  },

  // Update report
  updateReport: async (id: string, data: Partial<Report>): Promise<Report> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockReports.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Report not found');

    mockReports[index] = {
      ...mockReports[index],
      ...data,
      updated_at: new Date().toISOString()
    };

    return mockReports[index];
  },

  // Delete report
  deleteReport: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockReports.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Report not found');
    mockReports.splice(index, 1);
  },

  // Get report statistics
  getReportStats: async (): Promise<ReportStats> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const completedExecutions = mockExecutions.filter(e => e.status === 'completed');
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const executionsToday = mockExecutions.filter(e => new Date(e.started_at) >= todayStart);

    return {
      total_reports: mockReports.length,
      active_schedules: mockReports.filter(r => r.schedule?.enabled).length,
      executions_today: executionsToday.length,
      total_downloads: mockExecutions.filter(e => e.status === 'completed').length,
      avg_execution_time: completedExecutions.length > 0
        ? Math.round(completedExecutions.reduce((sum, e) => sum + (e.duration || 0), 0) / completedExecutions.length)
        : 0,
      failed_executions: mockExecutions.filter(e => e.status === 'failed').length
    };
  }
};
