import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { RolePermissionMatrix } from '../../components/admin';
import { adminService } from '../../services/adminService';
import { useToast } from '../../hooks/use-toast';
import { Shield, Plus, Edit, Trash2, Users, Lock } from 'lucide-react';
import type { AdminRole, CreateRoleRequest, UpdateRoleRequest } from '../../types';

export default function RolePermissions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<AdminRole | undefined>();
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch roles
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: adminService.getRoles,
  });

  // Fetch permissions
  const { data: permissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ['admin-permissions'],
    queryFn: adminService.getPermissions,
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminService.getAdminStats,
  });

  // Create role mutation
  const createMutation = useMutation({
    mutationFn: adminService.createRole,
    onSuccess: newRole => {
      queryClient.invalidateQueries(['admin-roles']);
      queryClient.invalidateQueries(['admin-stats']);
      setShowRoleDialog(false);
      setFormData({ name: '', description: '' });
      setSelectedRoleId(newRole.id);
      toast({
        title: 'Role Created',
        description: 'The role has been created successfully. You can now assign permissions.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create role. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Update role mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleRequest }) =>
      adminService.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-roles']);
      setShowRoleDialog(false);
      setEditingRole(undefined);
      setFormData({ name: '', description: '' });
      toast({
        title: 'Role Updated',
        description: 'The role has been updated successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update role. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Delete role mutation
  const deleteMutation = useMutation({
    mutationFn: adminService.deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-roles']);
      queryClient.invalidateQueries(['admin-stats']);
      setDeleteRoleId(null);
      if (selectedRoleId === deleteRoleId) {
        setSelectedRoleId(null);
      }
      toast({
        title: 'Role Deleted',
        description: 'The role has been deleted successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete role. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = 'Role name is required';
    }
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateRole = () => {
    setEditingRole(undefined);
    setFormData({ name: '', description: '' });
    setFormErrors({});
    setShowRoleDialog(true);
  };

  const handleEditRole = (role: AdminRole) => {
    if (role.isSystem) {
      toast({
        title: 'Cannot Edit System Role',
        description: 'System roles cannot be modified.',
        variant: 'destructive',
      });
      return;
    }
    setEditingRole(role);
    setFormData({ name: role.name, description: role.description });
    setFormErrors({});
    setShowRoleDialog(true);
  };

  const handleDeleteRole = (role: AdminRole) => {
    if (role.isSystem) {
      toast({
        title: 'Cannot Delete System Role',
        description: 'System roles cannot be deleted.',
        variant: 'destructive',
      });
      return;
    }
    setDeleteRoleId(role.id);
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (editingRole) {
      updateMutation.mutate({
        id: editingRole.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handlePermissionChange = (roleId: string, permissionIds: string[]) => {
    const role = roles.find(r => r.id === roleId);
    if (!role || role.isSystem) return;

    updateMutation.mutate({
      id: roleId,
      data: {
        permissionIds,
      },
    });
  };

  const selectedRole = selectedRoleId ? roles.find(r => r.id === selectedRoleId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Roles & Permissions</h1>
          <p className="text-muted-foreground mt-1">
            Manage user roles and their permission assignments
          </p>
        </div>
        <Button onClick={handleCreateRole}>
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Roles
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRoles || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {roles.filter(r => r.isSystem).length} system roles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Permissions
            </CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {new Set(permissions.map(p => p.module)).size} modules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Users Assigned
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roles.reduce((sum, role) => sum + role.userCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all roles
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Roles List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Roles</CardTitle>
            <CardDescription>Select a role to manage permissions</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {rolesLoading ? (
              <div className="p-4 text-center text-muted-foreground">Loading roles...</div>
            ) : (
              <div className="divide-y">
                {roles.map(role => (
                  <div
                    key={role.id}
                    className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedRoleId === role.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => setSelectedRoleId(role.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{role.name}</h4>
                          {role.isSystem && (
                            <Badge variant="secondary" className="text-xs">
                              System
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {role.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{role.userCount} users</span>
                          <span>{role.permissionIds.length} permissions</span>
                        </div>
                      </div>
                    </div>
                    {!role.isSystem && (
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={e => {
                            e.stopPropagation();
                            handleEditRole(role);
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteRole(role);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permission Matrix */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Permission Matrix</CardTitle>
            <CardDescription>
              {selectedRole
                ? `Manage permissions for ${selectedRole.name}`
                : 'Select a role to view and manage permissions'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {permissionsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading permissions...
              </div>
            ) : !selectedRole ? (
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a role from the list to view and manage its permissions</p>
              </div>
            ) : (
              <RolePermissionMatrix
                roles={[selectedRole]}
                permissions={permissions}
                onChange={(roleId, permissionIds) =>
                  handlePermissionChange(roleId, permissionIds)
                }
                readOnly={selectedRole.isSystem}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Edit Role' : 'Create New Role'}</DialogTitle>
            <DialogDescription>
              {editingRole
                ? 'Update the role name and description'
                : 'Create a new role and assign permissions'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                placeholder="e.g., Account Manager"
                value={formData.name}
                onChange={e => {
                  setFormData(prev => ({ ...prev, name: e.target.value }));
                  setFormErrors(prev => ({ ...prev, name: '' }));
                }}
              />
              {formErrors.name && (
                <p className="text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the role and its responsibilities..."
                value={formData.description}
                onChange={e => {
                  setFormData(prev => ({ ...prev, description: e.target.value }));
                  setFormErrors(prev => ({ ...prev, description: '' }));
                }}
                rows={3}
              />
              {formErrors.description && (
                <p className="text-sm text-red-600">{formErrors.description}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRoleDialog(false);
                setEditingRole(undefined);
                setFormData({ name: '', description: '' });
                setFormErrors({});
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingRole ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteRoleId} onOpenChange={() => setDeleteRoleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this role? All users assigned to this role will
              need to be reassigned. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteRoleId && deleteMutation.mutate(deleteRoleId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
