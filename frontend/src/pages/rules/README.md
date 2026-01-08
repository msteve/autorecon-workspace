# Rule Engine Module

Complete implementation of the AutoReconV2 Rule Engine module with visual condition builder, match strategy configuration, and maker-checker approval workflow.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Components](#components)
- [Pages](#pages)
- [Service Layer](#service-layer)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Integration Guide](#integration-guide)

## 🎯 Overview

The Rule Engine module enables users to create, manage, and apply reconciliation rules with sophisticated matching strategies. It provides a visual interface for building complex conditions without writing code, along with version history tracking and a maker-checker approval workflow.

### Key Capabilities

- **Visual Condition Builder**: Drag-and-drop interface for creating complex rule conditions
- **Multiple Match Strategies**: Exact, fuzzy, n-way, and AI-assisted matching
- **Maker-Checker Workflow**: Submit, approve, or reject rule changes
- **Version History**: Track all changes with complete audit trail
- **Real-time Search & Filtering**: Find rules quickly with advanced filters
- **Rule Testing**: Test rules against sample data before activation

## ✨ Features

### 1. Rule Management
- Create, edit, and delete rules
- Enable/disable rules with one click
- Duplicate existing rules
- Priority-based rule execution
- Tag-based organization

### 2. Condition Builder
- 10 pre-defined field categories (Transaction, Partner, Account, etc.)
- 13 comparator types (equals, contains, greater than, between, etc.)
- Support for multiple data types (string, number, date, amount, boolean)
- Logical operators (AND/OR) for combining conditions
- Drag-and-drop reordering
- Real-time condition summary

### 3. Match Strategies

#### Exact Match
- Strict field-by-field comparison
- No tolerance for discrepancies
- Highest accuracy, lowest false positives

#### Fuzzy Match
- Configurable similarity threshold (50-100%)
- Amount and percentage tolerance
- Handles minor data variations

#### N-Way Match
- Match across multiple data sources
- Configurable key fields
- Tolerance settings for flexibility

#### AI-Assisted Match
- Machine learning-based pattern recognition
- Handles complex, ambiguous cases
- Configurable AI model selection

### 4. Approval Workflow
- Submit rules for approval
- Approve or reject with comments
- View approval history
- Role-based access control (maker cannot approve own rules)
- Rejection reason tracking

### 5. Version History
- Complete change audit trail
- View all previous versions
- Compare versions
- Restore previous versions
- Track who made changes and when

## 🏗️ Architecture

```
frontend/src/
├── components/rules/
│   ├── ConditionBuilder.tsx         # Visual condition builder
│   ├── RuleStatusBadge.tsx          # Status indicators
│   ├── MatchStrategySelector.tsx    # Match strategy configuration
│   ├── RuleVersionHistory.tsx       # Version timeline
│   ├── ApprovalPanel.tsx            # Maker-checker workflow
│   └── __tests__/
│       ├── ConditionBuilder.test.tsx
│       ├── RuleStatusBadge.test.tsx
│       └── MatchStrategySelector.test.tsx
├── pages/rules/
│   ├── RuleListPage.tsx             # Rule list with filters
│   ├── RuleEditorPage.tsx           # Create/edit rules
│   └── RuleDetailsPage.tsx          # View rule details
└── services/
    └── ruleEngineService.ts         # Service layer with mock data
```

## 🧩 Components

### ConditionBuilder

**Purpose**: Reusable component for building IF conditions with visual interface.

**Props**:
```typescript
interface ConditionBuilderProps {
  conditions: RuleCondition[];
  onChange: (conditions: RuleCondition[]) => void;
  readOnly?: boolean;
}
```

**Features**:
- Add/remove conditions
- Select fields from categorized list
- Choose comparators based on field type
- Enter values with type-specific inputs
- Combine conditions with AND/OR operators
- Drag-and-drop reordering
- Real-time validation and summary

**Example**:
```tsx
const [conditions, setConditions] = useState<RuleCondition[]>([]);

<ConditionBuilder
  conditions={conditions}
  onChange={setConditions}
/>
```

### RuleStatusBadge

**Purpose**: Visual status indicators for rules.

**Props**:
```typescript
interface RuleStatusBadgeProps {
  status: RuleStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

**Statuses**:
- `draft`: Gray - Rule in draft state
- `pending_approval`: Yellow - Awaiting approval
- `approved`: Light green - Approved but not active
- `active`: Dark green - Currently active
- `inactive`: Gray - Disabled
- `rejected`: Red - Rejected with reason

**Example**:
```tsx
<RuleStatusBadge status="active" size="md" />
```

### MatchStrategySelector

**Purpose**: Configure match strategy and parameters.

**Props**:
```typescript
interface MatchStrategySelectorProps {
  configuration: MatchConfiguration;
  onChange: (configuration: MatchConfiguration) => void;
  readOnly?: boolean;
}
```

**Strategies**:
- **Exact**: No tolerance, strict matching
- **Fuzzy**: Threshold slider (50-100%), tolerance inputs
- **N-Way**: Key fields selection, tolerance settings
- **AI-Assisted**: Model selection, Beta feature

**Example**:
```tsx
const [config, setConfig] = useState<MatchConfiguration>({
  strategy: 'fuzzy',
  threshold: 85,
  tolerance: { amount: 0.01, percentage: 0.1 }
});

<MatchStrategySelector
  configuration={config}
  onChange={setConfig}
/>
```

### RuleVersionHistory

**Purpose**: Display timeline of rule changes.

**Props**:
```typescript
interface RuleVersionHistoryProps {
  versions: RuleVersion[];
  currentVersion: number;
  onRestore?: (versionId: string) => void;
  readOnly?: boolean;
}
```

**Features**:
- Chronological timeline view
- Change type indicators (created, updated, approved, etc.)
- User and timestamp information
- Restore previous versions
- Current version highlighting

**Example**:
```tsx
<RuleVersionHistory
  versions={versionHistory}
  currentVersion={3}
  onRestore={handleRestore}
/>
```

### ApprovalPanel

**Purpose**: Maker-checker approval workflow UI.

**Props**:
```typescript
interface ApprovalPanelProps {
  rule: Rule;
  onApprove: (comments?: string) => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  onSubmitForApproval: (comments?: string) => Promise<void>;
  currentUser?: string;
  readOnly?: boolean;
}
```

**Features**:
- Submit for approval (makers)
- Approve/reject actions (checkers)
- Comments and rejection reasons
- Approval history display
- Role-based button visibility

**Example**:
```tsx
<ApprovalPanel
  rule={currentRule}
  onApprove={handleApprove}
  onReject={handleReject}
  onSubmitForApproval={handleSubmit}
  currentUser="john.doe"
/>
```

## 📄 Pages

### RuleListPage

**Route**: `/rules`

**Features**:
- Statistics dashboard (total, active, pending, drafts)
- Search by name, description, rule number
- Filter by status, enabled state
- Sort by multiple fields
- Bulk actions
- Enable/disable toggle
- Quick delete
- Export functionality

**Auto-refresh**: Every 30 seconds

### RuleEditorPage

**Route**: `/rules/new` or `/rules/:ruleId/edit`

**Features**:
- Basic information form (name, description, priority, tags)
- Enable/disable toggle
- ConditionBuilder integration
- MatchStrategySelector integration
- Real-time validation
- Test rule functionality
- Save as draft or submit for approval

**Validation**:
- Rule name required
- At least one condition required
- Match strategy required
- Priority 1-10

### RuleDetailsPage

**Route**: `/rules/:ruleId`

**Features**:
- Three-tab layout (Overview, Conditions, Statistics)
- Complete rule information
- Read-only condition display
- Read-only match configuration
- Performance metrics and success rate
- Version history timeline
- Approval panel
- Enable/disable, edit, delete, duplicate actions

## 🔧 Service Layer

### ruleEngineService.ts

**Purpose**: Complete API service layer with comprehensive mock data.

**Key Methods**:

```typescript
// Get all rules with filtering and sorting
getRules(filters?: RuleListFilters, sort?: RuleSortOption): Promise<Rule[]>

// Get single rule
getRuleById(ruleId: string): Promise<Rule | null>

// Create new rule
createRule(rule: Omit<Rule, 'id' | 'ruleNumber' | ...>): Promise<Rule>

// Update existing rule
updateRule(ruleId: string, updates: Partial<Rule>): Promise<Rule>

// Delete rule
deleteRule(ruleId: string): Promise<void>

// Toggle enabled/disabled
toggleRuleStatus(ruleId: string): Promise<Rule>

// Get version history
getRuleVersions(ruleId: string): Promise<RuleVersion[]>

// Approval workflow
submitForApproval(ruleId: string, comments?: string): Promise<ApprovalRequest>
approveRule(ruleId: string, approvedBy: string, comments?: string): Promise<Rule>
rejectRule(ruleId: string, rejectedBy: string, reason: string): Promise<Rule>

// Utility methods
validateRule(rule: Partial<Rule>): Promise<{ valid: boolean; errors: string[] }>
testRule(ruleId: string, sampleData: any): Promise<{ matched: boolean; details: string }>
getAllTags(): Promise<string[]>
```

**Mock Data**:
- 12 pre-seeded rules with varied statuses
- 10 available fields across 4 categories
- Realistic timestamps and user assignments
- Statistics and performance metrics

**Field Types**:
```typescript
type FieldType = 'string' | 'number' | 'date' | 'boolean' | 'amount';
```

**Comparators**:
```typescript
type Comparator = 
  | 'equals' | 'not_equals'
  | 'contains' | 'not_contains' | 'starts_with' | 'ends_with'
  | 'greater_than' | 'less_than' | 'greater_than_or_equal' | 'less_than_or_equal'
  | 'between' | 'in' | 'not_in'
  | 'is_null' | 'is_not_null';
```

## 💡 Usage Examples

### Creating a Simple Rule

```typescript
const newRule = await createRule({
  name: 'High Value USD Transactions',
  description: 'Match transactions over $1000 in USD',
  status: 'draft',
  priority: 2,
  isEnabled: false,
  conditions: [
    {
      id: '1',
      field: 'transaction.amount',
      fieldType: 'amount',
      comparator: 'greater_than',
      value: 1000,
      logicalOperator: 'AND'
    },
    {
      id: '2',
      field: 'transaction.currency',
      fieldType: 'string',
      comparator: 'equals',
      value: 'USD'
    }
  ],
  matchConfiguration: {
    strategy: 'exact'
  },
  tags: ['automated', 'high-value'],
  createdBy: 'user@example.com',
  updatedBy: 'user@example.com',
  appliesTo: {
    partners: ['Partner A'],
    reconciliationTypes: ['Payment Reconciliation']
  }
});
```

### Filtering Rules

```typescript
const activeRules = await getRules(
  { 
    status: ['active'],
    isEnabled: true,
    tags: ['automated']
  },
  {
    field: 'priority',
    direction: 'asc'
  }
);
```

### Complex Condition Example

```typescript
const conditions: RuleCondition[] = [
  {
    id: '1',
    field: 'transaction.amount',
    fieldType: 'amount',
    comparator: 'between',
    value: 100,
    value2: 5000,
    logicalOperator: 'AND'
  },
  {
    id: '2',
    field: 'transaction.date',
    fieldType: 'date',
    comparator: 'greater_than',
    value: '2024-01-01',
    logicalOperator: 'AND'
  },
  {
    id: '3',
    field: 'partner.id',
    fieldType: 'string',
    comparator: 'in',
    value: 'PARTNER-A, PARTNER-B, PARTNER-C'
  }
];
```

### Fuzzy Match Configuration

```typescript
const fuzzyConfig: MatchConfiguration = {
  strategy: 'fuzzy',
  threshold: 90,
  tolerance: {
    amount: 0.50,
    percentage: 0.5
  }
};
```

## 📚 API Reference

### Rule Interface

```typescript
interface Rule {
  id: string;
  ruleNumber: string;
  name: string;
  description: string;
  status: RuleStatus;
  version: number;
  conditions: RuleCondition[];
  matchConfiguration: MatchConfiguration;
  priority: number;
  isEnabled: boolean;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  tags: string[];
  appliesTo: {
    partners?: string[];
    reconciliationTypes?: string[];
  };
  statistics?: {
    timesApplied: number;
    successfulMatches: number;
    lastApplied?: string;
  };
}
```

### RuleCondition Interface

```typescript
interface RuleCondition {
  id: string;
  field: string;
  fieldType: FieldType;
  comparator: Comparator;
  value?: any;
  value2?: any;
  logicalOperator?: 'AND' | 'OR';
}
```

### MatchConfiguration Interface

```typescript
interface MatchConfiguration {
  strategy: MatchStrategy;
  threshold?: number;
  keyFields?: string[];
  tolerance?: {
    amount?: number;
    percentage?: number;
  };
  aiModel?: string;
}
```

## 🧪 Testing

### Running Tests

```bash
# Run all Rule Engine tests
npm test -- rules

# Run specific test file
npm test -- ConditionBuilder.test.tsx

# Run with coverage
npm test -- --coverage rules
```

### Test Coverage

- **ConditionBuilder**: 10 tests covering add/remove, field selection, comparators, logical operators
- **RuleStatusBadge**: 11 tests covering all statuses, sizes, styling
- **MatchStrategySelector**: 10 tests covering all strategies, configuration options

### Writing Tests

Example test for a new component:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });
});
```

## 🔗 Integration Guide

### Adding to Application Routes

```typescript
// routes/index.tsx
import { RuleListPage } from '@/pages/rules/RuleListPage';
import { RuleEditorPage } from '@/pages/rules/RuleEditorPage';
import { RuleDetailsPage } from '@/pages/rules/RuleDetailsPage';

const routes = [
  {
    path: '/rules',
    element: <RuleListPage />
  },
  {
    path: '/rules/new',
    element: <RuleEditorPage />
  },
  {
    path: '/rules/:ruleId',
    element: <RuleDetailsPage />
  },
  {
    path: '/rules/:ruleId/edit',
    element: <RuleEditorPage />
  }
];
```

### Navigation Menu

```typescript
const menuItems = [
  {
    label: 'Rule Engine',
    icon: <Settings />,
    path: '/rules'
  }
];
```

### Connecting to Real Backend

Replace mock service calls with real API endpoints:

```typescript
// Before (mock)
export async function getRules() {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockRules;
}

// After (real API)
export async function getRules(filters?: RuleListFilters) {
  const response = await apiClient.get('/api/rules', { params: filters });
  return response.data;
}
```

## 🎨 Customization

### Styling

All components use Shadcn UI and Tailwind CSS. Customize by:

1. Modifying Tailwind theme in `tailwind.config.js`
2. Updating Shadcn component styles
3. Adding custom CSS classes

### Adding Custom Field Types

```typescript
// Add to AVAILABLE_FIELDS in ruleEngineService.ts
{
  id: 'custom.field',
  name: 'custom.field',
  label: 'Custom Field',
  type: 'string',
  category: 'Custom',
  description: 'Custom field description',
  allowedComparators: ['equals', 'contains'],
  sampleValues: ['sample1', 'sample2']
}
```

### Adding Custom Match Strategies

```typescript
// Add to MatchStrategy type
export type MatchStrategy = 'exact' | 'fuzzy' | 'n_way' | 'ai_assisted' | 'custom';

// Add configuration in MatchStrategySelector
{
  value: 'custom',
  label: 'Custom Strategy',
  description: 'Custom matching logic',
  icon: <CustomIcon />,
  color: 'text-custom-600'
}
```

## 📊 Performance Considerations

- **Auto-refresh**: Rules list refreshes every 30 seconds
- **Pagination**: Not implemented in mock data (add for large datasets)
- **Debouncing**: Search input should be debounced for production
- **Lazy Loading**: Consider lazy loading for version history

## 🐛 Troubleshooting

### Issue: Conditions not saving
**Solution**: Ensure all required fields (field, comparator, value) are populated

### Issue: Match strategy not updating
**Solution**: Check that onChange callback is properly connected

### Issue: Approval buttons not showing
**Solution**: Verify user role matches maker-checker requirements

### Issue: Version history not loading
**Solution**: Check that ruleId is valid and versions endpoint is accessible

## 📝 Future Enhancements

- [ ] Bulk rule operations (enable/disable multiple)
- [ ] Rule templates library
- [ ] Advanced analytics dashboard
- [ ] Rule conflict detection
- [ ] Import/export rules (JSON/CSV)
- [ ] Rule scheduling (time-based activation)
- [ ] A/B testing for rules
- [ ] Machine learning-based rule suggestions

## 📄 License

Part of AutoReconV2 Enterprise Reconciliation System

---

**Last Updated**: January 2026  
**Version**: 1.0.0  
**Module**: Rule Engine
