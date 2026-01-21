import { CheckCircle, XCircle, Send, UserPlus, MessageSquare, FileText, XOctagon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { ApprovalHistoryEntry } from '@/types';

interface ApprovalHistoryTimelineProps {
  history: ApprovalHistoryEntry[];
  className?: string;
}

export function ApprovalHistoryTimeline({ history, className = '' }: ApprovalHistoryTimelineProps) {
  const getActionIcon = (action: ApprovalHistoryEntry['action']) => {
    switch (action) {
      case 'created':
        return <FileText className="h-4 w-4" />;
      case 'submitted':
        return <Send className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'reassigned':
        return <UserPlus className="h-4 w-4" />;
      case 'cancelled':
        return <XOctagon className="h-4 w-4" />;
      case 'commented':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: ApprovalHistoryEntry['action']) => {
    switch (action) {
      case 'created':
        return 'bg-gray-100 text-gray-600';
      case 'submitted':
        return 'bg-blue-100 text-blue-600';
      case 'approved':
        return 'bg-green-100 text-green-600';
      case 'rejected':
        return 'bg-red-100 text-red-600';
      case 'reassigned':
        return 'bg-purple-100 text-purple-600';
      case 'cancelled':
        return 'bg-orange-100 text-orange-600';
      case 'commented':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getActionLabel = (action: ApprovalHistoryEntry['action']) => {
    switch (action) {
      case 'created':
        return 'Created';
      case 'submitted':
        return 'Submitted';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'reassigned':
        return 'Reassigned';
      case 'cancelled':
        return 'Cancelled';
      case 'commented':
        return 'Commented';
      default:
        return action.charAt(0).toUpperCase() + action.slice(1);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!history || history.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm text-gray-500 text-center">No history available</p>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Activity Timeline</h3>
      
      <div className="space-y-6">
        {history.map((entry, index) => (
          <div key={entry.id} className="relative">
            {/* Timeline Line */}
            {index < history.length - 1 && (
              <div className="absolute left-5 top-12 bottom-0 w-px bg-gray-200" />
            )}

            <div className="flex gap-4">
              {/* Avatar and Icon */}
              <div className="relative flex-shrink-0">
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                  <AvatarFallback className="text-sm font-medium bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {getInitials(entry.actor.name)}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center ${getActionColor(entry.action)} border-2 border-white shadow-sm`}>
                  {getActionIcon(entry.action)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900">
                      {entry.actor.name}
                    </span>
                    <span className="text-gray-600">
                      {getActionLabel(entry.action).toLowerCase()}
                    </span>
                    {entry.action === 'approved' && (
                      <span className="text-green-600 font-medium">the request</span>
                    )}
                    {entry.action === 'rejected' && (
                      <span className="text-red-600 font-medium">the request</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </div>

                {entry.comment && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {entry.comment}
                    </p>
                  </div>
                )}

                {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                  <div className="mt-2">
                    <details className="text-sm">
                      <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                        View metadata
                      </summary>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2">
                        <pre className="text-xs text-gray-600 overflow-auto">
                          {JSON.stringify(entry.metadata, null, 2)}
                        </pre>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {history.length} event{history.length !== 1 ? 's' : ''} recorded
          </span>
          <span className="text-gray-400">
            Created {formatTimestamp(history[history.length - 1]?.timestamp || '')}
          </span>
        </div>
      </div>
    </Card>
  );
}
