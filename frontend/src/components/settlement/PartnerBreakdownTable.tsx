import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SettlementStatusBadge } from './SettlementStatusBadge';
import type { PartnerSettlement } from '@/types';

interface PartnerBreakdownTableProps {
  breakdown: PartnerSettlement[];
  onPartnerClick?: (partner: PartnerSettlement) => void;
}

export function PartnerBreakdownTable({ breakdown, onPartnerClick }: PartnerBreakdownTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Partner
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transactions
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gross Amount
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fees
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Adjustments
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Net Amount
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {breakdown.map((partner) => (
              <tr
                key={partner.id}
                onClick={() => onPartnerClick?.(partner)}
                className={onPartnerClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {partner.partner.name}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span>{partner.partner.code}</span>
                        <Badge variant="outline" className="text-xs">
                          {partner.partner.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                  {partner.transaction_count.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                  {formatCurrency(partner.gross_amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600">
                  -{formatCurrency(partner.fees)}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-right text-sm ${
                  partner.adjustments >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {partner.adjustments >= 0 ? '+' : ''}{formatCurrency(partner.adjustments)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                  {formatCurrency(partner.net_amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <SettlementStatusBadge status={partner.status} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t border-gray-200">
            <tr className="font-semibold">
              <td className="px-6 py-4 text-sm text-gray-900">
                Total ({breakdown.length} partners)
              </td>
              <td className="px-6 py-4 text-right text-sm text-gray-900">
                {breakdown.reduce((sum, p) => sum + p.transaction_count, 0).toLocaleString()}
              </td>
              <td className="px-6 py-4 text-right text-sm text-gray-900">
                {formatCurrency(breakdown.reduce((sum, p) => sum + p.gross_amount, 0))}
              </td>
              <td className="px-6 py-4 text-right text-sm text-red-600">
                -{formatCurrency(breakdown.reduce((sum, p) => sum + p.fees, 0))}
              </td>
              <td className={`px-6 py-4 text-right text-sm ${
                breakdown.reduce((sum, p) => sum + p.adjustments, 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {breakdown.reduce((sum, p) => sum + p.adjustments, 0) >= 0 ? '+' : ''}
                {formatCurrency(breakdown.reduce((sum, p) => sum + p.adjustments, 0))}
              </td>
              <td className="px-6 py-4 text-right text-sm text-gray-900">
                {formatCurrency(breakdown.reduce((sum, p) => sum + p.net_amount, 0))}
              </td>
              <td className="px-6 py-4"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
}
