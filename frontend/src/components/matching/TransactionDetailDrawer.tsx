import React, { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X, 
  Calendar, 
  DollarSign, 
  FileText, 
  Building2, 
  CreditCard, 
  AlertCircle,
  CheckCircle2,
  Link2,
  Unlink,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { Transaction, PotentialMatch, matchingService } from '@/services/matchingService';
import { MatchingBadge } from './MatchingBadge';
import { format } from 'date-fns';

interface TransactionDetailDrawerProps {
  transaction: Transaction | null;
  open: boolean;
  onClose: () => void;
  onMatch?: (transactionIds: string[]) => void;
  onUnmatch?: (matchId: string) => void;
  onApprove?: (matchId: string) => void;
  onReject?: (matchId: string, reason: string) => void;
}

/**
 * TransactionDetailDrawer Component
 * 
 * Slide-out drawer showing comprehensive transaction details, match information,
 * potential matches, and available actions.
 * 
 * @example
 * ```tsx
 * <TransactionDetailDrawer
 *   transaction={selectedTransaction}
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onMatch={handleMatch}
 *   onUnmatch={handleUnmatch}
 * />
 * ```
 */
export const TransactionDetailDrawer: React.FC<TransactionDetailDrawerProps> = ({
  transaction,
  open,
  onClose,
  onMatch,
  onUnmatch,
  onApprove,
  onReject
}) => {
  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transaction && transaction.status === 'unmatched') {
      loadPotentialMatches();
    } else {
      setPotentialMatches(null);
    }
  }, [transaction?.id]);

  const loadPotentialMatches = async () => {
    if (!transaction) return;
    
    setLoading(true);
    try {
      const matches = await matchingService.getPotentialMatches(transaction.id);
      setPotentialMatches(matches);
    } catch (error) {
      console.error('Failed to load potential matches:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!transaction) {
    return null;
  }

  const getSourceColor = (source: string): string => {
    const colors: Record<string, string> = {
      source_a: 'bg-blue-100 text-blue-800',
      source_b: 'bg-green-100 text-green-800',
      source_c: 'bg-purple-100 text-purple-800',
      bank: 'bg-indigo-100 text-indigo-800',
      erp: 'bg-pink-100 text-pink-800',
      payment_gateway: 'bg-orange-100 text-orange-800'
    };
    return colors[source] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      matched: 'bg-green-100 text-green-800',
      unmatched: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      approved: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl">Transaction Details</SheetTitle>
              <SheetDescription>{transaction.transactionNumber}</SheetDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status and Source */}
          <div className="flex items-center gap-3">
            <Badge className={getSourceColor(transaction.source)}>
              {transaction.source.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge className={getStatusColor(transaction.status)}>
              {transaction.status.replace('_', ' ').toUpperCase()}
            </Badge>
            {transaction.matchType && (
              <MatchingBadge 
                matchType={transaction.matchType} 
                confidence={transaction.matchConfidence}
                showConfidence
              />
            )}
          </div>

          {/* Main Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transaction Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date
                  </div>
                  <div className="font-medium">{transaction.date}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Amount
                  </div>
                  <div className="font-medium text-lg">
                    ${transaction.amount.toFixed(2)} {transaction.currency}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Description
                  </div>
                  <div className="font-medium">{transaction.description}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Reference
                  </div>
                  <div className="font-mono text-sm">{transaction.reference}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Partner
                    </div>
                    <div className="font-medium">{transaction.partnerName}</div>
                    <div className="text-xs text-muted-foreground">ID: {transaction.partnerId}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Account
                    </div>
                    <div className="font-mono text-sm">{transaction.accountNumber}</div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="text-xs text-muted-foreground space-y-1">
                <div>Created: {format(new Date(transaction.createdAt), 'PPpp')}</div>
                <div>Updated: {format(new Date(transaction.updatedAt), 'PPpp')}</div>
              </div>
            </CardContent>
          </Card>

          {/* Match Information (if matched) */}
          {transaction.matchId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  Match Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Match ID</div>
                    <div className="font-mono text-sm">{transaction.matchId}</div>
                  </div>
                  {transaction.matchConfidence && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Confidence</div>
                      <div className="font-semibold text-lg">
                        {transaction.matchConfidence.toFixed(0)}%
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {onUnmatch && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onUnmatch(transaction.matchId!)}
                    >
                      <Unlink className="h-4 w-4 mr-2" />
                      Unmatch
                    </Button>
                  )}
                  {onApprove && transaction.status === 'matched' && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => onApprove(transaction.matchId!)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  )}
                  {onReject && transaction.status === 'matched' && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => onReject(transaction.matchId!, 'User rejection')}
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Potential Matches (if unmatched) */}
          {transaction.status === 'unmatched' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Potential Matches</CardTitle>
                <CardDescription>
                  AI-suggested transactions that may match
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : potentialMatches && potentialMatches.candidateTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {potentialMatches.candidateTransactions.slice(0, 5).map((candidate) => (
                      <div key={candidate.transaction.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{candidate.transaction.description}</div>
                            <div className="text-sm text-muted-foreground">
                              {candidate.transaction.transactionNumber}
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {candidate.confidence.toFixed(0)}% Match
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Amount:</span>{' '}
                            ${candidate.transaction.amount.toFixed(2)}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Date:</span>{' '}
                            {candidate.transaction.date}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {candidate.matchReasons.map((reason, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {reason}
                            </Badge>
                          ))}
                        </div>

                        {onMatch && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => onMatch([transaction.id, candidate.transaction.id])}
                          >
                            Create Manual Match
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <div>No potential matches found</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
