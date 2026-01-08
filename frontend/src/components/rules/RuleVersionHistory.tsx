import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Power, 
  PowerOff,
  Clock
} from 'lucide-react';
import { RuleVersion } from '@/services/ruleEngineService';
import { formatDistanceToNow } from 'date-fns';

interface RuleVersionHistoryProps {
  versions: RuleVersion[];
  currentVersion: number;
  onRestore?: (versionId: string) => void;
  readOnly?: boolean;
}

/**
 * RuleVersionHistory Component
 * 
 * Displays a timeline of rule changes with version history.
 * 
 * @example
 * ```tsx
 * <RuleVersionHistory
 *   versions={versionHistory}
 *   currentVersion={3}
 *   onRestore={(versionId) => handleRestore(versionId)}
 * />
 * ```
 */
export const RuleVersionHistory: React.FC<RuleVersionHistoryProps> = ({
  versions,
  currentVersion,
  onRestore,
  readOnly = false
}) => {
  const getChangeIcon = (changeType: RuleVersion['changeType']) => {
    const icons = {
      created: <FileText className="h-4 w-4 text-blue-600" />,
      updated: <Edit className="h-4 w-4 text-yellow-600" />,
      approved: <CheckCircle className="h-4 w-4 text-green-600" />,
      rejected: <XCircle className="h-4 w-4 text-red-600" />,
      activated: <Power className="h-4 w-4 text-green-600" />,
      deactivated: <PowerOff className="h-4 w-4 text-gray-600" />
    };
    return icons[changeType];
  };

  const getChangeColor = (changeType: RuleVersion['changeType']) => {
    const colors = {
      created: 'bg-blue-100 text-blue-800 border-blue-300',
      updated: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
      activated: 'bg-green-100 text-green-800 border-green-300',
      deactivated: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[changeType];
  };

  // Sort versions by version number descending (newest first)
  const sortedVersions = [...versions].sort((a, b) => b.version - a.version);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Version History
        </CardTitle>
        <CardDescription>
          Track all changes made to this rule over time
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {sortedVersions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No version history available</p>
              </div>
            ) : (
              sortedVersions.map((version, index) => (
                <div
                  key={version.id}
                  className={`
                    relative pl-8 pb-4
                    ${index !== sortedVersions.length - 1 ? 'border-l-2 border-gray-200' : ''}
                  `}
                >
                  {/* Timeline dot */}
                  <div className={`
                    absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white
                    ${version.version === currentVersion 
                      ? 'bg-primary ring-4 ring-primary/20' 
                      : 'bg-gray-300'
                    }
                  `} />

                  {/* Version card */}
                  <div className={`
                    border rounded-lg p-4
                    ${version.version === currentVersion 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200'
                    }
                  `}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={getChangeColor(version.changeType)}
                        >
                          {getChangeIcon(version.changeType)}
                          <span className="ml-1 capitalize">
                            {version.changeType.replace('_', ' ')}
                          </span>
                        </Badge>
                        <span className="font-semibold">
                          Version {version.version}
                        </span>
                        {version.version === currentVersion && (
                          <Badge variant="default" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>

                      {!readOnly && version.version !== currentVersion && onRestore && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRestore(version.id)}
                        >
                          Restore
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium">{version.name}</p>
                        {version.description && (
                          <p className="text-sm text-muted-foreground">
                            {version.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          By <span className="font-medium">{version.changedBy}</span>
                        </span>
                        <span>•</span>
                        <span title={new Date(version.changedAt).toLocaleString()}>
                          {formatDistanceToNow(new Date(version.changedAt), { addSuffix: true })}
                        </span>
                      </div>

                      {version.changeDescription && (
                        <div className="mt-3 p-2 bg-muted rounded text-xs">
                          <span className="font-medium">Changes: </span>
                          {version.changeDescription}
                        </div>
                      )}

                      {version.previousVersion && (
                        <div className="text-xs text-muted-foreground">
                          Previous version: {version.previousVersion}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
