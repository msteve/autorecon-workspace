import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { adminService } from '../../services/adminService';
import { useToast } from '../../hooks/use-toast';
import { Settings, Edit, Save, X, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import type { SystemConfig } from '../../types';

export default function SystemConfiguration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingConfig, setEditingConfig] = useState<SystemConfig | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  // Fetch system config
  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['admin-config'],
    queryFn: adminService.getSystemConfig,
  });

  // Update config mutation
  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      adminService.updateSystemConfig(key, value),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['admin-config']);
      setEditingConfig(null);
      setEditValue('');
      toast({
        title: 'Configuration Updated',
        description: `${variables.key} has been updated successfully.`,
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update configuration. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleEdit = (config: SystemConfig) => {
    if (!config.editable) return;
    setEditingConfig(config);
    setEditValue(config.value);
  };

  const handleCancel = () => {
    setEditingConfig(null);
    setEditValue('');
  };

  const handleSave = () => {
    if (!editingConfig) return;
    updateMutation.mutate({
      key: editingConfig.key,
      value: editValue,
    });
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderValue = (config: SystemConfig) => {
    if (editingConfig?.key === config.key) {
      return (
        <Input
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          className="max-w-md"
          autoFocus
        />
      );
    }

    if (config.isSecret) {
      return (
        <div className="flex items-center gap-2">
          <code className="text-sm">
            {showSecrets[config.key] ? config.value : '••••••••••••'}
          </code>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => toggleSecretVisibility(config.key)}
          >
            {showSecrets[config.key] ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      );
    }

    return <code className="text-sm">{config.value}</code>;
  };

  // Group configs by category
  const configsByCategory = configs.reduce((acc, config) => {
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push(config);
    return acc;
  }, {} as Record<string, SystemConfig[]>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general':
        return <Settings className="h-5 w-5" />;
      case 'security':
        return <Lock className="h-5 w-5" />;
      case 'integration':
        return <Unlock className="h-5 w-5" />;
      case 'notification':
        return <Settings className="h-5 w-5" />;
      default:
        return <Settings className="h-5 w-5" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Configuration</h1>
          <p className="text-muted-foreground mt-1">
            Manage global system settings and parameters
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Settings
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{configs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Editable Settings
            </CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {configs.filter(c => c.editable).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Secret Settings
            </CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {configs.filter(c => c.isSecret).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Categories */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading configuration...
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(configsByCategory).map(([category, categoryConfigs]) => (
            <Card key={category}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {getCategoryIcon(category)}
                  <div>
                    <CardTitle>{getCategoryTitle(category)}</CardTitle>
                    <CardDescription>
                      {categoryConfigs.length} setting{categoryConfigs.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">Setting</TableHead>
                      <TableHead className="w-[50%]">Value</TableHead>
                      <TableHead className="w-[20%] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryConfigs.map(config => (
                      <TableRow key={config.key}>
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {config.key}
                              {!config.editable && (
                                <Badge variant="secondary" className="text-xs">
                                  Read-only
                                </Badge>
                              )}
                              {config.isSecret && (
                                <Badge variant="outline" className="text-xs">
                                  Secret
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {config.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{renderValue(config)}</TableCell>
                        <TableCell className="text-right">
                          {editingConfig?.key === config.key ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={updateMutation.isPending}
                              >
                                <Save className="h-4 w-4 mr-1" />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={updateMutation.isPending}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            config.editable && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(config)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            )
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Help Text */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Settings className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-amber-900 mb-1">Configuration Tips</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Read-only settings are managed by the system and cannot be modified</li>
                <li>• Secret settings are masked by default - click the eye icon to reveal</li>
                <li>• Changes to configuration take effect immediately</li>
                <li>• Some settings may require system restart to fully apply</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
