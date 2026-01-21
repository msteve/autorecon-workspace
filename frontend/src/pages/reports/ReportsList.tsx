import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Download,
  Play,
  Calendar,
  Filter,
  Search,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Plus
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
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { reportsService } from '@/services/reportsService';
import type { Report, ReportExecution } from '@/types';

export default function ReportsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch reports
  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ['reports', currentPage, selectedStatuses, selectedCategories, selectedTypes, searchQuery],
    queryFn: () => reportsService.getReports({
      page: currentPage,
      page_size: 10,
      status: selectedStatuses.length === 1 ? selectedStatuses[0] : undefined,
      category: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
      report_type: selectedTypes.length === 1 ? selectedTypes[0] : undefined,
      search: searchQuery || undefined
    }),
    staleTime: 30000
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['report-stats'],
    queryFn: () => reportsService.getReportStats(),
    staleTime: 60000
  });

  // Fetch recent executions
  const { data: executionsData } = useQuery({
    queryKey: ['report-executions'],
    queryFn: () => reportsService.getReportExecutions({ page: 1, page_size: 5 }),
    staleTime: 30000
  });

  // Execute report mutation
  const executeMutation = useMutation({
    mutationFn: (reportId: string) => reportsService.executeReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-executions'] });
      queryClient.invalidateQueries({ queryKey: ['report-stats'] });
      toast({
        title: 'Report Execution Started',
        description: 'The report is being generated. You will be notified when it\'s ready.',
      });
    },
    onError: () => {
      toast({
        title: 'Execution Failed',
        description: 'Failed to start report execution. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
    setCurrentPage(1);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
    setCurrentPage(1);
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
    setCurrentPage(1);
  };

  const getStatusBadge = (status: Report['status']) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      draft: 'bg-gray-100 text-gray-800'
    };
    return variants[status];
  };

  const getCategoryBadge = (category: Report['category']) => {
    const variants = {
      operational: 'bg-blue-100 text-blue-800',
      financial: 'bg-emerald-100 text-emerald-800',
      compliance: 'bg-purple-100 text-purple-800',
      analytics: 'bg-orange-100 text-orange-800'
    };
    return variants[category];
  };

  const getExecutionStatusIcon = (status: ReportExecution['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const formatFrequency = (schedule?: Report['schedule']) => {
    if (!schedule) return 'On-demand';
    const freq = schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1);
    return schedule.enabled ? freq : `${freq} (Paused)`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports</h1>
          <p className="text-white text-opacity-90 mt-1">Generate and schedule automated reports</p>
        </div>
        <Link to="/reports/scheduler">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-white text-opacity-90">Total Reports</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats?.total_reports || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-white text-opacity-90">Active Schedules</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats?.active_schedules || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-white text-opacity-90">Today's Executions</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats?.executions_today || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-white text-opacity-90">Avg. Time</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatDuration(stats?.avg_execution_time)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                  <Badge variant="secondary" className="ml-2">
                    {selectedStatuses.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.includes('active')}
                onCheckedChange={() => toggleStatus('active')}
              >
                Active
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.includes('paused')}
                onCheckedChange={() => toggleStatus('paused')}
              >
                Paused
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.includes('draft')}
                onCheckedChange={() => toggleStatus('draft')}
              >
                Draft
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Category
                {selectedCategories.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedCategories.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={selectedCategories.includes('operational')}
                onCheckedChange={() => toggleCategory('operational')}
              >
                Operational
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedCategories.includes('financial')}
                onCheckedChange={() => toggleCategory('financial')}
              >
                Financial
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedCategories.includes('compliance')}
                onCheckedChange={() => toggleCategory('compliance')}
              >
                Compliance
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedCategories.includes('analytics')}
                onCheckedChange={() => toggleCategory('analytics')}
              >
                Analytics
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      {/* Reports List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Available Reports</h2>
          
          {reportsLoading ? (
            <div className="text-center text-white text-opacity-80">Loading reports...</div>
          ) : reportsData?.items.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-white text-opacity-80">No reports found</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {reportsData?.items.map((report) => (
                <Card key={report.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-white">{report.name}</h3>
                          <Badge className={getStatusBadge(report.status)}>
                            {report.status}
                          </Badge>
                          <Badge className={getCategoryBadge(report.category)}>
                            {report.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-white text-opacity-80">{report.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-white text-opacity-80">
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {report.format.toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatFrequency(report.schedule)}
                      </span>
                      {report.last_run && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Last run: {new Date(report.last_run).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => executeMutation.mutate(report.id)}
                        disabled={executeMutation.isPending}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Run Now
                      </Button>
                      <Link to={`/reports/scheduler?report=${report.id}`}>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Executions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Recent Executions</h2>
          
          <div className="space-y-3">
            {executionsData?.items.map((execution) => (
              <Card key={execution.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getExecutionStatusIcon(execution.status)}
                      <span className="font-medium text-white text-sm">{execution.report_name}</span>
                    </div>
                    <p className="text-xs text-white text-opacity-80">
                      Started: {new Date(execution.started_at).toLocaleString()}
                    </p>
                    {execution.duration && (
                      <p className="text-xs text-white text-opacity-80">
                        Duration: {formatDuration(execution.duration)} • Size: {formatFileSize(execution.file_size)}
                      </p>
                    )}
                    {execution.error_message && (
                      <p className="text-xs text-red-600 mt-1">{execution.error_message}</p>
                    )}
                  </div>
                  {execution.status === 'completed' && (
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
