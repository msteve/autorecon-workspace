import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { BatchStatusBadge, JournalEntryRow } from '../../components/gl-posting';
import { glPostingService } from '../../services/glPostingService';
import { useToast } from '../../hooks/use-toast';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Send,
  Download,
  FileText,
  AlertTriangle,
  TrendingUp,
  Calendar,
  User,
  Building,
  Hash,
} from 'lucide-react';

export default function JournalBatchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('entries');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch batch details
  const { data: batch, isLoading: batchLoading } = useQuery({
    queryKey: ['journal-batch', id],
    queryFn: () => glPostingService.getJournalBatchById(id!),
    enabled: !!id,
  });

  // Fetch entries
  const { data: entries, isLoading: entriesLoading } = useQuery({
    queryKey: ['journal-entries', id],
    queryFn: () => glPostingService.getJournalEntries(id!),
    enabled: !!id,
  });

  // Fetch summary
  const { data: summary } = useQuery({
    queryKey: ['journal-batch-summary', id],
    queryFn: () => glPostingService.getJournalBatchSummary(id!),
    enabled: !!id,
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: () => glPostingService.updateJournalBatchStatus(id!, 'approved'),
    onSuccess: () => {
      queryClient.invalidateQueries(['journal-batch', id]);
      toast({
        title: 'Batch Approved',
        description: 'The journal batch has been approved successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to approve the batch. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Post mutation
  const postMutation = useMutation({
    mutationFn: () => glPostingService.updateJournalBatchStatus(id!, 'posted'),
    onSuccess: () => {
      queryClient.invalidateQueries(['journal-batch', id]);
      toast({
        title: 'Batch Posted',
        description: 'The journal batch has been posted to the general ledger.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to post the batch. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: (reason: string) => glPostingService.rejectJournalBatch(id!, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['journal-batch', id]);
      setShowRejectDialog(false);
      setRejectionReason('');
      toast({
        title: 'Batch Rejected',
        description: 'The journal batch has been rejected.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to reject the batch. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Export to CSV
  const handleExportCSV = async () => {
    if (!id || !batch) return;

    try {
      const csv = await glPostingService.exportBatchToCSV(id);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${batch.batchNumber}_entries.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: 'Journal entries have been exported to CSV.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export entries. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Export to PDF (placeholder)
  const handleExportPDF = () => {
    toast({
      title: 'Coming Soon',
      description: 'PDF export functionality will be available soon.',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (batchLoading || !batch) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const isBalanced = batch.totalDebit === batch.totalCredit;
  const variance = Math.abs(batch.totalDebit - batch.totalCredit);
  const suspenseEntries = entries?.filter(e => e.suspenseFlag) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/gl-posting')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{batch.batchNumber}</h1>
              <BatchStatusBadge status={batch.status} />
              <Badge variant={isBalanced ? 'default' : 'destructive'}>
                {isBalanced ? 'Balanced' : 'Unbalanced'}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">{batch.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          
          {batch.status === 'pending_approval' && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(true)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => approveMutation.mutate()}
                disabled={!isBalanced || approveMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </>
          )}

          {batch.status === 'approved' && (
            <Button
              onClick={() => postMutation.mutate()}
              disabled={postMutation.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              Post to GL
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Debit
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(batch.totalDebit)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Credit
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(batch.totalCredit)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Variance
            </CardTitle>
            <AlertTriangle className={`h-4 w-4 ${isBalanced ? 'text-green-500' : 'text-amber-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isBalanced ? 'text-green-600' : 'text-amber-600'}`}>
              {formatCurrency(variance)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {isBalanced ? 'Perfectly balanced' : 'Needs adjustment'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Suspense Entries
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suspenseEntries.length}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Out of {batch.entryCount} total entries
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warnings */}
      {!isBalanced && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900">Unbalanced Batch</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Total debits and credits do not match. Variance of {formatCurrency(variance)} must be
                  resolved before approval.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {suspenseEntries.length > 0 && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900">Suspense Entries Detected</h4>
                <p className="text-sm text-amber-700 mt-1">
                  This batch contains {suspenseEntries.length} suspense{' '}
                  {suspenseEntries.length === 1 ? 'entry' : 'entries'} that require investigation and
                  proper account assignment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="entries">
            Journal Entries ({batch.entryCount})
          </TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        {/* Entries Tab */}
        <TabsContent value="entries" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Line</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                      <TableHead>Cost Center</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entriesLoading ? (
                      <TableRow>
                        <td colSpan={8} className="text-center py-8">
                          Loading entries...
                        </td>
                      </TableRow>
                    ) : entries?.length === 0 ? (
                      <TableRow>
                        <td colSpan={8} className="text-center py-8 text-muted-foreground">
                          No entries found
                        </td>
                      </TableRow>
                    ) : (
                      entries?.map(entry => (
                        <JournalEntryRow key={entry.id} entry={entry} showBatchInfo />
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Totals Footer */}
              <div className="border-t bg-muted/50 p-4">
                <div className="flex justify-end gap-12 font-semibold">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total Debit</div>
                    <div className="text-lg text-green-600">
                      {formatCurrency(batch.totalDebit)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total Credit</div>
                    <div className="text-lg text-blue-600">
                      {formatCurrency(batch.totalCredit)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Variance</div>
                    <div className={`text-lg ${isBalanced ? 'text-green-600' : 'text-amber-600'}`}>
                      {formatCurrency(variance)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Batch Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Entries</span>
                  <span className="font-semibold">{summary?.entryCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Accounts Affected</span>
                  <span className="font-semibold">{summary?.accountsAffected || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Suspense Entries</span>
                  <span className="font-semibold">{summary?.suspenseCount || 0}</span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="text-muted-foreground">Balance</span>
                  <span className={`font-semibold ${isBalanced ? 'text-green-600' : 'text-amber-600'}`}>
                    {formatCurrency(summary?.balance || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>By Account Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Asset Accounts</span>
                  <span className="font-semibold">
                    {formatCurrency(summary?.byAccountType.asset || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Liability Accounts</span>
                  <span className="font-semibold">
                    {formatCurrency(summary?.byAccountType.liability || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Equity Accounts</span>
                  <span className="font-semibold">
                    {formatCurrency(summary?.byAccountType.equity || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Revenue Accounts</span>
                  <span className="font-semibold">
                    {formatCurrency(summary?.byAccountType.revenue || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expense Accounts</span>
                  <span className="font-semibold">
                    {formatCurrency(summary?.byAccountType.expense || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Batch Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Hash className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Batch Number</div>
                    <div className="font-semibold">{batch.batchNumber}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Company Code</div>
                    <div className="font-semibold">{batch.companyCode}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Fiscal Period</div>
                    <div className="font-semibold">
                      {batch.fiscalYear} - Period {batch.fiscalPeriod}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Period Range</div>
                    <div className="font-semibold">
                      {formatDate(batch.periodStart)} - {formatDate(batch.periodEnd)}
                    </div>
                  </div>
                </div>
                {batch.externalReference && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground">External Reference</div>
                      <div className="font-semibold">{batch.externalReference}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tracking Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Created By</div>
                    <div className="font-semibold">{batch.createdBy}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(batch.createdAt)}</div>
                  </div>
                </div>
                {batch.approvedBy && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground">Approved By</div>
                      <div className="font-semibold">{batch.approvedBy}</div>
                      <div className="text-xs text-muted-foreground">
                        {batch.approvedAt && formatDate(batch.approvedAt)}
                      </div>
                    </div>
                  </div>
                )}
                {batch.postedBy && (
                  <div className="flex items-start gap-3">
                    <Send className="h-4 w-4 text-blue-500 mt-1" />
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground">Posted By</div>
                      <div className="font-semibold">{batch.postedBy}</div>
                      <div className="text-xs text-muted-foreground">
                        {batch.postedAt && formatDate(batch.postedAt)}
                      </div>
                    </div>
                  </div>
                )}
                {batch.rejectedBy && (
                  <div className="flex items-start gap-3">
                    <XCircle className="h-4 w-4 text-red-500 mt-1" />
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground">Rejected By</div>
                      <div className="font-semibold">{batch.rejectedBy}</div>
                      <div className="text-xs text-muted-foreground">
                        {batch.rejectedAt && formatDate(batch.rejectedAt)}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {batch.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{batch.notes}</p>
              </CardContent>
            </Card>
          )}

          {batch.rejectionReason && (
            <Card className="border-red-300 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-900">Rejection Reason</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700">{batch.rejectionReason}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Journal Batch</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this batch. This information will be visible to
              the creator.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => rejectMutation.mutate(rejectionReason)}
              disabled={!rejectionReason.trim() || rejectMutation.isPending}
            >
              Reject Batch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
