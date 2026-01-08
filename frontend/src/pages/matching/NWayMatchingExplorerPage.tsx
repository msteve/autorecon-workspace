import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Network, 
  Play, 
  Settings, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp
} from 'lucide-react';
import { DataGrid, DataGridColumn } from '@/components/matching/DataGrid';
import { MatchingBadge } from '@/components/matching/MatchingBadge';
import { ComparisonView } from '@/components/matching/ComparisonView';
import { 
  matchingService, 
  NWayMatchConfig,
  MatchGroup,
  TransactionSource
} from '@/services/matchingService';

/**
 * NWayMatchingExplorerPage Component
 * 
 * Interface for configuring and running N-way matching across multiple sources.
 * Displays results with comparison views and statistics.
 */
export const NWayMatchingExplorerPage: React.FC = () => {
  const [config, setConfig] = useState<NWayMatchConfig>({
    sources: ['source_a', 'source_b', 'source_c'],
    keyFields: ['reference', 'amount', 'date'],
    amountTolerance: 0.01,
    dateTolerance: 0,
    minConfidence: 70
  });
  const [selectedMatch, setSelectedMatch] = useState<MatchGroup | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  // Mutation for running N-way matching
  const runMatchingMutation = useMutation({
    mutationFn: (cfg: NWayMatchConfig) => matchingService.runNWayMatching(cfg),
    onSuccess: () => {
      // Refetch existing matches to see new results
      refetch();
    }
  });

  // Fetch existing N-way matches
  const { data: existingMatches, refetch } = useQuery({
    queryKey: ['n-way-matches'],
    queryFn: async () => {
      const result = await matchingService.getMatchedTransactions(
        { matchType: 'n_way' },
        { page: 1, pageSize: 100 }
      );
      return result;
    }
  });

  const handleRunMatching = () => {
    runMatchingMutation.mutate(config);
  };

  const handleSourceToggle = (source: TransactionSource, enabled: boolean) => {
    const newSources = enabled
      ? [...config.sources, source]
      : config.sources.filter(s => s !== source);
    
    setConfig({ ...config, sources: newSources });
  };

  const handleKeyFieldToggle = (field: string, enabled: boolean) => {
    const newFields = enabled
      ? [...config.keyFields, field]
      : config.keyFields.filter(f => f !== field);
    
    setConfig({ ...config, keyFields: newFields });
  };

  const availableSources: TransactionSource[] = [
    'source_a',
    'source_b',
    'source_c',
    'bank',
    'erp',
    'payment_gateway'
  ];

  const availableKeyFields = [
    { value: 'reference', label: 'Reference Number' },
    { value: 'amount', label: 'Amount' },
    { value: 'date', label: 'Date' },
    { value: 'partnerId', label: 'Partner ID' },
    { value: 'accountNumber', label: 'Account Number' }
  ];

  const columns: DataGridColumn<MatchGroup>[] = [
    {
      key: 'matchNumber',
      header: 'Match #',
      render: (row) => (
        <div className="font-mono text-sm">{row.matchNumber}</div>
      )
    },
    {
      key: 'sources',
      header: 'Sources',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.transactions.map((txn) => (
            <Badge key={txn.id} variant="outline" className="text-xs">
              {txn.source.replace('_', ' ').toUpperCase()}
            </Badge>
          ))}
        </div>
      )
    },
    {
      key: 'matchConfidence',
      header: 'Confidence',
      sortable: true,
      render: (row) => (
        <div className={`font-semibold ${
          row.matchConfidence >= 90 ? 'text-green-600' :
          row.matchConfidence >= 75 ? 'text-yellow-600' :
          'text-orange-600'
        }`}>
          {row.matchConfidence.toFixed(0)}%
        </div>
      )
    },
    {
      key: 'totalAmount',
      header: 'Amount',
      render: (row) => (
        <div className="font-semibold">
          ${row.totalAmount.toFixed(2)}
        </div>
      )
    },
    {
      key: 'variance',
      header: 'Variance',
      render: (row) => (
        <div className="space-y-1">
          <div className={`font-semibold ${
            row.variance === 0 ? 'text-green-600' :
            row.variancePercentage < 1 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            ${Math.abs(row.variance).toFixed(2)}
          </div>
          {row.variance !== 0 && (
            <div className="text-xs text-muted-foreground">
              ({row.variancePercentage.toFixed(2)}%)
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedMatch(row);
            setShowComparison(true);
          }}
        >
          View Comparison
        </Button>
      )
    }
  ];

  const stats = runMatchingMutation.data;
  const nWayMatches = existingMatches?.data || [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Network className="h-8 w-8" />
          N-Way Matching Explorer
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure and run multi-source matching algorithms to reconcile transactions across 3+ systems
        </p>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Matching Configuration
          </CardTitle>
          <CardDescription>
            Configure the sources, key fields, and tolerance settings for N-way matching
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Source Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Data Sources</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableSources.map((source) => (
                <Card
                  key={source}
                  className={`cursor-pointer transition-colors ${
                    config.sources.includes(source)
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-muted-foreground/50'
                  }`}
                  onClick={() => handleSourceToggle(source, !config.sources.includes(source))}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      config.sources.includes(source)
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}>
                      {config.sources.includes(source) && (
                        <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <span className="font-medium text-sm">
                      {source.replace('_', ' ').toUpperCase()}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
            {config.sources.length < 3 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Minimum Sources Required</AlertTitle>
                <AlertDescription>
                  N-way matching requires at least 3 data sources. Please select more sources.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Separator />

          {/* Key Fields */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Matching Key Fields</Label>
            <p className="text-sm text-muted-foreground">
              Select which fields should be used to identify matching transactions
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableKeyFields.map((field) => (
                <Card
                  key={field.value}
                  className={`cursor-pointer transition-colors ${
                    config.keyFields.includes(field.value)
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-muted-foreground/50'
                  }`}
                  onClick={() => handleKeyFieldToggle(field.value, !config.keyFields.includes(field.value))}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      config.keyFields.includes(field.value)
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}>
                      {config.keyFields.includes(field.value) && (
                        <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <span className="font-medium text-sm">{field.label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Tolerance Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount-tolerance">Amount Tolerance ($)</Label>
              <Input
                id="amount-tolerance"
                type="number"
                step="0.01"
                min="0"
                value={config.amountTolerance}
                onChange={(e) => setConfig({ ...config, amountTolerance: parseFloat(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">
                Maximum amount difference allowed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-tolerance">Date Tolerance (days)</Label>
              <Input
                id="date-tolerance"
                type="number"
                min="0"
                value={config.dateTolerance}
                onChange={(e) => setConfig({ ...config, dateTolerance: parseInt(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">
                Maximum date difference allowed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-confidence">Minimum Confidence (%)</Label>
              <Input
                id="min-confidence"
                type="number"
                min="0"
                max="100"
                value={config.minConfidence}
                onChange={(e) => setConfig({ ...config, minConfidence: parseInt(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">
                Minimum match confidence score
              </p>
            </div>
          </div>

          <Separator />

          {/* Run Button */}
          <div className="flex gap-4">
            <Button
              size="lg"
              onClick={handleRunMatching}
              disabled={runMatchingMutation.isPending || config.sources.length < 3}
              className="flex-1"
            >
              {runMatchingMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Running Matching Algorithm...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Run N-Way Matching
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {stats && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="h-5 w-5" />
              Matching Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Matches Found</div>
                <div className="text-2xl font-bold text-green-800">{stats.newMatches}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Transactions Matched</div>
                <div className="text-2xl font-bold text-green-800">{stats.transactionsMatched}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Processing Time</div>
                <div className="text-2xl font-bold text-green-800">{stats.processingTimeMs}ms</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
                <div className="text-2xl font-bold text-green-800 flex items-center gap-2">
                  {stats.successRate.toFixed(1)}%
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing N-Way Matches */}
      <Card>
        <CardHeader>
          <CardTitle>Existing N-Way Matches</CardTitle>
          <CardDescription>
            Showing {nWayMatches.length} N-way matches found across {config.sources.length} sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          {nWayMatches.length > 0 ? (
            <DataGrid
              columns={columns}
              data={nWayMatches}
              keyExtractor={(row) => row.id}
              currentPage={1}
              pageSize={20}
              totalItems={nWayMatches.length}
              onPageChange={() => {}}
              onPageSizeChange={() => {}}
              emptyMessage="No N-way matches found"
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No N-Way Matches Yet</p>
              <p className="text-sm mt-1">
                Configure the settings above and click "Run N-Way Matching" to find multi-source matches
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison View Dialog */}
      {selectedMatch && showComparison && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">N-Way Match Comparison</h2>
                  <p className="text-muted-foreground mt-1">
                    {selectedMatch.matchNumber} • {selectedMatch.transactions.length} Sources
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowComparison(false)}>
                  <AlertCircle className="h-5 w-5" />
                </Button>
              </div>
              <ComparisonView 
                transactions={selectedMatch.transactions} 
                highlightDifferences
                showVariance
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
