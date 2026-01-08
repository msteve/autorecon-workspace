import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  Link2, 
  AlertCircle,
  Sparkles,
  Eye
} from 'lucide-react';
import { DataGrid, DataGridColumn } from '@/components/matching/DataGrid';
import { TransactionDetailDrawer } from '@/components/matching/TransactionDetailDrawer';
import { 
  matchingService, 
  Transaction,
  MatchingFilters,
  TransactionSource
} from '@/services/matchingService';

/**
 * UnmatchedTransactionsPage Component
 * 
 * Displays a list of unmatched transactions with manual matching capability,
 * potential match suggestions, and multi-select operations.
 */
export const UnmatchedTransactionsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<TransactionSource | 'all'>('all');
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);

  // Fetch unmatched transactions
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['unmatched-transactions', page, pageSize, sortBy, sortOrder, searchTerm, sourceFilter],
    queryFn: async () => {
      const filters: MatchingFilters = {
        search: searchTerm || undefined,
        source: sourceFilter !== 'all' ? sourceFilter : undefined
      };

      return await matchingService.getUnmatchedTransactions(
        filters,
        { page, pageSize, sortBy, sortOrder }
      );
    }
  });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleSelectTransaction = (transactionId: string, selected: boolean) => {
    const newSelected = new Set(selectedTransactions);
    if (selected) {
      newSelected.add(transactionId);
    } else {
      newSelected.delete(transactionId);
    }
    setSelectedTransactions(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected && data?.data) {
      setSelectedTransactions(new Set(data.data.map(t => t.id)));
    } else {
      setSelectedTransactions(new Set());
    }
  };

  const handleCreateManualMatch = async () => {
    if (selectedTransactions.size < 2) {
      alert('Please select at least 2 transactions to create a match');
      return;
    }

    try {
      await matchingService.createManualMatch(Array.from(selectedTransactions));
      setSelectedTransactions(new Set());
      refetch();
    } catch (error) {
      console.error('Failed to create manual match:', error);
    }
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailDrawer(true);
  };

  const getSourceColor = (source: string): string => {
    const colors: Record<string, string> = {
      source_a: 'bg-blue-100 text-blue-800',
      source_b: 'bg-green-100 text-green-800',
      source_c: 'bg-purple-100 text-purple-800',
      bank: 'bg-indigo-100 text-indigo-800',
      erp: 'bg-pink-100 text-pink-800',
      payment_gateway: 'bg-orange-100 text-orange-800'
    };
    return colors[source] || 'bg-gray-100 text-gray-800';
  };

  const columns: DataGridColumn<Transaction>[] = [
    {
      key: 'select',
      header: (
        <Checkbox
          checked={selectedTransactions.size > 0 && selectedTransactions.size === data?.data.length}
          onCheckedChange={handleSelectAll}
        />
      ) as any,
      render: (row) => (
        <Checkbox
          checked={selectedTransactions.has(row.id)}
          onCheckedChange={(checked) => handleSelectTransaction(row.id, checked as boolean)}
        />
      )
    },
    {
      key: 'transactionNumber',
      header: 'Transaction #',
      sortable: true,
      render: (row) => (
        <div className="font-mono text-sm">{row.transactionNumber}</div>
      )
    },
    {
      key: 'source',
      header: 'Source',
      sortable: true,
      render: (row) => (
        <Badge className={getSourceColor(row.source)}>
          {row.source.replace('_', ' ').toUpperCase()}
        </Badge>
      )
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (row) => <div className="text-sm">{row.date}</div>
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (row) => (
        <div className="font-semibold">
          ${row.amount.toFixed(2)} {row.currency}
        </div>
      )
    },
    {
      key: 'description',
      header: 'Description',
      render: (row) => (
        <div className="max-w-xs truncate text-sm">{row.description}</div>
      )
    },
    {
      key: 'reference',
      header: 'Reference',
      render: (row) => (
        <div className="font-mono text-xs">{row.reference}</div>
      )
    },
    {
      key: 'partnerName',
      header: 'Partner',
      sortable: true,
      render: (row) => (
        <div className="text-sm">{row.partnerName}</div>
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
            onClick={() => handleViewDetails(row)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewDetails(row)}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Suggest
          </Button>
        </div>
      )
    }
  ];

  const unmatchedCount = data?.total || 0;
  const selectedCount = selectedTransactions.size;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Unmatched Transactions</h1>
        <p className="text-muted-foreground mt-1">
          Review and manually match transactions that couldn't be automatically matched
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Unmatched Transactions</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              {unmatchedCount.toLocaleString()}
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Selected for Matching</CardDescription>
            <CardTitle className="text-3xl">{selectedCount}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <Button
              className="w-full"
              disabled={selectedCount < 2}
              onClick={handleCreateManualMatch}
            >
              <Link2 className="h-4 w-4 mr-2" />
              Create Manual Match ({selectedCount})
            </Button>
            {selectedCount > 0 && selectedCount < 2 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Select at least 2 transactions
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <label className="text-sm font-medium">Source</label>
              <Select value={sourceFilter} onValueChange={(value) => setSourceFilter(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="source_a">Source A</SelectItem>
                  <SelectItem value="source_b">Source B</SelectItem>
                  <SelectItem value="source_c">Source C</SelectItem>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="erp">ERP</SelectItem>
                  <SelectItem value="payment_gateway">Payment Gateway</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearchTerm('');
                  setSourceFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selection Actions */}
      {selectedCount > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={true}
                  onCheckedChange={() => setSelectedTransactions(new Set())}
                />
                <span className="font-medium">
                  {selectedCount} transaction{selectedCount !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedTransactions(new Set())}
                >
                  Clear Selection
                </Button>
                <Button
                  disabled={selectedCount < 2}
                  onClick={handleCreateManualMatch}
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  Create Manual Match
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
            emptyMessage="No unmatched transactions found"
          />
        </CardContent>
      </Card>

      {/* Transaction Detail Drawer */}
      <TransactionDetailDrawer
        transaction={selectedTransaction}
        open={showDetailDrawer}
        onClose={() => {
          setShowDetailDrawer(false);
          setSelectedTransaction(null);
        }}
        onMatch={async (transactionIds) => {
          await matchingService.createManualMatch(transactionIds);
          setShowDetailDrawer(false);
          setSelectedTransaction(null);
          refetch();
        }}
      />
    </div>
  );
};
