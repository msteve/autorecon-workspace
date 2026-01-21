import { Badge } from '../ui/badge';
import type { JournalBatch } from '../../types';

interface BatchStatusBadgeProps {
  status: JournalBatch['status'];
}

export function BatchStatusBadge({ status }: BatchStatusBadgeProps) {
  const variants: Record<JournalBatch['status'], { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700 border-slate-300' },
    pending_approval: { label: 'Pending Approval', className: 'bg-amber-100 text-amber-700 border-amber-300' },
    approved: { label: 'Approved', className: 'bg-blue-100 text-blue-700 border-blue-300' },
    posted: { label: 'Posted', className: 'bg-green-100 text-green-700 border-green-300' },
    rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 border-red-300' },
    failed: { label: 'Failed', className: 'bg-rose-100 text-rose-700 border-rose-300' },
  };

  const variant = variants[status];

  return (
    <Badge variant="outline" className={variant.className}>
      {variant.label}
    </Badge>
  );
}
