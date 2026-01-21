import { Plus, Minus, Edit } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ChangeSet, ChangeDiff } from '@/types';

interface ChangeDiffViewerProps {
  changes: ChangeSet;
  showFullPayload?: boolean;
}

export function ChangeDiffViewer({ changes, showFullPayload = false }: ChangeDiffViewerProps) {
  if (!changes || !changes.diff || changes.diff.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm text-gray-500 text-center">No changes detected</p>
      </Card>
    );
  }

  const getChangeIcon = (type: ChangeDiff['change_type']) => {
    switch (type) {
      case 'added':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'removed':
        return <Minus className="h-4 w-4 text-red-600" />;
      case 'modified':
        return <Edit className="h-4 w-4 text-blue-600" />;
    }
  };

  const getChangeBadgeColor = (type: ChangeDiff['change_type']) => {
    switch (type) {
      case 'added':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'removed':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'modified':
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'null';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return String(value);
  };

  return (
    <div className="space-y-4">
      {/* Changes Summary */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600">
          {changes.diff.length} change{changes.diff.length !== 1 ? 's' : ''} detected
        </span>
        <div className="flex items-center gap-2">
          {changes.diff.filter(d => d.change_type === 'added').length > 0 && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
              +{changes.diff.filter(d => d.change_type === 'added').length}
            </Badge>
          )}
          {changes.diff.filter(d => d.change_type === 'modified').length > 0 && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
              ~{changes.diff.filter(d => d.change_type === 'modified').length}
            </Badge>
          )}
          {changes.diff.filter(d => d.change_type === 'removed').length > 0 && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
              -{changes.diff.filter(d => d.change_type === 'removed').length}
            </Badge>
          )}
        </div>
      </div>

      {/* Individual Changes */}
      <div className="space-y-3">
        {changes.diff.map((change, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                {getChangeIcon(change.change_type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{change.field}</span>
                    <Badge variant="outline" className={getChangeBadgeColor(change.change_type)}>
                      {change.change_type}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{change.path}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Old Value */}
                {change.change_type !== 'added' && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase">
                      Previous Value
                    </label>
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <code className="text-sm text-red-900 whitespace-pre-wrap break-all">
                        {formatValue(change.old_value)}
                      </code>
                    </div>
                  </div>
                )}

                {/* New Value */}
                {change.change_type !== 'removed' && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase">
                      New Value
                    </label>
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <code className="text-sm text-green-900 whitespace-pre-wrap break-all">
                        {formatValue(change.new_value)}
                      </code>
                    </div>
                  </div>
                )}

                {/* For single column when only one value */}
                {(change.change_type === 'added' || change.change_type === 'removed') && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase">
                      {change.change_type === 'added' ? 'Added' : 'Removed'}
                    </label>
                    <div className={`border rounded-md p-3 ${
                      change.change_type === 'added' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <code className={`text-sm whitespace-pre-wrap break-all ${
                        change.change_type === 'added' 
                          ? 'text-green-900' 
                          : 'text-red-900'
                      }`}>
                        {formatValue(change.change_type === 'added' ? change.new_value : change.old_value)}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Full Payload View (Optional) */}
      {showFullPayload && (
        <Card className="overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <h4 className="text-sm font-medium text-gray-900">Complete Payload</h4>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase">Before</label>
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3 overflow-auto max-h-96">
                  <pre className="text-xs text-gray-800">
                    {JSON.stringify(changes.before, null, 2)}
                  </pre>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase">After</label>
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3 overflow-auto max-h-96">
                  <pre className="text-xs text-gray-800">
                    {JSON.stringify(changes.after, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
