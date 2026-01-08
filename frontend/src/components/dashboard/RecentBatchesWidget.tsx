import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle2, Clock, XCircle, Eye } from 'lucide-react';
import { formatDate, formatNumber } from '@/lib/utils';

export interface RecentBatch {
  id: string;
  batchNumber: string;
  fileName: string;
  status: 'completed' | 'processing' | 'failed';
  recordsCount: number;
  matchedCount: number;
  exceptionsCount: number;
  processedAt: string;
  processingTime: number; // in seconds
}

interface RecentBatchesWidgetProps {
  batches: RecentBatch[];
  onViewDetails?: (batchId: string) => void;
  loading?: boolean;
}

export function RecentBatchesWidget({ batches, onViewDetails, loading = false }: RecentBatchesWidgetProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recently Processed Batches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 w-full animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: RecentBatch['status']) => {
    const config = {
      completed: {
        variant: 'success' as const,
        icon: CheckCircle2,
        label: 'Completed',
      },
      processing: {
        variant: 'warning' as const,
        icon: Clock,
        label: 'Processing',
      },
      failed: {
        variant: 'destructive' as const,
        icon: XCircle,
        label: 'Failed',
      },
    };

    const { variant, icon: Icon, label } = config[status];

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const formatProcessingTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recently Processed Batches</CardTitle>
        <p className="text-sm text-muted-foreground">Latest reconciliation batches</p>
      </CardHeader>
      <CardContent>
        {batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="mb-2 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No recent batches</p>
          </div>
        ) : (
          <div className="space-y-3">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-semibold text-sm">{batch.batchNumber}</h4>
                      <p className="text-xs text-muted-foreground">{batch.fileName}</p>
                    </div>
                  </div>
                  {getStatusBadge(batch.status)}
                </div>

                <div className="mb-3 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Records</p>
                    <p className="font-semibold">{formatNumber(batch.recordsCount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Matched</p>
                    <p className="font-semibold text-green-600">{formatNumber(batch.matchedCount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Exceptions</p>
                    <p className="font-semibold text-red-600">{formatNumber(batch.exceptionsCount)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                  <div>
                    <span>Processed: {formatDate(batch.processedAt)}</span>
                    <span className="mx-2">•</span>
                    <span>Time: {formatProcessingTime(batch.processingTime)}</span>
                  </div>
                  {onViewDetails && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7"
                      onClick={() => onViewDetails(batch.id)}
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
