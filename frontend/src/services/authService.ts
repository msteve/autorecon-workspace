import { apiClient } from './apiClient';
import type { LoginRequest, LoginResponse, MFARequest, User } from '@/types';

// Use static mock data when backend is unavailable
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
if (USE_MOCK_DATA) {
  console.info('🔐 Auth Service: Using static mock data (backend unavailable)');
}

// Mock Users for Development
const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'admin@autorecon.com',
    name: 'Admin User',
    role: 'admin',
    avatar: null,
    permissions: [
      'dashboard.view',
      'ingestion.manage',
      'rules.manage',
      'matching.manage',
      'exceptions.manage',
      'approvals.manage',
      'settlements.manage',
      'gl.manage',
      'reports.view',
      'users.manage',
      'audit.view'
    ]
  },
  {
    id: 'user-2',
    email: 'reconciler@autorecon.com',
    name: 'John Doe',
    role: 'reconciler',
    avatar: null,
    permissions: [
      'dashboard.view',
      'ingestion.view',
      'rules.view',
      'matching.manage',
      'exceptions.manage',
      'reports.view'
    ]
  },
  {
    id: 'user-3',
    email: 'approver@autorecon.com',
    name: 'Jane Smith',
    role: 'approver',
    avatar: null,
    permissions: [
      'dashboard.view',
      'approvals.manage',
      'settlements.view',
      'reports.view'
    ]
  },
  {
    id: 'user-4',
    email: 'viewer@autorecon.com',
    name: 'Bob Johnson',
    role: 'viewer',
    avatar: null,
    permissions: [
      'dashboard.view',
      'reports.view'
    ]
  }
];

// Mock credentials - all use password "password123"
const mockCredentials = [
  { email: 'admin@autorecon.com', password: 'password123' },
  { email: 'reconciler@autorecon.com', password: 'password123' },
  { email: 'approver@autorecon.com', password: 'password123' },
  { email: 'viewer@autorecon.com', password: 'password123' }
];

// Helper to generate mock token
const generateMockToken = (userId: string): string => {
  return `mock_token_${userId}_${Date.now()}`;
};

// Helper to get current user from stored token
const getUserFromToken = (token: string): User | null => {
  const userId = token.split('_')[2];
  return mockUsers.find(u => u.id === userId) || null;
};

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Check credentials
    const validCredential = mockCredentials.find(
      c => c.email === credentials.email && c.password === credentials.password
    );

    if (!validCredential) {
      throw new Error('Invalid email or password');
    }

    // Find user
    const user = mockUsers.find(u => u.email === credentials.email);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate tokens
    const accessToken = generateMockToken(user.id);
    const refreshToken = `refresh_${accessToken}`;

    // Store token in localStorage
    localStorage.setItem('auth_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('current_user', JSON.stringify(user));

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user,
      requires_mfa: false
    };
  },

  verifyMFA: async (mfaData: MFARequest): Promise<LoginResponse> => {
    // Mock MFA verification - accept any 6-digit code
    await new Promise(resolve => setTimeout(resolve, 500));

    if (mfaData.code.length !== 6) {
      throw new Error('Invalid MFA code');
    }

    // Return mock admin user after MFA
    const user = mockUsers[0];
    const accessToken = generateMockToken(user.id);
    const refreshToken = `refresh_${accessToken}`;

    localStorage.setItem('auth_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('current_user', JSON.stringify(user));

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user,
      requires_mfa: false
    };
  },

  logout: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
  },

  refreshToken: async (refreshToken: string): Promise<{ access_token: string }> => {
    await new Promise(resolve => setTimeout(resolve, 400));

    if (!refreshToken || !refreshToken.startsWith('refresh_')) {
      throw new Error('Invalid refresh token');
    }

    // Extract user ID from refresh token
    const oldToken = refreshToken.replace('refresh_', '');
    const user = getUserFromToken(oldToken);

    if (!user) {
      throw new Error('Invalid token');
    }

    const newAccessToken = generateMockToken(user.id);
    localStorage.setItem('auth_token', newAccessToken);

    return { access_token: newAccessToken };
  },

  getCurrentUser: async (): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const user = getUserFromToken(token);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      // Don't reveal if email exists for security
      return;
    }

    console.log(`Password reset email sent to ${email}`);
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    console.log('Password reset successful');
  },

  // Additional helper methods
  getMockUsers: (): User[] => {
    return mockUsers;
  },

  getMockCredentials: () => {
    return mockCredentials.map(c => ({ email: c.email, password: '********' }));
  }
};
