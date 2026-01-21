import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { SettlementStatusBadge } from '@/components/settlement';
import { settlementService } from '@/services/settlementService';

export default function SettlementRunList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch settlement runs
  const { data: runsData, isLoading } = useQuery({
    queryKey: ['settlement-runs', currentPage, selectedStatuses, searchQuery],
    queryFn: () => settlementService.getSettlementRuns({
      page: currentPage,
      page_size: 10,
      status: selectedStatuses.length === 1 ? selectedStatuses[0] : undefined,
      search: searchQuery || undefined
    }),
    staleTime: 30000
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['settlement-stats'],
    queryFn: () => settlementService.getSettlementStats(),
    staleTime: 60000
  });

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
    setCurrentPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Settlement Runs</h1>
          <p className="text-white text-opacity-90 mt-1">Manage and track partner settlement processing</p>
        </div>
        <Link to="/settlement/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Settlement Run
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white text-opacity-90">Total Settled</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(stats.total_settled_amount)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-white text-opacity-80 mt-2">
              {stats.completed_count} completed runs
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white text-opacity-90">Pending</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats.pending_count}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-white text-opacity-80 mt-2">
              Awaiting processing
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white text-opacity-90">Avg Settlement</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(stats.avg_settlement_amount)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-white text-opacity-80 mt-2">
              Per settlement run
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white text-opacity-90">Active Partners</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats.total_partners}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-white text-opacity-80 mt-2">
              Across all runs
            </p>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by run number or ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Status
                {selectedStatuses.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                    {selectedStatuses.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.includes('draft')}
                onCheckedChange={() => toggleStatus('draft')}
              >
                Draft
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.includes('pending_review')}
                onCheckedChange={() => toggleStatus('pending_review')}
              >
                Pending Review
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.includes('pending_approval')}
                onCheckedChange={() => toggleStatus('pending_approval')}
              >
                Pending Approval
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.includes('approved')}
                onCheckedChange={() => toggleStatus('approved')}
              >
                Approved
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.includes('processing')}
                onCheckedChange={() => toggleStatus('processing')}
              >
                Processing
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.includes('completed')}
                onCheckedChange={() => toggleStatus('completed')}
              >
                Completed
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      {/* Settlement Runs List */}
      <div className="space-y-3">
        {isLoading ? (
          <Card className="p-12">
            <div className="text-center text-white text-opacity-80">Loading settlement runs...</div>
          </Card>
        ) : runsData && runsData.items.length > 0 ? (
          <>
            {runsData.items.map((run) => (
              <Link key={run.id} to={`/settlement/${run.id}`}>
                <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {run.run_number}
                        </h3>
                        <SettlementStatusBadge status={run.status} />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white text-opacity-90">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(run.period_start)} - {formatDate(run.period_end)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {run.partner_count} partners
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          {run.total_transactions.toLocaleString()} transactions
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        {formatCurrency(run.total_amount)}
                      </div>
                      <div className="text-sm text-white text-opacity-80 mt-1">
                        Net settlement
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-white text-opacity-80 uppercase">Created</p>
                      <p className="text-sm font-medium text-white mt-1">
                        {formatDate(run.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white text-opacity-80 uppercase">Created By</p>
                      <p className="text-sm font-medium text-white mt-1">
                        {run.created_by.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white text-opacity-80 uppercase">Payment Method</p>
                      <p className="text-sm font-medium text-white mt-1 capitalize">
                        {run.payment_method.replace('_', ' ')}
                      </p>
                    </div>
                    {run.completed_at && (
                      <div>
                        <p className="text-xs text-white text-opacity-80 uppercase">Completed</p>
                        <p className="text-sm font-medium text-white mt-1">
                          {formatDate(run.completed_at)}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}

            {/* Pagination */}
            {runsData.total_pages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-white text-opacity-90">
                  Page {currentPage} of {runsData.total_pages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(runsData.total_pages, p + 1))}
                  disabled={currentPage === runsData.total_pages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="p-12">
            <div className="text-center">
              <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-white text-opacity-80">No settlement runs found</p>
              <p className="text-sm text-gray-400 mt-1">
                Create a new settlement run to get started
              </p>
              <Link to="/settlement/create">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Settlement Run
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
