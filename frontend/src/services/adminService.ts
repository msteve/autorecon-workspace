// Use static mock data when backend is unavailable
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
if (USE_MOCK_DATA) {
  console.info('👥 Admin Service: Using static mock data (backend unavailable)');
}

import type {
  AdminUser,
  Permission,
  AdminRole,
  PartnerConfig,
  SystemConfig,
  CreateUserRequest,
  UpdateUserRequest,
  CreateRoleRequest,
  UpdateRoleRequest,
  CreatePartnerRequest,
  UpdatePartnerRequest,
  AdminStats,
  PaginatedResponse,
} from '../types';

// Mock permissions
const mockPermissions: Permission[] = [
  // Dashboard
  { id: 'perm-1', name: 'View Dashboard', code: 'dashboard.view', module: 'Dashboard', description: 'Access to dashboard and analytics', category: 'read' },
  { id: 'perm-2', name: 'Export Dashboard', code: 'dashboard.export', module: 'Dashboard', description: 'Export dashboard reports', category: 'read' },
  
  // Ingestion
  { id: 'perm-3', name: 'View Ingestion', code: 'ingestion.view', module: 'Ingestion', description: 'View ingestion jobs', category: 'read' },
  { id: 'perm-4', name: 'Upload Files', code: 'ingestion.upload', module: 'Ingestion', description: 'Upload files for ingestion', category: 'write' },
  { id: 'perm-5', name: 'Retry Jobs', code: 'ingestion.retry', module: 'Ingestion', description: 'Retry failed ingestion jobs', category: 'write' },
  { id: 'perm-6', name: 'Delete Jobs', code: 'ingestion.delete', module: 'Ingestion', description: 'Delete ingestion jobs', category: 'delete' },
  
  // Matching
  { id: 'perm-7', name: 'View Matching', code: 'matching.view', module: 'Matching', description: 'View matching results', category: 'read' },
  { id: 'perm-8', name: 'Manual Match', code: 'matching.manual', module: 'Matching', description: 'Create manual matches', category: 'write' },
  { id: 'perm-9', name: 'Unmatch Records', code: 'matching.unmatch', module: 'Matching', description: 'Break existing matches', category: 'write' },
  
  // Exceptions
  { id: 'perm-10', name: 'View Exceptions', code: 'exceptions.view', module: 'Exceptions', description: 'View exception records', category: 'read' },
  { id: 'perm-11', name: 'Assign Exceptions', code: 'exceptions.assign', module: 'Exceptions', description: 'Assign exceptions to users', category: 'write' },
  { id: 'perm-12', name: 'Resolve Exceptions', code: 'exceptions.resolve', module: 'Exceptions', description: 'Resolve exception records', category: 'write' },
  { id: 'perm-13', name: 'Delete Exceptions', code: 'exceptions.delete', module: 'Exceptions', description: 'Delete exception records', category: 'delete' },
  
  // Rules
  { id: 'perm-14', name: 'View Rules', code: 'rules.view', module: 'Rules', description: 'View reconciliation rules', category: 'read' },
  { id: 'perm-15', name: 'Create Rules', code: 'rules.create', module: 'Rules', description: 'Create new rules', category: 'write' },
  { id: 'perm-16', name: 'Edit Rules', code: 'rules.edit', module: 'Rules', description: 'Edit existing rules', category: 'write' },
  { id: 'perm-17', name: 'Delete Rules', code: 'rules.delete', module: 'Rules', description: 'Delete rules', category: 'delete' },
  { id: 'perm-18', name: 'Approve Rules', code: 'rules.approve', module: 'Rules', description: 'Approve rule changes', category: 'admin' },
  
  // Workflow
  { id: 'perm-19', name: 'View Approvals', code: 'workflow.view', module: 'Workflow', description: 'View approval requests', category: 'read' },
  { id: 'perm-20', name: 'Approve Requests', code: 'workflow.approve', module: 'Workflow', description: 'Approve workflow requests', category: 'admin' },
  
  // Settlement
  { id: 'perm-21', name: 'View Settlement', code: 'settlement.view', module: 'Settlement', description: 'View settlement runs', category: 'read' },
  { id: 'perm-22', name: 'Create Settlement', code: 'settlement.create', module: 'Settlement', description: 'Create settlement runs', category: 'write' },
  { id: 'perm-23', name: 'Process Settlement', code: 'settlement.process', module: 'Settlement', description: 'Process settlement payments', category: 'admin' },
  
  // GL Posting
  { id: 'perm-24', name: 'View GL Posting', code: 'gl.view', module: 'GL Posting', description: 'View journal batches', category: 'read' },
  { id: 'perm-25', name: 'Create GL Batch', code: 'gl.create', module: 'GL Posting', description: 'Create journal batches', category: 'write' },
  { id: 'perm-26', name: 'Approve GL Batch', code: 'gl.approve', module: 'GL Posting', description: 'Approve journal batches', category: 'admin' },
  { id: 'perm-27', name: 'Post to GL', code: 'gl.post', module: 'GL Posting', description: 'Post batches to general ledger', category: 'admin' },
  
  // Reports
  { id: 'perm-28', name: 'View Reports', code: 'reports.view', module: 'Reports', description: 'View reports', category: 'read' },
  { id: 'perm-29', name: 'Export Reports', code: 'reports.export', module: 'Reports', description: 'Export report data', category: 'read' },
  
  // Admin
  { id: 'perm-30', name: 'View Users', code: 'admin.users.view', module: 'Admin', description: 'View user list', category: 'read' },
  { id: 'perm-31', name: 'Manage Users', code: 'admin.users.manage', module: 'Admin', description: 'Create, edit, delete users', category: 'admin' },
  { id: 'perm-32', name: 'View Roles', code: 'admin.roles.view', module: 'Admin', description: 'View roles and permissions', category: 'read' },
  { id: 'perm-33', name: 'Manage Roles', code: 'admin.roles.manage', module: 'Admin', description: 'Create, edit, delete roles', category: 'admin' },
  { id: 'perm-34', name: 'View Partners', code: 'admin.partners.view', module: 'Admin', description: 'View partner configurations', category: 'read' },
  { id: 'perm-35', name: 'Manage Partners', code: 'admin.partners.manage', module: 'Admin', description: 'Create, edit partner configs', category: 'admin' },
  { id: 'perm-36', name: 'View System Config', code: 'admin.config.view', module: 'Admin', description: 'View system configuration', category: 'read' },
  { id: 'perm-37', name: 'Manage System Config', code: 'admin.config.manage', module: 'Admin', description: 'Edit system configuration', category: 'admin' },
  
  // Audit
  { id: 'perm-38', name: 'View Audit Logs', code: 'audit.view', module: 'Audit', description: 'View audit trail', category: 'read' },
  { id: 'perm-39', name: 'Export Audit Logs', code: 'audit.export', module: 'Audit', description: 'Export audit data', category: 'read' },
];

// Mock roles
const mockRoles: AdminRole[] = [
  {
    id: 'role-1',
    name: 'System Administrator',
    description: 'Full system access with all permissions',
    permissionIds: mockPermissions.map(p => p.id),
    userCount: 3,
    isSystem: true,
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'role-2',
    name: 'Reconciliation Manager',
    description: 'Manage reconciliation operations and approve workflows',
    permissionIds: ['perm-1', 'perm-3', 'perm-7', 'perm-10', 'perm-11', 'perm-12', 'perm-14', 'perm-18', 'perm-19', 'perm-20', 'perm-28'],
    userCount: 8,
    isSystem: false,
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'role-3',
    name: 'Reconciliation Analyst',
    description: 'Perform daily reconciliation tasks',
    permissionIds: ['perm-1', 'perm-3', 'perm-4', 'perm-7', 'perm-8', 'perm-10', 'perm-11', 'perm-12', 'perm-14', 'perm-28'],
    userCount: 15,
    isSystem: false,
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'role-4',
    name: 'Finance Manager',
    description: 'Manage settlements and GL posting',
    permissionIds: ['perm-1', 'perm-21', 'perm-22', 'perm-23', 'perm-24', 'perm-25', 'perm-26', 'perm-27', 'perm-28', 'perm-29'],
    userCount: 5,
    isSystem: false,
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'role-5',
    name: 'Auditor',
    description: 'Read-only access for audit and reporting',
    permissionIds: ['perm-1', 'perm-2', 'perm-3', 'perm-7', 'perm-10', 'perm-14', 'perm-19', 'perm-21', 'perm-24', 'perm-28', 'perm-29', 'perm-38', 'perm-39'],
    userCount: 4,
    isSystem: false,
    createdAt: '2025-01-01T00:00:00Z',
  },
];

// Mock users
const generateMockUsers = (): AdminUser[] => {
  const users: AdminUser[] = [];
  const departments = ['Finance', 'Operations', 'IT', 'Accounting', 'Treasury'];
  const statuses: AdminUser['status'][] = ['active', 'inactive', 'pending'];
  
  const names = [
    'John Smith', 'Jane Doe', 'Bob Johnson', 'Alice Williams', 'Charlie Brown',
    'Diana Prince', 'Eve Anderson', 'Frank Miller', 'Grace Lee', 'Henry Davis',
    'Iris Chen', 'Jack Wilson', 'Kelly Martinez', 'Liam Garcia', 'Maya Rodriguez',
    'Nathan Taylor', 'Olivia Moore', 'Paul Jackson', 'Quinn White', 'Rachel Green',
    'Steve Rogers', 'Tina Turner', 'Uma Thurman', 'Victor Hugo', 'Wendy Adams',
  ];
  
  names.forEach((name, index) => {
    const role = mockRoles[index % mockRoles.length];
    const status = index < 20 ? 'active' : statuses[index % statuses.length];
    
    users.push({
      id: `user-${index + 1}`,
      email: name.toLowerCase().replace(' ', '.') + '@autorecon.com',
      name,
      username: name.toLowerCase().replace(' ', '.'),
      roleId: role.id,
      roleName: role.name,
      status,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      phone: index % 3 === 0 ? `+1-555-${String(index).padStart(4, '0')}` : undefined,
      department: departments[index % departments.length],
      lastLogin: status === 'active' && index < 20 
        ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
      createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'admin',
      mfaEnabled: index % 4 === 0,
      emailVerified: status !== 'pending',
    });
  });
  
  return users;
};

const mockUsers = generateMockUsers();

// Mock partners
const mockPartners: PartnerConfig[] = [
  {
    id: 'partner-1',
    name: 'Visa Merchant Services',
    code: 'VISA-MS',
    type: 'payment_processor',
    status: 'active',
    contactName: 'Sarah Johnson',
    contactEmail: 'sarah.j@visa.com',
    contactPhone: '+1-800-VISA-001',
    address: '900 Metro Center Blvd, Foster City, CA 94404',
    apiEndpoint: 'https://api.visa.com/merchant/v1',
    settlementFrequency: 'daily',
    currency: 'USD',
    timezone: 'America/Los_Angeles',
    feePercentage: 2.5,
    contractStartDate: '2024-01-01',
    contractEndDate: '2026-12-31',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'partner-2',
    name: 'PayPal Business',
    code: 'PAYPAL',
    type: 'payment_processor',
    status: 'active',
    contactName: 'Michael Chen',
    contactEmail: 'business@paypal.com',
    contactPhone: '+1-888-221-1161',
    address: '2211 North First Street, San Jose, CA 95131',
    apiEndpoint: 'https://api.paypal.com/v2',
    settlementFrequency: 'weekly',
    currency: 'USD',
    timezone: 'America/Los_Angeles',
    feePercentage: 2.9,
    contractStartDate: '2024-01-01',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'partner-3',
    name: 'Stripe Inc.',
    code: 'STRIPE',
    type: 'gateway',
    status: 'active',
    contactName: 'Emily White',
    contactEmail: 'partners@stripe.com',
    contactPhone: '+1-888-926-2289',
    apiEndpoint: 'https://api.stripe.com/v1',
    settlementFrequency: 'daily',
    currency: 'USD',
    timezone: 'America/Los_Angeles',
    feePercentage: 2.9,
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'partner-4',
    name: 'Square Payments',
    code: 'SQUARE',
    type: 'payment_processor',
    status: 'active',
    contactName: 'David Martinez',
    contactEmail: 'partnerships@squareup.com',
    apiEndpoint: 'https://api.squareup.com/v2',
    settlementFrequency: 'daily',
    currency: 'USD',
    timezone: 'America/Los_Angeles',
    feePercentage: 2.6,
    createdAt: '2024-03-01T00:00:00Z',
  },
  {
    id: 'partner-5',
    name: 'First National Bank',
    code: 'FNB',
    type: 'bank',
    status: 'active',
    contactName: 'Robert Taylor',
    contactEmail: 'corporate@fnb.com',
    contactPhone: '+1-800-555-2000',
    address: '100 Wall Street, New York, NY 10005',
    settlementFrequency: 'monthly',
    currency: 'USD',
    timezone: 'America/New_York',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'partner-6',
    name: 'Adyen NV',
    code: 'ADYEN',
    type: 'gateway',
    status: 'pending',
    contactEmail: 'sales@adyen.com',
    settlementFrequency: 'daily',
    currency: 'USD',
    timezone: 'Europe/Amsterdam',
    feePercentage: 2.8,
    createdAt: '2026-01-05T00:00:00Z',
  },
];

// Mock system config
const mockSystemConfig: SystemConfig[] = [
  // General Settings
  { id: 'cfg-1', category: 'General', key: 'app_name', value: 'AutoRecon', dataType: 'string', description: 'Application name', isSecret: false, isEditable: true, defaultValue: 'AutoRecon' },
  { id: 'cfg-2', category: 'General', key: 'company_name', value: 'ACME Corporation', dataType: 'string', description: 'Company name', isSecret: false, isEditable: true },
  { id: 'cfg-3', category: 'General', key: 'timezone', value: 'America/New_York', dataType: 'string', description: 'Default timezone', isSecret: false, isEditable: true, defaultValue: 'UTC' },
  { id: 'cfg-4', category: 'General', key: 'date_format', value: 'MM/DD/YYYY', dataType: 'string', description: 'Date display format', isSecret: false, isEditable: true, defaultValue: 'MM/DD/YYYY' },
  { id: 'cfg-5', category: 'General', key: 'currency', value: 'USD', dataType: 'string', description: 'Default currency', isSecret: false, isEditable: true, defaultValue: 'USD' },
  
  // Security
  { id: 'cfg-6', category: 'Security', key: 'session_timeout', value: '3600', dataType: 'number', description: 'Session timeout in seconds', isSecret: false, isEditable: true, defaultValue: '3600' },
  { id: 'cfg-7', category: 'Security', key: 'mfa_required', value: 'false', dataType: 'boolean', description: 'Require MFA for all users', isSecret: false, isEditable: true, defaultValue: 'false' },
  { id: 'cfg-8', category: 'Security', key: 'password_min_length', value: '8', dataType: 'number', description: 'Minimum password length', isSecret: false, isEditable: true, defaultValue: '8' },
  { id: 'cfg-9', category: 'Security', key: 'max_login_attempts', value: '5', dataType: 'number', description: 'Max failed login attempts', isSecret: false, isEditable: true, defaultValue: '5' },
  
  // Reconciliation
  { id: 'cfg-10', category: 'Reconciliation', key: 'auto_match_threshold', value: '0.95', dataType: 'number', description: 'Automatic matching confidence threshold', isSecret: false, isEditable: true, defaultValue: '0.90' },
  { id: 'cfg-11', category: 'Reconciliation', key: 'max_variance_amount', value: '10.00', dataType: 'number', description: 'Maximum acceptable variance', isSecret: false, isEditable: true, defaultValue: '5.00' },
  { id: 'cfg-12', category: 'Reconciliation', key: 'batch_size', value: '1000', dataType: 'number', description: 'Processing batch size', isSecret: false, isEditable: true, defaultValue: '1000' },
  
  // Email
  { id: 'cfg-13', category: 'Email', key: 'smtp_host', value: 'smtp.gmail.com', dataType: 'string', description: 'SMTP server hostname', isSecret: false, isEditable: true },
  { id: 'cfg-14', category: 'Email', key: 'smtp_port', value: '587', dataType: 'number', description: 'SMTP server port', isSecret: false, isEditable: true, defaultValue: '587' },
  { id: 'cfg-15', category: 'Email', key: 'smtp_username', value: 'notifications@autorecon.com', dataType: 'string', description: 'SMTP username', isSecret: false, isEditable: true },
  { id: 'cfg-16', category: 'Email', key: 'smtp_password', value: '********', dataType: 'string', description: 'SMTP password', isSecret: true, isEditable: true },
  { id: 'cfg-17', category: 'Email', key: 'from_email', value: 'noreply@autorecon.com', dataType: 'string', description: 'Default from email', isSecret: false, isEditable: true },
  
  // Integration
  { id: 'cfg-18', category: 'Integration', key: 'api_rate_limit', value: '100', dataType: 'number', description: 'API requests per minute', isSecret: false, isEditable: true, defaultValue: '100' },
  { id: 'cfg-19', category: 'Integration', key: 'webhook_timeout', value: '30', dataType: 'number', description: 'Webhook timeout in seconds', isSecret: false, isEditable: true, defaultValue: '30' },
  { id: 'cfg-20', category: 'Integration', key: 'api_key', value: '********', dataType: 'string', description: 'External API key', isSecret: true, isEditable: true },
];

export const adminService = {
  /**
   * Get admin statistics
   */
  getAdminStats: async (): Promise<AdminStats> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      totalUsers: mockUsers.length,
      activeUsers: mockUsers.filter(u => u.status === 'active').length,
      totalRoles: mockRoles.length,
      totalPartners: mockPartners.length,
      activePartners: mockPartners.filter(p => p.status === 'active').length,
      pendingUsers: mockUsers.filter(u => u.status === 'pending').length,
    };
  },

  // ========================================
  // User Management
  // ========================================

  /**
   * Get paginated list of users
   */
  getUsers: async (params: {
    page?: number;
    pageSize?: number;
    status?: string;
    roleId?: string;
    search?: string;
  }): Promise<PaginatedResponse<AdminUser>> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const { page = 1, pageSize = 10, status, roleId, search } = params;
    
    let filtered = [...mockUsers];
    
    if (status) {
      filtered = filtered.filter(user => user.status === status);
    }
    
    if (roleId) {
      filtered = filtered.filter(user => user.roleId === roleId);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.username.toLowerCase().includes(searchLower)
      );
    }
    
    const total = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = filtered.slice(startIndex, endIndex);
    
    return {
      items,
      total,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(total / pageSize),
    };
  },

  /**
   * Get a single user by ID
   */
  getUserById: async (id: string): Promise<AdminUser | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockUsers.find(user => user.id === id) || null;
  },

  /**
   * Create a new user
   */
  createUser: async (request: CreateUserRequest): Promise<AdminUser> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const role = mockRoles.find(r => r.id === request.roleId);
    
    const newUser: AdminUser = {
      id: `user-${mockUsers.length + 1}`,
      email: request.email,
      name: request.name,
      username: request.username,
      roleId: request.roleId,
      roleName: role?.name || 'Unknown Role',
      status: 'pending',
      phone: request.phone,
      department: request.department,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user',
      mfaEnabled: false,
      emailVerified: false,
    };
    
    mockUsers.unshift(newUser);
    
    return newUser;
  },

  /**
   * Update a user
   */
  updateUser: async (id: string, request: UpdateUserRequest): Promise<AdminUser> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = mockUsers.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    
    if (request.name) user.name = request.name;
    if (request.roleId) {
      user.roleId = request.roleId;
      const role = mockRoles.find(r => r.id === request.roleId);
      user.roleName = role?.name || user.roleName;
    }
    if (request.phone !== undefined) user.phone = request.phone;
    if (request.department !== undefined) user.department = request.department;
    if (request.status) user.status = request.status;
    if (request.mfaEnabled !== undefined) user.mfaEnabled = request.mfaEnabled;
    
    user.updatedAt = new Date().toISOString();
    
    return user;
  },

  /**
   * Delete a user
   */
  deleteUser: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      mockUsers.splice(index, 1);
    }
  },

  // ========================================
  // Role & Permissions
  // ========================================

  /**
   * Get all permissions
   */
  getPermissions: async (): Promise<Permission[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockPermissions;
  },

  /**
   * Get all roles
   */
  getRoles: async (): Promise<AdminRole[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockRoles;
  },

  /**
   * Get a single role by ID
   */
  getRoleById: async (id: string): Promise<AdminRole | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockRoles.find(role => role.id === id) || null;
  },

  /**
   * Create a new role
   */
  createRole: async (request: CreateRoleRequest): Promise<AdminRole> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newRole: AdminRole = {
      id: `role-${mockRoles.length + 1}`,
      name: request.name,
      description: request.description,
      permissionIds: request.permissionIds,
      userCount: 0,
      isSystem: false,
      createdAt: new Date().toISOString(),
    };
    
    mockRoles.push(newRole);
    
    return newRole;
  },

  /**
   * Update a role
   */
  updateRole: async (id: string, request: UpdateRoleRequest): Promise<AdminRole> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const role = mockRoles.find(r => r.id === id);
    if (!role) throw new Error('Role not found');
    if (role.isSystem) throw new Error('Cannot modify system role');
    
    if (request.name) role.name = request.name;
    if (request.description) role.description = request.description;
    if (request.permissionIds) role.permissionIds = request.permissionIds;
    
    role.updatedAt = new Date().toISOString();
    
    return role;
  },

  /**
   * Delete a role
   */
  deleteRole: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const role = mockRoles.find(r => r.id === id);
    if (role?.isSystem) throw new Error('Cannot delete system role');
    
    const index = mockRoles.findIndex(r => r.id === id);
    if (index !== -1) {
      mockRoles.splice(index, 1);
    }
  },

  // ========================================
  // Partner Management
  // ========================================

  /**
   * Get paginated list of partners
   */
  getPartners: async (params: {
    page?: number;
    pageSize?: number;
    status?: string;
    type?: string;
    search?: string;
  }): Promise<PaginatedResponse<PartnerConfig>> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const { page = 1, pageSize = 10, status, type, search } = params;
    
    let filtered = [...mockPartners];
    
    if (status) {
      filtered = filtered.filter(partner => partner.status === status);
    }
    
    if (type) {
      filtered = filtered.filter(partner => partner.type === type);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(partner =>
        partner.name.toLowerCase().includes(searchLower) ||
        partner.code.toLowerCase().includes(searchLower)
      );
    }
    
    const total = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = filtered.slice(startIndex, endIndex);
    
    return {
      items,
      total,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(total / pageSize),
    };
  },

  /**
   * Get a single partner by ID
   */
  getPartnerById: async (id: string): Promise<PartnerConfig | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockPartners.find(partner => partner.id === id) || null;
  },

  /**
   * Create a new partner
   */
  createPartner: async (request: CreatePartnerRequest): Promise<PartnerConfig> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newPartner: PartnerConfig = {
      id: `partner-${mockPartners.length + 1}`,
      ...request,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    mockPartners.push(newPartner);
    
    return newPartner;
  },

  /**
   * Update a partner
   */
  updatePartner: async (id: string, request: UpdatePartnerRequest): Promise<PartnerConfig> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const partner = mockPartners.find(p => p.id === id);
    if (!partner) throw new Error('Partner not found');
    
    Object.assign(partner, request);
    partner.updatedAt = new Date().toISOString();
    
    return partner;
  },

  /**
   * Delete a partner
   */
  deletePartner: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockPartners.findIndex(p => p.id === id);
    if (index !== -1) {
      mockPartners.splice(index, 1);
    }
  },

  // ========================================
  // System Configuration
  // ========================================

  /**
   * Get all system configuration parameters
   */
  getSystemConfig: async (category?: string): Promise<SystemConfig[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (category) {
      return mockSystemConfig.filter(cfg => cfg.category === category);
    }
    
    return mockSystemConfig;
  },

  /**
   * Get configuration categories
   */
  getConfigCategories: async (): Promise<string[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return Array.from(new Set(mockSystemConfig.map(cfg => cfg.category)));
  },

  /**
   * Update a configuration parameter
   */
  updateConfig: async (id: string, value: string): Promise<SystemConfig> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const config = mockSystemConfig.find(cfg => cfg.id === id);
    if (!config) throw new Error('Config not found');
    if (!config.isEditable) throw new Error('Config is not editable');
    
    config.value = value;
    config.updatedAt = new Date().toISOString();
    config.updatedBy = 'current-user';
    
    return config;
  },
};
