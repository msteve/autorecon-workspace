import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Target, Sparkles, GitMerge, Hand, Network } from 'lucide-react';
import { MatchType } from '@/services/matchingService';

interface MatchingBadgeProps {
  matchType: MatchType;
  confidence?: number;
  size?: 'sm' | 'md' | 'lg';
  showConfidence?: boolean;
  className?: string;
}

/**
 * MatchingBadge Component
 * 
 * Displays visual indicators for different match types (exact, fuzzy, partial, manual, n-way).
 * 
 * @example
 * ```tsx
 * <MatchingBadge matchType="exact" confidence={100} showConfidence />
 * <MatchingBadge matchType="fuzzy" confidence={85} size="lg" />
 * ```
 */
export const MatchingBadge: React.FC<MatchingBadgeProps> = ({
  matchType,
  confidence,
  size = 'md',
  showConfidence = false,
  className = ''
}) => {
  const matchConfig: Record<MatchType, {
    label: string;
    className: string;
    icon: React.ReactNode;
  }> = {
    exact: {
      label: 'Exact Match',
      className: 'bg-green-600 text-white border-green-600',
      icon: <Target className="h-3 w-3" />
    },
    fuzzy: {
      label: 'Fuzzy Match',
      className: 'bg-blue-500 text-white border-blue-500',
      icon: <Sparkles className="h-3 w-3" />
    },
    partial: {
      label: 'Partial Match',
      className: 'bg-yellow-500 text-white border-yellow-500',
      icon: <GitMerge className="h-3 w-3" />
    },
    manual: {
      label: 'Manual Match',
      className: 'bg-purple-600 text-white border-purple-600',
      icon: <Hand className="h-3 w-3" />
    },
    n_way: {
      label: 'N-Way Match',
      className: 'bg-orange-600 text-white border-orange-600',
      icon: <Network className="h-3 w-3" />
    }
  };

  const config = matchConfig[matchType];
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const getConfidenceColor = (conf: number): string => {
    if (conf >= 90) return 'text-green-200';
    if (conf >= 75) return 'text-yellow-200';
    return 'text-orange-200';
  };

  return (
    <Badge 
      variant="default"
      className={`${config.className} ${sizeClasses[size]} ${className} inline-flex items-center gap-1.5 font-medium`}
    >
      {config.icon}
      <span>{config.label}</span>
      {showConfidence && confidence !== undefined && (
        <span className={`ml-1 ${getConfidenceColor(confidence)}`}>
          ({confidence.toFixed(0)}%)
        </span>
      )}
    </Badge>
  );
};
