# Exceptions Module

Comprehensive exception management system with SLA tracking, comments, attachments, and team assignment capabilities.

## Features

### 📊 Exception Management
- **Multi-status workflow**: Open → In Progress → Resolved/Escalated → Closed
- **Severity levels**: Critical, High, Medium, Low with color-coded indicators
- **Categories**: Matching Failure, Data Quality, Validation Error, System Error, Manual Review, Compliance
- **SLA tracking**: Automated deadline calculation, breach detection, visual indicators
- **Aging analysis**: Age bucket distribution for backlog management
- **Team assignment**: Workload balancing and capacity tracking

### 🎯 Key Components

#### ExceptionCard
Displays exception summary with status, severity, SLA indicator, and quick actions.

```tsx
import { ExceptionCard } from '@/components/exceptions';

<ExceptionCard
  exception={exception}
  onClick={() => navigate(`/exceptions/${exception.id}`)}
  onAssign={handleAssign}
  showActions
/>
```

**Props:**
- `exception`: Exception object
- `onClick?`: Click handler for card navigation
- `onAssign?`: Assignment handler function
- `showActions?`: Show action buttons (default: true)
- `className?`: Additional CSS classes

#### SLAIndicator
Visual SLA status indicator with countdown/overdue display.

```tsx
import { SLAIndicator } from '@/components/exceptions';

<SLAIndicator 
  slaStatus="approaching" 
  daysRemaining={1} 
  showLabel
  size="md"
/>
```

**Props:**
- `slaStatus`: 'within_sla' | 'approaching' | 'breached'
- `daysRemaining`: Number of days remaining (negative for overdue)
- `size?`: 'sm' | 'md' | 'lg' (default: 'md')
- `showLabel?`: Display label and description (default: true)
- `className?`: Additional CSS classes

#### CommentBox
Comment thread with internal/external visibility toggle.

```tsx
import { CommentBox } from '@/components/exceptions';

<CommentBox
  comments={comments}
  onAddComment={handleAddComment}
  showInternalToggle
/>
```

**Props:**
- `comments`: Array of ExceptionComment objects
- `onAddComment`: async (content: string, isInternal: boolean) => Promise<void>
- `loading?`: Loading state (default: false)
- `showInternalToggle?`: Show internal note checkbox (default: true)
- `className?`: Additional CSS classes

#### AttachmentUploader
File upload with drag-drop, validation, and attachment management.

```tsx
import { AttachmentUploader } from '@/components/exceptions';

<AttachmentUploader
  attachments={attachments}
  onUpload={handleUpload}
  onDelete={handleDelete}
  maxFileSize={5 * 1024 * 1024}
  allowedTypes={['application/pdf', 'image/*']}
/>
```

**Props:**
- `attachments`: Array of ExceptionAttachment objects
- `onUpload`: async (file: File) => Promise<void>
- `onDelete?`: async (attachmentId: string) => Promise<void>
- `maxFileSize?`: Max file size in bytes (default: 10MB)
- `allowedTypes?`: Allowed MIME types (default: ['*'])
- `loading?`: Loading state
- `className?`: Additional CSS classes

### 📄 Pages

#### ExceptionsQueuePage
Main queue view with filtering, search, sorting, and pagination.

**Features:**
- Statistics dashboard (total, open, resolved today, SLA breached)
- Advanced filtering: status, severity, category, SLA status, team, assignee
- Full-text search
- Sorting by created date, SLA deadline, last updated
- Pagination with page size control
- Bulk actions (planned)

**Route:** `/exceptions`

#### ExceptionDetailPage
Detailed exception view with full context and actions.

**Features:**
- Exception header with status/severity badges and SLA indicator
- Quick actions: Status update, assignment change
- Four tabs:
  - **Details**: Complete exception information and metrics
  - **Timeline**: Event history and audit trail
  - **Comments**: Comment thread with internal notes
  - **Attachments**: File upload and management
- Context menu for additional actions

**Route:** `/exceptions/:id`

#### AgingAnalysisPage
Aging distribution analysis for backlog management.

**Features:**
- Age distribution bar chart
- Five aging buckets: 0-3 days, 4-7 days, 8-14 days, 15-30 days, 30+ days
- Bucket breakdown cards with percentage
- Recent examples per bucket
- Drill-down to exceptions in each bucket
- Key metrics: Average age, average resolution time, total open

**Route:** `/exceptions/aging-analysis`

#### AssignmentRoutingPage
Team workload management and exception routing.

**Features:**
- Team overview cards with utilization metrics
- Capacity vs active exceptions tracking
- Unassigned exceptions queue
- Bulk assignment capabilities
- Team filtering
- Workload balancing insights

**Route:** `/exceptions/assignment`

## Service Layer

### exceptionsService

Complete API service layer for exception management:

```typescript
import { exceptionsService } from '@/services/exceptionsService';

// Get exceptions with filters and pagination
const { data, total } = await exceptionsService.getExceptions(
  { 
    status: 'open', 
    severity: 'critical',
    slaStatus: 'breached'
  },
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

### TypeScript Interfaces

#### Exception
```typescript
interface Exception {
  id: string;
  exceptionNumber: string;
  title: string;
  description: string;
  category: ExceptionCategory;
  severity: ExceptionSeverity;
  status: ExceptionStatus;
  entityType: string;
  entityId: string;
  source: string;
  assignedTo: string | null;
  assignedToName: string | null;
  teamId: string;
  teamName: string;
  slaDeadline: string;
  slaStatus: 'within_sla' | 'approaching' | 'breached';
  slaDaysRemaining: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  ageInDays: number;
  responseTime: number | null;
  resolutionTime: number | null;
  commentsCount: number;
  attachmentsCount: number;
  tags: string[];
}
```

#### ExceptionComment
```typescript
interface ExceptionComment {
  id: string;
  exceptionId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  content: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### ExceptionAttachment
```typescript
interface ExceptionAttachment {
  id: string;
  exceptionId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  url: string;
}
```

## Mock Data

The service layer includes pre-seeded mock data:
- **80 exceptions** across all statuses
- **30 open**, **20 in progress**, **15 resolved**, **10 escalated**, **5 closed**
- Realistic SLA scenarios with breach tracking
- Comments and attachments for each exception
- Timeline events for audit trail
- 3 teams with capacity tracking

## SLA Configuration

SLA deadlines are automatically calculated based on severity:
- **Critical**: 1 day (24 hours)
- **High**: 3 days (72 hours)
- **Medium**: 7 days (168 hours)
- **Low**: 14 days (336 hours)

SLA Status:
- **within_sla**: More than 1 day remaining
- **approaching**: 1 day or less remaining
- **breached**: Past deadline (negative days)

## Integration

### React Router Setup
```typescript
import { 
  ExceptionsQueuePage, 
  ExceptionDetailPage,
  AgingAnalysisPage,
  AssignmentRoutingPage
} from '@/pages/exceptions';

<Routes>
  <Route path="/exceptions" element={<ExceptionsQueuePage />} />
  <Route path="/exceptions/:id" element={<ExceptionDetailPage />} />
  <Route path="/exceptions/aging-analysis" element={<AgingAnalysisPage />} />
  <Route path="/exceptions/assignment" element={<AssignmentRoutingPage />} />
</Routes>
```

### Navigation Menu
```typescript
const menuItems = [
  {
    label: 'Exceptions Queue',
    path: '/exceptions',
    icon: AlertCircle
  },
  {
    label: 'Aging Analysis',
    path: '/exceptions/aging-analysis',
    icon: Calendar
  },
  {
    label: 'Assignment & Routing',
    path: '/exceptions/assignment',
    icon: Users
  }
];
```

## Testing

Comprehensive test coverage using Vitest and React Testing Library:

```bash
# Run all exception tests
npm test -- exceptions

# Run component tests
npm test -- ExceptionCard
npm test -- SLAIndicator
npm test -- CommentBox
npm test -- AttachmentUploader

# Run page tests
npm test -- ExceptionsQueuePage
npm test -- ExceptionDetailPage

# Run with coverage
npm test -- --coverage exceptions
```

**Test Coverage:**
- Component rendering and props
- User interactions (clicks, form submission)
- SLA status display logic
- File upload validation
- Comment internal/external toggle
- Filtering and pagination
- API integration
- Error handling

## Dependencies

- React 18.2.0
- React Query 5.17.19 (data fetching)
- React Router 6+ (routing)
- React Hook Form 7.49.3 (forms)
- date-fns 3.2.0 (date formatting)
- Recharts 2.x (charts in AgingAnalysisPage)
- Lucide React (icons)
- Shadcn UI components
- TailwindCSS 3.4.1

## Styling

All components use TailwindCSS and Shadcn UI for consistent styling:
- Color-coded severity: Red (critical), Orange (high), Yellow (medium), Blue (low)
- Color-coded status: Yellow (open), Blue (in progress), Green (resolved), Orange (escalated), Gray (closed)
- Color-coded SLA: Green (within), Yellow (approaching), Red (breached)
- Responsive grid layouts
- Hover states and transitions
- Accessible focus indicators

## Accessibility

- Semantic HTML structure
- ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- Color contrast compliance (WCAG AA)
- Alternative text for icons

## Performance

- React Query caching and deduplication
- Pagination for large datasets
- Lazy loading for tab content
- Optimistic updates for mutations
- Debounced search input
- Virtual scrolling (future enhancement)

## Future Enhancements

- [ ] Real-time updates via WebSocket
- [ ] Advanced analytics dashboard
- [ ] Custom SLA rules engine
- [ ] Automated escalation workflows
- [ ] Email notifications
- [ ] Export to Excel/PDF
- [ ] Saved filters and views
- [ ] Exception templates
- [ ] Bulk operations (assign, close, escalate)
- [ ] Integration with external ticketing systems

## License

MIT
