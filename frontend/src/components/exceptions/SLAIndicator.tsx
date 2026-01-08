import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SLAIndicatorProps {
  slaStatus: 'within_sla' | 'approaching' | 'breached';
  daysRemaining: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

/**
 * SLAIndicator Component
 * 
 * Displays SLA status with color-coded visual indicators and time remaining.
 * 
 * @example
 * ```tsx
 * <SLAIndicator 
 *   slaStatus="approaching" 
 *   daysRemaining={1} 
 *   showLabel 
 * />
 * ```
 */
export const SLAIndicator: React.FC<SLAIndicatorProps> = ({
  slaStatus,
  daysRemaining,
  size = 'md',
  showLabel = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1.5',
    lg: 'text-base px-3 py-2'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const configs = {
    within_sla: {
      label: 'On Track',
      className: 'bg-green-100 text-green-800 border-green-300',
      icon: CheckCircle2,
      description: `${daysRemaining} ${Math.abs(daysRemaining) === 1 ? 'day' : 'days'} remaining`
    },
    approaching: {
      label: 'Due Soon',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: Clock,
      description: `${daysRemaining} ${Math.abs(daysRemaining) === 1 ? 'day' : 'days'} remaining`
    },
    breached: {
      label: 'Overdue',
      className: 'bg-red-100 text-red-800 border-red-300',
      icon: AlertTriangle,
      description: `${Math.abs(daysRemaining)} ${Math.abs(daysRemaining) === 1 ? 'day' : 'days'} overdue`
    }
  };

  const config = configs[slaStatus];
  const Icon = config.icon;

  if (!showLabel) {
    return (
      <div className={cn('relative', className)}>
        <Icon className={cn(iconSizes[size], config.className.split(' ').find(c => c.startsWith('text-')))} />
      </div>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={cn(
        config.className,
        sizeClasses[size],
        'inline-flex items-center gap-1.5 font-medium',
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      <div className="flex flex-col items-start">
        <span className="font-semibold">{config.label}</span>
        <span className="text-xs opacity-90">{config.description}</span>
      </div>
    </Badge>
  );
};
