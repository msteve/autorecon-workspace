import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, DollarSign, FileText, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { settlementService } from '@/services/settlementService';
import type { CreateSettlementRunRequest } from '@/types';

export default function CreateSettlementRun() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CreateSettlementRunRequest>({
    period_start: '',
    period_end: '',
    payment_method: 'bank_transfer',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useMutation({
    mutationFn: (data: CreateSettlementRunRequest) => settlementService.createSettlementRun(data),
    onSuccess: (newRun) => {
      queryClient.invalidateQueries({ queryKey: ['settlement-runs'] });
      queryClient.invalidateQueries({ queryKey: ['settlement-stats'] });
      toast({
        title: 'Settlement Run Created',
        description: `Successfully created ${newRun.run_number}`,
      });
      navigate(`/settlement/${newRun.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: 'Creation Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.period_start) {
      newErrors.period_start = 'Period start date is required';
    }

    if (!formData.period_end) {
      newErrors.period_end = 'Period end date is required';
    }

    if (formData.period_start && formData.period_end) {
      const start = new Date(formData.period_start);
      const end = new Date(formData.period_end);
      if (end <= start) {
        newErrors.period_end = 'End date must be after start date';
      }
    }

    if (!formData.payment_method) {
      newErrors.payment_method = 'Payment method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive'
      });
      return;
    }

    createMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof CreateSettlementRunRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Auto-fill common date ranges
  const setDateRange = (range: 'last_week' | 'last_month' | 'last_quarter') => {
    const today = new Date();
    let start = new Date();
    let end = new Date(today);

    switch (range) {
      case 'last_week':
        start.setDate(today.getDate() - 7);
        break;
      case 'last_month':
        start.setMonth(today.getMonth() - 1);
        break;
      case 'last_quarter':
        start.setMonth(today.getMonth() - 3);
        break;
    }

    setFormData(prev => ({
      ...prev,
      period_start: start.toISOString().split('T')[0],
      period_end: end.toISOString().split('T')[0]
    }));
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/settlement')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Settlement Run</h1>
          <p className="text-gray-600 mt-1">Set up a new partner settlement processing run</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Settlement Period */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Settlement Period</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="period_start">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="period_start"
                  type="date"
                  value={formData.period_start}
                  onChange={(e) => handleInputChange('period_start', e.target.value)}
                  className={errors.period_start ? 'border-red-500' : ''}
                />
                {errors.period_start && (
                  <p className="text-sm text-red-600 mt-1">{errors.period_start}</p>
                )}
              </div>

              <div>
                <Label htmlFor="period_end">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="period_end"
                  type="date"
                  value={formData.period_end}
                  onChange={(e) => handleInputChange('period_end', e.target.value)}
                  className={errors.period_end ? 'border-red-500' : ''}
                />
                {errors.period_end && (
                  <p className="text-sm text-red-600 mt-1">{errors.period_end}</p>
                )}
              </div>
            </div>

            {/* Quick Date Range Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Quick select:</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDateRange('last_week')}
              >
                Last Week
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDateRange('last_month')}
              >
                Last Month
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDateRange('last_quarter')}
              >
                Last Quarter
              </Button>
            </div>
          </div>
        </Card>

        {/* Payment Details */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Payment Details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="payment_method">
                Payment Method <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => handleInputChange('payment_method', value)}
              >
                <SelectTrigger id="payment_method" className={errors.payment_method ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="ach">ACH</SelectItem>
                  <SelectItem value="wire">Wire Transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
              {errors.payment_method && (
                <p className="text-sm text-red-600 mt-1">{errors.payment_method}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Method used for partner payments in this run
              </p>
            </div>
          </div>
        </Card>

        {/* Additional Information */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Additional Information</h2>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add any notes or comments about this settlement run..."
              rows={4}
              className="resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              Internal notes about this settlement run
            </p>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="h-5 w-5 text-blue-600 mt-0.5">ℹ️</div>
            <div className="flex-1">
              <h3 className="font-medium text-blue-900 mb-1">What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Settlement calculations will be performed for the selected period</li>
                <li>• Partner transactions will be aggregated and fees calculated</li>
                <li>• A detailed breakdown will be generated for review</li>
                <li>• You can review and approve before processing payments</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/settlement')}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Settlement Run'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
