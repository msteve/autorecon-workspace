import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Check, X, AlertCircle } from 'lucide-react';
import { Transaction } from '@/services/matchingService';

interface ComparisonViewProps {
  transactions: Transaction[];
  highlightDifferences?: boolean;
  showVariance?: boolean;
}

/**
 * ComparisonView Component
 * 
 * Side-by-side comparison of transactions from different sources (SourceA vs SourceB vs SourceC).
 * Highlights differences and shows variance.
 * 
 * @example
 * ```tsx
 * <ComparisonView
 *   transactions={[txnA, txnB, txnC]}
 *   highlightDifferences
 *   showVariance
 * />
 * ```
 */
export const ComparisonView: React.FC<ComparisonViewProps> = ({
  transactions,
  highlightDifferences = true,
  showVariance = true
}) => {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No transactions to compare
        </CardContent>
      </Card>
    );
  }

  // Calculate field-level matches
  const checkFieldMatch = (field: keyof Transaction): boolean => {
    const values = transactions.map(t => t[field]);
    return values.every(v => v === values[0]);
  };

  const checkAmountMatch = (tolerance: number = 0.01): boolean => {
    const amounts = transactions.map(t => t.amount);
    const max = Math.max(...amounts);
    const min = Math.min(...amounts);
    return (max - min) <= tolerance;
  };

  // Calculate variance
  const amounts = transactions.map(t => t.amount);
  const avgAmount = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
  const variance = Math.max(...amounts.map(a => Math.abs(a - avgAmount)));
  const variancePercentage = (variance / avgAmount) * 100;

  // Get source color
  const getSourceColor = (source: string): string => {
    const colors: Record<string, string> = {
      source_a: 'bg-blue-100 text-blue-800 border-blue-300',
      source_b: 'bg-green-100 text-green-800 border-green-300',
      source_c: 'bg-purple-100 text-purple-800 border-purple-300',
      bank: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      erp: 'bg-pink-100 text-pink-800 border-pink-300',
      payment_gateway: 'bg-orange-100 text-orange-800 border-orange-300'
    };
    return colors[source] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Render field row
  const renderFieldRow = (
    label: string,
    field: keyof Transaction,
    format?: (value: any) => string
  ) => {
    const isMatch = checkFieldMatch(field);
    const values = transactions.map(t => t[field]);

    return (
      <div className="grid grid-cols-12 gap-4 py-3 border-b last:border-b-0">
        <div className="col-span-3 text-sm font-medium text-muted-foreground flex items-center gap-2">
          {label}
          {highlightDifferences && (
            isMatch ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <X className="h-4 w-4 text-red-600" />
            )
          )}
        </div>
        {values.map((value, index) => (
          <div 
            key={index} 
            className={`col-span-${Math.floor(9 / transactions.length)} text-sm ${
              highlightDifferences && !isMatch && value !== values[0]
                ? 'text-red-600 font-semibold'
                : ''
            }`}
          >
            {format ? format(value) : String(value)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Source Comparison
              {transactions.length > 2 && (
                <Badge variant="secondary">{transactions.length}-Way</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Side-by-side comparison of transaction details
            </CardDescription>
          </div>
          {showVariance && variance > 0 && (
            <div className="text-right">
              <div className="text-sm font-medium">Variance</div>
              <div className={`text-lg font-bold ${
                variancePercentage < 1 ? 'text-green-600' :
                variancePercentage < 5 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                ${variance.toFixed(2)} ({variancePercentage.toFixed(2)}%)
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Source headers */}
        <div className="grid grid-cols-12 gap-4 mb-4 pb-3 border-b-2">
          <div className="col-span-3 text-sm font-semibold text-muted-foreground">
            Field
          </div>
          {transactions.map((txn, index) => (
            <div key={txn.id} className={`col-span-${Math.floor(9 / transactions.length)}`}>
              <Badge variant="outline" className={getSourceColor(txn.source)}>
                {txn.source.replace('_', ' ').toUpperCase()}
              </Badge>
              <div className="text-xs text-muted-foreground mt-1">
                {txn.transactionNumber}
              </div>
            </div>
          ))}
        </div>

        {/* Field comparisons */}
        <div className="space-y-0">
          {renderFieldRow('Date', 'date')}
          {renderFieldRow('Amount', 'amount', (val) => `$${Number(val).toFixed(2)}`)}
          {renderFieldRow('Currency', 'currency')}
          {renderFieldRow('Description', 'description')}
          {renderFieldRow('Reference', 'reference')}
          {renderFieldRow('Partner', 'partnerName')}
          {renderFieldRow('Account', 'accountNumber')}
        </div>

        {/* Variance summary */}
        {showVariance && transactions.length > 1 && (
          <>
            <Separator className="my-4" />
            <div className="bg-muted rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Average Amount</div>
                  <div className="font-semibold text-lg">${avgAmount.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Max Difference</div>
                  <div className="font-semibold text-lg">${variance.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Status</div>
                  <div className="flex items-center gap-2 mt-1">
                    {checkAmountMatch() ? (
                      <>
                        <Check className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-600">Within Tolerance</span>
                      </>
                    ) : variancePercentage < 5 ? (
                      <>
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <span className="font-semibold text-yellow-600">Minor Variance</span>
                      </>
                    ) : (
                      <>
                        <X className="h-5 w-5 text-red-600" />
                        <span className="font-semibold text-red-600">High Variance</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Visual flow indicator for 2-way matches */}
        {transactions.length === 2 && (
          <div className="mt-6 flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <Badge variant="outline" className={getSourceColor(transactions[0].source)}>
                {transactions[0].source.replace('_', ' ').toUpperCase()}
              </Badge>
              <div className="text-2xl font-bold mt-2">
                ${transactions[0].amount.toFixed(2)}
              </div>
            </div>
            <ArrowRight className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <Badge variant="outline" className={getSourceColor(transactions[1].source)}>
                {transactions[1].source.replace('_', ' ').toUpperCase()}
              </Badge>
              <div className="text-2xl font-bold mt-2">
                ${transactions[1].amount.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Triangle visualization for 3-way matches */}
        {transactions.length === 3 && (
          <div className="mt-6 p-6 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center">
              <div className="relative" style={{ width: '300px', height: '260px' }}>
                {/* Top */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center">
                  <Badge variant="outline" className={getSourceColor(transactions[0].source)}>
                    {transactions[0].source.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <div className="text-xl font-bold mt-1">
                    ${transactions[0].amount.toFixed(2)}
                  </div>
                </div>
                {/* Bottom Left */}
                <div className="absolute bottom-0 left-0 text-center">
                  <Badge variant="outline" className={getSourceColor(transactions[1].source)}>
                    {transactions[1].source.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <div className="text-xl font-bold mt-1">
                    ${transactions[1].amount.toFixed(2)}
                  </div>
                </div>
                {/* Bottom Right */}
                <div className="absolute bottom-0 right-0 text-center">
                  <Badge variant="outline" className={getSourceColor(transactions[2].source)}>
                    {transactions[2].source.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <div className="text-xl font-bold mt-1">
                    ${transactions[2].amount.toFixed(2)}
                  </div>
                </div>
                {/* Connecting lines */}
                <svg className="absolute inset-0" style={{ width: '100%', height: '100%' }}>
                  <line x1="50%" y1="20" x2="10%" y2="90%" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" strokeDasharray="4" />
                  <line x1="50%" y1="20" x2="90%" y2="90%" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" strokeDasharray="4" />
                  <line x1="10%" y1="90%" x2="90%" y2="90%" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" strokeDasharray="4" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
