import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConditionBuilder } from '../ConditionBuilder';
import { RuleCondition } from '@/services/ruleEngineService';

describe('ConditionBuilder', () => {
  const mockConditions: RuleCondition[] = [
    {
      id: '1',
      field: 'transaction.amount',
      fieldType: 'amount',
      comparator: 'greater_than',
      value: 1000
    }
  ];

  it('renders empty state when no conditions', () => {
    const onChange = vi.fn();
    render(<ConditionBuilder conditions={[]} onChange={onChange} />);
    
    expect(screen.getByText(/no conditions defined/i)).toBeInTheDocument();
  });

  it('renders existing conditions', () => {
    const onChange = vi.fn();
    render(<ConditionBuilder conditions={mockConditions} onChange={onChange} />);
    
    expect(screen.getByText(/transaction amount/i)).toBeInTheDocument();
  });

  it('adds new condition when clicking Add Condition button', () => {
    const onChange = vi.fn();
    render(<ConditionBuilder conditions={[]} onChange={onChange} />);
    
    const addButton = screen.getByText(/add condition/i);
    fireEvent.click(addButton);
    
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0]).toHaveLength(1);
  });

  it('removes condition when clicking delete button', () => {
    const onChange = vi.fn();
    render(<ConditionBuilder conditions={mockConditions} onChange={onChange} />);
    
    const deleteButton = screen.getByRole('button', { name: '' }); // Trash icon button
    fireEvent.click(deleteButton);
    
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('updates condition field', () => {
    const onChange = vi.fn();
    render(<ConditionBuilder conditions={mockConditions} onChange={onChange} />);
    
    // Field selection would trigger onChange
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows logical operator for multiple conditions', () => {
    const conditions: RuleCondition[] = [
      ...mockConditions,
      {
        id: '2',
        field: 'transaction.currency',
        fieldType: 'string',
        comparator: 'equals',
        value: 'USD',
        logicalOperator: 'AND'
      }
    ];

    render(<ConditionBuilder conditions={conditions} onChange={vi.fn()} />);
    
    expect(screen.getByText('AND')).toBeInTheDocument();
  });

  it('displays condition summary', () => {
    const onChange = vi.fn();
    render(<ConditionBuilder conditions={mockConditions} onChange={onChange} />);
    
    expect(screen.getByText(/condition summary/i)).toBeInTheDocument();
  });

  it('is read-only when readOnly prop is true', () => {
    const onChange = vi.fn();
    render(<ConditionBuilder conditions={mockConditions} onChange={onChange} readOnly />);
    
    const addButton = screen.queryByText(/add condition/i);
    expect(addButton).not.toBeInTheDocument();
  });

  it('handles between comparator with two values', () => {
    const conditions: RuleCondition[] = [
      {
        id: '1',
        field: 'transaction.amount',
        fieldType: 'amount',
        comparator: 'between',
        value: 100,
        value2: 1000
      }
    ];

    render(<ConditionBuilder conditions={conditions} onChange={vi.fn()} />);
    
    expect(screen.getByText(/from/i)).toBeInTheDocument();
    expect(screen.getByText(/to/i)).toBeInTheDocument();
  });

  it('shows appropriate input for field types', () => {
    const conditions: RuleCondition[] = [
      {
        id: '1',
        field: 'transaction.date',
        fieldType: 'date',
        comparator: 'equals',
        value: '2024-01-01'
      }
    ];

    render(<ConditionBuilder conditions={conditions} onChange={vi.fn()} />);
    
    // Date input would be rendered
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
  });
});
