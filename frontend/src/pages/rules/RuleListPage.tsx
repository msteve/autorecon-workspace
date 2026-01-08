import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  ArrowUpDown, 
  Filter,
  Download,
  RefreshCw,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Power,
  PowerOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { RuleStatusBadge } from '@/components/rules/RuleStatusBadge';
import { 
  getRules, 
  toggleRuleStatus,
  deleteRule,
  Rule,
  RuleStatus,
  RuleListFilters,
  RuleSortOption
} from '@/services/ruleEngineService';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

/**
 * RuleListPage Component
 * 
 * Main page for viewing and managing reconciliation rules.
 * Features: search, filter, sort, create, edit, delete, toggle status.
 */
export const RuleListPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState<RuleListFilters>({});
  const [sort, setSort] = useState<RuleSortOption>({
    field: 'updatedAt',
    direction: 'desc'
  });
  const [search, setSearch] = useState('');

  // Fetch rules with React Query
  const { data: rules = [], isLoading, refetch } = useQuery({
    queryKey: ['rules', filters, sort],
    queryFn: () => getRules(filters, sort),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Calculate statistics
  const stats = {
    total: rules.length,
    active: rules.filter(r => r.status === 'active').length,
    pending: rules.filter(r => r.status === 'pending_approval').length,
    draft: rules.filter(r => r.status === 'draft').length
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearch(value);
    setFilters({ ...filters, search: value || undefined });
  };

  // Handle status filter
  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      const { status: _, ...rest } = filters;
      setFilters(rest);
    } else {
      setFilters({ ...filters, status: [status as RuleStatus] });
    }
  };

  // Handle enabled filter
  const handleEnabledFilter = (enabled: string) => {
    if (enabled === 'all') {
      const { isEnabled: _, ...rest } = filters;
      setFilters(rest);
    } else {
      setFilters({ ...filters, isEnabled: enabled === 'enabled' });
    }
  };

  // Handle sort change
  const handleSort = (field: RuleSortOption['field']) => {
    setSort({
      field,
      direction: sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  // Toggle rule status
  const handleToggleStatus = async (ruleId: string) => {
    try {
      await toggleRuleStatus(ruleId);
      toast.success('Rule status updated successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to update rule status');
    }
  };

  // Delete rule
  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteRule(ruleId);
      toast.success('Rule deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to delete rule');
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({});
    setSearch('');
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rule Engine</h1>
          <p className="text-muted-foreground mt-1">
            Manage reconciliation rules and matching strategies
          </p>
        </div>
        <Button onClick={() => navigate('/rules/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Rule
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Rules</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Rules</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.active}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Approval</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Drafts</CardDescription>
            <CardTitle className="text-3xl text-gray-600">{stats.draft}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search rules by name, description, or number..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Status filter */}
            <Select onValueChange={handleStatusFilter} defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {/* Enabled filter */}
            <Select onValueChange={handleEnabledFilter} defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Filter by state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                <SelectItem value="enabled">Enabled Only</SelectItem>
                <SelectItem value="disabled">Disabled Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rules Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Rules ({rules.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">Loading rules...</p>
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-semibold">No rules found</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {hasActiveFilters 
                  ? 'Try adjusting your filters or search criteria'
                  : 'Get started by creating your first rule'
                }
              </p>
              {!hasActiveFilters && (
                <Button className="mt-4" onClick={() => navigate('/rules/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Rule
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleSort('ruleNumber')}
                        className="h-8 px-2"
                      >
                        Rule #
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleSort('name')}
                        className="h-8 px-2"
                      >
                        Name
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleSort('priority')}
                        className="h-8 px-2"
                      >
                        Priority
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Strategy</TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleSort('timesApplied')}
                        className="h-8 px-2"
                      >
                        Applied
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleSort('updatedAt')}
                        className="h-8 px-2"
                      >
                        Updated
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell 
                        className="font-mono text-sm"
                        onClick={() => navigate(`/rules/${rule.id}`)}
                      >
                        {rule.ruleNumber}
                      </TableCell>
                      <TableCell onClick={() => navigate(`/rules/${rule.id}`)}>
                        <div>
                          <p className="font-medium">{rule.name}</p>
                          <div className="flex gap-1 mt-1">
                            {rule.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell 
                        className="text-sm text-muted-foreground max-w-xs truncate"
                        onClick={() => navigate(`/rules/${rule.id}`)}
                      >
                        {rule.description}
                      </TableCell>
                      <TableCell onClick={() => navigate(`/rules/${rule.id}`)}>
                        <Badge variant="outline">{rule.priority}</Badge>
                      </TableCell>
                      <TableCell onClick={() => navigate(`/rules/${rule.id}`)}>
                        <RuleStatusBadge status={rule.status} size="sm" />
                      </TableCell>
                      <TableCell onClick={() => navigate(`/rules/${rule.id}`)}>
                        <Badge variant="secondary" className="capitalize">
                          {rule.matchConfiguration.strategy.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={() => navigate(`/rules/${rule.id}`)}>
                        <div className="text-sm">
                          <p className="font-medium">{rule.statistics?.timesApplied || 0}</p>
                          <p className="text-xs text-muted-foreground">
                            {rule.statistics?.successfulMatches || 0} matched
                          </p>
                        </div>
                      </TableCell>
                      <TableCell onClick={() => navigate(`/rules/${rule.id}`)}>
                        <div className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(rule.updatedAt), { addSuffix: true })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigate(`/rules/${rule.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/rules/${rule.id}/edit`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleStatus(rule.id)}>
                              {rule.isEnabled ? (
                                <>
                                  <PowerOff className="h-4 w-4 mr-2" />
                                  Disable
                                </>
                              ) : (
                                <>
                                  <Power className="h-4 w-4 mr-2" />
                                  Enable
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteRule(rule.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
