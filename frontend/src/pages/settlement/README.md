# Settlement Module

Complete settlement management system for handling partner settlements, payment processing, and financial reconciliation.

## Overview

The Settlement Module provides comprehensive functionality for:
- Creating and managing settlement runs
- Reviewing settlement summaries and partner breakdowns
- Processing payments to partners
- Tracking settlement status and reconciliation
- Analyzing partner settlement details

## Features

### 1. Settlement Run List
- View all settlement runs with pagination
- Filter by status (draft, pending, approved, processing, completed, failed)
- Search by run ID, partner name, or reference
- Real-time statistics dashboard showing:
  - Total Settled Amount
  - Pending Settlements
  - Average Settlement Time
  - Active Partners
- Quick actions to create new settlements
- Navigation to individual settlement details

### 2. Create Settlement Run
- Configure settlement parameters:
  - Date range selection (start and end dates)
  - Quick presets (Last Week, Last Month, Last Quarter)
  - Payment method (Bank Transfer, ACH, Wire, Check)
  - Optional notes
- Automatic validation of date ranges
- Preview settlement calculations before creation
- Success confirmation with navigation to settlement summary

### 3. Settlement Summary
- Comprehensive overview of settlement run:
  - Key metrics (total transactions, net amount, partner count)
  - Status and timeline information
  - Settlement period and payment method
- Three-tab interface:
  - **Overview**: Financial breakdown and partner type grouping
  - **Breakdown**: Detailed partner-by-partner table with:
    - Partner names and types
    - Transaction counts
    - Gross amounts, fees, adjustments, and net amounts
    - Status indicators
    - Click-through to partner details
  - **Details**: Run configuration, tracking info, dates
- Action buttons for status progression:
  - Approve settlement (draft → approved)
  - Process settlement (approved → processing)
  - Complete settlement (processing → completed)

### 4. Partner Settlement Breakdown
- Detailed view of individual partner settlements:
  - Partner information (name, type, contact)
  - Settlement calculation breakdown:
    - Gross Amount
    - Processing Fees
    - Adjustments (with reason)
    - Net Amount
  - Payment details (method, account, status)
  - Comprehensive transaction table with:
    - Filtering by transaction type (all, payment, refund, chargeback, fee, adjustment)
    - Sortable columns (date, type, reference, amount, status)
    - Transaction details and metadata
    - Status indicators
  - Transaction summary statistics

## Components

### SettlementStatusBadge
Status indicator for settlement runs and partners.

**Props:**
```typescript
{
  status: 'draft' | 'pending_approval' | 'approved' | 'processing' | 
          'completed' | 'failed' | 'cancelled' | 'partially_paid' | 
          'paid' | 'reconciled' | 'disputed'
}
```

**Features:**
- Color-coded status display
- Consistent visual language
- 11 different status states

### PartnerBreakdownTable
Comprehensive table component for partner settlement data.

**Props:**
```typescript
{
  partners: PartnerSettlement[]
  onPartnerClick: (partner: PartnerSettlement) => void
}
```

**Features:**
- Sortable columns
- Formatted currency display
- Transaction count summaries
- Status badges
- Clickable rows for drill-down
- Automatic totals calculation
- Empty state handling

## Types

### SettlementRun
Main settlement run entity.

```typescript
{
  id: string
  runNumber: string
  status: 'draft' | 'pending_approval' | 'approved' | 'processing' | 
          'completed' | 'failed' | 'cancelled'
  periodStart: string
  periodEnd: string
  totalAmount: number
  partnerCount: number
  transactionCount: number
  currency: string
  paymentMethod: 'bank_transfer' | 'ach' | 'wire' | 'check'
  createdBy: string
  createdAt: string
  approvedBy?: string
  approvedAt?: string
  processedAt?: string
  completedAt?: string
  notes?: string
}
```

### PartnerSettlement
Individual partner settlement within a run.

```typescript
{
  partnerId: string
  partnerName: string
  partnerType: 'payment_processor' | 'acquirer' | 'gateway' | 'merchant' | 'bank'
  status: 'pending_approval' | 'approved' | 'processing' | 'partially_paid' | 
          'paid' | 'failed' | 'disputed' | 'reconciled'
  grossAmount: number
  fees: number
  adjustments: number
  netAmount: number
  transactionCount: number
  currency: string
  paymentMethod: 'bank_transfer' | 'ach' | 'wire' | 'check'
  bankAccount?: string
  paymentReference?: string
  paidAt?: string
  reconciledAt?: string
  notes?: string
  calculatedAt: string
}
```

### SettlementTransaction
Individual transaction within a partner settlement.

```typescript
{
  id: string
  settlementRunId: string
  partnerId: string
  transactionDate: string
  type: 'payment' | 'refund' | 'chargeback' | 'fee' | 'adjustment'
  reference: string
  description: string
  amount: number
  currency: string
  status: 'pending' | 'settled' | 'failed' | 'disputed'
  metadata?: Record<string, any>
}
```

### SettlementSummary
Aggregated summary of a settlement run.

```typescript
{
  runId: string
  totalGross: number
  totalFees: number
  totalAdjustments: number
  totalNet: number
  partnersByType: {
    payment_processor: number
    acquirer: number
    gateway: number
    merchant: number
    bank: number
  }
  statusBreakdown: {
    pending_approval: number
    approved: number
    processing: number
    partially_paid: number
    paid: number
    failed: number
    disputed: number
    reconciled: number
  }
}
```

### CreateSettlementRunRequest
Request payload for creating a new settlement run.

```typescript
{
  periodStart: string
  periodEnd: string
  paymentMethod: 'bank_transfer' | 'ach' | 'wire' | 'check'
  notes?: string
}
```

## Service Layer

### settlementService

**Methods:**

#### `getSettlementRuns(params)`
Fetch paginated list of settlement runs.

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['settlements', page, pageSize, status, search],
  queryFn: () => settlementService.getSettlementRuns({
    page,
    pageSize,
    status,
    search
  })
});
```

#### `getSettlementRunById(id)`
Fetch detailed information for a specific settlement run.

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['settlement', id],
  queryFn: () => settlementService.getSettlementRunById(id)
});
```

#### `createSettlementRun(request)`
Create a new settlement run.

```typescript
const mutation = useMutation({
  mutationFn: settlementService.createSettlementRun,
  onSuccess: (data) => {
    navigate(`/settlement/summary/${data.id}`);
  }
});
```

#### `updateSettlementRunStatus(id, status)`
Update the status of a settlement run.

```typescript
const mutation = useMutation({
  mutationFn: ({ status }: { status: string }) =>
    settlementService.updateSettlementRunStatus(id, status),
  onSuccess: () => {
    queryClient.invalidateQueries(['settlement', id]);
  }
});
```

#### `getSettlementStats()`
Fetch settlement statistics for the dashboard.

```typescript
const { data } = useQuery({
  queryKey: ['settlement-stats'],
  queryFn: settlementService.getSettlementStats
});
```

#### `getPartnerSettlement(runId, partnerId)`
Fetch detailed settlement information for a specific partner.

```typescript
const { data } = useQuery({
  queryKey: ['partner-settlement', runId, partnerId],
  queryFn: () => settlementService.getPartnerSettlement(runId, partnerId)
});
```

## Routing Setup

Add these routes to your application:

```typescript
import SettlementRunList from './pages/settlement/SettlementRunList';
import CreateSettlementRun from './pages/settlement/CreateSettlementRun';
import SettlementSummary from './pages/settlement/SettlementSummary';
import PartnerSettlementBreakdown from './pages/settlement/PartnerSettlementBreakdown';

// In your router configuration
{
  path: '/settlement',
  children: [
    {
      index: true,
      element: <SettlementRunList />
    },
    {
      path: 'create',
      element: <CreateSettlementRun />
    },
    {
      path: 'summary/:id',
      element: <SettlementSummary />
    },
    {
      path: ':runId/partner/:partnerId',
      element: <PartnerSettlementBreakdown />
    }
  ]
}
```

## Navigation Examples

### From Settlement List to Create
```typescript
<Button onClick={() => navigate('/settlement/create')}>
  Create Settlement Run
</Button>
```

### From Settlement List to Summary
```typescript
<Card onClick={() => navigate(`/settlement/summary/${settlement.id}`)}>
  {/* Settlement card content */}
</Card>
```

### From Summary to Partner Breakdown
```typescript
<TableRow 
  onClick={() => navigate(`/settlement/${runId}/partner/${partner.partnerId}`)}
>
  {/* Partner row content */}
</TableRow>
```

## Usage Examples

### Creating a Settlement Run

1. Navigate to `/settlement/create`
2. Select date range (or use quick preset)
3. Choose payment method
4. Add optional notes
5. Click "Create Settlement Run"
6. Automatically redirected to settlement summary

### Reviewing and Approving Settlements

1. Navigate to `/settlement`
2. Find the settlement run (use filters/search if needed)
3. Click on the settlement to view summary
4. Review the Overview tab for financial breakdown
5. Check the Breakdown tab for partner details
6. Click "Approve Settlement" to move to approved status

### Processing Settlements

1. Open an approved settlement summary
2. Review all partner breakdowns
3. Click "Process Settlement" to initiate payment processing
4. System updates status to "processing"
5. Monitor individual partner payment statuses

### Investigating Partner Details

1. From settlement summary, click on a partner row in the Breakdown tab
2. View partner settlement breakdown page
3. Review transaction list (filter by type if needed)
4. Check payment details and status
5. Verify settlement calculations

## Mock Data

The settlement service includes comprehensive mock data:
- **30 settlement runs** with varying statuses and date ranges
- **8 partner entities** across different partner types
- **Dynamic transaction generation** based on settlement parameters
- **Realistic financial calculations** with fees and adjustments
- **Temporal data** with proper date sequencing

### Sample Data Characteristics

- Transaction counts: 100-1,000 per settlement run
- Settlement amounts: $10,000 - $500,000
- Processing fees: 2-4% of gross amount
- Adjustments: Random positive/negative values
- Settlement periods: Weekly, bi-weekly, and monthly cycles
- Multiple payment methods and bank accounts

## Testing

Component tests are located in `__tests__` directories:

```bash
# Run all settlement tests
npm test settlement

# Run specific component tests
npm test SettlementStatusBadge
npm test PartnerBreakdownTable

# Run with coverage
npm test -- --coverage settlement
```

### Test Coverage

- **SettlementStatusBadge**: 40+ test cases covering all status types and styling
- **PartnerBreakdownTable**: 20+ test cases covering rendering, interaction, and calculations

## State Management

The module uses React Query for data fetching and caching:

- **Query keys** are namespaced with feature identifiers
- **Mutations** automatically invalidate related queries
- **Optimistic updates** for status changes
- **Error handling** with toast notifications
- **Loading states** with skeleton components

## Best Practices

1. **Always validate date ranges** when creating settlement runs
2. **Check settlement status** before attempting status updates
3. **Review partner breakdowns** before approving settlements
4. **Monitor transaction details** for disputed settlements
5. **Use filters and search** for efficient navigation in large datasets

## Future Enhancements

Potential areas for expansion:
- [ ] Bulk settlement approval/rejection
- [ ] Settlement scheduling and automation
- [ ] Custom fee structures per partner
- [ ] Multi-currency settlement support
- [ ] Settlement reconciliation tools
- [ ] Partner settlement dispute resolution
- [ ] Export functionality (CSV, PDF)
- [ ] Email notifications for settlement events
- [ ] Settlement analytics and reporting
- [ ] Integration with payment gateways

## Integration Points

The Settlement Module integrates with:
- **Dashboard**: Settlement metrics and recent activity
- **Reports**: Settlement analysis and trends
- **Audit**: Settlement event logging
- **Workflow**: Settlement approval workflows
- **Partner Management**: Partner configuration and details

## Dependencies

- `@tanstack/react-query` - Data fetching and caching
- `react-router-dom` - Routing and navigation
- `lucide-react` - Icons
- `date-fns` - Date formatting and manipulation
- Shadcn UI components (Card, Button, Table, Badge, etc.)

## Support

For issues or questions:
1. Check the type definitions in `/types/index.ts`
2. Review the service implementation in `/services/settlementService.ts`
3. Examine component implementations in `/components/settlement`
4. Refer to test files for usage examples
