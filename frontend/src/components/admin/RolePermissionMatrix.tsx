import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import type { Permission, AdminRole } from '../../types';

interface RolePermissionMatrixProps {
  permissions: Permission[];
  roles: AdminRole[];
  selectedRole?: AdminRole;
  onPermissionToggle?: (roleId: string, permissionId: string, checked: boolean) => void;
  readOnly?: boolean;
}

export function RolePermissionMatrix({
  permissions,
  roles,
  selectedRole,
  onPermissionToggle,
  readOnly = false,
}: RolePermissionMatrixProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // Group permissions by module
  const permissionsByModule = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const modules = Object.keys(permissionsByModule).sort();

  const toggleModule = (module: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(module)) {
      newExpanded.delete(module);
    } else {
      newExpanded.add(module);
    }
    setExpandedModules(newExpanded);
  };

  const isPermissionGranted = (roleId: string, permissionId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.permissionIds.includes(permissionId) || false;
  };

  const getCategoryColor = (category: Permission['category']) => {
    const colors = {
      read: 'bg-blue-100 text-blue-700',
      write: 'bg-green-100 text-green-700',
      delete: 'bg-red-100 text-red-700',
      admin: 'bg-purple-100 text-purple-700',
    };
    return colors[category];
  };

  const displayRoles = selectedRole ? [selectedRole] : roles;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px] sticky left-0 bg-background z-10">
                Permission
              </TableHead>
              <TableHead className="w-[100px]">Category</TableHead>
              {displayRoles.map(role => (
                <TableHead key={role.id} className="text-center min-w-[120px]">
                  <div className="space-y-1">
                    <div className="font-semibold">{role.name}</div>
                    {role.isSystem && (
                      <Badge variant="secondary" className="text-xs">
                        System
                      </Badge>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {modules.map(module => {
              const modulePermissions = permissionsByModule[module];
              const isExpanded = expandedModules.has(module) || modules.length <= 3;

              return (
                <React.Fragment key={module}>
                  <TableRow
                    className="bg-muted/50 hover:bg-muted cursor-pointer"
                    onClick={() => toggleModule(module)}
                  >
                    <TableCell
                      colSpan={2 + displayRoles.length}
                      className="font-semibold sticky left-0 bg-muted/50 z-10"
                    >
                      <div className="flex items-center gap-2">
                        <span className={isExpanded ? '▼' : '▶'} />
                        {module}
                        <Badge variant="outline" className="ml-2">
                          {modulePermissions.length}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                  {isExpanded &&
                    modulePermissions.map(permission => (
                      <TableRow key={permission.id}>
                        <TableCell className="sticky left-0 bg-background z-10">
                          <div>
                            <div className="font-medium text-sm">{permission.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {permission.description}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 font-mono">
                              {permission.code}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getCategoryColor(permission.category)}>
                            {permission.category}
                          </Badge>
                        </TableCell>
                        {displayRoles.map(role => {
                          const isGranted = isPermissionGranted(role.id, permission.id);
                          const isDisabled = readOnly || role.isSystem;

                          return (
                            <TableCell key={role.id} className="text-center">
                              <div className="flex justify-center">
                                <Checkbox
                                  checked={isGranted}
                                  onCheckedChange={checked => {
                                    if (!isDisabled && onPermissionToggle) {
                                      onPermissionToggle(role.id, permission.id, checked as boolean);
                                    }
                                  }}
                                  disabled={isDisabled}
                                />
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Need to import React for Fragment
import React from 'react';
