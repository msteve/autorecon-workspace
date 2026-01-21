import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChangeDiffViewer } from '../ChangeDiffViewer';
import type { ChangeSet } from '@/types';

const mockChanges: ChangeSet = {
  before: {
    threshold: 0.85,
    tolerance: 0.05,
    enabled: true
  },
  after: {
    threshold: 0.90,
    tolerance: 0.03,
    enabled: true
  },
  diff: [
    {
      path: 'threshold',
      field: 'Match Threshold',
      old_value: 0.85,
      new_value: 0.90,
      change_type: 'modified'
    },
    {
      path: 'tolerance',
      field: 'Tolerance',
      old_value: 0.05,
      new_value: 0.03,
      change_type: 'modified'
    }
  ]
};

const mockAddedChange: ChangeSet = {
  before: {},
  after: { new_field: 'value' },
  diff: [
    {
      path: 'new_field',
      field: 'New Field',
      old_value: null,
      new_value: 'value',
      change_type: 'added'
    }
  ]
};

const mockRemovedChange: ChangeSet = {
  before: { old_field: 'value' },
  after: {},
  diff: [
    {
      path: 'old_field',
      field: 'Old Field',
      old_value: 'value',
      new_value: null,
      change_type: 'removed'
    }
  ]
};

describe('ChangeDiffViewer', () => {
  it('renders change summary', () => {
    render(<ChangeDiffViewer changes={mockChanges} />);

    expect(screen.getByText('2 changes detected')).toBeInTheDocument();
  });

  it('displays modified changes with old and new values', () => {
    render(<ChangeDiffViewer changes={mockChanges} />);

    expect(screen.getByText('Match Threshold')).toBeInTheDocument();
    expect(screen.getByText('Tolerance')).toBeInTheDocument();
    expect(screen.getByText('0.85')).toBeInTheDocument();
    expect(screen.getByText('0.9')).toBeInTheDocument();
    expect(screen.getByText('0.05')).toBeInTheDocument();
    expect(screen.getByText('0.03')).toBeInTheDocument();
  });

  it('displays added changes', () => {
    render(<ChangeDiffViewer changes={mockAddedChange} />);

    expect(screen.getByText('New Field')).toBeInTheDocument();
    expect(screen.getByText(/added/i)).toBeInTheDocument();
    expect(screen.getByText('value')).toBeInTheDocument();
  });

  it('displays removed changes', () => {
    render(<ChangeDiffViewer changes={mockRemovedChange} />);

    expect(screen.getByText('Old Field')).toBeInTheDocument();
    expect(screen.getByText(/removed/i)).toBeInTheDocument();
    expect(screen.getByText('value')).toBeInTheDocument();
  });

  it('shows change type badges', () => {
    render(<ChangeDiffViewer changes={mockChanges} />);

    const badges = screen.getAllByText('modified');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('displays summary badges for change types', () => {
    const mixedChanges: ChangeSet = {
      before: { field1: 'old', field2: 'value' },
      after: { field1: 'new', field3: 'added' },
      diff: [
        {
          path: 'field1',
          field: 'Field 1',
          old_value: 'old',
          new_value: 'new',
          change_type: 'modified'
        },
        {
          path: 'field2',
          field: 'Field 2',
          old_value: 'value',
          new_value: null,
          change_type: 'removed'
        },
        {
          path: 'field3',
          field: 'Field 3',
          old_value: null,
          new_value: 'added',
          change_type: 'added'
        }
      ]
    };

    render(<ChangeDiffViewer changes={mixedChanges} />);

    expect(screen.getByText('+1')).toBeInTheDocument();
    expect(screen.getByText('~1')).toBeInTheDocument();
    expect(screen.getByText('-1')).toBeInTheDocument();
  });

  it('shows full payload when requested', () => {
    render(<ChangeDiffViewer changes={mockChanges} showFullPayload={true} />);

    expect(screen.getByText('Complete Payload')).toBeInTheDocument();
    expect(screen.getByText('Before')).toBeInTheDocument();
    expect(screen.getByText('After')).toBeInTheDocument();
  });

  it('displays empty state when no changes', () => {
    const emptyChanges: ChangeSet = {
      before: {},
      after: {},
      diff: []
    };

    render(<ChangeDiffViewer changes={emptyChanges} />);

    expect(screen.getByText('No changes detected')).toBeInTheDocument();
  });

  it('formats complex values correctly', () => {
    const complexChanges: ChangeSet = {
      before: { config: { nested: true } },
      after: { config: { nested: false } },
      diff: [
        {
          path: 'config.nested',
          field: 'Nested Config',
          old_value: { nested: true },
          new_value: { nested: false },
          change_type: 'modified'
        }
      ]
    };

    render(<ChangeDiffViewer changes={complexChanges} />);

    expect(screen.getByText('Nested Config')).toBeInTheDocument();
  });

  it('formats null values correctly', () => {
    const nullChanges: ChangeSet = {
      before: { field: null },
      after: { field: 'value' },
      diff: [
        {
          path: 'field',
          field: 'Field',
          old_value: null,
          new_value: 'value',
          change_type: 'modified'
        }
      ]
    };

    render(<ChangeDiffViewer changes={nullChanges} />);

    expect(screen.getByText('null')).toBeInTheDocument();
  });
});
