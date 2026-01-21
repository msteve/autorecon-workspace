import { Badge } from '@/components/ui/badge';
import type { SettlementRun, PartnerSettlement } from '@/types';

interface SettlementStatusBadgeProps {
  status: SettlementRun['status'] | PartnerSettlement['status'];
  className?: string;
}

export function SettlementStatusBadge({ status, className = '' }: SettlementStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800 border-gray-300' },
      calculating: { label: 'Calculating', className: 'bg-blue-100 text-blue-800 border-blue-300' },
      pending_review: { label: 'Pending Review', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      pending_approval: { label: 'Pending Approval', className: 'bg-orange-100 text-orange-800 border-orange-300' },
      approved: { label: 'Approved', className: 'bg-green-100 text-green-800 border-green-300' },
      processing: { label: 'Processing', className: 'bg-purple-100 text-purple-800 border-purple-300' },
      completed: { label: 'Completed', className: 'bg-green-100 text-green-800 border-green-300' },
      failed: { label: 'Failed', className: 'bg-red-100 text-red-800 border-red-300' },
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      paid: { label: 'Paid', className: 'bg-green-100 text-green-800 border-green-300' },
    };
    return configs[status] || { label: status, className: 'bg-gray-100 text-gray-800 border-gray-300' };
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant="outline" className={`${config.className} ${className}`}>
      {config.label}
    </Badge>
  );
}
