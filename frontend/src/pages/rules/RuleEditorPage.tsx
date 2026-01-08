import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Save, Play, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ConditionBuilder } from '@/components/rules/ConditionBuilder';
import { MatchStrategySelector } from '@/components/rules/MatchStrategySelector';
import { 
  getRuleById,
  createRule,
  updateRule,
  validateRule,
  testRule,
  Rule,
  RuleCondition,
  MatchConfiguration
} from '@/services/ruleEngineService';
import { toast } from 'sonner';

/**
 * RuleEditorPage Component
 * 
 * Create and edit reconciliation rules with a visual condition builder.
 */
export const RuleEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { ruleId } = useParams();
  const isEditMode = !!ruleId;

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(5);
  const [isEnabled, setIsEnabled] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [conditions, setConditions] = useState<RuleCondition[]>([]);
  const [matchConfiguration, setMatchConfiguration] = useState<MatchConfiguration>({
    strategy: 'exact'
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Fetch existing rule if editing
  const { data: existingRule, isLoading } = useQuery({
    queryKey: ['rule', ruleId],
    queryFn: () => getRuleById(ruleId!),
    enabled: isEditMode
  });

  // Populate form with existing rule data
  useEffect(() => {
    if (existingRule) {
      setName(existingRule.name);
      setDescription(existingRule.description);
      setPriority(existingRule.priority);
      setIsEnabled(existingRule.isEnabled);
      setTags(existingRule.tags);
      setConditions(existingRule.conditions);
      setMatchConfiguration(existingRule.matchConfiguration);
    }
  }, [existingRule]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createRule,
    onSuccess: (newRule) => {
      toast.success('Rule created successfully');
      navigate(`/rules/${newRule.id}`);
    },
    onError: () => {
      toast.error('Failed to create rule');
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Rule> }) => 
      updateRule(id, updates),
    onSuccess: () => {
      toast.success('Rule updated successfully');
      navigate(`/rules/${ruleId}`);
    },
    onError: () => {
      toast.error('Failed to update rule');
    }
  });

  // Test rule mutation
  const testMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => testRule(id, data),
    onSuccess: (result) => {
      if (result.matched) {
        toast.success(`Test passed: ${result.details}`);
      } else {
        toast.warning(`Test failed: ${result.details}`);
      }
    },
    onError: () => {
      toast.error('Failed to test rule');
    }
  });

  // Handle tag addition
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Validate form
  const handleValidate = async () => {
    const ruleData = {
      name,
      description,
      priority,
      conditions,
      matchConfiguration,
      tags
    };

    const result = await validateRule(ruleData);
    setValidationErrors(result.errors);

    if (result.valid) {
      toast.success('Rule validation passed');
    } else {
      toast.error('Rule validation failed. Please fix the errors.');
    }
  };

  // Handle save
  const handleSave = async () => {
    // Validate first
    const ruleData = {
      name,
      description,
      priority,
      conditions,
      matchConfiguration,
      tags,
      isEnabled,
      status: 'draft' as const,
      createdBy: 'current.user',
      updatedBy: 'current.user',
      appliesTo: {}
    };

    const validation = await validateRule(ruleData);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      toast.error('Please fix validation errors before saving');
      return;
    }

    if (isEditMode && ruleId) {
      updateMutation.mutate({
        id: ruleId,
        updates: {
          name,
          description,
          priority,
          conditions,
          matchConfiguration,
          tags,
          isEnabled,
          updatedBy: 'current.user'
        }
      });
    } else {
      createMutation.mutate(ruleData);
    }
  };

  // Handle test
  const handleTest = () => {
    if (!isEditMode || !ruleId) {
      toast.error('Please save the rule before testing');
      return;
    }

    // Mock sample data for testing
    const sampleData = {
      transaction: {
        id: 'TXN-001',
        amount: 1500.00,
        currency: 'USD',
        date: '2024-06-15'
      }
    };

    testMutation.mutate({ id: ruleId, data: sampleData });
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground mt-4">Loading rule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/rules')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditMode ? 'Edit Rule' : 'Create New Rule'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode 
                ? `Editing ${existingRule?.ruleNumber || ''}`
                : 'Define conditions and match strategy for automatic reconciliation'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditMode && (
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={testMutation.isPending}
            >
              <Play className="h-4 w-4 mr-2" />
              {testMutation.isPending ? 'Testing...' : 'Test Rule'}
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Rule'}
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Validation Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm text-destructive">{error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Provide a name and description for this rule
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Rule Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Auto Match High Value Transactions"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority (1-10) *</Label>
              <Select
                value={priority.toString()}
                onValueChange={(value) => setPriority(parseInt(value))}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(p => (
                    <SelectItem key={p} value={p.toString()}>
                      {p} {p === 1 ? '(Highest)' : p === 10 ? '(Lowest)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Rules with higher priority (lower number) are evaluated first
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe when and how this rule should be applied..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add tags (press Enter)"
              />
              <Button type="button" onClick={handleAddTag} variant="secondary">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Enable Rule</Label>
              <p className="text-sm text-muted-foreground">
                Active rules will be applied during reconciliation
              </p>
            </div>
            <Switch
              id="enabled"
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Condition Builder */}
      <ConditionBuilder
        conditions={conditions}
        onChange={setConditions}
      />

      {/* Match Strategy */}
      <MatchStrategySelector
        configuration={matchConfiguration}
        onChange={setMatchConfiguration}
      />

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={() => navigate('/rules')}>
          Cancel
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleValidate}>
            Validate
          </Button>
          <Button
            onClick={handleSave}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Rule'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RuleEditorPage;
