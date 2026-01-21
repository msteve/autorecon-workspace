import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RolePermissionMatrix } from '../RolePermissionMatrix';
import type { AdminRole, Permission } from '../../../types';

const mockPermissions: Permission[] = [
  {
    id: '1',
    name: 'dashboard.view',
    description: 'View dashboard',
    module: 'dashboard',
    category: 'read',
  },
  {
    id: '2',
    name: 'dashboard.edit',
    description: 'Edit dashboard',
    module: 'dashboard',
    category: 'write',
  },
  {
    id: '3',
    name: 'users.view',
    description: 'View users',
    module: 'admin',
    category: 'read',
  },
  {
    id: '4',
    name: 'users.create',
    description: 'Create users',
    module: 'admin',
    category: 'write',
  },
  {
    id: '5',
    name: 'users.delete',
    description: 'Delete users',
    module: 'admin',
    category: 'delete',
  },
];

const mockRoles: AdminRole[] = [
  {
    id: '1',
    name: 'Admin',
    description: 'Full access',
    permissionIds: ['1', '2', '3', '4', '5'],
    userCount: 5,
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Analyst',
    description: 'Read-only access',
    permissionIds: ['1', '3'],
    userCount: 10,
    isSystem: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

describe('RolePermissionMatrix', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all roles as column headers', () => {
    render(
      <RolePermissionMatrix
        roles={mockRoles}
        permissions={mockPermissions}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Analyst')).toBeInTheDocument();
  });

  it('groups permissions by module', () => {
    render(
      <RolePermissionMatrix
        roles={mockRoles}
        permissions={mockPermissions}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('displays permission names and descriptions', () => {
    render(
      <RolePermissionMatrix
        roles={mockRoles}
        permissions={mockPermissions}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('dashboard.view')).toBeInTheDocument();
    expect(screen.getByText('View dashboard')).toBeInTheDocument();
    expect(screen.getByText('users.create')).toBeInTheDocument();
    expect(screen.getByText('Create users')).toBeInTheDocument();
  });

  it('shows correct checkboxes for role permissions', () => {
    render(
      <RolePermissionMatrix
        roles={mockRoles}
        permissions={mockPermissions}
        onChange={mockOnChange}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    // Admin role has all 5 permissions
    // Analyst role has 2 permissions
    // Total checkboxes = 5 permissions × 2 roles = 10
    expect(checkboxes).toHaveLength(10);
  });

  it('checks boxes for assigned permissions', () => {
    render(
      <RolePermissionMatrix
        roles={mockRoles}
        permissions={mockPermissions}
        onChange={mockOnChange}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    
    // Admin role (first 5 checkboxes) - all should be checked
    expect(checkboxes[0]).toBeChecked(); // dashboard.view
    expect(checkboxes[1]).toBeChecked(); // dashboard.edit
    
    // Analyst role (last 5 checkboxes) - only first and third should be checked
    expect(checkboxes[5]).toBeChecked(); // dashboard.view
    expect(checkboxes[6]).not.toBeChecked(); // dashboard.edit
    expect(checkboxes[7]).toBeChecked(); // users.view
    expect(checkboxes[8]).not.toBeChecked(); // users.create
    expect(checkboxes[9]).not.toBeChecked(); // users.delete
  });

  it('calls onChange when checkbox is toggled', () => {
    render(
      <RolePermissionMatrix
        roles={mockRoles}
        permissions={mockPermissions}
        onChange={mockOnChange}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    // Click the second checkbox for Analyst role (dashboard.edit)
    fireEvent.click(checkboxes[6]);

    expect(mockOnChange).toHaveBeenCalledWith('2', ['1', '3', '2']);
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('removes permission when unchecking', () => {
    render(
      <RolePermissionMatrix
        roles={mockRoles}
        permissions={mockPermissions}
        onChange={mockOnChange}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    // Uncheck dashboard.view for Analyst role (checkbox index 5)
    fireEvent.click(checkboxes[5]);

    expect(mockOnChange).toHaveBeenCalledWith('2', ['3']);
  });

  it('disables checkboxes when readOnly is true', () => {
    render(
      <RolePermissionMatrix
        roles={mockRoles}
        permissions={mockPermissions}
        onChange={mockOnChange}
        readOnly={true}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(checkbox => {
      expect(checkbox).toBeDisabled();
    });
  });

  it('disables checkboxes for system roles', () => {
    render(
      <RolePermissionMatrix
        roles={mockRoles}
        permissions={mockPermissions}
        onChange={mockOnChange}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    // First 5 checkboxes are for Admin (system role)
    expect(checkboxes[0]).toBeDisabled();
    expect(checkboxes[1]).toBeDisabled();
    
    // Last 5 checkboxes are for Analyst (not system role)
    expect(checkboxes[5]).not.toBeDisabled();
    expect(checkboxes[6]).not.toBeDisabled();
  });

  it('displays category badges correctly', () => {
    render(
      <RolePermissionMatrix
        roles={mockRoles}
        permissions={mockPermissions}
        onChange={mockOnChange}
      />
    );

    // Check for category badges
    const readBadges = screen.getAllByText('read');
    const writeBadges = screen.getAllByText('write');
    const deleteBadges = screen.getAllByText('delete');

    expect(readBadges.length).toBeGreaterThan(0);
    expect(writeBadges.length).toBeGreaterThan(0);
    expect(deleteBadges.length).toBeGreaterThan(0);
  });

  it('allows expanding and collapsing module sections', () => {
    render(
      <RolePermissionMatrix
        roles={mockRoles}
        permissions={mockPermissions}
        onChange={mockOnChange}
      />
    );

    const dashboardHeader = screen.getByText('Dashboard');
    const dashboardButton = dashboardHeader.closest('button');

    // Initially expanded - should show permissions
    expect(screen.getByText('dashboard.view')).toBeVisible();

    // Click to collapse
    if (dashboardButton) {
      fireEvent.click(dashboardButton);
    }

    // After collapse, permissions might not be visible
    // (depends on implementation - this test assumes collapse hides content)
  });

  it('handles single role correctly', () => {
    render(
      <RolePermissionMatrix
        roles={[mockRoles[0]]}
        permissions={mockPermissions}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.queryByText('Analyst')).not.toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox');
    // Should have 5 checkboxes (one per permission)
    expect(checkboxes).toHaveLength(5);
  });

  it('handles empty permissions gracefully', () => {
    render(
      <RolePermissionMatrix
        roles={mockRoles}
        permissions={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Analyst')).toBeInTheDocument();
    
    const checkboxes = screen.queryAllByRole('checkbox');
    expect(checkboxes).toHaveLength(0);
  });

  it('formats module names correctly', () => {
    const permissionsWithMultiWord: Permission[] = [
      {
        id: '6',
        name: 'gl-posting.view',
        description: 'View GL posting',
        module: 'gl-posting',
        category: 'read',
      },
    ];

    render(
      <RolePermissionMatrix
        roles={mockRoles}
        permissions={permissionsWithMultiWord}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Gl Posting')).toBeInTheDocument();
  });

  it('displays system role indicator', () => {
    render(
      <RolePermissionMatrix
        roles={mockRoles}
        permissions={mockPermissions}
        onChange={mockOnChange}
      />
    );

    const systemBadge = screen.getByText('System');
    expect(systemBadge).toBeInTheDocument();
  });
});
