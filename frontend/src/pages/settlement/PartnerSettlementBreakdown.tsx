import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  Calendar,
  CreditCard,
  Download,
  Building2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettlementStatusBadge } from '@/components/settlement';
import { settlementService } from '@/services/settlementService';

export default function PartnerSettlementBreakdown() {
  const { id, partnerId } = useParams<{ id: string; partnerId: string }>();
  const navigate = useNavigate();

  // Fetch settlement run
  const { data: settlementRun } = useQuery({
    queryKey: ['settlement-run', id],
    queryFn: () => settlementService.getSettlementRunById(id!),
    enabled: !!id,
    staleTime: 10000
  });

  // Fetch partner settlement details
  const { data: partnerSettlement, isLoading } = useQuery({
    queryKey: ['partner-settlement', id, partnerId],
    queryFn: () => settlementService.getPartnerSettlement(id!, partnerId!),
    enabled: !!id && !!partnerId,
    staleTime: 10000
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
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Card className="p-12">
          <div className="text-center text-gray-500">Loading partner settlement details...</div>
        </Card>
      </div>
    );
  }

  if (!partnerSettlement || !settlementRun) {
    return (
      <div className="p-6">
        <Card className="p-12">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Partner settlement not found</p>
            <Button onClick={() => navigate(`/settlement/${id}`)} className="mt-4">
              Back to Settlement Summary
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Group transactions by type
  const transactionsByType = partnerSettlement.transactions.reduce((acc, txn) => {
    if (!acc[txn.transaction_type]) {
      acc[txn.transaction_type] = [];
    }
    acc[txn.transaction_type].push(txn);
    return acc;
  }, {} as Record<string, typeof partnerSettlement.transactions>);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(`/settlement/${id}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {partnerSettlement.partner.name}
              </h1>
              <Badge variant="outline" className="capitalize">
                {partnerSettlement.partner.type.replace('_', ' ')}
              </Badge>
              <SettlementStatusBadge status={partnerSettlement.status} />
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {settlementRun.run_number}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(settlementRun.period_start)} - {formatDate(settlementRun.period_end)}
              </span>
            </div>
          </div>
        </div>

        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Details
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Settlement</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(partnerSettlement.net_amount)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gross Amount</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(partnerSettlement.gross_amount)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fees</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {formatCurrency(partnerSettlement.fees)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {partnerSettlement.transaction_count.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Partner Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Partner Information
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <label className="text-sm text-gray-600">Partner Code</label>
            <p className="font-medium text-gray-900 mt-1">{partnerSettlement.partner.code}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Partner Type</label>
            <p className="font-medium text-gray-900 mt-1 capitalize">
              {partnerSettlement.partner.type.replace('_', ' ')}
            </p>
          </div>
          {partnerSettlement.partner.bank_account && (
            <div>
              <label className="text-sm text-gray-600">Bank Account</label>
              <p className="font-medium text-gray-900 mt-1">{partnerSettlement.partner.bank_account}</p>
            </div>
          )}
          {partnerSettlement.payment_details && (
            <div>
              <label className="text-sm text-gray-600">Payment Method</label>
              <p className="font-medium text-gray-900 mt-1 capitalize">
                {partnerSettlement.payment_details.method.replace('_', ' ')}
              </p>
            </div>
          )}
        </div>

        {partnerSettlement.payment_details?.paid_at && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-green-600" />
              <span className="text-gray-600">Paid on</span>
              <span className="font-medium text-gray-900">
                {formatDateTime(partnerSettlement.payment_details.paid_at)}
              </span>
              {partnerSettlement.payment_details.reference && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">Ref:</span>
                  <span className="font-mono text-sm text-gray-900">
                    {partnerSettlement.payment_details.reference}
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Settlement Calculation */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Settlement Calculation</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Gross Transaction Amount</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(partnerSettlement.gross_amount)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-t">
            <span className="text-gray-600">Processing Fees</span>
            <span className="font-medium text-red-600">
              -{formatCurrency(partnerSettlement.fees)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-t">
            <span className="text-gray-600">Adjustments</span>
            <span className={`font-medium ${
              partnerSettlement.adjustments >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {partnerSettlement.adjustments >= 0 ? '+' : ''}
              {formatCurrency(partnerSettlement.adjustments)}
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-t-2 border-gray-300">
            <span className="text-lg font-semibold text-gray-900">Net Settlement Amount</span>
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(partnerSettlement.net_amount)}
            </span>
          </div>
        </div>
      </Card>

      {/* Transactions */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            All Transactions ({partnerSettlement.transactions.length})
          </TabsTrigger>
          {Object.keys(transactionsByType).map(type => (
            <TabsTrigger key={type} value={type} className="capitalize">
              {type} ({transactionsByType[type].length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Fee
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Net Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Reference
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {partnerSettlement.transactions.slice(0, 50).map((txn) => (
                    <tr key={txn.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {txn.transaction_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(txn.transaction_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline" className="capitalize">
                          {txn.transaction_type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        {formatCurrency(txn.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600">
                        -{formatCurrency(txn.fee)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(txn.net_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                        {txn.reference}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {partnerSettlement.transactions.length > 50 && (
              <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 text-center text-sm text-gray-600">
                Showing first 50 of {partnerSettlement.transactions.length} transactions
              </div>
            )}
          </Card>
        </TabsContent>

        {Object.entries(transactionsByType).map(([type, transactions]) => (
          <TabsContent key={type} value={type} className="mt-4">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Transaction ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Fee
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Net Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Reference
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {txn.transaction_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(txn.transaction_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                          {formatCurrency(txn.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600">
                          -{formatCurrency(txn.fee)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                          {formatCurrency(txn.net_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                          {txn.reference}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr className="font-semibold">
                      <td colSpan={2} className="px-6 py-4 text-sm text-gray-900">
                        Subtotal ({transactions.length} transactions)
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900">
                        {formatCurrency(transactions.reduce((sum, t) => sum + t.amount, 0))}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-red-600">
                        -{formatCurrency(transactions.reduce((sum, t) => sum + t.fee, 0))}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900">
                        {formatCurrency(transactions.reduce((sum, t) => sum + t.net_amount, 0))}
                      </td>
                      <td className="px-6 py-4"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
