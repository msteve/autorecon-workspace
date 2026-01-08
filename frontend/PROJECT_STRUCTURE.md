# AutoRecon V2 Frontend - Project Structure

## Complete File Tree

```
frontend/
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── .env.example
├── .gitignore
├── README.md
│
├── src/
│   ├── main.tsx                    # Application entry point
│   ├── App.tsx                     # Root component
│   ├── index.css                   # Global styles with Tailwind
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx         # Main navigation sidebar
│   │   │   └── TopBar.tsx          # Top navigation bar
│   │   ├── theme/
│   │   │   ├── ThemeProvider.tsx   # Theme context provider
│   │   │   └── ThemeToggle.tsx     # Dark/light mode toggle
│   │   └── ui/                     # Shadcn UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── scroll-area.tsx
│   │       ├── toast.tsx
│   │       ├── toaster.tsx
│   │       └── __tests__/          # Component tests
│   │           ├── button.test.tsx
│   │           ├── card.test.tsx
│   │           └── input.test.tsx
│   │
│   ├── layouts/
│   │   ├── AuthLayout.tsx          # Layout for auth pages
│   │   └── DashboardLayout.tsx     # Main app layout
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── MFAPage.tsx
│   │   │   └── ForgotPasswordPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── ingestion/
│   │   │   ├── IngestionListPage.tsx
│   │   │   └── IngestionUploadPage.tsx
│   │   ├── rules/
│   │   │   ├── RuleEngineListPage.tsx
│   │   │   └── RuleEditorPage.tsx
│   │   ├── matching/
│   │   │   ├── MatchingDashboardPage.tsx
│   │   │   ├── MatchedRecordsPage.tsx
│   │   │   └── UnmatchedRecordsPage.tsx
│   │   ├── exceptions/
│   │   │   ├── ExceptionsQueuePage.tsx
│   │   │   └── ExceptionDetailPage.tsx
│   │   ├── workflow/
│   │   │   └── ApprovalsPage.tsx
│   │   ├── settlement/
│   │   │   ├── SettlementDashboardPage.tsx
│   │   │   └── SettlementBatchesPage.tsx
│   │   ├── gl-posting/
│   │   │   ├── GLPostingListPage.tsx
│   │   │   └── GLJournalDetailPage.tsx
│   │   ├── reports/
│   │   │   ├── ReportsListPage.tsx
│   │   │   └── ReportSchedulerPage.tsx
│   │   ├── audit/
│   │   │   └── AuditLogPage.tsx
│   │   └── admin/
│   │       ├── UsersPage.tsx
│   │       ├── RolesPage.tsx
│   │       ├── PartnersPage.tsx
│   │       └── SystemConfigPage.tsx
│   │
│   ├── routes/
│   │   └── index.tsx               # Route configuration
│   │
│   ├── services/
│   │   ├── apiClient.ts            # Axios HTTP client
│   │   ├── authService.ts          # Authentication API
│   │   ├── dashboardService.ts     # Dashboard API
│   │   ├── ingestionService.ts     # Data ingestion API
│   │   ├── ruleService.ts          # Rule engine API
│   │   └── exceptionService.ts     # Exception management API
│   │
│   ├── stores/
│   │   ├── authStore.ts            # Authentication state
│   │   ├── notificationStore.ts    # Notifications state
│   │   └── uiStore.ts              # UI state
│   │
│   ├── hooks/
│   │   └── use-toast.ts            # Toast notification hook
│   │
│   ├── lib/
│   │   ├── utils.ts                # Utility functions
│   │   └── __tests__/
│   │       └── utils.test.ts
│   │
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   │
│   └── test/
│       └── setup.ts                # Test setup & configuration
```

## Module Breakdown

### 1. Authentication Module
- **Pages**: Login, MFA, Forgot Password
- **Features**: Email/password login, 2FA, password reset
- **Store**: authStore.ts
- **Service**: authService.ts

### 2. Dashboard Module
- **Pages**: Dashboard overview
- **Features**: KPI cards, charts, recent activity, quick actions
- **Service**: dashboardService.ts

### 3. Ingestion Module
- **Pages**: List view, Upload page
- **Features**: File upload (drag & drop), job tracking, progress indicators
- **Service**: ingestionService.ts

### 4. Rule Engine Module
- **Pages**: List view, Rule editor
- **Features**: Create/edit rules, priority management, activate/deactivate
- **Service**: ruleService.ts

### 5. Matching Module
- **Pages**: Dashboard, Matched records, Unmatched records
- **Features**: Match rate analytics, record comparison
- **Service**: (To be implemented)

### 6. Exception Management Module
- **Pages**: Queue view, Detail view
- **Features**: Exception filtering, severity levels, comments, assignment
- **Service**: exceptionService.ts

### 7. Workflow/Approvals Module
- **Pages**: Approvals queue
- **Features**: Maker-checker workflow, approval actions

### 8. Settlement Module
- **Pages**: Dashboard, Batches
- **Features**: Settlement calculations, batch management

### 9. GL Posting Module
- **Pages**: Journal list, Journal detail
- **Features**: Journal entry management, approval workflow

### 10. Reports Module
- **Pages**: Reports list, Scheduler
- **Features**: Report library, scheduling, exports

### 11. Audit Log Module
- **Pages**: Audit trail
- **Features**: Activity tracking, compliance logging

### 12. Admin Module
- **Pages**: Users, Roles, Partners, System Config
- **Features**: User management, RBAC, partner config, settings

## Key Design Patterns

### 1. Service Layer Pattern
All API calls are abstracted into service modules:
```typescript
// services/dashboardService.ts
export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    return apiClient.get<DashboardStats>('/dashboard/stats');
  },
};
```

### 2. Component Composition
Reusable UI components built with Radix UI primitives:
```typescript
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### 3. State Management
Zustand stores for global state:
```typescript
export const useAuthStore = create<AuthState>()(...);
```

### 4. Type Safety
Comprehensive TypeScript types:
```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}
```

### 5. Custom Hooks
Reusable logic extraction:
```typescript
export function useToast() {
  // Toast notification logic
}
```

## Next Steps for Development

1. **Enhance Existing Pages**: Add data tables, filters, and advanced features
2. **Complete Service Layer**: Implement remaining API service methods
3. **Add More Components**: Data tables, charts, forms
4. **Implement WebSocket**: Real-time updates for jobs/notifications
5. **Add More Tests**: Increase test coverage to 80%+
6. **Error Boundaries**: Graceful error handling
7. **Performance**: Code splitting, lazy loading optimization
8. **Accessibility**: ARIA labels, keyboard navigation

## Development Workflow

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Run tests: `npm test`
4. Build for production: `npm run build`
5. Preview production: `npm run preview`

## API Integration

All pages are ready to integrate with Django backend:
- API base URL configured in `.env`
- Axios interceptors handle auth tokens
- React Query manages caching and refetching
- TypeScript types match expected API responses

## Testing Strategy

- **Unit Tests**: UI components (Button, Card, Input)
- **Integration Tests**: Page-level functionality
- **Utility Tests**: Helper functions
- **E2E Tests**: (To be implemented with Playwright/Cypress)
