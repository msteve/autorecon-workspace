import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Target, Sparkles, Network, Bot } from 'lucide-react';
import { MatchStrategy, MatchConfiguration } from '@/services/ruleEngineService';

interface MatchStrategySelectorProps {
  configuration: MatchConfiguration;
  onChange: (configuration: MatchConfiguration) => void;
  readOnly?: boolean;
}

/**
 * MatchStrategySelector Component
 * 
 * Allows selection and configuration of match strategies for rules.
 * Supports exact, fuzzy, n-way, and AI-assisted matching.
 * 
 * @example
 * ```tsx
 * const [config, setConfig] = useState<MatchConfiguration>({
 *   strategy: 'exact'
 * });
 * 
 * <MatchStrategySelector
 *   configuration={config}
 *   onChange={setConfig}
 * />
 * ```
 */
export const MatchStrategySelector: React.FC<MatchStrategySelectorProps> = ({
  configuration,
  onChange,
  readOnly = false
}) => {
  const strategies: {
    value: MatchStrategy;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      value: 'exact',
      label: 'Exact Match',
      description: 'Fields must match exactly with no tolerance',
      icon: <Target className="h-5 w-5" />,
      color: 'text-blue-600'
    },
    {
      value: 'fuzzy',
      label: 'Fuzzy Match',
      description: 'Allow partial matches based on similarity threshold',
      icon: <Sparkles className="h-5 w-5" />,
      color: 'text-purple-600'
    },
    {
      value: 'n_way',
      label: 'N-Way Match',
      description: 'Match across multiple sources using key fields',
      icon: <Network className="h-5 w-5" />,
      color: 'text-green-600'
    },
    {
      value: 'ai_assisted',
      label: 'AI-Assisted',
      description: 'Use machine learning to identify complex patterns',
      icon: <Bot className="h-5 w-5" />,
      color: 'text-orange-600'
    }
  ];

  const handleStrategyChange = (strategy: MatchStrategy) => {
    const newConfig: MatchConfiguration = {
      strategy,
      threshold: strategy === 'fuzzy' ? 85 : undefined,
      keyFields: strategy === 'n_way' ? [] : undefined,
      tolerance: strategy === 'exact' ? undefined : configuration.tolerance,
      aiModel: strategy === 'ai_assisted' ? 'gpt-4' : undefined
    };
    onChange(newConfig);
  };

  const handleThresholdChange = (value: number[]) => {
    onChange({ ...configuration, threshold: value[0] });
  };

  const handleToleranceChange = (field: 'amount' | 'percentage', value: string) => {
    onChange({
      ...configuration,
      tolerance: {
        ...configuration.tolerance,
        [field]: parseFloat(value) || 0
      }
    });
  };

  const handleKeyFieldsChange = (value: string) => {
    const fields = value.split(',').map(f => f.trim()).filter(f => f);
    onChange({ ...configuration, keyFields: fields });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>THEN Match Strategy</CardTitle>
        <CardDescription>
          Select how transactions should be matched when conditions are met
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Strategy selection */}
        <RadioGroup
          value={configuration.strategy}
          onValueChange={(value) => handleStrategyChange(value as MatchStrategy)}
          disabled={readOnly}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategies.map((strategy) => (
              <Label
                key={strategy.value}
                htmlFor={strategy.value}
                className={`
                  flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${configuration.strategy === strategy.value 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                  ${readOnly ? 'cursor-not-allowed opacity-60' : ''}
                `}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem 
                    value={strategy.value} 
                    id={strategy.value}
                    disabled={readOnly}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={strategy.color}>{strategy.icon}</span>
                      <span className="font-semibold">{strategy.label}</span>
                      {strategy.value === 'ai_assisted' && (
                        <Badge variant="secondary" className="text-xs">Beta</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {strategy.description}
                    </p>
                  </div>
                </div>
              </Label>
            ))}
          </div>
        </RadioGroup>

        {/* Strategy-specific configuration */}
        <div className="pt-4 border-t">
          {/* Fuzzy Match Configuration */}
          {configuration.strategy === 'fuzzy' && (
            <div className="space-y-4">
              <div>
                <Label className="mb-3 flex items-center justify-between">
                  <span>Similarity Threshold</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {configuration.threshold}%
                  </span>
                </Label>
                <Slider
                  value={[configuration.threshold || 85]}
                  onValueChange={handleThresholdChange}
                  min={50}
                  max={100}
                  step={5}
                  disabled={readOnly}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Higher values require closer matches (more strict)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount-tolerance" className="text-sm">
                    Amount Tolerance ($)
                  </Label>
                  <Input
                    id="amount-tolerance"
                    type="number"
                    step="0.01"
                    value={configuration.tolerance?.amount || ''}
                    onChange={(e) => handleToleranceChange('amount', e.target.value)}
                    placeholder="0.00"
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="percentage-tolerance" className="text-sm">
                    Percentage Tolerance (%)
                  </Label>
                  <Input
                    id="percentage-tolerance"
                    type="number"
                    step="0.1"
                    value={configuration.tolerance?.percentage || ''}
                    onChange={(e) => handleToleranceChange('percentage', e.target.value)}
                    placeholder="0.0"
                    disabled={readOnly}
                  />
                </div>
              </div>
            </div>
          )}

          {/* N-Way Match Configuration */}
          {configuration.strategy === 'n_way' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="key-fields" className="mb-2">
                  Key Fields for Matching
                </Label>
                <Input
                  id="key-fields"
                  type="text"
                  value={configuration.keyFields?.join(', ') || ''}
                  onChange={(e) => handleKeyFieldsChange(e.target.value)}
                  placeholder="e.g., transaction_id, amount, date"
                  disabled={readOnly}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Enter field names separated by commas. These fields will be used to match across multiple sources.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount-tolerance-nway" className="text-sm">
                    Amount Tolerance ($)
                  </Label>
                  <Input
                    id="amount-tolerance-nway"
                    type="number"
                    step="0.01"
                    value={configuration.tolerance?.amount || ''}
                    onChange={(e) => handleToleranceChange('amount', e.target.value)}
                    placeholder="0.00"
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="percentage-tolerance-nway" className="text-sm">
                    Percentage Tolerance (%)
                  </Label>
                  <Input
                    id="percentage-tolerance-nway"
                    type="number"
                    step="0.1"
                    value={configuration.tolerance?.percentage || ''}
                    onChange={(e) => handleToleranceChange('percentage', e.target.value)}
                    placeholder="0.0"
                    disabled={readOnly}
                  />
                </div>
              </div>
            </div>
          )}

          {/* AI-Assisted Configuration */}
          {configuration.strategy === 'ai_assisted' && (
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Bot className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-900">
                      AI-Assisted Matching (Beta)
                    </p>
                    <p className="text-xs text-orange-700 mt-1">
                      This feature uses machine learning to identify complex matching patterns. 
                      It may take longer to process but can handle ambiguous cases more effectively.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="ai-model" className="text-sm">
                  AI Model
                </Label>
                <Input
                  id="ai-model"
                  type="text"
                  value={configuration.aiModel || 'gpt-4'}
                  onChange={(e) => onChange({ ...configuration, aiModel: e.target.value })}
                  placeholder="gpt-4"
                  disabled={readOnly}
                />
              </div>
            </div>
          )}

          {/* Exact Match Configuration */}
          {configuration.strategy === 'exact' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Exact Matching
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Fields must match exactly with no tolerance. This is the most strict matching strategy 
                    and provides the highest accuracy but may miss valid matches with minor discrepancies.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
