import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  Download,
  Send,
  CheckCircle,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { settlementService } from '@/services/settlementService';
import { SettlementStatusBadge, PartnerBreakdownTable } from '@/components/settlement';

export default function SettlementSummary() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch settlement run
  const { data: settlementRun, isLoading } = useQuery({
    queryKey: ['settlement-run', id],
    queryFn: () => settlementService.getSettlementRunById(id!),
    enabled: !!id,
    staleTime: 10000
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) =>
      settlementService.updateSettlementRunStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settlement-run', id] });
      queryClient.invalidateQueries({ queryKey: ['settlement-runs'] });
      queryClient.invalidateQueries({ queryKey: ['settlement-stats'] });
      toast({
        title: 'Status Updated',
        description: 'Settlement run status has been updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleApprove = () => {
    if (!id) return;
    updateStatusMutation.mutate({ id, status: 'approved' });
  };

  const handleProcess = () => {
    if (!id) return;
    updateStatusMutation.mutate({ id, status: 'completed' });
  };

  const handlePartnerClick = (partner: any) => {
    navigate(`/settlement/${id}/partner/${partner.partner.id}`);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Card className="p-12">
          <div className="text-center text-white text-opacity-80">Loading settlement run...</div>
        </Card>
      </div>
    );
  }

  if (!settlementRun) {
    return (
      <div className="p-6">
        <Card className="p-12">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-white text-opacity-80">Settlement run not found</p>
            <Button onClick={() => navigate('/settlement')} className="mt-4">
              Back to Settlement Runs
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const canApprove = settlementRun.status === 'pending_approval';
  const canProcess = settlementRun.status === 'approved';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/settlement')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{settlementRun.run_number}</h1>
              <SettlementStatusBadge status={settlementRun.status} />
            </div>
            <p className="text-white text-opacity-90">
              Settlement period: {formatDate(settlementRun.period_start)} - {formatDate(settlementRun.period_end)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {canApprove && (
            <Button
              onClick={handleApprove}
              disabled={updateStatusMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          )}
          {canProcess && (
            <Button
              onClick={handleProcess}
              disabled={updateStatusMutation.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              Process Payments
            </Button>
          )}
        </div>
      </div>

      {/* Alert for pending actions */}
      {canApprove && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-900">Approval Required</h3>
              <p className="text-sm text-yellow-800 mt-1">
                This settlement run requires approval before processing payments. Review the details and partner breakdown before approving.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white text-opacity-90">Net Settlement</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCurrency(settlementRun.summary.total_net_amount)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-white text-opacity-80 mt-2">
            After fees and adjustments
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white text-opacity-90">Gross Amount</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCurrency(settlementRun.summary.total_gross_amount)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-white text-opacity-80 mt-2">
            Total transaction volume
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white text-opacity-90">Total Fees</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {formatCurrency(settlementRun.summary.total_fees)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-white text-opacity-80 mt-2">
            Processing fees
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white text-opacity-90">Partners</p>
              <p className="text-2xl font-bold text-white mt-1">
                {settlementRun.partner_count}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-white text-opacity-80 mt-2">
            {settlementRun.total_transactions.toLocaleString()} transactions
          </p>
        </Card>
      </div>

      {/* Details and Breakdown */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="breakdown">Partner Breakdown</TabsTrigger>
          <TabsTrigger value="details">Run Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          {/* Summary by Partner Type */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Summary by Partner Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(settlementRun.summary.by_partner_type).map(([type, data]) => (
                <Card key={type} className="p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="capitalize">
                      {type.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm font-medium text-white text-opacity-90">
                      {data.count} partner{data.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white text-opacity-90">Gross:</span>
                      <span className="font-medium">{formatCurrency(data.gross_amount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white text-opacity-90">Net:</span>
                      <span className="font-semibold text-white">{formatCurrency(data.net_amount)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Financial Summary */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Financial Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-white text-opacity-90">Gross Transaction Amount</span>
                <span className="font-medium text-white">
                  {formatCurrency(settlementRun.summary.total_gross_amount)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-t">
                <span className="text-white text-opacity-90">Total Processing Fees</span>
                <span className="font-medium text-red-600">
                  -{formatCurrency(settlementRun.summary.total_fees)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-t">
                <span className="text-white text-opacity-90">Adjustments</span>
                <span className={`font-medium ${
                  settlementRun.summary.total_adjustments >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {settlementRun.summary.total_adjustments >= 0 ? '+' : ''}
                  {formatCurrency(settlementRun.summary.total_adjustments)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-t-2 border-gray-300">
                <span className="text-lg font-semibold text-white">Net Settlement Amount</span>
                <span className="text-xl font-bold text-white">
                  {formatCurrency(settlementRun.summary.total_net_amount)}
                </span>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="mt-4">
          <PartnerBreakdownTable
            breakdown={settlementRun.breakdown}
            onPartnerClick={handlePartnerClick}
          />
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          <Card className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Run Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-white text-opacity-90">Run Number</label>
                    <p className="font-medium text-white">{settlementRun.run_number}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white text-opacity-90">Run ID</label>
                    <p className="font-mono text-sm text-white">{settlementRun.id}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white text-opacity-90">Settlement Period</label>
                    <p className="font-medium text-white">
                      {formatDate(settlementRun.period_start)} - {formatDate(settlementRun.period_end)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-white text-opacity-90">Payment Method</label>
                    <p className="font-medium text-white capitalize">
                      {settlementRun.payment_method.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Tracking</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-white text-opacity-90">Created By</label>
                    <p className="font-medium text-white">{settlementRun.created_by.name}</p>
                    <p className="text-sm text-white text-opacity-80">{settlementRun.created_by.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white text-opacity-90">Created At</label>
                    <p className="font-medium text-white">{formatDate(settlementRun.created_at)}</p>
                  </div>
                  {settlementRun.approved_by && (
                    <div>
                      <label className="text-sm text-white text-opacity-90">Approved By</label>
                      <p className="font-medium text-white">{settlementRun.approved_by.name}</p>
                      <p className="text-sm text-white text-opacity-80">{settlementRun.approved_by.email}</p>
                    </div>
                  )}
                  {settlementRun.completed_at && (
                    <div>
                      <label className="text-sm text-white text-opacity-90">Completed At</label>
                      <p className="font-medium text-white">{formatDate(settlementRun.completed_at)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {settlementRun.notes && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold text-white mb-2">Notes</h3>
                <p className="text-white text-opacity-95">{settlementRun.notes}</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
