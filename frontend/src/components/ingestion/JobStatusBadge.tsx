import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Ban,
  type LucideIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface JobStatusBadgeProps {
  status: JobStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig: Record<JobStatus, {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  bgColor: string;
  textColor: string;
  icon: LucideIcon;
  iconClass: string;
}> = {
  pending: {
    label: 'Pending',
    variant: 'secondary',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    textColor: 'text-gray-700 dark:text-gray-300',
    icon: Clock,
    iconClass: 'text-gray-600 dark:text-gray-400',
  },
  processing: {
    label: 'Processing',
    variant: 'default',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
    textColor: 'text-blue-700 dark:text-blue-300',
    icon: Loader2,
    iconClass: 'text-blue-600 dark:text-blue-400 animate-spin',
  },
  completed: {
    label: 'Completed',
    variant: 'outline',
    bgColor: 'bg-green-100 dark:bg-green-950',
    textColor: 'text-green-700 dark:text-green-300',
    icon: CheckCircle2,
    iconClass: 'text-green-600 dark:text-green-400',
  },
  failed: {
    label: 'Failed',
    variant: 'destructive',
    bgColor: 'bg-red-100 dark:bg-red-950',
    textColor: 'text-red-700 dark:text-red-300',
    icon: XCircle,
    iconClass: 'text-red-600 dark:text-red-400',
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'outline',
    bgColor: 'bg-orange-100 dark:bg-orange-950',
    textColor: 'text-orange-700 dark:text-orange-300',
    icon: Ban,
    iconClass: 'text-orange-600 dark:text-orange-400',
  },
};

export const JobStatusBadge = ({ 
  status, 
  showIcon = true,
  size = 'md',
  className 
}: JobStatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium',
        config.bgColor,
        config.textColor,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={cn(iconSizes[size], config.iconClass)} />}
      {config.label}
    </Badge>
  );
};
