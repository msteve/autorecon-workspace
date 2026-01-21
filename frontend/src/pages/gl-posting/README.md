# GL Posting Module

Complete general ledger posting system for managing journal batches, reviewing entries, and posting to the general ledger.

## Overview

The GL Posting Module provides comprehensive functionality for:
- Creating and managing journal batches
- Reviewing journal entries with detailed breakdowns
- Approval workflow integration
- Balance validation and suspense account management
- Export capabilities (CSV/PDF)
- Tracking batch lifecycle from draft to posted

## Features

### 1. Journal Batch List
- View all journal batches with pagination
- Filter by status (draft, pending approval, approved, posted, rejected, failed)
- Search by batch number, description, or creator
- Real-time statistics dashboard showing:
  - Total Batches
  - Pending Approval Count
  - Posted Batches
  - Suspense Entries
- Balance status indicators (balanced/unbalanced)
- Quick navigation to batch details
- Create new batch action

### 2. Journal Batch Detail
- Comprehensive batch overview with key metrics
- Three-tab interface:
  - **Journal Entries**: Complete list of all entries with debit/credit columns
  - **Summary**: Batch overview and breakdown by account type
  - **Details**: Batch configuration, tracking information, and audit trail
- Balance validation with variance display
- Suspense entry warnings
- Action buttons for workflow progression:
  - Approve Batch (pending → approved)
  - Post to GL (approved → posted)
  - Reject Batch (with reason)
- Export functionality:
  - Export to CSV (implemented)
  - Export to PDF (placeholder)
- Breadcrumb navigation

### 3. Approval Workflow Integration
- Status-based workflow progression
- Approval validation (balanced entries required)
- Rejection with reason tracking
- Audit trail for all approvals/rejections
- User and timestamp tracking
- Automatic status updates

### 4. Export Capabilities
- **CSV Export**: Complete journal entry export with all fields
- **PDF Export**: Placeholder for future implementation
- Downloadable files with batch number in filename
- Comprehensive entry details in export

## Components

### JournalEntryRow
Table row component for displaying individual journal entries.

**Props:**
```typescript
{
  entry: JournalEntry
  showBatchInfo?: boolean  // Show cost center, department, reference
}
```

**Features:**
- Formatted currency display
- Color-coded debit (green) and credit (blue) amounts
- Account code in monospace font
- Suspense badge integration
- Optional batch information columns
- Responsive layout

### SuspenseBadge
Visual indicator for suspense account entries.

**Props:**
```typescript
{
  isSuspense: boolean
  reason?: string  // Displayed in title attribute
}
```

**Features:**
- Amber color scheme for visibility
- Tooltip showing suspense reason
- Conditional rendering (only shows if isSuspense is true)

### BatchStatusBadge
Status indicator for journal batches.

**Props:**
```typescript
{
  status: 'draft' | 'pending_approval' | 'approved' | 'posted' | 'rejected' | 'failed'
}
```

**Features:**
- Color-coded status display
- 6 different status states
- Consistent visual language

## Types

### JournalBatch
Main journal batch entity.

```typescript
{
  id: string
  batchNumber: string
  description: string
  status: 'draft' | 'pending_approval' | 'approved' | 'posted' | 'rejected' | 'failed'
  periodStart: string
  periodEnd: string
  totalDebit: number
  totalCredit: number
  entryCount: number
  currency: string
  companyCode: string
  fiscalYear: string
  fiscalPeriod: string
  createdBy: string
  createdAt: string
  approvedBy?: string
  approvedAt?: string
  postedBy?: string
  postedAt?: string
  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string
  externalReference?: string
  notes?: string
}
```

### JournalEntry
Individual journal entry within a batch.

```typescript
{
  id: string
  batchId: string
  lineNumber: number
  accountCode: string
  accountName: string
  debitAmount: number
  creditAmount: number
  description: string
  costCenter?: string
  department?: string
  project?: string
  reference?: string
  taxCode?: string
  taxAmount?: number
  suspenseFlag: boolean
  suspenseReason?: string
  createdAt: string
}
```

### JournalBatchSummary
Aggregated summary of a journal batch.

```typescript
{
  batchId: string
  totalDebit: number
  totalCredit: number
  balance: number
  entryCount: number
  suspenseCount: number
  accountsAffected: number
  byAccountType: {
    asset: number
    liability: number
    equity: number
    revenue: number
    expense: number
  }
}
```

### GLAccount
General ledger account definition.

```typescript
{
  code: string
  name: string
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  category: string
  balance: number
  currency: string
  isActive: boolean
}
```

### GLPostingStats
Dashboard statistics.

```typescript
{
  totalBatches: number
  pendingApproval: number
  approvedBatches: number
  postedBatches: number
  totalDebit: number
  totalCredit: number
  suspenseEntries: number
  avgBatchSize: number
}
```

## Service Layer

### glPostingService

**Methods:**

#### `getJournalBatches(params)`
Fetch paginated list of journal batches.

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['journal-batches', page, search, statusFilter],
  queryFn: () => glPostingService.getJournalBatches({
    page,
    pageSize: 10,
    status,
    search
  })
});
```

#### `getJournalBatchById(id)`
Fetch detailed information for a specific batch.

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['journal-batch', id],
  queryFn: () => glPostingService.getJournalBatchById(id)
});
```

#### `getJournalEntries(batchId)`
Fetch all entries for a batch.

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['journal-entries', batchId],
  queryFn: () => glPostingService.getJournalEntries(batchId)
});
```

#### `getJournalBatchSummary(batchId)`
Fetch aggregated summary for a batch.

```typescript
const { data } = useQuery({
  queryKey: ['journal-batch-summary', batchId],
  queryFn: () => glPostingService.getJournalBatchSummary(batchId)
});
```

#### `updateJournalBatchStatus(id, status)`
Update the status of a batch.

```typescript
const mutation = useMutation({
  mutationFn: () => glPostingService.updateJournalBatchStatus(id, 'approved'),
  onSuccess: () => {
    queryClient.invalidateQueries(['journal-batch', id]);
  }
});
```

#### `rejectJournalBatch(id, reason)`
Reject a batch with a reason.

```typescript
const mutation = useMutation({
  mutationFn: (reason: string) => glPostingService.rejectJournalBatch(id, reason),
  onSuccess: () => {
    queryClient.invalidateQueries(['journal-batch', id]);
  }
});
```

#### `getGLPostingStats()`
Fetch GL posting statistics.

```typescript
const { data } = useQuery({
  queryKey: ['gl-posting-stats'],
  queryFn: glPostingService.getGLPostingStats
});
```

#### `exportBatchToCSV(batchId)`
Export batch entries to CSV format.

```typescript
const csv = await glPostingService.exportBatchToCSV(batchId);
// Returns CSV string for download
```

## Routing Setup

Add these routes to your application:

```typescript
import JournalBatchList from './pages/gl-posting/JournalBatchList';
import JournalBatchDetail from './pages/gl-posting/JournalBatchDetail';

// In your router configuration
{
  path: '/gl-posting',
  children: [
    {
      index: true,
      element: <JournalBatchList />
    },
    {
      path: 'batch/:id',
      element: <JournalBatchDetail />
    }
  ]
}
```

## Usage Examples

### Viewing Journal Batches

1. Navigate to `/gl-posting`
2. View statistics dashboard
3. Use filters to find specific batches
4. Search by batch number or description
5. Click on a batch card to view details

### Reviewing and Approving Batches

1. Open a batch in pending_approval status
2. Review the Journal Entries tab
3. Check balance (must be balanced to approve)
4. Review suspense entries if any
5. Check Summary and Details tabs
6. Click "Approve" if everything looks good
7. Or click "Reject" and provide a reason

### Posting to General Ledger

1. Open an approved batch
2. Verify all information is correct
3. Click "Post to GL" button
4. Status updates to "posted"
5. Batch is finalized and cannot be modified

### Exporting Batch Data

1. Open any batch detail page
2. Click "Export CSV" for CSV format
3. Click "Export PDF" for PDF (coming soon)
4. File downloads with batch number in filename

## Mock Data

The GL posting service includes comprehensive mock data:
- **40 journal batches** with varying statuses and date ranges
- **19 GL accounts** across all account types
- **Dynamic entry generation** (5-50 entries per batch)
- **Realistic financial data** with proper debit/credit balancing
- **10% suspense rate** for entries requiring investigation
- **Temporal data** with proper date sequencing

### Sample Data Characteristics

- Batch amounts: $10,000 - $500,000
- Entry counts: 5-50 per batch
- 6 status types with realistic progression
- Multiple company codes
- Fiscal year 2026 with proper period codes
- Cost centers, departments, and project codes
- Suspense entries with reasons

## Business Rules

### Batch Status Workflow

```
draft → pending_approval → approved → posted
                         ↓
                    rejected
                         ↓
                      failed
```

### Approval Validation

1. **Balance Check**: Total debits must equal total credits
2. **Status Check**: Only pending_approval batches can be approved
3. **Rejection**: Can reject pending_approval or approved batches
4. **Posting**: Only approved batches can be posted
5. **Finality**: Posted batches cannot be modified

### Suspense Accounts

- Account code: 9999
- Used for unidentified or pending transactions
- Flagged with amber badge
- Includes reason for suspense
- Should be resolved before posting

## Testing

Component tests are located in `__tests__` directories:

```bash
# Run all GL posting tests
npm test gl-posting

# Run specific component tests
npm test SuspenseBadge
npm test JournalEntryRow
npm test BatchStatusBadge

# Run with coverage
npm test -- --coverage gl-posting
```

### Test Coverage

- **SuspenseBadge**: 5+ test cases covering display logic and styling
- **JournalEntryRow**: 15+ test cases covering rendering, formatting, and optional fields
- **BatchStatusBadge**: 12+ test cases covering all status types and styling

## State Management

The module uses React Query for data fetching and caching:

- **Query keys** are namespaced by feature and ID
- **Mutations** automatically invalidate related queries
- **Optimistic updates** for status changes
- **Error handling** with toast notifications
- **Loading states** with skeleton components

## Integration Points

The GL Posting Module integrates with:
- **Workflow Module**: Batch approval workflow
- **Dashboard**: GL posting metrics and activity
- **Reports**: GL posting analysis and audit reports
- **Audit**: Batch event logging and tracking
- **Settlement**: Settlement-to-GL posting integration

## Export Format

### CSV Export Structure

```csv
Line,Account Code,Account Name,Debit,Credit,Description,Cost Center,Department,Reference,Suspense
1,1000,Cash - Operating Account,5000,0,"Payment received",CC-1,Finance,REF-12345,No
2,4000,Sales Revenue,0,5000,"Revenue recognition",,Sales,,No
```

### PDF Export (Future)

Will include:
- Batch header information
- Formatted entry table
- Balance totals
- Approval signatures
- Company branding

## Dependencies

- `@tanstack/react-query` - Data fetching and caching
- `react-router-dom` - Routing and navigation
- `lucide-react` - Icons
- Shadcn UI components (Card, Button, Table, Dialog, etc.)

## Best Practices

1. **Always validate balance** before approving batches
2. **Review suspense entries** and resolve before posting
3. **Provide clear rejection reasons** for audit trail
4. **Use filters and search** for efficient navigation
5. **Export for external review** when needed
6. **Monitor statistics** for pending approvals

## Future Enhancements

Potential areas for expansion:
- [ ] Batch editing and line item modification
- [ ] Bulk batch approval
- [ ] Scheduled batch posting
- [ ] Reversal journal entries
- [ ] Recurring journal templates
- [ ] Advanced account lookup
- [ ] Multi-currency support
- [ ] Attachment support for documentation
- [ ] Integration with external GL systems
- [ ] Advanced filtering and saved views

## API Integration Readiness

The service layer is designed for easy backend integration:

```typescript
// Replace mock implementation with API calls
export const glPostingService = {
  getJournalBatches: async (params) => {
    const response = await apiClient.get('/api/gl-posting/batches', { params });
    return response.data;
  },
  
  updateJournalBatchStatus: async (id, status) => {
    const response = await apiClient.patch(`/api/gl-posting/batches/${id}/status`, { status });
    return response.data;
  },
  
  // ... other methods
};
```

Expected API endpoints:
- `GET /api/gl-posting/batches` - List batches
- `GET /api/gl-posting/batches/:id` - Get batch details
- `GET /api/gl-posting/batches/:id/entries` - Get entries
- `GET /api/gl-posting/batches/:id/summary` - Get summary
- `PATCH /api/gl-posting/batches/:id/status` - Update status
- `POST /api/gl-posting/batches/:id/reject` - Reject batch
- `GET /api/gl-posting/stats` - Get statistics
- `GET /api/gl-posting/batches/:id/export/csv` - Export CSV
- `GET /api/gl-posting/batches/:id/export/pdf` - Export PDF

## Support

For issues or questions:
1. Check the type definitions in `/types/index.ts`
2. Review the service implementation in `/services/glPostingService.ts`
3. Examine component implementations in `/components/gl-posting`
4. Refer to test files for usage examples
