import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Unlink,
  ThumbsUp,
  ThumbsDown,
  Eye,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { DataGrid, DataGridColumn } from '@/components/matching/DataGrid';
import { MatchingBadge } from '@/components/matching/MatchingBadge';
import { ComparisonView } from '@/components/matching/ComparisonView';
import { TransactionDetailDrawer } from '@/components/matching/TransactionDetailDrawer';
import { 
  matchingService, 
  MatchGroup, 
  MatchingFilters,
  MatchStatus,
  MatchType 
} from '@/services/matchingService';

/**
 * MatchedTransactionsPage Component
 * 
 * Displays a list of matched transaction groups with filtering, search, and actions.
 * Includes statistics dashboard and detail views.
 */
export const MatchedTransactionsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<MatchStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<MatchType | 'all'>('all');
  const [selectedMatch, setSelectedMatch] = useState<MatchGroup | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  // Fetch matched transactions
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['matched-transactions', page, pageSize, sortBy, sortOrder, searchTerm, statusFilter, typeFilter],
    queryFn: async () => {
      const filters: MatchingFilters = {
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        matchType: typeFilter !== 'all' ? typeFilter : undefined
      };

      return await matchingService.getMatchedTransactions(
        filters,
        { page, pageSize, sortBy, sortOrder }
      );
    }
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['matching-statistics'],
    queryFn: () => matchingService.getMatchingStatistics()
  });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleUnmatch = async (matchId: string) => {
    try {
      await matchingService.unmatchGroup(matchId);
      refetch();
      setSelectedMatch(null);
    } catch (error) {
      console.error('Failed to unmatch:', error);
    }
  };

  const handleApprove = async (matchId: string) => {
    try {
      await matchingService.approveMatch(matchId, 'current_user');
      refetch();
      setSelectedMatch(null);
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleReject = async (matchId: string, reason: string) => {
    try {
      await matchingService.rejectMatch(matchId, 'current_user', reason);
      refetch();
      setSelectedMatch(null);
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };

  const columns: DataGridColumn<MatchGroup>[] = [
    {
      key: 'matchNumber',
      header: 'Match #',
      sortable: true,
      render: (row) => (
        <div className="font-mono text-sm">{row.matchNumber}</div>
      )
    },
    {
      key: 'matchType',
      header: 'Type',
      sortable: true,
      render: (row) => (
        <MatchingBadge 
          matchType={row.matchType} 
          confidence={row.matchConfidence}
          size="sm"
        />
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => {
        const statusConfig: Record<MatchStatus, { label: string; className: string; icon: React.ReactNode }> = {
          matched: { 
            label: 'Matched', 
            className: 'bg-green-100 text-green-800',
            icon: <CheckCircle2 className="h-3 w-3" />
          },
          under_review: { 
            label: 'Review', 
            className: 'bg-blue-100 text-blue-800',
            icon: <AlertCircle className="h-3 w-3" />
          },
          approved: { 
            label: 'Approved', 
            className: 'bg-emerald-100 text-emerald-800',
            icon: <CheckCircle2 className="h-3 w-3" />
          },
          rejected: { 
            label: 'Rejected', 
            className: 'bg-red-100 text-red-800',
            icon: <XCircle className="h-3 w-3" />
          },
          unmatched: { 
            label: 'Unmatched', 
            className: 'bg-gray-100 text-gray-800',
            icon: <XCircle className="h-3 w-3" />
          },
          potential: { 
            label: 'Potential', 
            className: 'bg-yellow-100 text-yellow-800',
            icon: <AlertCircle className="h-3 w-3" />
          }
        };
        const config = statusConfig[row.status];
        return (
          <Badge className={`${config.className} inline-flex items-center gap-1`}>
            {config.icon}
            {config.label}
          </Badge>
        );
      }
    },
    {
      key: 'transactions',
      header: 'Sources',
      render: (row) => (
        <div className="flex gap-1">
          {row.transactions.map((txn) => (
            <Badge key={txn.id} variant="outline" className="text-xs">
              {txn.source.replace('_', ' ').toUpperCase()}
            </Badge>
          ))}
        </div>
      )
    },
    {
      key: 'totalAmount',
      header: 'Amount',
      sortable: true,
      render: (row) => (
        <div className="font-semibold">
          ${row.totalAmount.toFixed(2)}
        </div>
      )
    },
    {
      key: 'variance',
      header: 'Variance',
      sortable: true,
      render: (row) => (
        <div className="space-y-1">
          <div className={`font-semibold ${
            row.variance === 0 ? 'text-green-600' :
            row.variancePercentage < 1 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            ${Math.abs(row.variance).toFixed(2)}
          </div>
          {row.variance !== 0 && (
            <div className="text-xs text-muted-foreground">
              ({row.variancePercentage.toFixed(2)}%)
            </div>
          )}
        </div>
      )
    },
    {
      key: 'matchConfidence',
      header: 'Confidence',
      sortable: true,
      render: (row) => (
        <div className={`font-semibold ${
          row.matchConfidence >= 90 ? 'text-green-600' :
          row.matchConfidence >= 75 ? 'text-yellow-600' :
          'text-orange-600'
        }`}>
          {row.matchConfidence.toFixed(0)}%
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedMatch(row);
              setShowComparison(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {row.status === 'matched' && (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleApprove(row.id)}
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleReject(row.id, 'Manual rejection')}
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUnmatch(row.id)}
          >
            <Unlink className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Matched Transactions</h1>
        <p className="text-muted-foreground mt-1">
          View and manage matched transaction groups
        </p>
      </div>

      {/* Statistics Dashboard */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Transactions</CardDescription>
              <CardTitle className="text-3xl">{stats.totalTransactions.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Match Rate</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                {stats.matchRate.toFixed(1)}%
                <TrendingUp className="h-6 w-6 text-green-600" />
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Variance</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                ${stats.totalVariance.toFixed(0)}
                {stats.totalVariance > 1000 ? (
                  <TrendingUp className="h-6 w-6 text-red-600" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-green-600" />
                )}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Avg Confidence</CardDescription>
              <CardTitle className="text-3xl">{stats.averageConfidence.toFixed(0)}%</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="matched">Matched</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Match Type</label>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="exact">Exact</SelectItem>
                  <SelectItem value="fuzzy">Fuzzy</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="n_way">N-Way</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Grid */}
      <Card>
        <CardContent className="pt-6">
          <DataGrid
            columns={columns}
            data={data?.data || []}
            keyExtractor={(row) => row.id}
            currentPage={page}
            pageSize={pageSize}
            totalItems={data?.total || 0}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            loading={isLoading}
            emptyMessage="No matched transactions found"
          />
        </CardContent>
      </Card>

      {/* Comparison View Dialog */}
      {selectedMatch && showComparison && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Match Comparison</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowComparison(false)}>
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>
              <ComparisonView 
                transactions={selectedMatch.transactions} 
                highlightDifferences
                showVariance
              />
              <Separator />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => handleUnmatch(selectedMatch.id)}>
                  <Unlink className="h-4 w-4 mr-2" />
                  Unmatch
                </Button>
                {selectedMatch.status === 'matched' && (
                  <>
                    <Button onClick={() => handleApprove(selectedMatch.id)}>
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => handleReject(selectedMatch.id, 'Manual rejection')}
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
