import React, { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  RuleCondition, 
  AVAILABLE_FIELDS, 
  AvailableField,
  Comparator,
  getComparatorLabel 
} from '@/services/ruleEngineService';

interface ConditionBuilderProps {
  conditions: RuleCondition[];
  onChange: (conditions: RuleCondition[]) => void;
  readOnly?: boolean;
}

/**
 * ConditionBuilder Component
 * 
 * A reusable component for building complex rule conditions with a visual interface.
 * Supports multiple field types, comparators, and logical operators.
 * 
 * @example
 * ```tsx
 * const [conditions, setConditions] = useState<RuleCondition[]>([]);
 * 
 * <ConditionBuilder
 *   conditions={conditions}
 *   onChange={setConditions}
 * />
 * ```
 */
export const ConditionBuilder: React.FC<ConditionBuilderProps> = ({
  conditions,
  onChange,
  readOnly = false
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  /**
   * Add a new empty condition
   */
  const handleAddCondition = () => {
    const newCondition: RuleCondition = {
      id: `condition-${Date.now()}`,
      field: '',
      fieldType: 'string',
      comparator: 'equals',
      value: '',
      logicalOperator: conditions.length > 0 ? 'AND' : undefined
    };
    onChange([...conditions, newCondition]);
  };

  /**
   * Remove a condition by index
   */
  const handleRemoveCondition = (index: number) => {
    const updated = conditions.filter((_, i) => i !== index);
    // Remove logical operator from first condition if it exists
    if (updated.length > 0 && updated[0].logicalOperator) {
      updated[0] = { ...updated[0], logicalOperator: undefined };
    }
    onChange(updated);
  };

  /**
   * Update a specific condition
   */
  const handleUpdateCondition = (index: number, updates: Partial<RuleCondition>) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  /**
   * Handle field selection change
   */
  const handleFieldChange = (index: number, fieldName: string) => {
    const field = AVAILABLE_FIELDS.find(f => f.name === fieldName);
    if (!field) return;

    const updates: Partial<RuleCondition> = {
      field: fieldName,
      fieldType: field.type,
      comparator: field.allowedComparators[0], // Set default comparator
      value: '', // Reset value when field changes
      value2: undefined
    };

    handleUpdateCondition(index, updates);
  };

  /**
   * Handle comparator change
   */
  const handleComparatorChange = (index: number, comparator: Comparator) => {
    const updates: Partial<RuleCondition> = {
      comparator,
      value: '', // Reset value when comparator changes
      value2: undefined
    };

    // If changing to/from 'between', reset values
    if (comparator === 'between') {
      updates.value2 = '';
    }

    handleUpdateCondition(index, updates);
  };

  /**
   * Get allowed comparators for a field
   */
  const getAllowedComparators = (fieldName: string): Comparator[] => {
    const field = AVAILABLE_FIELDS.find(f => f.name === fieldName);
    return field?.allowedComparators || [];
  };

  /**
   * Render value input based on field type and comparator
   */
  const renderValueInput = (condition: RuleCondition, index: number) => {
    if (condition.comparator === 'is_null' || condition.comparator === 'is_not_null') {
      return (
        <div className="text-sm text-muted-foreground italic">
          No value required
        </div>
      );
    }

    const field = AVAILABLE_FIELDS.find(f => f.name === condition.field);
    
    // For "in" and "not_in" comparators
    if (condition.comparator === 'in' || condition.comparator === 'not_in') {
      return (
        <div className="space-y-2">
          <Input
            type="text"
            value={condition.value || ''}
            onChange={(e) => handleUpdateCondition(index, { value: e.target.value })}
            placeholder="Enter comma-separated values"
            disabled={readOnly}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Enter values separated by commas (e.g., USD, EUR, GBP)
          </p>
        </div>
      );
    }

    // For "between" comparator
    if (condition.comparator === 'between') {
      return (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">From</Label>
            <Input
              type={condition.fieldType === 'date' ? 'date' : condition.fieldType === 'number' || condition.fieldType === 'amount' ? 'number' : 'text'}
              value={condition.value || ''}
              onChange={(e) => handleUpdateCondition(index, { value: e.target.value })}
              placeholder="Min value"
              disabled={readOnly}
              step={condition.fieldType === 'amount' ? '0.01' : undefined}
            />
          </div>
          <div>
            <Label className="text-xs">To</Label>
            <Input
              type={condition.fieldType === 'date' ? 'date' : condition.fieldType === 'number' || condition.fieldType === 'amount' ? 'number' : 'text'}
              value={condition.value2 || ''}
              onChange={(e) => handleUpdateCondition(index, { value2: e.target.value })}
              placeholder="Max value"
              disabled={readOnly}
              step={condition.fieldType === 'amount' ? '0.01' : undefined}
            />
          </div>
        </div>
      );
    }

    // Standard input types
    let inputType = 'text';
    let inputStep: string | undefined;
    
    if (condition.fieldType === 'date') {
      inputType = 'date';
    } else if (condition.fieldType === 'number' || condition.fieldType === 'amount') {
      inputType = 'number';
      inputStep = condition.fieldType === 'amount' ? '0.01' : undefined;
    }

    return (
      <Input
        type={inputType}
        value={condition.value || ''}
        onChange={(e) => handleUpdateCondition(index, { value: e.target.value })}
        placeholder={field?.sampleValues?.[0] || 'Enter value'}
        disabled={readOnly}
        step={inputStep}
      />
    );
  };

  /**
   * Get field category color
   */
  const getFieldCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      Transaction: 'bg-blue-100 text-blue-800',
      Partner: 'bg-green-100 text-green-800',
      Account: 'bg-purple-100 text-purple-800',
      Reconciliation: 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Handle drag and drop reordering
   */
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...conditions];
    const [draggedItem] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);
    
    onChange(updated);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>IF Conditions</span>
          {!readOnly && (
            <Button
              onClick={handleAddCondition}
              size="sm"
              variant="outline"
              disabled={readOnly}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Condition
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Define the conditions that must be met for this rule to apply.
          {conditions.length === 0 && ' Click "Add Condition" to get started.'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {conditions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No conditions defined yet</p>
            <p className="text-xs mt-1">Add at least one condition to activate this rule</p>
          </div>
        ) : (
          conditions.map((condition, index) => {
            const field = AVAILABLE_FIELDS.find(f => f.name === condition.field);
            
            return (
              <div key={condition.id} className="space-y-3">
                {/* Logical operator badge (for all except first condition) */}
                {index > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 border-t border-dashed" />
                    <Select
                      value={condition.logicalOperator || 'AND'}
                      onValueChange={(value) => handleUpdateCondition(index, { logicalOperator: value as 'AND' | 'OR' })}
                      disabled={readOnly}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">AND</SelectItem>
                        <SelectItem value="OR">OR</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex-1 border-t border-dashed" />
                  </div>
                )}

                {/* Condition row */}
                <div
                  className={`border rounded-lg p-4 ${draggedIndex === index ? 'opacity-50' : ''}`}
                  draggable={!readOnly}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="grid grid-cols-12 gap-3 items-start">
                    {/* Drag handle */}
                    {!readOnly && (
                      <div className="col-span-1 flex items-center justify-center pt-2 cursor-move">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}

                    {/* Field selection */}
                    <div className={readOnly ? 'col-span-4' : 'col-span-3'}>
                      <Label className="text-xs mb-1.5 block">Field</Label>
                      <Select
                        value={condition.field}
                        onValueChange={(value) => handleFieldChange(index, value)}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(
                            AVAILABLE_FIELDS.reduce((acc, field) => {
                              if (!acc[field.category]) acc[field.category] = [];
                              acc[field.category].push(field);
                              return acc;
                            }, {} as Record<string, AvailableField[]>)
                          ).map(([category, fields]) => (
                            <React.Fragment key={category}>
                              <div className="px-2 py-1.5">
                                <Badge variant="secondary" className={`text-xs ${getFieldCategoryColor(category)}`}>
                                  {category}
                                </Badge>
                              </div>
                              {fields.map((f) => (
                                <SelectItem key={f.id} value={f.name}>
                                  <div className="flex flex-col">
                                    <span>{f.label}</span>
                                    <span className="text-xs text-muted-foreground">{f.description}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </React.Fragment>
                          ))}
                        </SelectContent>
                      </Select>
                      {field && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Type: {field.type}
                        </p>
                      )}
                    </div>

                    {/* Comparator selection */}
                    <div className="col-span-3">
                      <Label className="text-xs mb-1.5 block">Comparator</Label>
                      <Select
                        value={condition.comparator}
                        onValueChange={(value) => handleComparatorChange(index, value as Comparator)}
                        disabled={readOnly || !condition.field}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select comparator" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAllowedComparators(condition.field).map((comp) => (
                            <SelectItem key={comp} value={comp}>
                              {getComparatorLabel(comp)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Value input */}
                    <div className="col-span-4">
                      <Label className="text-xs mb-1.5 block">Value</Label>
                      {renderValueInput(condition, index)}
                    </div>

                    {/* Delete button */}
                    {!readOnly && (
                      <div className="col-span-1 flex items-center justify-center pt-7">
                        <Button
                          onClick={() => handleRemoveCondition(index)}
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Summary */}
        {conditions.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs font-medium mb-1">Condition Summary:</p>
            <p className="text-xs text-muted-foreground">
              {conditions.map((c, i) => {
                const field = AVAILABLE_FIELDS.find(f => f.name === c.field);
                return (
                  <span key={c.id}>
                    {i > 0 && <span className="font-semibold"> {c.logicalOperator} </span>}
                    {field?.label || c.field} {getComparatorLabel(c.comparator)} {c.value}
                    {c.value2 && ` and ${c.value2}`}
                  </span>
                );
              }).reduce((prev, curr, i) => i === 0 ? [curr] : [...prev, curr], [] as React.ReactNode[])}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
