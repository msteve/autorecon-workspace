# Exceptions Module - Quick Reference

## Import Components

```typescript
import { 
  ExceptionCard, 
  SLAIndicator, 
  CommentBox, 
  AttachmentUploader 
} from '@/components/exceptions';
```

## Import Pages

```typescript
import { 
  ExceptionsQueuePage, 
  ExceptionDetailPage,
  AgingAnalysisPage,
  AssignmentRoutingPage
} from '@/pages/exceptions';
```

## Import Service

```typescript
import { exceptionsService } from '@/services/exceptionsService';
```

## Quick Examples

### ExceptionCard

```tsx
<ExceptionCard
  exception={exception}
  onClick={() => navigate(`/exceptions/${exception.id}`)}
  onAssign={handleAssign}
  showActions
/>
```

### SLAIndicator

```tsx
<SLAIndicator 
  slaStatus="approaching" 
  daysRemaining={1} 
  showLabel 
/>
```

### CommentBox

```tsx
<CommentBox
  comments={comments}
  onAddComment={async (content, isInternal) => {
    await exceptionsService.addComment(exceptionId, content, isInternal, userId);
  }}
  showInternalToggle
/>
```

### AttachmentUploader

```tsx
<AttachmentUploader
  attachments={attachments}
  onUpload={async (file) => {
    await exceptionsService.uploadAttachment(exceptionId, file, userId);
  }}
  onDelete={async (id) => {
    await exceptionsService.deleteAttachment(id);
  }}
  maxFileSize={5 * 1024 * 1024}
/>
```

## Service Methods

```typescript
// Get exceptions with filters
const { data, total } = await exceptionsService.getExceptions(
  { status: 'open', severity: 'critical' },
  { page: 1, pageSize: 20, sortBy: 'slaDeadline', sortOrder: 'asc' }
);

// Get single exception
const exception = await exceptionsService.getExceptionById('exc-123');

// Update status
await exceptionsService.updateStatus('exc-123', 'in_progress');

// Assign exception
await exceptionsService.assignException('exc-123', 'user1', 'John Doe');

// Add comment
await exceptionsService.addComment('exc-123', 'Comment text', false);

// Upload attachment
await exceptionsService.uploadAttachment('exc-123', file, 'user1');

// Get statistics
const stats = await exceptionsService.getStatistics();

// Get aging analysis
const aging = await exceptionsService.getAgingAnalysis();

// Get team assignments
const teams = await exceptionsService.getTeamAssignments();
```

## Routes

```typescript
<Routes>
  <Route path="/exceptions" element={<ExceptionsQueuePage />} />
  <Route path="/exceptions/:id" element={<ExceptionDetailPage />} />
  <Route path="/exceptions/aging-analysis" element={<AgingAnalysisPage />} />
  <Route path="/exceptions/assignment" element={<AssignmentRoutingPage />} />
</Routes>
```

## TypeScript Types

```typescript
// Key types
type ExceptionStatus = 'open' | 'in_progress' | 'resolved' | 'escalated' | 'closed';
type ExceptionSeverity = 'critical' | 'high' | 'medium' | 'low';
type ExceptionCategory = 'matching_failure' | 'data_quality' | 'validation_error' 
  | 'system_error' | 'manual_review' | 'compliance';

interface Exception {
  id: string;
  exceptionNumber: string;
  title: string;
  description: string;
  category: ExceptionCategory;
  severity: ExceptionSeverity;
  status: ExceptionStatus;
  slaStatus: 'within_sla' | 'approaching' | 'breached';
  slaDaysRemaining: number;
  commentsCount: number;
  attachmentsCount: number;
  // ... more fields
}
```

## Filters

```typescript
interface ExceptionsFilters {
  status?: ExceptionStatus;
  severity?: ExceptionSeverity;
  category?: ExceptionCategory;
  assignedTo?: string;
  teamId?: string;
  slaStatus?: 'within_sla' | 'approaching' | 'breached';
  search?: string;
  dateRange?: { from: string; to: string };
  ageRange?: { min: number; max: number };
}
```

## SLA Configuration

| Severity | Deadline |
|----------|----------|
| Critical | 1 day |
| High | 3 days |
| Medium | 7 days |
| Low | 14 days |

## Color Coding

**Severity:**
- Critical: Red (bg-red-600)
- High: Orange (bg-orange-600)
- Medium: Yellow (bg-yellow-600)
- Low: Blue (bg-blue-600)

**SLA Status:**
- Within SLA: Green (bg-green-100)
- Approaching: Yellow (bg-yellow-100)
- Breached: Red (bg-red-100)

**Status:**
- Open: Yellow (bg-yellow-100)
- In Progress: Blue (bg-blue-100)
- Resolved: Green (bg-green-100)
- Escalated: Orange (bg-orange-100)
- Closed: Gray (bg-gray-100)

## Testing

```bash
# Run all tests
npm test -- exceptions

# Run specific component tests
npm test -- ExceptionCard
npm test -- SLAIndicator
npm test -- CommentBox
npm test -- AttachmentUploader

# Run with coverage
npm test -- --coverage exceptions
```

## Files Created

```
Service: exceptionsService.ts (500+ lines)
Components: 4 files (560 lines)
Pages: 4 files (1,550 lines)
Tests: 6 files (400 lines)
UI: progress.tsx
Docs: README.md, COMPLETE.md, QUICK_REFERENCE.md
```

## Dependencies

```json
{
  "@radix-ui/react-progress": "latest",
  "@radix-ui/react-dropdown-menu": "latest",
  "recharts": "^2.x",
  "@tanstack/react-query": "^5.17.19",
  "date-fns": "^3.2.0"
}
```
