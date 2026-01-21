import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Badge } from '../../components/ui/badge';
import { BatchStatusBadge } from '../../components/gl-posting';
import { glPostingService } from '../../services/glPostingService';
import {
  FileText,
  Filter,
  Search,
  Plus,
  BookOpen,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import type { JournalBatch } from '../../types';

export default function JournalBatchList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['gl-posting-stats'],
    queryFn: glPostingService.getGLPostingStats,
  });

  // Fetch journal batches
  const { data: batchesData, isLoading } = useQuery({
    queryKey: ['journal-batches', page, search, statusFilter],
    queryFn: () =>
      glPostingService.getJournalBatches({
        page,
        pageSize: 10,
        status: statusFilter.length === 1 ? statusFilter[0] : undefined,
        search,
      }),
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getBalanceStatus = (batch: JournalBatch) => {
    const diff = Math.abs(batch.totalDebit - batch.totalCredit);
    if (diff === 0) return { label: 'Balanced', variant: 'success' as const };
    if (diff < 100) return { label: 'Minor Variance', variant: 'warning' as const };
    return { label: 'Unbalanced', variant: 'destructive' as const };
  };

  const statusOptions: { value: JournalBatch['status']; label: string }[] = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending_approval', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'posted', label: 'Posted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'failed', label: 'Failed' },
  ];

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">GL Posting</h1>
          <p className="text-muted-foreground mt-1">
            Manage journal batches and general ledger postings
          </p>
        </div>
        <Button onClick={() => navigate('/gl-posting/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Batch
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Batches
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBatches || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats?.avgBatchSize || 0} avg entries per batch
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Approval
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingApproval || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Awaiting review
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Posted Batches
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.postedBatches || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Successfully posted to GL
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Suspense Entries
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.suspenseEntries || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Requires attention
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by batch number, description, or creator..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Status
              {statusFilter.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {statusFilter.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {statusOptions.map(option => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={statusFilter.includes(option.value)}
                onCheckedChange={() => handleStatusFilterChange(option.value)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Batch List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : batchesData?.items.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No journal batches found</h3>
              <p className="text-muted-foreground mb-4">
                {search || statusFilter.length > 0
                  ? 'Try adjusting your filters'
                  : 'Create your first journal batch to get started'}
              </p>
              {!search && statusFilter.length === 0 && (
                <Button onClick={() => navigate('/gl-posting/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Batch
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          batchesData?.items.map(batch => {
            const balanceStatus = getBalanceStatus(batch);
            return (
              <Card
                key={batch.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/gl-posting/batch/${batch.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{batch.batchNumber}</h3>
                        <BatchStatusBadge status={batch.status} />
                        <Badge variant={balanceStatus.variant}>
                          {balanceStatus.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {batch.description}
                      </p>
                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <span className="text-muted-foreground">Period:</span>
                          <span className="ml-2 font-medium">
                            {formatDate(batch.periodStart)} - {formatDate(batch.periodEnd)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Entries:</span>
                          <span className="ml-2 font-medium">{batch.entryCount}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Company:</span>
                          <span className="ml-2 font-medium">{batch.companyCode}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Created by:</span>
                          <span className="ml-2 font-medium">{batch.createdBy}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-2 ml-6">
                      <div>
                        <div className="text-xs text-muted-foreground">Total Debit</div>
                        <div className="text-lg font-semibold text-green-600">
                          {formatCurrency(batch.totalDebit)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Total Credit</div>
                        <div className="text-lg font-semibold text-blue-600">
                          {formatCurrency(batch.totalCredit)}
                        </div>
                      </div>
                      {batch.totalDebit !== batch.totalCredit && (
                        <div>
                          <div className="text-xs text-muted-foreground">Variance</div>
                          <div className="text-sm font-semibold text-amber-600">
                            {formatCurrency(Math.abs(batch.totalDebit - batch.totalCredit))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {batch.rejectionReason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-red-900">
                            Rejection Reason
                          </div>
                          <div className="text-sm text-red-700">{batch.rejectionReason}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {batchesData && batchesData.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, batchesData.total)} of{' '}
            {batchesData.total} batches
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(batchesData.total_pages)].map((_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 ||
                  pageNum === batchesData.total_pages ||
                  (pageNum >= page - 1 && pageNum <= page + 1)
                ) {
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                } else if (pageNum === page - 2 || pageNum === page + 2) {
                  return <span key={pageNum}>...</span>;
                }
                return null;
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(batchesData.total_pages, p + 1))}
              disabled={page === batchesData.total_pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
