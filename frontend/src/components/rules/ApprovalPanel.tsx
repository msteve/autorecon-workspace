import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Send, 
  Clock,
  User,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Rule, ApprovalStatus } from '@/services/ruleEngineService';
import { formatDistanceToNow } from 'date-fns';

interface ApprovalPanelProps {
  rule: Rule;
  onApprove: (comments?: string) => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  onSubmitForApproval: (comments?: string) => Promise<void>;
  currentUser?: string;
  readOnly?: boolean;
}

/**
 * ApprovalPanel Component
 * 
 * Maker-checker approval workflow UI for rules.
 * Supports submitting for approval, approving, and rejecting.
 * 
 * @example
 * ```tsx
 * <ApprovalPanel
 *   rule={currentRule}
 *   onApprove={handleApprove}
 *   onReject={handleReject}
 *   onSubmitForApproval={handleSubmit}
 *   currentUser="john.doe"
 * />
 * ```
 */
export const ApprovalPanel: React.FC<ApprovalPanelProps> = ({
  rule,
  onApprove,
  onReject,
  onSubmitForApproval,
  currentUser = 'current.user',
  readOnly = false
}) => {
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmitForApproval = rule.status === 'draft' && rule.createdBy === currentUser;
  const canApprove = rule.status === 'pending_approval' && rule.createdBy !== currentUser;
  const canReject = rule.status === 'pending_approval' && rule.createdBy !== currentUser;

  const handleSubmitForApproval = async () => {
    setIsSubmitting(true);
    try {
      await onSubmitForApproval(comments);
      setComments('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove(comments);
      setComments('');
      setShowApproveDialog(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onReject(rejectionReason);
      setRejectionReason('');
      setShowRejectDialog(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusInfo = () => {
    switch (rule.status) {
      case 'draft':
        return {
          icon: <MessageSquare className="h-5 w-5 text-gray-600" />,
          title: 'Draft Status',
          description: 'This rule is in draft status and needs to be submitted for approval.',
          color: 'bg-gray-50 border-gray-200'
        };
      case 'pending_approval':
        return {
          icon: <Clock className="h-5 w-5 text-yellow-600" />,
          title: 'Pending Approval',
          description: 'This rule is waiting for approval from an authorized reviewer.',
          color: 'bg-yellow-50 border-yellow-200'
        };
      case 'approved':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          title: 'Approved',
          description: 'This rule has been approved and can be activated.',
          color: 'bg-green-50 border-green-200'
        };
      case 'rejected':
        return {
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          title: 'Rejected',
          description: 'This rule was rejected and needs to be revised.',
          color: 'bg-red-50 border-red-200'
        };
      case 'active':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          title: 'Active',
          description: 'This rule is currently active and being applied.',
          color: 'bg-green-50 border-green-200'
        };
      case 'inactive':
        return {
          icon: <AlertCircle className="h-5 w-5 text-gray-600" />,
          title: 'Inactive',
          description: 'This rule has been deactivated.',
          color: 'bg-gray-50 border-gray-200'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {statusInfo.icon}
            Approval Status
          </CardTitle>
          <CardDescription>
            Maker-checker workflow for rule approval
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Status overview */}
          <div className={`p-4 border rounded-lg ${statusInfo.color}`}>
            <div className="flex items-start gap-3">
              {statusInfo.icon}
              <div className="flex-1">
                <p className="font-semibold text-sm">{statusInfo.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {statusInfo.description}
                </p>
              </div>
            </div>
          </div>

          {/* Approval history */}
          {(rule.approvedBy || rule.rejectedBy) && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Approval History</Label>
              
              {rule.approvedBy && rule.approvedAt && (
                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-green-900">
                      Approved by {rule.approvedBy}
                    </p>
                    <p className="text-green-700 text-xs mt-1">
                      {formatDistanceToNow(new Date(rule.approvedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )}

              {rule.rejectedBy && rule.rejectedAt && (
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-red-900">
                      Rejected by {rule.rejectedBy}
                    </p>
                    <p className="text-red-700 text-xs mt-1">
                      {formatDistanceToNow(new Date(rule.rejectedAt), { addSuffix: true })}
                    </p>
                    {rule.rejectionReason && (
                      <div className="mt-2 p-2 bg-white rounded text-xs">
                        <span className="font-medium">Reason: </span>
                        {rule.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {!readOnly && (
            <div className="space-y-4 pt-4 border-t">
              {/* Submit for approval */}
              {canSubmitForApproval && (
                <div className="space-y-3">
                  <Label htmlFor="approval-comments">
                    Comments (Optional)
                  </Label>
                  <Textarea
                    id="approval-comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add any notes for the reviewer..."
                    rows={3}
                  />
                  <Button
                    onClick={handleSubmitForApproval}
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit for Approval
                  </Button>
                </div>
              )}

              {/* Approve/Reject actions */}
              {(canApprove || canReject) && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-medium text-blue-900">
                          You are authorized to review this rule
                        </p>
                        <p className="text-blue-700 mt-1">
                          Created by {rule.createdBy}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => setShowApproveDialog(true)}
                      variant="default"
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => setShowRejectDialog(true)}
                      variant="destructive"
                      disabled={isSubmitting}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              )}

              {/* No actions available */}
              {!canSubmitForApproval && !canApprove && !canReject && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No approval actions available for current status
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve confirmation dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this rule? Once approved, it can be activated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="approve-comments">Comments (Optional)</Label>
            <Textarea
              id="approve-comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add approval comments..."
              rows={3}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Approving...' : 'Approve'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject confirmation dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this rule. The creator will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="rejection-reason">Rejection Reason *</Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this rule is being rejected..."
              rows={4}
              className="mt-2"
              required
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isSubmitting || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Rejecting...' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
