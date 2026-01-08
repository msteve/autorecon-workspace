import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface AlertsWidgetProps {
  alerts: Alert[];
  onDismiss?: (id: string) => void;
  loading?: boolean;
}

export function AlertsWidget({ alerts, onDismiss, loading = false }: AlertsWidgetProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 w-full animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return AlertCircle;
      case 'warning':
        return AlertTriangle;
      case 'info':
        return Info;
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return 'border-l-red-500 bg-red-50 dark:bg-red-950/20';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      case 'info':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20';
    }
  };

  const getIconColor = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>System Alerts</CardTitle>
        <Badge variant="outline">{alerts.length}</Badge>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Info className="mb-2 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No active alerts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const Icon = getAlertIcon(alert.type);
              return (
                <div
                  key={alert.id}
                  className={cn(
                    'relative rounded-lg border-l-4 p-4 transition-all',
                    getAlertColor(alert.type)
                  )}
                >
                  {onDismiss && (
                    <button
                      onClick={() => onDismiss(alert.id)}
                      className="absolute right-2 top-2 rounded-full p-1 hover:bg-background/50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <div className="flex gap-3">
                    <Icon className={cn('h-5 w-5 flex-shrink-0', getIconColor(alert.type))} />
                    <div className="flex-1">
                      <h4 className="mb-1 font-semibold text-sm">{alert.title}</h4>
                      <p className="mb-2 text-xs text-muted-foreground">{alert.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                        {alert.actionLabel && alert.onAction && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={alert.onAction}
                          >
                            {alert.actionLabel}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
