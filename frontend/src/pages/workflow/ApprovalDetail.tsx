import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Clock,
  User,
  Calendar,
  DollarSign,
  AlertTriangle,
  Code,
  Activity,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { approvalService } from '@/services/approvalService';
import {
  ApprovalDecisionBar,
  ChangeDiffViewer,
  ApprovalHistoryTimeline
} from '@/components/workflow';
import type { ApprovalRequest } from '@/types';

export default function ApprovalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showFullPayload, setShowFullPayload] = useState(false);
  const [showFullLogs, setShowFullLogs] = useState(false);

  // Fetch approval details
  const { data: approval, isLoading } = useQuery({
    queryKey: ['approval', id],
    queryFn: () => approvalService.getApprovalById(id!),
    enabled: !!id,
    staleTime: 10000
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      approvalService.approveRequest(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval', id] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['approval-stats'] });
      toast({
        title: 'Approval Successful',
        description: 'The request has been approved.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Approval Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      approvalService.rejectRequest(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval', id] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['approval-stats'] });
      toast({
        title: 'Request Rejected',
        description: 'The request has been rejected.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Rejection Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleApprove = async (comment?: string) => {
    if (!id) return;
    await approveMutation.mutateAsync({ id, comment });
  };

  const handleReject = async (comment: string) => {
    if (!id) return;
    await rejectMutation.mutateAsync({ id, comment });
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
      exception_resolution: 'Exception Resolution',
      settlement_approval: 'Settlement Approval',
      gl_posting: 'GL Posting',
      threshold_override: 'Threshold Override'
    };
    return labels[type];
  };

  const getLogLevelColor = (level: 'info' | 'warning' | 'error') => {
    switch (level) {
      case 'info':
        return 'text-blue-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Card className="p-12">
          <div className="text-center text-gray-500">Loading approval details...</div>
        </Card>
      </div>
    );
  }

  if (!approval) {
    return (
      <div className="p-6">
        <Card className="p-12">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Approval request not found</p>
            <Button onClick={() => navigate('/workflow/approvals')} className="mt-4">
              Back to Inbox
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const displayedLogs = showFullLogs ? approval.logs : approval.logs.slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/workflow/approvals')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{approval.title}</h1>
              <Badge variant="outline" className={getStatusColor(approval.status)}>
                {approval.status}
              </Badge>
              <Badge variant="outline" className={getPriorityColor(approval.priority)}>
                {approval.priority}
              </Badge>
            </div>
            <p className="text-gray-600">{approval.description}</p>
          </div>
        </div>
      </div>

      {/* Decision Bar */}
      <ApprovalDecisionBar
        approval={approval}
        onApprove={handleApprove}
        onReject={handleReject}
        disabled={approveMutation.isPending || rejectMutation.isPending}
      />

      {/* Metadata Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 uppercase">Request ID</p>
              <p className="font-medium text-gray-900 truncate">{approval.id}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 uppercase">Requestor</p>
              <p className="font-medium text-gray-900 truncate">{approval.requestor.name}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 uppercase">Created</p>
              <p className="font-medium text-gray-900 truncate">
                {new Date(approval.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              {approval.metadata.amount ? (
                <DollarSign className="h-5 w-5 text-orange-600" />
              ) : (
                <Clock className="h-5 w-5 text-orange-600" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 uppercase">
                {approval.metadata.amount ? 'Amount' : 'Due Date'}
              </p>
              <p className="font-medium text-gray-900 truncate">
                {approval.metadata.amount
                  ? `$${approval.metadata.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                  : approval.due_date
                  ? new Date(approval.due_date).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details & Payload */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="changes">
                Changes
                {approval.changes && (
                  <Badge variant="secondary" className="ml-2">
                    {approval.changes.diff.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="payload">Payload</TabsTrigger>
              <TabsTrigger value="logs">
                Logs
                <Badge variant="secondary" className="ml-2">
                  {approval.logs.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4">
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Type</label>
                    <p className="text-gray-900 mt-1">{getTypeLabel(approval.type)}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Entity</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{approval.metadata.entity_type}</Badge>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {approval.metadata.entity_id}
                      </code>
                    </div>
                  </div>

                  {approval.metadata.risk_score !== undefined && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Risk Score</label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              approval.metadata.risk_score > 70
                                ? 'bg-red-600'
                                : approval.metadata.risk_score > 40
                                ? 'bg-yellow-600'
                                : 'bg-green-600'
                            }`}
                            style={{ width: `${approval.metadata.risk_score}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {approval.metadata.risk_score}/100
                        </span>
                      </div>
                      {approval.metadata.risk_score > 70 && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          High risk - requires careful review
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-700">Requestor</label>
                    <div className="mt-1">
                      <p className="text-gray-900">{approval.requestor.name}</p>
                      <p className="text-sm text-gray-500">{approval.requestor.email}</p>
                    </div>
                  </div>

                  {approval.approver && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Reviewer</label>
                      <div className="mt-1">
                        <p className="text-gray-900">{approval.approver.name}</p>
                        <p className="text-sm text-gray-500">{approval.approver.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="changes" className="mt-4">
              {approval.changes ? (
                <ChangeDiffViewer changes={approval.changes} showFullPayload={showFullPayload} />
              ) : (
                <Card className="p-6">
                  <p className="text-sm text-gray-500 text-center">
                    No changes to display for this request
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="payload" className="mt-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Request Payload</h3>
                  <Badge variant="outline">
                    <Code className="h-3 w-3 mr-1" />
                    JSON
                  </Badge>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-auto max-h-96">
                  <pre className="text-sm text-gray-800">
                    {JSON.stringify(approval.payload, null, 2)}
                  </pre>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="mt-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Logs
                  </h3>
                  <Badge variant="outline">{approval.logs.length} entries</Badge>
                </div>

                <div className="space-y-2">
                  {displayedLogs.map((log) => (
                    <div
                      key={log.id}
                      className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`uppercase text-xs ${getLogLevelColor(log.level)}`}
                          >
                            {log.level}
                          </Badge>
                          <span className="text-sm font-medium text-gray-900">
                            {log.message}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {log.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            View details
                          </summary>
                          <div className="bg-gray-100 rounded p-2 mt-1">
                            <pre className="text-xs text-gray-700 overflow-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        </details>
                      )}
                    </div>
                  ))}
                </div>

                {approval.logs.length > 5 && (
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => setShowFullLogs(!showFullLogs)}
                  >
                    {showFullLogs ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Show All {approval.logs.length} Logs
                      </>
                    )}
                  </Button>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - History Timeline */}
        <div className="lg:col-span-1">
          <ApprovalHistoryTimeline history={approval.history} />
        </div>
      </div>
    </div>
  );
}
