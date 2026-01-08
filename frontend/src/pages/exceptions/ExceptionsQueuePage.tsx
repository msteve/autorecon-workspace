import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { exceptionService } from '@/services/exceptionService';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ExceptionsQueuePage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: 'open' });

  const { data, isLoading } = useQuery({
    queryKey: ['exceptions', page, filters],
    queryFn: () => exceptionService.getExceptions(page, 10, filters),
  });

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, any> = {
      critical: 'destructive',
      high: 'warning',
      medium: 'outline',
      low: 'secondary',
    };
    return <Badge variant={variants[severity] || 'outline'}>{severity}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exceptions Queue</h1>
        <p className="text-muted-foreground">Manage and resolve reconciliation exceptions</p>
      </div>

      <div className="flex gap-2">
        {['open', 'in_progress', 'resolved'].map((status) => (
          <Button
            key={status}
            variant={filters.status === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilters({ status })}
          >
            {status.replace('_', ' ')}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exceptions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : (
            <div className="space-y-3">
              {data?.items.map((exception) => (
                <div
                  key={exception.id}
                  className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-accent"
                  onClick={() => navigate(`/exceptions/${exception.id}`)}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      <h3 className="font-semibold">{exception.exception_type}</h3>
                      {getSeverityBadge(exception.severity)}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(exception.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mb-2 text-sm text-muted-foreground">{exception.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Ref: {exception.source_reference}</span>
                    {exception.amount && <span>Amount: ${exception.amount.toLocaleString()}</span>}
                    {exception.assigned_to && <span>Assigned to: {exception.assigned_to}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExceptionsQueuePage;
