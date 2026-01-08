# Dashboard Module

## Overview

The Dashboard module provides a comprehensive real-time overview of the AutoReconV2 Enterprise Reconciliation System. It displays key performance indicators (KPIs), charts for variance analysis and partner performance, system alerts, and recent batch processing information.

## Features

### 1. KPI Cards
Four primary metrics displayed at the top:
- **Total Transactions**: Total number of transactions processed this month with trend indicator
- **Match Rate**: Percentage of successfully matched transactions (with count)
- **Active Exceptions**: Number of exceptions requiring attention
- **Pending Settlements**: Number of settlements awaiting approval

Each KPI card includes:
- Icon with custom color coding
- Primary value display
- Optional subtitle for additional context
- Trend indicator (percentage change vs. last month)
- Loading skeleton for better UX

### 2. Daily Variance Chart
A line chart showing the 7-day reconciliation variance trend:
- **Variance Line**: Actual daily variance amounts (blue)
- **Threshold Line**: Configured variance threshold (red dashed)
- Custom tooltip with currency formatting
- Responsive design for all screen sizes
- Empty state when no data available

### 3. Partner Performance Chart
A stacked bar chart displaying transaction status by partner:
- **Matched**: Successfully matched transactions (green)
- **Unmatched**: Unmatched transactions requiring review (yellow)
- **Exceptions**: Transactions with exceptions (red)
- Angled X-axis labels for readability
- Custom tooltip with transaction counts
- Responsive container

### 4. Alerts Widget
System alerts with severity levels:
- **Error**: Critical issues requiring immediate attention (red border)
- **Warning**: Important issues to review (amber border)
- **Info**: Informational messages (blue border)

Features:
- Dismiss functionality for each alert
- Optional action buttons
- Timestamp display (relative time)
- Empty state when no alerts
- Auto-refresh every 60 seconds

### 5. Recent Batches Widget
Display of recently processed reconciliation batches:
- Batch number and status badge
- Record counts (total, matched, unmatched, exceptions)
- Processing time for completed batches
- Error messages for failed batches
- View details button for each batch
- Empty state with call-to-action

### 6. Quick Actions
Four quick-access buttons for common tasks:
- Upload New File
- Review Exceptions
- Pending Approvals
- Generate Report

## Component Structure

```
dashboard/
├── DashboardPage.tsx              # Main page container
├── KPICard.tsx                    # Reusable KPI metric card
├── DailyVarianceChart.tsx         # Variance trend chart
├── PartnerPerformanceChart.tsx    # Partner performance chart
├── AlertsWidget.tsx               # System alerts display
├── RecentBatchesWidget.tsx        # Recent batches display
└── __tests__/                     # Component tests
    ├── DashboardPage.test.tsx
    ├── KPICard.test.tsx
    ├── AlertsWidget.test.tsx
    ├── RecentBatchesWidget.test.tsx
    ├── DailyVarianceChart.test.tsx
    └── PartnerPerformanceChart.test.tsx
```

## Data Flow

### React Query Integration
All data fetching uses React Query for:
- Automatic caching
- Background refetching
- Loading and error states
- Optimistic updates

### Query Keys
```typescript
'dashboard-stats'      // KPI statistics (refetch every 30s)
'dashboard-variance'   // Daily variance data
'dashboard-partners'   // Partner performance data
'dashboard-alerts'     // System alerts (refetch every 60s)
'dashboard-batches'    // Recent batch information
```

### Mock API
The `dashboardService` provides mock data generators for development:
- `getStats()` - Returns KPI statistics with trends
- `getDailyVariance()` - Returns 7 days of variance data
- `getPartnerPerformance()` - Returns data for 5 partners
- `getAlerts()` - Returns 3 sample alerts
- `getRecentBatches()` - Returns 4 recent batch records
- `dismissAlert(id)` - Removes an alert

All service methods include simulated API delays (300-800ms) for realistic behavior.

## Usage

### Basic Import
```typescript
import DashboardPage from '@/pages/dashboard/DashboardPage';
```

### Individual Components
```typescript
import { KPICard } from '@/components/dashboard/KPICard';
import { DailyVarianceChart } from '@/components/dashboard/DailyVarianceChart';
import { AlertsWidget } from '@/components/dashboard/AlertsWidget';

// Example: KPI Card
<KPICard
  title="Total Transactions"
  value="125,430"
  subtitle="This month"
  icon={Activity}
  iconColor="text-blue-600"
  trend={{
    value: '8.3%',
    isPositive: true,
    label: 'vs last month'
  }}
/>

// Example: Alerts Widget
<AlertsWidget
  alerts={alerts}
  onDismiss={(id) => handleDismiss(id)}
  loading={isLoading}
/>
```

## TypeScript Interfaces

### DashboardStats
```typescript
interface DashboardStats {
  totalTransactions: number;
  matchedPercentage: number;
  exceptionsCount: number;
  settlementsPending: number;
  trends: {
    transactions: { value: string; isPositive: boolean };
    matchRate: { value: string; isPositive: boolean };
    exceptions: { value: string; isPositive: boolean };
    settlements: { value: string; isPositive: boolean };
  };
}
```

### DailyVarianceData
```typescript
interface DailyVarianceData {
  date: string;
  variance: number;
  threshold: number;
}
```

### PartnerPerformanceData
```typescript
interface PartnerPerformanceData {
  partner: string;
  matched: number;
  unmatched: number;
  exceptions: number;
}
```

### DashboardAlert
```typescript
interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  actionLabel?: string;
  onAction?: () => void;
}
```

### RecentBatchData
```typescript
interface RecentBatch {
  id: string;
  batchNumber: string;
  status: 'completed' | 'processing' | 'failed';
  uploadedAt: Date;
  processedAt?: Date;
  recordCount: number;
  matchedCount: number;
  unmatchedCount: number;
  exceptionCount: number;
  processingTimeMs?: number;
  errorMessage?: string;
}
```

## Responsive Design

The dashboard adapts to different screen sizes:

### Mobile (< 768px)
- KPI cards stack vertically
- Charts display full-width
- Widgets stack vertically
- Quick actions in single column

### Tablet (768px - 1024px)
- KPI cards in 2-column grid
- Charts in 2-column layout
- Widgets in 2-column layout
- Quick actions in 2-column grid

### Desktop (> 1024px)
- KPI cards in 4-column grid
- Charts side-by-side (2 columns)
- Widgets in 7-column grid (3:4 ratio)
- Quick actions in 4-column grid

## Testing

### Running Tests
```bash
# Run all dashboard tests
npm test -- dashboard

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### Test Coverage
- **KPICard**: 12 test cases
  - Rendering with different props
  - Loading states
  - Trend indicators
  - Icon colors

- **AlertsWidget**: 11 test cases
  - Alert rendering
  - Dismissal functionality
  - Action buttons
  - Empty states
  - Styling by type

- **RecentBatchesWidget**: 14 test cases
  - Batch display
  - Status badges
  - Processing time formatting
  - Error messages
  - View details interaction

- **DailyVarianceChart**: 7 test cases
  - Chart rendering
  - Loading states
  - Empty states
  - Data visualization

- **PartnerPerformanceChart**: 8 test cases
  - Chart rendering
  - Loading states
  - Empty states
  - Legend display

- **DashboardPage**: 16 test cases
  - Page rendering
  - Data fetching
  - Refresh functionality
  - Alert dismissal
  - Error handling
  - Quick actions

## Performance Optimization

1. **React Query Caching**: Data is cached and reused across renders
2. **Background Refetching**: Stats and alerts auto-refresh without blocking UI
3. **Code Splitting**: Dashboard components loaded on-demand
4. **Memoization**: Charts use React.memo to prevent unnecessary re-renders
5. **Responsive Charts**: Recharts automatically handles resize events

## Accessibility

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly
- Color contrast compliance (WCAG AA)
- Loading states announced to screen readers

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- `react` ^18.2.0
- `react-query` ^5.17.19
- `recharts` ^2.10.4
- `lucide-react` ^0.309.0
- `date-fns` ^3.2.0

## Future Enhancements

1. **Customizable Dashboard**: Allow users to rearrange widgets
2. **Date Range Selector**: Filter data by custom date ranges
3. **Export Functionality**: Export dashboard data as PDF/Excel
4. **Real-time WebSocket Updates**: Push updates for critical alerts
5. **Drill-down Views**: Click charts to view detailed data
6. **Custom Thresholds**: User-configurable variance thresholds
7. **Dashboard Templates**: Pre-configured layouts for different roles

## Troubleshooting

### Charts not rendering
- Ensure Recharts is installed: `npm install recharts`
- Check browser console for errors
- Verify data format matches interfaces

### Data not loading
- Check network tab for API calls
- Verify React Query is properly configured
- Check mock service is returning data

### Slow performance
- Check React DevTools for unnecessary re-renders
- Verify refetch intervals aren't too aggressive
- Consider implementing virtualization for large data sets

## Contributing

When adding new features to the Dashboard:
1. Create component in `src/components/dashboard/`
2. Add TypeScript interfaces in component file
3. Create comprehensive tests in `__tests__/` directory
4. Update this README with new features
5. Ensure responsive design works on all breakpoints
6. Add accessibility features (ARIA labels, keyboard support)
