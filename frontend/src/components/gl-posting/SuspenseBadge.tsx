import { Badge } from '../ui/badge';

interface SuspenseBadgeProps {
  isSuspense: boolean;
  reason?: string;
}

export function SuspenseBadge({ isSuspense, reason }: SuspenseBadgeProps) {
  if (!isSuspense) return null;

  return (
    <Badge 
      variant="outline" 
      className="bg-amber-50 text-amber-700 border-amber-300"
      title={reason}
    >
      Suspense
    </Badge>
  );
}
