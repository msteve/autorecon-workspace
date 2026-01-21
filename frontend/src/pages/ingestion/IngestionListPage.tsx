import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ingestionService } from '@/services/ingestionService';
import { Plus, FileText, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const IngestionListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['ingestion-jobs', page],
    queryFn: () => ingestionService.getJobs(page, 10),
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: { variant: 'success', icon: CheckCircle2 },
      processing: { variant: 'warning', icon: Clock },
      failed: { variant: 'destructive', icon: XCircle },
      pending: { variant: 'outline', icon: Clock },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="mr-1 h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Ingestion</h1>
          <p className="text-muted-foreground">Manage file uploads and ingestion jobs</p>
        </div>
        <Button onClick={() => navigate('/ingestion/upload')}>
          <Plus className="mr-2 h-4 w-4" />
          Upload File
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ingestion Jobs</CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-left text-sm font-medium">File Name</th>
                      <th className="p-3 text-left text-sm font-medium">Type</th>
                      <th className="p-3 text-left text-sm font-medium">Status</th>
                      <th className="p-3 text-left text-sm font-medium">Records</th>
                      <th className="p-3 text-left text-sm font-medium">Created</th>
                      <th className="p-3 text-left text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.items?.map((job) => (
                      <tr key={job.id} className="border-b">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{job.file_name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm">{job.file_type}</td>
                        <td className="p-3">{getStatusBadge(job.status)}</td>
                        <td className="p-3 text-sm">{job.records_count.toLocaleString()}</td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {formatDate(job.created_at)}
                        </td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No ingestion jobs found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {data && data.total_pages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, data.total)} of{' '}
                    {data.total} jobs
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= data.total_pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IngestionListPage;
