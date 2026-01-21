import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { ApprovalRequest } from '@/types';

interface ApprovalDecisionBarProps {
  approval: ApprovalRequest;
  onApprove: (comment?: string) => Promise<void>;
  onReject: (comment: string) => Promise<void>;
  disabled?: boolean;
}

export function ApprovalDecisionBar({
  approval,
  onApprove,
  onReject,
  disabled = false
}: ApprovalDecisionBarProps) {
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const handleApprove = async () => {
    setAction('approve');
    setShowCommentBox(true);
  };

  const handleReject = () => {
    setAction('reject');
    setShowCommentBox(true);
  };

  const handleSubmit = async () => {
    if (action === 'reject' && !comment.trim()) {
      return;
    }

    setIsProcessing(true);
    try {
      if (action === 'approve') {
        await onApprove(comment.trim() || undefined);
      } else if (action === 'reject') {
        await onReject(comment.trim());
      }
    } finally {
      setIsProcessing(false);
      setShowCommentBox(false);
      setComment('');
      setAction(null);
    }
  };

  const handleCancel = () => {
    setShowCommentBox(false);
    setComment('');
    setAction(null);
  };

  // Show decision if already approved/rejected
  if (approval.status === 'approved' || approval.status === 'rejected') {
    return (
      <Card className="p-4 bg-gray-50">
        <div className="flex items-start gap-3">
          {approval.status === 'approved' ? (
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900">
                {approval.status === 'approved' ? 'Approved' : 'Rejected'}
              </span>
              <span className="text-sm text-gray-500">
                by {approval.approver?.name || 'Unknown'}
              </span>
              <span className="text-sm text-gray-400">
                on {new Date(approval.approved_at || approval.rejected_at || '').toLocaleDateString()}
              </span>
            </div>
            {approval.decision_comment && (
              <p className="text-sm text-gray-600 mt-1">{approval.decision_comment}</p>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Show decision bar for pending approvals
  if (approval.status !== 'pending') {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Risk Assessment Alert */}
      {approval.metadata.risk_score && approval.metadata.risk_score > 70 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            High risk score ({approval.metadata.risk_score}/100). Additional review recommended.
          </AlertDescription>
        </Alert>
      )}

      {!showCommentBox ? (
        <Card className="p-4 bg-white border-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-gray-400" />
              <div>
                <h3 className="font-medium text-gray-900">Ready for Decision</h3>
                <p className="text-sm text-gray-500">
                  Review the request details and make your decision
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={disabled}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                disabled={disabled}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4 bg-white border-2 border-blue-200">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {action === 'approve' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <h3 className="font-medium text-gray-900">
                {action === 'approve' ? 'Approve Request' : 'Reject Request'}
              </h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {action === 'approve' ? 'Comment (optional)' : 'Rejection Reason (required)'}
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  action === 'approve'
                    ? 'Add a comment about your approval...'
                    : 'Please provide a reason for rejection...'
                }
                rows={3}
                className="resize-none"
              />
              {action === 'reject' && !comment.trim() && (
                <p className="text-sm text-red-600 mt-1">
                  A rejection reason is required
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isProcessing || (action === 'reject' && !comment.trim())}
                className={
                  action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }
              >
                {isProcessing ? (
                  <>
                    <span className="mr-2">Processing...</span>
                  </>
                ) : (
                  <>
                    {action === 'approve' ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Approval
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Confirm Rejection
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
