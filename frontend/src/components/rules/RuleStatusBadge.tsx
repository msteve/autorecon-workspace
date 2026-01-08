import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, CheckCircle2, XCircle, AlertCircle, Ban } from 'lucide-react';
import { RuleStatus } from '@/services/ruleEngineService';

interface RuleStatusBadgeProps {
  status: RuleStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * RuleStatusBadge Component
 * 
 * Displays a visual status indicator for rules with appropriate colors and icons.
 * 
 * @example
 * ```tsx
 * <RuleStatusBadge status="active" size="md" />
 * <RuleStatusBadge status="pending_approval" />
 * ```
 */
export const RuleStatusBadge: React.FC<RuleStatusBadgeProps> = ({
  status,
  size = 'md',
  className = ''
}) => {
  const statusConfig: Record<RuleStatus, {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    className: string;
    icon: React.ReactNode;
  }> = {
    draft: {
      label: 'Draft',
      variant: 'secondary',
      className: 'bg-gray-100 text-gray-700 border-gray-300',
      icon: <FileText className="h-3 w-3" />
    },
    pending_approval: {
      label: 'Pending Approval',
      variant: 'outline',
      className: 'bg-yellow-50 text-yellow-700 border-yellow-300',
      icon: <Clock className="h-3 w-3" />
    },
    approved: {
      label: 'Approved',
      variant: 'outline',
      className: 'bg-green-50 text-green-700 border-green-300',
      icon: <CheckCircle2 className="h-3 w-3" />
    },
    active: {
      label: 'Active',
      variant: 'default',
      className: 'bg-green-600 text-white border-green-600',
      icon: <CheckCircle2 className="h-3 w-3" />
    },
    inactive: {
      label: 'Inactive',
      variant: 'secondary',
      className: 'bg-gray-200 text-gray-600 border-gray-400',
      icon: <Ban className="h-3 w-3" />
    },
    rejected: {
      label: 'Rejected',
      variant: 'destructive',
      className: 'bg-red-100 text-red-700 border-red-300',
      icon: <XCircle className="h-3 w-3" />
    }
  };

  const config = statusConfig[status];
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${sizeClasses[size]} ${className} inline-flex items-center gap-1.5 font-medium`}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
};
