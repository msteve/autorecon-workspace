import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Power, 
  PowerOff,
  Send,
  Copy,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConditionBuilder } from '@/components/rules/ConditionBuilder';
import { MatchStrategySelector } from '@/components/rules/MatchStrategySelector';
import { RuleStatusBadge } from '@/components/rules/RuleStatusBadge';
import { RuleVersionHistory } from '@/components/rules/RuleVersionHistory';
import { ApprovalPanel } from '@/components/rules/ApprovalPanel';
import { 
  getRuleById,
  getRuleVersions,
  toggleRuleStatus,
  deleteRule,
  submitForApproval,
  approveRule,
  rejectRule
} from '@/services/ruleEngineService';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

/**
 * RuleDetailsPage Component
 * 
 * Detailed view of a reconciliation rule with version history and approval workflow.
 */
export const RuleDetailsPage: React.FC = () => {
  const { ruleId } = useParams<{ ruleId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch rule data
  const { data: rule, isLoading } = useQuery({
    queryKey: ['rule', ruleId],
    queryFn: () => getRuleById(ruleId!),
    enabled: !!ruleId
  });

  // Fetch version history
  const { data: versions = [] } = useQuery({
    queryKey: ['rule-versions', ruleId],
    queryFn: () => getRuleVersions(ruleId!),
    enabled: !!ruleId
  });

  // Toggle status mutation
  const toggleMutation = useMutation({
    mutationFn: () => toggleRuleStatus(ruleId!),
    onSuccess: () => {
      toast.success('Rule status updated');
      queryClient.invalidateQueries({ queryKey: ['rule', ruleId] });
    },
    onError: () => {
      toast.error('Failed to update rule status');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteRule(ruleId!),
    onSuccess: () => {
      toast.success('Rule deleted successfully');
      navigate('/rules');
    },
    onError: () => {
      toast.error('Failed to delete rule');
    }
  });

  // Submit for approval mutation
  const submitMutation = useMutation({
    mutationFn: (comments?: string) => submitForApproval(ruleId!, comments),
    onSuccess: () => {
      toast.success('Rule submitted for approval');
      queryClient.invalidateQueries({ queryKey: ['rule', ruleId] });
    },
    onError: () => {
      toast.error('Failed to submit rule for approval');
    }
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ comments }: { comments?: string }) => 
      approveRule(ruleId!, 'current.user', comments),
    onSuccess: () => {
      toast.success('Rule approved successfully');
      queryClient.invalidateQueries({ queryKey: ['rule', ruleId] });
    },
    onError: () => {
      toast.error('Failed to approve rule');
    }
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ reason }: { reason: string }) => 
      rejectRule(ruleId!, 'current.user', reason),
    onSuccess: () => {
      toast.success('Rule rejected');
      queryClient.invalidateQueries({ queryKey: ['rule', ruleId] });
    },
    onError: () => {
      toast.error('Failed to reject rule');
    }
  });

  // Handle delete
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this rule? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  // Handle duplicate
  const handleDuplicate = () => {
    toast.info('Duplicate functionality coming soon');
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground mt-4">Loading rule...</p>
        </div>
      </div>
    );
  }

  if (!rule) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Rule not found</h2>
          <p className="text-muted-foreground mt-2">The rule you're looking for doesn't exist.</p>
          <Button className="mt-4" onClick={() => navigate('/rules')}>
            Back to Rules
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/rules')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{rule.name}</h1>
              <RuleStatusBadge status={rule.status} />
            </div>
            <p className="text-muted-foreground mt-1">
              {rule.ruleNumber} • Version {rule.version} • Priority {rule.priority}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => toggleMutation.mutate()}
            title={rule.isEnabled ? 'Disable rule' : 'Enable rule'}
          >
            {rule.isEnabled ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleDuplicate}
            title="Duplicate rule"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/rules/${ruleId}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="conditions">Conditions</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rule Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                    <p className="mt-1">{rule.description}</p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Priority</h3>
                      <p className="mt-1 flex items-center gap-2">
                        <Badge variant="outline">{rule.priority}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {rule.priority <= 3 ? 'High' : rule.priority <= 7 ? 'Medium' : 'Low'}
                        </span>
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Match Strategy</h3>
                      <p className="mt-1">
                        <Badge variant="secondary" className="capitalize">
                          {rule.matchConfiguration.strategy.replace('_', ' ')}
                        </Badge>
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {rule.tags.length > 0 ? (
                        rule.tags.map(tag => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No tags</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <h3 className="font-medium text-muted-foreground">Created By</h3>
                      <p className="mt-1">{rule.createdBy}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(rule.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-muted-foreground">Last Updated</h3>
                      <p className="mt-1">{rule.updatedBy}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(rule.updatedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Match Configuration */}
              <MatchStrategySelector
                configuration={rule.matchConfiguration}
                onChange={() => {}}
                readOnly
              />
            </TabsContent>

            {/* Conditions Tab */}
            <TabsContent value="conditions" className="space-y-6">
              <ConditionBuilder
                conditions={rule.conditions}
                onChange={() => {}}
                readOnly
              />
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="statistics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Times Applied</CardDescription>
                    <CardTitle className="text-3xl">
                      {rule.statistics?.timesApplied || 0}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Successful Matches</CardDescription>
                    <CardTitle className="text-3xl text-green-600">
                      {rule.statistics?.successfulMatches || 0}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Success Rate</span>
                      <span className="text-sm text-muted-foreground">
                        {rule.statistics?.timesApplied 
                          ? Math.round((rule.statistics.successfulMatches / rule.statistics.timesApplied) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ 
                          width: `${rule.statistics?.timesApplied 
                            ? (rule.statistics.successfulMatches / rule.statistics.timesApplied) * 100 
                            : 0}%` 
                        }}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="text-sm">
                    <h3 className="font-medium mb-2">Last Applied</h3>
                    <p className="text-muted-foreground">
                      {rule.statistics?.lastApplied 
                        ? formatDistanceToNow(new Date(rule.statistics.lastApplied), { addSuffix: true })
                        : 'Never'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Version History */}
          <RuleVersionHistory
            versions={versions}
            currentVersion={rule.version}
            onRestore={(versionId) => toast.info('Restore functionality coming soon')}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Approval Panel */}
          <ApprovalPanel
            rule={rule}
            onApprove={async (comments) => {
              await approveMutation.mutateAsync({ comments });
            }}
            onReject={async (reason) => {
              await rejectMutation.mutateAsync({ reason });
            }}
            onSubmitForApproval={async (comments) => {
              await submitMutation.mutateAsync(comments);
            }}
            currentUser="current.user"
          />

          {/* Applies To */}
          <Card>
            <CardHeader>
              <CardTitle>Applies To</CardTitle>
              <CardDescription>
                Partners and types this rule applies to
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Partners</h3>
                {rule.appliesTo.partners && rule.appliesTo.partners.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {rule.appliesTo.partners.map(partner => (
                      <Badge key={partner} variant="outline">{partner}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">All partners</p>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-2">Reconciliation Types</h3>
                {rule.appliesTo.reconciliationTypes && rule.appliesTo.reconciliationTypes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {rule.appliesTo.reconciliationTypes.map(type => (
                      <Badge key={type} variant="outline">{type}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">All types</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
