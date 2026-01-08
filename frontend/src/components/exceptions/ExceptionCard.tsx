import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowUp, 
  MessageSquare,
  Paperclip,
  User,
  Calendar
} from 'lucide-react';
import { Exception, ExceptionStatus, ExceptionSeverity } from '@/services/exceptionsService';
import { SLAIndicator } from './SLAIndicator';
import { formatDistanceToNow } from 'date-fns';

interface ExceptionCardProps {
  exception: Exception;
  onClick?: () => void;
  onAssign?: (exceptionId: string) => void;
  showActions?: boolean;
  className?: string;
}

/**
 * ExceptionCard Component
 * 
 * Displays exception summary with status, severity, SLA indicator, and quick actions.
 * 
 * @example
 * ```tsx
 * <ExceptionCard
 *   exception={exception}
 *   onClick={() => navigate(`/exceptions/${exception.id}`)}
 *   onAssign={handleAssign}
 *   showActions
 * />
 * ```
 */
export const ExceptionCard: React.FC<ExceptionCardProps> = ({
  exception,
  onClick,
  onAssign,
  showActions = true,
  className = ''
}) => {
  const statusConfig: Record<ExceptionStatus, { 
    label: string; 
    className: string; 
    icon: React.ReactNode 
  }> = {
    open: {
      label: 'Open',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: <AlertCircle className="h-3 w-3" />
    },
    in_progress: {
      label: 'In Progress',
      className: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: <Clock className="h-3 w-3" />
    },
    resolved: {
      label: 'Resolved',
      className: 'bg-green-100 text-green-800 border-green-300',
      icon: <CheckCircle2 className="h-3 w-3" />
    },
    escalated: {
      label: 'Escalated',
      className: 'bg-orange-100 text-orange-800 border-orange-300',
      icon: <ArrowUp className="h-3 w-3" />
    },
    closed: {
      label: 'Closed',
      className: 'bg-gray-100 text-gray-800 border-gray-300',
      icon: <XCircle className="h-3 w-3" />
    }
  };

  const severityConfig: Record<ExceptionSeverity, { 
    label: string; 
    className: string 
  }> = {
    critical: {
      label: 'Critical',
      className: 'bg-red-600 text-white'
    },
    high: {
      label: 'High',
      className: 'bg-orange-600 text-white'
    },
    medium: {
      label: 'Medium',
      className: 'bg-yellow-600 text-white'
    },
    low: {
      label: 'Low',
      className: 'bg-blue-600 text-white'
    }
  };

  const status = statusConfig[exception.status];
  const severity = severityConfig[exception.severity];

  return (
    <Card 
      className={`${className} transition-all hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-sm text-muted-foreground">
                {exception.exceptionNumber}
              </span>
              <Badge variant="outline" className={severity.className}>
                {severity.label}
              </Badge>
              <Badge variant="outline" className={status.className}>
                {status.icon}
                <span className="ml-1">{status.label}</span>
              </Badge>
            </div>
            <h3 className="font-semibold text-lg truncate">{exception.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {exception.description}
            </p>
          </div>
          
          <SLAIndicator 
            slaStatus={exception.slaStatus}
            daysRemaining={exception.slaDaysRemaining}
            size="sm"
          />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Metadata */}
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDistanceToNow(new Date(exception.createdAt), { addSuffix: true })}</span>
            </div>
            
            {exception.assignedToName && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{exception.assignedToName}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{exception.commentsCount}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Paperclip className="h-4 w-4" />
              <span>{exception.attachmentsCount}</span>
            </div>
          </div>

          {/* Tags */}
          {exception.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {exception.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          )}

          {/* Category Badge */}
          <div>
            <Badge variant="outline">
              {exception.category.replace('_', ' ')}
            </Badge>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 pt-2 border-t">
              {!exception.assignedTo && onAssign && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssign(exception.id);
                  }}
                >
                  <User className="h-4 w-4 mr-1" />
                  Assign
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick?.();
                }}
              >
                View Details
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
