import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Filter, 
  Search,
  AlertCircle,
  TrendingUp,
  FileText,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { approvalService } from '@/services/approvalService';
import type { ApprovalRequest } from '@/types';

export default function ApprovalsInbox() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['pending']);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch approvals
  const { data: approvalsData, isLoading } = useQuery({
    queryKey: ['approvals', currentPage, selectedStatuses, selectedTypes, selectedPriorities, searchQuery],
    queryFn: () => approvalService.getApprovals({
      page: currentPage,
      page_size: 20,
      status: selectedStatuses.length === 1 ? selectedStatuses[0] : undefined,
      type: selectedTypes.length === 1 ? selectedTypes[0] : undefined,
      priority: selectedPriorities.length === 1 ? selectedPriorities[0] : undefined,
      search: searchQuery || undefined
    }),
    staleTime: 30000
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['approval-stats'],
    queryFn: () => approvalService.getApprovalStats(),
    staleTime: 60000
  });

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
    setCurrentPage(1);
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
    setCurrentPage(1);
  };

  const togglePriority = (priority: string) => {
    setSelectedPriorities(prev =>
      prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]
    );
    setCurrentPage(1);
  };

  const getPriorityColor = (priority: ApprovalRequest['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getStatusColor = (status: ApprovalRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeLabel = (type: ApprovalRequest['type']) => {
    const labels: Record<ApprovalRequest['type'], string> = {
      rule_change: 'Rule Change',
      exception_resolution: 'Exception',
      settlement_approval: 'Settlement',
      gl_posting: 'GL Posting',
      threshold_override: 'Threshold'
    };
    return labels[type];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Approvals Inbox</h1>
        <p className="text-white text-opacity-90 mt-1">Review and process pending approval requests</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white text-opacity-90">Pending</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats.total_pending}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            {stats.overdue_count > 0 && (
              <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {stats.overdue_count} overdue
              </p>
            )}
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white text-opacity-90">Approved</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats.total_approved}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white text-opacity-90">Rejected</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats.total_rejected}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white text-opacity-90">Avg. Time</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats.avg_approval_time.toFixed(1)}h
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
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
                placeholder="Search by ID, title, or description..."
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
                Filters
                {(selectedStatuses.length + selectedTypes.length + selectedPriorities.length) > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedStatuses.length + selectedTypes.length + selectedPriorities.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.includes('pending')}
                onCheckedChange={() => toggleStatus('pending')}
              >
                Pending
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.includes('approved')}
                onCheckedChange={() => toggleStatus('approved')}
              >
                Approved
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.includes('rejected')}
                onCheckedChange={() => toggleStatus('rejected')}
              >
                Rejected
              </DropdownMenuCheckboxItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Priority</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={selectedPriorities.includes('urgent')}
                onCheckedChange={() => togglePriority('urgent')}
              >
                Urgent
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedPriorities.includes('high')}
                onCheckedChange={() => togglePriority('high')}
              >
                High
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedPriorities.includes('medium')}
                onCheckedChange={() => togglePriority('medium')}
              >
                Medium
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedPriorities.includes('low')}
                onCheckedChange={() => togglePriority('low')}
              >
                Low
              </DropdownMenuCheckboxItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Type</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={selectedTypes.includes('rule_change')}
                onCheckedChange={() => toggleType('rule_change')}
              >
                Rule Change
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedTypes.includes('exception_resolution')}
                onCheckedChange={() => toggleType('exception_resolution')}
              >
                Exception
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedTypes.includes('settlement_approval')}
                onCheckedChange={() => toggleType('settlement_approval')}
              >
                Settlement
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedTypes.includes('gl_posting')}
                onCheckedChange={() => toggleType('gl_posting')}
              >
                GL Posting
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedTypes.includes('threshold_override')}
                onCheckedChange={() => toggleType('threshold_override')}
              >
                Threshold
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      {/* Approvals List */}
      <div className="space-y-3">
        {isLoading ? (
          <Card className="p-12">
            <div className="text-center text-white text-opacity-80">Loading approvals...</div>
          </Card>
        ) : approvalsData && approvalsData.items.length > 0 ? (
          <>
            {approvalsData.items.map((approval) => (
              <Link key={approval.id} to={`/workflow/approvals/${approval.id}`}>
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="text-sm font-medium bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {getInitials(approval.requestor.name)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-white truncate">
                              {approval.title}
                            </h3>
                            {isOverdue(approval.due_date) && approval.status === 'pending' && (
                              <Badge variant="destructive" className="flex-shrink-0">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Overdue
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-white text-opacity-90 line-clamp-1">
                            {approval.description}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="outline" className={getPriorityColor(approval.priority)}>
                          {approval.priority}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(approval.status)}>
                          {approval.status}
                        </Badge>
                        <Badge variant="outline">
                          <FileText className="h-3 w-3 mr-1" />
                          {getTypeLabel(approval.type)}
                        </Badge>
                        <span className="text-sm text-white text-opacity-80">
                          by {approval.requestor.name}
                        </span>
                        <span className="text-sm text-gray-400">
                          {formatDate(approval.created_at)}
                        </span>
                        {approval.metadata.amount && (
                          <span className="text-sm font-medium text-white text-opacity-95">
                            ${approval.metadata.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}

            {/* Pagination */}
            {approvalsData.total_pages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-white text-opacity-90">
                  Page {currentPage} of {approvalsData.total_pages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(approvalsData.total_pages, p + 1))}
                  disabled={currentPage === approvalsData.total_pages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="p-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-white text-opacity-80">No approval requests found</p>
              <p className="text-sm text-gray-400 mt-1">
                Try adjusting your filters or search query
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
