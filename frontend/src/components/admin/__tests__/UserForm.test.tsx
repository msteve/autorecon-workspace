import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserForm } from '../UserForm';
import type { AdminUser, AdminRole } from '../../../types';

const mockRoles: AdminRole[] = [
  {
    id: '1',
    name: 'Admin',
    description: 'Full system access',
    permissionIds: ['1', '2', '3'],
    userCount: 5,
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Analyst',
    description: 'Read-only access',
    permissionIds: ['1'],
    userCount: 10,
    isSystem: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const mockUser: AdminUser = {
  id: '1',
  email: 'john.doe@example.com',
  name: 'John Doe',
  username: 'johndoe',
  roleId: '1',
  roleName: 'Admin',
  status: 'active',
  mfaEnabled: true,
  phone: '+1 555-1234',
  department: 'Finance',
  lastLogin: '2024-01-15T10:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
};

describe('UserForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  describe('Create Mode', () => {
    it('renders create form with all required fields', () => {
      render(
        <UserForm
          roles={mockRoles}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('shows password fields in create mode', () => {
      render(
        <UserForm
          roles={mockRoles}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('validates required fields', async () => {
      render(
        <UserForm
          roles={mockRoles}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByRole('button', { name: /create/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(screen.getByText('Username is required')).toBeInTheDocument();
        expect(screen.getByText('Role is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('validates email format', async () => {
      render(
        <UserForm
          roles={mockRoles}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      const submitButton = screen.getByRole('button', { name: /create/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('validates password length', async () => {
      render(
        <UserForm
          roles={mockRoles}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const passwordInput = screen.getByLabelText(/^password/i);
      fireEvent.change(passwordInput, { target: { value: '12345' } });

      const submitButton = screen.getByRole('button', { name: /create/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Password must be at least 8 characters')
        ).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('validates password confirmation match', async () => {
      render(
        <UserForm
          roles={mockRoles}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);

      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmInput, { target: { value: 'password456' } });

      const submitButton = screen.getByRole('button', { name: /create/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('submits valid create form', async () => {
      render(
        <UserForm
          roles={mockRoles}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'new.user@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^name/i), {
        target: { value: 'New User' },
      });
      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: 'newuser' },
      });
      fireEvent.change(screen.getByLabelText(/^password/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'password123' },
      });

      const submitButton = screen.getByRole('button', { name: /create/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'new.user@example.com',
            name: 'New User',
            username: 'newuser',
            password: 'password123',
          })
        );
      });
    });
  });

  describe('Edit Mode', () => {
    it('renders edit form with existing user data', () => {
      render(
        <UserForm
          user={mockUser}
          roles={mockRoles}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('johndoe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+1 555-1234')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Finance')).toBeInTheDocument();
    });

    it('does not show password fields in edit mode', () => {
      render(
        <UserForm
          user={mockUser}
          roles={mockRoles}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.queryByLabelText(/^password/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/confirm password/i)).not.toBeInTheDocument();
    });

    it('shows status field in edit mode', () => {
      render(
        <UserForm
          user={mockUser}
          roles={mockRoles}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    });

    it('shows MFA toggle in edit mode', () => {
      render(
        <UserForm
          user={mockUser}
          roles={mockRoles}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText(/enable mfa/i)).toBeInTheDocument();
    });

    it('submits valid edit form', async () => {
      render(
        <UserForm
          user={mockUser}
          roles={mockRoles}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByLabelText(/^name/i);
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      const submitButton = screen.getByRole('button', { name: /update/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Updated Name',
          })
        );
      });
    });

    it('preserves MFA setting when toggled', async () => {
      render(
        <UserForm
          user={mockUser}
          roles={mockRoles}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const mfaCheckbox = screen.getByLabelText(/enable mfa/i);
      fireEvent.click(mfaCheckbox);

      const submitButton = screen.getByRole('button', { name: /update/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            mfaEnabled: false,
          })
        );
      });
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <UserForm
        roles={mockRoles}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('disables submit button when loading', () => {
    render(
      <UserForm
        roles={mockRoles}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={true}
      />
    );

    const submitButton = screen.getByRole('button', { name: /create/i });
    expect(submitButton).toBeDisabled();
  });

  it('populates role dropdown correctly', () => {
    render(
      <UserForm
        roles={mockRoles}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const roleSelect = screen.getByLabelText(/role/i);
    fireEvent.click(roleSelect);

    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Analyst')).toBeInTheDocument();
  });
});
