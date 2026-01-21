import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Calendar,
  Clock,
  Users,
  FileText,
  Settings
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { reportsService } from '@/services/reportsService';
import type { Report, ReportSchedule } from '@/types';

export default function ReportScheduler() {
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('report');
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    report_type: 'reconciliation' as Report['report_type'],
    category: 'operational' as Report['category'],
    format: 'pdf' as Report['format'],
    status: 'draft' as Report['status'],
    scheduleEnabled: false,
    frequency: 'daily' as ReportSchedule['frequency'],
    time: '08:00',
    dayOfWeek: 1,
    dayOfMonth: 1,
    recipients: '',
    timezone: 'America/New_York'
  });

  // Fetch existing report if editing
  const { data: existingReport } = useQuery({
    queryKey: ['report', reportId],
    queryFn: () => reportsService.getReportById(reportId!),
    enabled: !!reportId,
    staleTime: 0
  });

  useEffect(() => {
    if (existingReport) {
      setFormData({
        name: existingReport.name,
        description: existingReport.description,
        report_type: existingReport.report_type,
        category: existingReport.category,
        format: existingReport.format,
        status: existingReport.status,
        scheduleEnabled: !!existingReport.schedule?.enabled,
        frequency: existingReport.schedule?.frequency || 'daily',
        time: existingReport.schedule?.time || '08:00',
        dayOfWeek: existingReport.schedule?.day_of_week || 1,
        dayOfMonth: existingReport.schedule?.day_of_month || 1,
        recipients: existingReport.schedule?.recipients.join(', ') || '',
        timezone: existingReport.schedule?.timezone || 'America/New_York'
      });
    }
  }, [existingReport]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const reportData: Partial<Report> = {
        name: data.name,
        description: data.description,
        report_type: data.report_type,
        category: data.category,
        format: data.format,
        status: data.status,
        schedule: data.scheduleEnabled ? {
          id: existingReport?.schedule?.id || `SCH-${Date.now()}`,
          report_id: reportId || '',
          frequency: data.frequency,
          time: data.time,
          day_of_week: data.frequency === 'weekly' ? data.dayOfWeek : undefined,
          day_of_month: data.frequency === 'monthly' ? data.dayOfMonth : undefined,
          timezone: data.timezone,
          recipients: data.recipients.split(',').map(e => e.trim()).filter(Boolean),
          enabled: true
        } : undefined
      };

      if (reportId) {
        return reportsService.updateReport(reportId, reportData);
      } else {
        return reportsService.createReport(reportData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['report-stats'] });
      toast({
        title: reportId ? 'Report Updated' : 'Report Created',
        description: reportId ? 'Report has been updated successfully' : 'Report has been created successfully',
      });
      navigate('/reports');
    },
    onError: () => {
      toast({
        title: 'Save Failed',
        description: 'Failed to save report. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/reports">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {reportId ? 'Edit Report' : 'Create New Report'}
            </h1>
            <p className="text-white text-opacity-90 mt-1">
              {reportId ? 'Update report configuration and schedule' : 'Configure a new automated report'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="h-5 w-5 text-white text-opacity-90" />
            <h2 className="text-lg font-semibold text-white">Basic Information</h2>
          </div>

          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Report Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g., Daily Reconciliation Summary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe what this report contains and its purpose"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="report_type" className="text-white">Report Type *</Label>
                <Select
                  value={formData.report_type}
                  onValueChange={(value) => updateField('report_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reconciliation">Reconciliation</SelectItem>
                    <SelectItem value="matching">Matching</SelectItem>
                    <SelectItem value="exceptions">Exceptions</SelectItem>
                    <SelectItem value="settlement">Settlement</SelectItem>
                    <SelectItem value="gl_posting">GL Posting</SelectItem>
                    <SelectItem value="audit">Audit</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-white">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => updateField('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format" className="text-white">Output Format *</Label>
                <Select
                  value={formData.format}
                  onValueChange={(value) => updateField('format', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-white">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => updateField('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Schedule Configuration */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-5 w-5 text-white text-opacity-90" />
            <h2 className="text-lg font-semibold text-white">Schedule Configuration</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="scheduleEnabled"
                checked={formData.scheduleEnabled}
                onCheckedChange={(checked) => updateField('scheduleEnabled', checked)}
              />
              <Label htmlFor="scheduleEnabled" className="text-white cursor-pointer">
                Enable automatic scheduling
              </Label>
            </div>

            {formData.scheduleEnabled && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="frequency" className="text-white">Frequency *</Label>
                    <Select
                      value={formData.frequency}
                      onValueChange={(value) => updateField('frequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="on_demand">On-Demand</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-white">Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => updateField('time', e.target.value)}
                      required={formData.scheduleEnabled}
                    />
                  </div>
                </div>

                {formData.frequency === 'weekly' && (
                  <div className="space-y-2">
                    <Label htmlFor="dayOfWeek" className="text-white">Day of Week</Label>
                    <Select
                      value={String(formData.dayOfWeek)}
                      onValueChange={(value) => updateField('dayOfWeek', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sunday</SelectItem>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.frequency === 'monthly' && (
                  <div className="space-y-2">
                    <Label htmlFor="dayOfMonth" className="text-white">Day of Month</Label>
                    <Input
                      id="dayOfMonth"
                      type="number"
                      min="1"
                      max="31"
                      value={formData.dayOfMonth}
                      onChange={(e) => updateField('dayOfMonth', parseInt(e.target.value))}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-white">Timezone</Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) => updateField('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Recipients */}
        {formData.scheduleEnabled && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Users className="h-5 w-5 text-white text-opacity-90" />
              <h2 className="text-lg font-semibold text-white">Recipients</h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipients" className="text-white">Email Recipients</Label>
              <Textarea
                id="recipients"
                value={formData.recipients}
                onChange={(e) => updateField('recipients', e.target.value)}
                placeholder="Enter email addresses separated by commas (e.g., user1@company.com, user2@company.com)"
                rows={3}
              />
              <p className="text-sm text-white text-opacity-80">
                Separate multiple email addresses with commas
              </p>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link to="/reports">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? 'Saving...' : reportId ? 'Update Report' : 'Create Report'}
          </Button>
        </div>
      </form>
    </div>
  );
}
