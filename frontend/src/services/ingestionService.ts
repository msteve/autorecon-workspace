import { apiClient } from './apiClient';

// TypeScript Interfaces
export interface IngestionJob {
  id: string;
  jobNumber: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  uploadedBy: string;
  uploadedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  metadata: {
    partner: string;
    reconciliationType: string;
    period: string;
    notes?: string;
  };
  results?: {
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    processedRecords: number;
  };
  errors?: JobError[];
  progress?: number; // 0-100
}

export interface JobError {
  id: string;
  row: number;
  column: string;
  message: string;
  severity: 'error' | 'warning';
  timestamp: Date;
}

export interface UploadFileRequest {
  file: File;
  metadata: {
    partner: string;
    reconciliationType: string;
    period: string;
    notes?: string;
  };
}

export interface JobStatusTimeline {
  id: string;
  status: string;
  message: string;
  timestamp: Date;
  details?: string;
}

export interface JobListFilters {
  status?: string;
  partner?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// Mock Data Generators
const generateMockJob = (index: number, status: IngestionJob['status']): IngestionJob => {
  const uploadedAt = new Date(Date.now() - index * 3600000);
  const startedAt = status !== 'pending' ? new Date(uploadedAt.getTime() + 60000) : undefined;
  const completedAt = status === 'completed' || status === 'failed' 
    ? new Date((startedAt?.getTime() || uploadedAt.getTime()) + 300000) 
    : undefined;

  const partners = ['Bank A', 'Bank B', 'Processor C', 'Gateway D', 'PSP E'];
  const types = ['Transaction Matching', 'Settlement Reconciliation', 'Fee Validation', 'Balance Verification'];
  const fileNames = ['transactions_jan_2026.csv', 'settlements_q4_2025.xlsx', 'fees_dec_2025.csv', 'balances_weekly.xlsx'];

  return {
    id: `job-${index + 1}`,
    jobNumber: `JOB-2026-0108-${String(index + 1).padStart(4, '0')}`,
    fileName: fileNames[index % fileNames.length],
    fileSize: Math.floor(Math.random() * 10000000) + 100000,
    fileType: index % 2 === 0 ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    status,
    uploadedBy: index % 3 === 0 ? 'John Doe' : index % 3 === 1 ? 'Jane Smith' : 'Bob Johnson',
    uploadedAt,
    startedAt,
    completedAt,
    metadata: {
      partner: partners[index % partners.length],
      reconciliationType: types[index % types.length],
      period: '2026-01',
      notes: index % 2 === 0 ? 'Regular monthly reconciliation' : undefined,
    },
    results: status === 'completed' ? {
      totalRecords: 1000 + index * 100,
      validRecords: 950 + index * 95,
      invalidRecords: 30 + index * 3,
      processedRecords: 950 + index * 95,
    } : undefined,
    errors: status === 'failed' ? generateMockErrors(5) : 
            status === 'completed' && index % 3 === 0 ? generateMockErrors(2) : undefined,
    progress: status === 'processing' ? Math.floor(Math.random() * 100) : 
              status === 'completed' ? 100 : 
              status === 'pending' ? 0 : undefined,
  };
};

const generateMockErrors = (count: number): JobError[] => {
  const errorMessages = [
    'Invalid transaction amount format',
    'Missing required field: merchant_id',
    'Duplicate transaction reference',
    'Invalid date format in column',
    'Amount exceeds maximum threshold',
    'Invalid currency code',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `error-${Date.now()}-${i}`,
    row: Math.floor(Math.random() * 1000) + 1,
    column: ['amount', 'merchant_id', 'transaction_date', 'currency'][i % 4],
    message: errorMessages[i % errorMessages.length],
    severity: i % 3 === 0 ? 'error' : 'warning' as const,
    timestamp: new Date(Date.now() - i * 60000),
  }));
};

const generateMockTimeline = (job: IngestionJob): JobStatusTimeline[] => {
  const timeline: JobStatusTimeline[] = [
    {
      id: 'timeline-1',
      status: 'uploaded',
      message: 'File uploaded successfully',
      timestamp: job.uploadedAt,
      details: `File: ${job.fileName} (${(job.fileSize / 1024).toFixed(2)} KB)`,
    },
  ];

  if (job.startedAt) {
    timeline.push({
      id: 'timeline-2',
      status: 'validation',
      message: 'File validation started',
      timestamp: job.startedAt,
      details: 'Checking file format and structure',
    });
  }

  if (job.status === 'processing') {
    timeline.push({
      id: 'timeline-3',
      status: 'processing',
      message: 'Processing records',
      timestamp: new Date(job.startedAt!.getTime() + 30000),
      details: `Progress: ${job.progress}%`,
    });
  }

  if (job.completedAt) {
    if (job.status === 'completed') {
      timeline.push({
        id: 'timeline-4',
        status: 'processing',
        message: 'Processing records',
        timestamp: new Date(job.startedAt!.getTime() + 60000),
        details: `Processed ${job.results?.processedRecords} records`,
      });
      timeline.push({
        id: 'timeline-5',
        status: 'completed',
        message: 'Job completed successfully',
        timestamp: job.completedAt,
        details: `${job.results?.validRecords} valid, ${job.results?.invalidRecords} invalid records`,
      });
    } else if (job.status === 'failed') {
      timeline.push({
        id: 'timeline-4',
        status: 'failed',
        message: 'Job failed',
        timestamp: job.completedAt,
        details: `${job.errors?.length || 0} errors encountered`,
      });
    }
  }

  return timeline;
};

let mockJobs: IngestionJob[] = [
  generateMockJob(0, 'completed'),
  generateMockJob(1, 'processing'),
  generateMockJob(2, 'completed'),
  generateMockJob(3, 'failed'),
  generateMockJob(4, 'pending'),
  generateMockJob(5, 'completed'),
  generateMockJob(6, 'processing'),
  generateMockJob(7, 'completed'),
  generateMockJob(8, 'cancelled'),
  generateMockJob(9, 'completed'),
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const ingestionService = {
  async getJobs(filters?: JobListFilters): Promise<IngestionJob[]> {
    await delay(500);
    let filteredJobs = [...mockJobs];

    if (filters?.status) {
      filteredJobs = filteredJobs.filter(job => job.status === filters.status);
    }
    if (filters?.partner) {
      filteredJobs = filteredJobs.filter(job => job.metadata.partner === filters.partner);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.jobNumber.toLowerCase().includes(searchLower) ||
        job.fileName.toLowerCase().includes(searchLower) ||
        job.uploadedBy.toLowerCase().includes(searchLower)
      );
    }
    if (filters?.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filteredJobs = filteredJobs.filter(job => job.uploadedAt >= fromDate);
    }
    if (filters?.dateTo) {
      const toDate = new Date(filters.dateTo);
      filteredJobs = filteredJobs.filter(job => job.uploadedAt <= toDate);
    }

    return filteredJobs;
  },

  async getJobById(jobId: string): Promise<IngestionJob> {
    await delay(400);
    const job = mockJobs.find(j => j.id === jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }
    return job;
  },

  async uploadFile(request: UploadFileRequest): Promise<IngestionJob> {
    await delay(1500);

    const newJob: IngestionJob = {
      id: `job-${Date.now()}`,
      jobNumber: `JOB-2026-0108-${String(mockJobs.length + 1).padStart(4, '0')}`,
      fileName: request.file.name,
      fileSize: request.file.size,
      fileType: request.file.type,
      status: 'pending',
      uploadedBy: 'Current User',
      uploadedAt: new Date(),
      metadata: request.metadata,
      progress: 0,
    };

    mockJobs.unshift(newJob);

    setTimeout(() => {
      const job = mockJobs.find(j => j.id === newJob.id);
      if (job) {
        job.status = 'processing';
        job.startedAt = new Date();
        job.progress = 0;

        const progressInterval = setInterval(() => {
          if (job.progress !== undefined && job.progress < 100) {
            job.progress += 10;
          } else {
            clearInterval(progressInterval);
            job.status = 'completed';
            job.completedAt = new Date();
            job.progress = 100;
            job.results = {
              totalRecords: 1500,
              validRecords: 1450,
              invalidRecords: 50,
              processedRecords: 1450,
            };
          }
        }, 1000);
      }
    }, 2000);

    return newJob;
  },

  async getJobTimeline(jobId: string): Promise<JobStatusTimeline[]> {
    await delay(300);
    const job = mockJobs.find(j => j.id === jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }
    return generateMockTimeline(job);
  },

  async retryJob(jobId: string): Promise<IngestionJob> {
    await delay(600);
    const job = mockJobs.find(j => j.id === jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }
    if (job.status !== 'failed' && job.status !== 'cancelled') {
      throw new Error('Only failed or cancelled jobs can be retried');
    }

    job.status = 'pending';
    job.startedAt = undefined;
    job.completedAt = undefined;
    job.errors = undefined;
    job.progress = 0;

    setTimeout(() => {
      job.status = 'processing';
      job.startedAt = new Date();
    }, 1000);

    return job;
  },

  async cancelJob(jobId: string): Promise<IngestionJob> {
    await delay(400);
    const job = mockJobs.find(j => j.id === jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }
    if (job.status !== 'pending' && job.status !== 'processing') {
      throw new Error('Only pending or processing jobs can be cancelled');
    }

    job.status = 'cancelled';
    job.completedAt = new Date();
    return job;
  },

  async deleteJob(jobId: string): Promise<void> {
    await delay(300);
    const index = mockJobs.findIndex(j => j.id === jobId);
    if (index === -1) {
      throw new Error(`Job not found: ${jobId}`);
    }
    mockJobs.splice(index, 1);
  },

  async downloadErrorReport(jobId: string): Promise<Blob> {
    await delay(500);
    const job = mockJobs.find(j => j.id === jobId);
    if (!job || !job.errors) {
      throw new Error('No errors found for this job');
    }

    const csvContent = [
      'Row,Column,Severity,Message,Timestamp',
      ...job.errors.map(error => 
        `${error.row},${error.column},${error.severity},"${error.message}",${error.timestamp.toISOString()}`
      )
    ].join('\n');

    return new Blob([csvContent], { type: 'text/csv' });
  },

  async getPartners(): Promise<string[]> {
    await delay(200);
    return ['Bank A', 'Bank B', 'Processor C', 'Gateway D', 'PSP E'];
  },

  async getReconciliationTypes(): Promise<string[]> {
    await delay(200);
    return [
      'Transaction Matching',
      'Settlement Reconciliation',
      'Fee Validation',
      'Balance Verification',
      'Chargeback Reconciliation',
    ];
  },
};
