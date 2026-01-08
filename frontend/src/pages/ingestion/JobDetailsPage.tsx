import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ingestionService } from '@/services/ingestionService';
import { JobStatusBadge } from '@/components/ingestion/JobStatusBadge';
import { RetryButton } from '@/components/ingestion/RetryButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Download,
  Trash2,
  Calendar,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Ban,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const JobDetailsPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: job, isLoading } = useQuery({
    queryKey: ['ingestion-job', jobId],
    queryFn: () => ingestionService.getJobById(jobId!),
    enabled: !!jobId,
    refetchInterval: (data) =>
      data?.status === 'processing' || data?.status === 'pending' ? 2000 : false,
  });

  const { data: timeline, isLoading: timelineLoading } = useQuery({
    queryKey: ['job-timeline', jobId],
    queryFn: () => ingestionService.getJobTimeline(jobId!),
    enabled: !!jobId,
  });

  const retryMutation = useMutation({
    mutationFn: () => ingestionService.retryJob(jobId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingestion-job', jobId] });
      queryClient.invalidateQueries({ queryKey: ['job-timeline', jobId] });
      queryClient.invalidateQueries({ queryKey: ['ingestion-jobs'] });
      toast({
        title: 'Job Retried',
        description: 'The job has been queued for reprocessing.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Retry Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => ingestionService.cancelJob(jobId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingestion-job', jobId] });
      queryClient.invalidateQueries({ queryKey: ['ingestion-jobs'] });
      toast({
        title: 'Job Cancelled',
        description: 'The job has been cancelled successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Cancellation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => ingestionService.deleteJob(jobId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingestion-jobs'] });
      toast({
        title: 'Job Deleted',
        description: 'The job has been deleted successfully.',
      });
      navigate('/ingestion');
    },
    onError: (error: Error) => {
      toast({
        title: 'Deletion Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const downloadErrorReport = async () => {
    try {
      const blob = await ingestionService.downloadErrorReport(jobId!);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${job?.jobNumber}_errors.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: 'Download Started',
        description: 'Error report is being downloaded.',
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Failed to download error report.',
        variant: 'destructive',
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />;
      case 'cancelled':
        return <Ban className="h-5 w-5 text-orange-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertTriangle className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Job Not Found</h2>
        <p className="text-muted-foreground">The requested job could not be found.</p>
        <Button onClick={() => navigate('/ingestion')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>
      </div>
    );
  }

  const canRetry = job.status === 'failed' || job.status === 'cancelled';
  const canCancel = job.status === 'pending' || job.status === 'processing';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/ingestion')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{job.jobNumber}</h1>
              <JobStatusBadge status={job.status} size="lg" />
            </div>
            <p className="text-muted-foreground">{job.fileName}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {canRetry && (
            <RetryButton onRetry={() => retryMutation.mutateAsync()} />
          )}
          {canCancel && (
            <Button
              variant="outline"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
            >
              <Ban className="mr-2 h-4 w-4" />
              Cancel Job
            </Button>
          )}
          {job.errors && job.errors.length > 0 && (
            <Button variant="outline" onClick={downloadErrorReport}>
              <Download className="mr-2 h-4 w-4" />
              Download Errors
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Job Information */}
        <Card>
          <CardHeader>
            <CardTitle>Job Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">File Name</p>
                <p className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {job.fileName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">File Size</p>
                <p className="font-medium">{formatFileSize(job.fileSize)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Uploaded By</p>
                <p className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {job.uploadedBy}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Uploaded At</p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(job.uploadedAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Partner</p>
                <Badge variant="outline">{job.metadata.partner}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <Badge variant="outline">{job.metadata.reconciliationType}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Period</p>
                <p className="font-medium">{job.metadata.period}</p>
              </div>
              {job.metadata.notes && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{job.metadata.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress (for processing jobs) */}
      {job.status === 'processing' && job.progress !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing records...</span>
                <span className="font-medium">{job.progress}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results (for completed jobs) */}
      {job.results && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold">{job.results.totalRecords}</p>
                <p className="text-sm text-muted-foreground">Total Records</p>
              </div>
              <div className="text-center p-4 border rounded-lg border-green-200 bg-green-50 dark:bg-green-950">
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {job.results.validRecords}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">Valid</p>
              </div>
              <div className="text-center p-4 border rounded-lg border-red-200 bg-red-50 dark:bg-red-950">
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                  {job.results.invalidRecords}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">Invalid</p>
              </div>
              <div className="text-center p-4 border rounded-lg border-blue-200 bg-blue-50 dark:bg-blue-950">
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {job.results.processedRecords}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">Processed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Status Timeline</CardTitle>
          <CardDescription>Track the progress of this job</CardDescription>
        </CardHeader>
        <CardContent>
          {timelineLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : timeline && timeline.length > 0 ? (
            <div className="relative space-y-6">
              {timeline.map((item, index) => (
                <div key={item.id} className="relative flex gap-4">
                  {/* Timeline line */}
                  {index < timeline.length - 1 && (
                    <div className="absolute left-[18px] top-10 bottom-0 w-0.5 bg-border" />
                  )}

                  {/* Icon */}
                  <div className="relative flex-shrink-0 mt-1">
                    {getStatusIcon(item.status)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium">{item.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.timestamp), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    {item.details && (
                      <p className="text-sm text-muted-foreground">{item.details}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(item.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No timeline data available
            </p>
          )}
        </CardContent>
      </Card>

      {/* Errors Table (for failed jobs or jobs with errors) */}
      {job.errors && job.errors.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Errors ({job.errors.length})</CardTitle>
                <CardDescription>Issues encountered during processing</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={downloadErrorReport}>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Row</TableHead>
                  <TableHead>Column</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {job.errors.slice(0, 10).map((error) => (
                  <TableRow key={error.id}>
                    <TableCell className="font-mono">{error.row}</TableCell>
                    <TableCell className="font-mono">{error.column}</TableCell>
                    <TableCell>
                      <Badge
                        variant={error.severity === 'error' ? 'destructive' : 'outline'}
                        className={cn(
                          error.severity === 'warning' &&
                            'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                        )}
                      >
                        {error.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>{error.message}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(error.timestamp), {
                        addSuffix: true,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {job.errors.length > 10 && (
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm" onClick={downloadErrorReport}>
                  View All {job.errors.length} Errors
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JobDetailsPage;
