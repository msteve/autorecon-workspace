import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '@/services/dashboardService';
import { KPICard } from '@/components/dashboard/KPICard';
import { DailyVarianceChart } from '@/components/dashboard/DailyVarianceChart';
import { PartnerPerformanceChart } from '@/components/dashboard/PartnerPerformanceChart';
import { AlertsWidget, Alert } from '@/components/dashboard/AlertsWidget';
import { RecentBatchesWidget } from '@/components/dashboard/RecentBatchesWidget';
import { Button } from '@/components/ui/button';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Upload,
  FileText,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const DashboardPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: varianceData, isLoading: varianceLoading } = useQuery({
    queryKey: ['dashboard-variance'],
    queryFn: dashboardService.getDailyVariance,
  });

  const { data: partnerData, isLoading: partnerLoading } = useQuery({
    queryKey: ['dashboard-partners'],
    queryFn: dashboardService.getPartnerPerformance,
  });

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['dashboard-alerts'],
    queryFn: dashboardService.getAlerts,
    refetchInterval: 60000, // Refetch every minute
  });

  const { data: recentBatches, isLoading: batchesLoading } = useQuery({
    queryKey: ['dashboard-batches'],
    queryFn: dashboardService.getRecentBatches,
  });

  // Dismiss alert mutation
  const dismissAlertMutation = useMutation({
    mutationFn: dashboardService.dismissAlert,
    onSuccess: (_, alertId) => {
      queryClient.setQueryData(['dashboard-alerts'], (old: Alert[] | undefined) =>
        old ? old.filter((alert) => alert.id !== alertId) : []
      );
      toast({
        title: 'Alert Dismissed',
        description: 'The alert has been removed.',
      });
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    await queryClient.invalidateQueries({ queryKey: ['dashboard-variance'] });
    await queryClient.invalidateQueries({ queryKey: ['dashboard-partners'] });
    await queryClient.invalidateQueries({ queryKey: ['dashboard-alerts'] });
    await queryClient.invalidateQueries({ queryKey: ['dashboard-batches'] });
    setRefreshing(false);
    toast({
      title: 'Dashboard Refreshed',
      description: 'All data has been updated.',
    });
  };

  const handleAlertAction = (alertId: string) => {
    // Handle alert-specific actions
    toast({
      title: 'Action Triggered',
      description: `Action for alert ${alertId} initiated.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time overview of reconciliation operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => navigate('/ingestion/upload')}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Data
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Transactions"
          value={stats?.totalTransactions.toLocaleString() || '0'}
          subtitle="This month"
          icon={Activity}
          iconColor="text-blue-600"
          trend={
            stats?.trends.transactions
              ? {
                  value: stats.trends.transactions.value,
                  isPositive: stats.trends.transactions.isPositive,
                  label: 'vs last month',
                }
              : undefined
          }
          loading={statsLoading}
        />
        <KPICard
          title="Match Rate"
          value={stats ? `${stats.matchedPercentage.toFixed(1)}%` : '0%'}
          subtitle={
            stats
              ? `${Math.round((stats.totalTransactions * stats.matchedPercentage) / 100).toLocaleString()} matched`
              : undefined
          }
          icon={CheckCircle2}
          iconColor="text-green-600"
          trend={
            stats?.trends.matchRate
              ? {
                  value: stats.trends.matchRate.value,
                  isPositive: stats.trends.matchRate.isPositive,
                  label: 'vs last month',
                }
              : undefined
          }
          loading={statsLoading}
        />
        <KPICard
          title="Active Exceptions"
          value={stats?.exceptionsCount.toLocaleString() || '0'}
          subtitle="Require attention"
          icon={AlertTriangle}
          iconColor="text-amber-600"
          trend={
            stats?.trends.exceptions
              ? {
                  value: stats.trends.exceptions.value,
                  isPositive: stats.trends.exceptions.isPositive,
                  label: 'vs last month',
                }
              : undefined
          }
          loading={statsLoading}
        />
        <KPICard
          title="Pending Settlements"
          value={stats?.settlementsPending.toLocaleString() || '0'}
          subtitle="Awaiting approval"
          icon={Clock}
          iconColor="text-purple-600"
          trend={
            stats?.trends.settlements
              ? {
                  value: stats.trends.settlements.value,
                  isPositive: stats.trends.settlements.isPositive,
                  label: 'vs last month',
                }
              : undefined
          }
          loading={statsLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <DailyVarianceChart data={varianceData || []} loading={varianceLoading} />
        <PartnerPerformanceChart data={partnerData || []} loading={partnerLoading} />
      </div>

      {/* Widgets Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Alerts Widget */}
        <div className="lg:col-span-3">
          <AlertsWidget
            alerts={
              alerts?.map((alert) => ({
                ...alert,
                onAction: () => handleAlertAction(alert.id),
              })) || []
            }
            onDismiss={(id) => dismissAlertMutation.mutate(id)}
            loading={alertsLoading}
          />
        </div>

        {/* Recent Batches Widget */}
        <div className="lg:col-span-4">
          <RecentBatchesWidget
            batches={recentBatches || []}
            onViewDetails={(batchId) => {
              toast({
                title: 'Viewing Batch',
                description: `Opening details for batch ${batchId}`,
              });
              // navigate(`/ingestion/batch/${batchId}`);
            }}
            loading={batchesLoading}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <button
          onClick={() => navigate('/ingestion/upload')}
          className="group flex flex-col items-center gap-3 rounded-lg border bg-card p-6 transition-all hover:shadow-md hover:border-primary"
        >
          <Upload className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
          <div className="text-center">
            <p className="font-medium">Upload New File</p>
            <p className="text-xs text-muted-foreground">Start reconciliation</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/exceptions')}
          className="group flex flex-col items-center gap-3 rounded-lg border bg-card p-6 transition-all hover:shadow-md hover:border-amber-500"
        >
          <AlertTriangle className="h-8 w-8 text-amber-600 transition-transform group-hover:scale-110" />
          <div className="text-center">
            <p className="font-medium">Review Exceptions</p>
            <p className="text-xs text-muted-foreground">
              {stats?.exceptionsCount || 0} pending
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate('/approvals')}
          className="group flex flex-col items-center gap-3 rounded-lg border bg-card p-6 transition-all hover:shadow-md hover:border-purple-500"
        >
          <Clock className="h-8 w-8 text-purple-600 transition-transform group-hover:scale-110" />
          <div className="text-center">
            <p className="font-medium">Pending Approvals</p>
            <p className="text-xs text-muted-foreground">
              {stats?.settlementsPending || 0} items
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate('/reports')}
          className="group flex flex-col items-center gap-3 rounded-lg border bg-card p-6 transition-all hover:shadow-md hover:border-blue-500"
        >
          <FileText className="h-8 w-8 text-blue-600 transition-transform group-hover:scale-110" />
          <div className="text-center">
            <p className="font-medium">Generate Report</p>
            <p className="text-xs text-muted-foreground">Export data</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
