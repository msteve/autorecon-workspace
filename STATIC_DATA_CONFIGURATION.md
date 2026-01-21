# Static Mock Data Configuration

## Overview

All services in the AutoRecon application are configured to use **static mock data** as a fallback when the backend is unavailable. This ensures the frontend can be developed, tested, and demonstrated independently of backend availability.

## Configuration

The mock data system is controlled by the `VITE_USE_MOCK_DATA` environment variable in the `.env` file:

```bash
# Use static mock data (default)
VITE_USE_MOCK_DATA=true

# Attempt to connect to real backend API
VITE_USE_MOCK_DATA=false
```

## How It Works

### Service Layer Architecture

Each service file includes:

1. **USE_MOCK_DATA flag**: Reads from environment variable
2. **Console logging**: Indicates when mock data is active
3. **Static mock data**: Comprehensive fallback datasets
4. **Conditional execution**: Returns mock data or makes API calls

### Example Implementation

```typescript
// Use static mock data when backend is unavailable
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
if (USE_MOCK_DATA) {
  console.info('📊 Service: Using static mock data (backend unavailable)');
}

export const service = {
  async getData() {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockData;
    }
    return apiClient.get('/api/data');
  }
};
```

## Services with Static Data

All services are equipped with comprehensive mock data:

### ✅ Ingestion Service
- **Icon**: 📊
- **Mock Data**: 25 ingestion jobs with various statuses
- **Features**: File upload simulation, progress tracking, error reports
- **Delay**: 300-1500ms to simulate network latency

### ✅ Auth Service
- **Icon**: 🔐
- **Mock Data**: 4 user accounts (admin, reconciler, approver, viewer)
- **Features**: Login, MFA, token generation, permissions
- **Credentials**: All passwords are `password123`
- **Delay**: 800ms for login

### ✅ Dashboard Service
- **Icon**: 📈
- **Mock Data**: KPI stats, variance data, partner performance, alerts
- **Features**: Real-time-like data with random variations
- **Delay**: 200-600ms

### ✅ Matching Service
- **Icon**: 🔄
- **Mock Data**: 50+ transactions with various match statuses
- **Features**: Match/unmatch operations, confidence scoring
- **Delay**: 300-800ms

### ✅ Exceptions Service
- **Icon**: ⚠️
- **Mock Data**: 50+ exceptions with SLA tracking
- **Features**: Comments, attachments, assignments, status changes
- **Delay**: 300-600ms

### ✅ Approval Service
- **Icon**: ✅
- **Mock Data**: 40 approval requests across 5 types
- **Features**: Approve/reject, comments, approval chains
- **Delay**: 300-800ms

### ✅ Settlement Service
- **Icon**: 💰
- **Mock Data**: 15 settlement runs with partner details
- **Features**: Settlement creation, approval, file generation
- **Delay**: 400-1000ms

### ✅ GL Posting Service
- **Icon**: 📒
- **Mock Data**: 40 journal batches with entries
- **Features**: Batch approval, posting, suspense handling
- **Delay**: 300-800ms

### ✅ Admin Service
- **Icon**: 👥
- **Mock Data**: 25 users, 5 roles, 39 permissions, 6 partners, 20 configs
- **Features**: User/role/partner management, system configuration
- **Delay**: 300-600ms

### ✅ Rule Engine Service
- **Icon**: 📋
- **Mock Data**: 20+ reconciliation rules
- **Features**: Rule CRUD, activation, versioning
- **Delay**: 300-600ms

### ✅ Rule Service (Legacy)
- **Icon**: 📋
- **Mock Data**: 2 basic rules
- **Features**: Basic rule operations
- **Delay**: 200-300ms

### ✅ Exception Service (Legacy)
- **Icon**: ⚠️
- **Mock Data**: 2 basic exceptions
- **Features**: Basic exception operations
- **Delay**: 200-300ms

## Console Indicators

When the application loads with mock data enabled, you'll see console messages like:

```
📊 Ingestion Service: Using static mock data (backend unavailable)
🔐 Auth Service: Using static mock data (backend unavailable)
📈 Dashboard Service: Using static mock data (backend unavailable)
🔄 Matching Service: Using static mock data (backend unavailable)
⚠️ Exceptions Service: Using static mock data (backend unavailable)
✅ Approval Service: Using static mock data (backend unavailable)
💰 Settlement Service: Using static mock data (backend unavailable)
📒 GL Posting Service: Using static mock data (backend unavailable)
👥 Admin Service: Using static mock data (backend unavailable)
📋 Rule Engine Service: Using static mock data (backend unavailable)
```

## Development Workflow

### Frontend-Only Development (Default)

```bash
# Ensure mock data is enabled
echo "VITE_USE_MOCK_DATA=true" > .env

# Start the dev server
npm run dev
```

All services will use static mock data. Perfect for:
- UI/UX development
- Component testing
- Demo presentations
- Frontend-only testing

### Full-Stack Development

```bash
# Disable mock data to use real backend
echo "VITE_USE_MOCK_DATA=false" > .env

# Start backend (in another terminal)
cd backend
python manage.py runserver

# Start frontend
npm run dev
```

Services will attempt real API calls. If backend is unavailable, requests will fail.

### Hybrid Mode (Recommended for Development)

Keep `VITE_USE_MOCK_DATA=true` but selectively test backend endpoints:

1. Develop frontend with mock data
2. When backend endpoint is ready, temporarily set flag to `false`
3. Test specific integration
4. Return flag to `true` for continued development

## Mock Data Characteristics

### Realistic Data Generation
- **Dates**: Recent timestamps with logical progression
- **Numbers**: Realistic ranges and distributions
- **Status**: Proper state transitions
- **Relationships**: Consistent foreign keys and references

### Simulated Delays
All mock services include artificial delays (200-1500ms) to:
- Simulate network latency
- Test loading states
- Prevent race conditions
- Make the experience realistic

### Error Scenarios
Mock data includes various error cases:
- Failed jobs
- Validation errors
- Locked resources
- Pending approvals
- SLA violations

### Data Variety
- **Users**: 4-25 users with different roles
- **Transactions**: 50-100+ records per service
- **Statuses**: Multiple states (pending, processing, completed, failed)
- **Types**: Various categories and classifications
- **Time ranges**: Recent data spanning days to weeks

## Benefits

### 1. **Independent Development**
Frontend team can work without backend availability

### 2. **Faster Iteration**
No need to set up/maintain backend for UI work

### 3. **Consistent Testing**
Same dataset across all environments

### 4. **Demo-Ready**
Always have working data for presentations

### 5. **Offline Capability**
Application works without network/backend

### 6. **Reduced Errors**
No backend connection failures during development

### 7. **Cost Savings**
No need for dev backend infrastructure

## Mock Data Patterns

### Pagination Support
```typescript
async getJobs(page = 1, pageSize = 10) {
  if (USE_MOCK_DATA) {
    return {
      items: allJobs.slice((page - 1) * pageSize, page * pageSize),
      total: allJobs.length,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(allJobs.length / pageSize),
    };
  }
  // Real API call...
}
```

### Filtering Support
```typescript
async getExceptions(filters) {
  if (USE_MOCK_DATA) {
    let filtered = mockExceptions;
    if (filters.status) {
      filtered = filtered.filter(e => e.status === filters.status);
    }
    if (filters.search) {
      filtered = filtered.filter(e => 
        e.title.includes(filters.search)
      );
    }
    return filtered;
  }
  // Real API call...
}
```

### CRUD Operations
```typescript
async createJob(data) {
  if (USE_MOCK_DATA) {
    const newJob = {
      id: `job-${Date.now()}`,
      ...data,
      createdAt: new Date()
    };
    mockJobs.unshift(newJob);
    return newJob;
  }
  // Real API call...
}
```

### State Management
```typescript
async updateStatus(id, status) {
  if (USE_MOCK_DATA) {
    const item = mockData.find(i => i.id === id);
    if (item) {
      item.status = status;
      item.updatedAt = new Date();
    }
    return item;
  }
  // Real API call...
}
```

## Transitioning to Real Backend

When backend becomes available:

1. **Gradual Migration**: Keep `USE_MOCK_DATA=true` by default
2. **Service-by-Service**: Test one service at a time
3. **Fallback Safety**: Keep mock data code for offline capability
4. **Environment-Specific**: Use `.env.production` vs `.env.development`

### Production Configuration

```bash
# .env.production
VITE_USE_MOCK_DATA=false
VITE_API_URL=https://api.autorecon.com
```

### Development Configuration

```bash
# .env.development
VITE_USE_MOCK_DATA=true
VITE_API_URL=http://localhost:8000
```

## Troubleshooting

### Issue: Mock data not loading
**Solution**: Check `.env` file exists and contains `VITE_USE_MOCK_DATA=true`

### Issue: Changes to .env not taking effect
**Solution**: Restart the Vite dev server (Vite doesn't hot-reload env vars)

### Issue: Need different mock data
**Solution**: Edit the mock data generators in respective service files

### Issue: Want to test specific backend endpoint
**Solution**: Temporarily set `USE_MOCK_DATA=false`, test, then revert

## Best Practices

1. ✅ **Keep mock data realistic**: Use proper formats, ranges, and relationships
2. ✅ **Include edge cases**: Errors, empty states, extreme values
3. ✅ **Maintain consistency**: IDs, references, and states should be logical
4. ✅ **Add variety**: Different statuses, types, and scenarios
5. ✅ **Simulate delays**: Include realistic network latency
6. ✅ **Update regularly**: Keep mock data in sync with API changes
7. ✅ **Document data**: Comment mock data structures and purposes
8. ✅ **Version control**: Commit `.env.example`, ignore `.env`

## Related Files

- `/frontend/.env` - Environment configuration (gitignored)
- `/frontend/.env.example` - Template environment file (committed)
- `/frontend/src/services/*.ts` - All service files with mock data
- `/frontend/src/types/index.ts` - TypeScript type definitions

## Support

For questions about mock data:
1. Check this documentation
2. Review service file implementations
3. Examine mock data generators
4. Check console for service initialization messages

---

**Last Updated**: January 2026  
**Status**: ✅ All services configured with static mock data  
**Coverage**: 12 services, 100% mock data support
