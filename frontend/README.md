# AutoRecon V2 Frontend

Enterprise-grade reconciliation system frontend built with React, TypeScript, and Vite.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **TailwindCSS** - Utility-first styling
- **Shadcn UI** - Component library
- **React Query** - Data fetching & caching
- **Zustand** - State management
- **React Router 6** - Client-side routing
- **Axios** - HTTP client
- **Vitest** - Testing framework

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/          # Layout components (Sidebar, TopBar)
│   │   ├── theme/           # Theme provider & toggle
│   │   └── ui/              # Reusable UI components (Shadcn)
│   ├── pages/
│   │   ├── auth/            # Authentication pages
│   │   ├── dashboard/       # Dashboard
│   │   ├── ingestion/       # Data ingestion
│   │   ├── rules/           # Rule engine
│   │   ├── matching/        # Record matching
│   │   ├── exceptions/      # Exception management
│   │   ├── workflow/        # Approvals
│   │   ├── settlement/      # Settlement operations
│   │   ├── gl-posting/      # GL journal posting
│   │   ├── reports/         # Reporting
│   │   ├── audit/           # Audit logs
│   │   └── admin/           # Admin panel
│   ├── layouts/             # Page layouts
│   ├── services/            # API service layer
│   ├── stores/              # Zustand stores
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities & helpers
│   ├── types/               # TypeScript type definitions
│   └── routes/              # Route configuration
├── public/
└── tests/
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Environment Variables

Create a `.env` file:

```
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=AutoRecon V2
VITE_APP_VERSION=2.0.0
VITE_ENABLE_DEVTOOLS=true
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Generate coverage report

## Features

### Core Modules

1. **Authentication**
   - Login with email/password
   - Multi-factor authentication (MFA)
   - Password reset flow

2. **Dashboard**
   - KPI cards (reconciliation stats)
   - Recent activity feed
   - Quick actions

3. **Data Ingestion**
   - File upload (CSV, Excel, JSON)
   - Job status tracking
   - Drag & drop support

4. **Rule Engine**
   - Create/edit matching rules
   - Rule priority management
   - Activate/deactivate rules

5. **Matching**
   - View matched records
   - Handle unmatched records
   - Match rate analytics

6. **Exception Management**
   - Exception queue
   - Severity-based filtering
   - Comment threads
   - Assignment workflow

7. **Approvals**
   - Maker-checker workflow
   - Pending approvals queue

8. **Settlement**
   - Settlement batches
   - Amount calculations

9. **GL Posting**
   - Journal entry management
   - Approval workflow

10. **Reports**
    - Report library
    - Scheduled reports
    - Export functionality

11. **Audit Log**
    - Activity tracking
    - Compliance logging

12. **Admin**
    - User management
    - Role & permission management
    - Partner configuration
    - System settings

### UI Features

- **Dark/Light Mode** - System-aware theme switching
- **Responsive Design** - Mobile, tablet, and desktop support
- **Collapsible Sidebar** - Space-optimized navigation
- **Toast Notifications** - User feedback system
- **Loading States** - Skeleton loaders
- **Error Handling** - Graceful error states

## API Integration

All API calls are centralized in the `services/` directory:

```typescript
// Example usage
import { dashboardService } from '@/services/dashboardService';

const { data } = useQuery({
  queryKey: ['dashboard-stats'],
  queryFn: dashboardService.getStats,
});
```

API client automatically handles:
- Authentication tokens
- Request/response interceptors
- Error handling
- Retry logic

## State Management

Uses Zustand for global state:

```typescript
// Auth store
import { useAuthStore } from '@/stores/authStore';

const { user, isAuthenticated, logout } = useAuthStore();
```

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm run test:coverage
```

## Building for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

## Code Style

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for formatting (recommended)
- **Functional components** with hooks
- **Composition over inheritance**

## Performance Optimizations

- Code splitting via React Router
- Lazy loading of routes
- React Query caching
- Optimized bundle size
- Tree shaking

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Proprietary - AutoRecon V2 Enterprise System
