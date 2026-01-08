import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ingestionService, type UploadFileRequest } from '@/services/ingestionService';
import { FileUploader } from '@/components/ingestion/FileUploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Upload, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UploadFormData {
  partner: string;
  reconciliationType: string;
  period: string;
  notes?: string;
}

const UploadFilePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UploadFormData>({
    defaultValues: {
      period: '2026-01',
    },
  });

  const { data: partners, isLoading: partnersLoading } = useQuery({
    queryKey: ['partners'],
    queryFn: ingestionService.getPartners,
  });

  const { data: reconciliationTypes, isLoading: typesLoading } = useQuery({
    queryKey: ['reconciliation-types'],
    queryFn: ingestionService.getReconciliationTypes,
  });

  const uploadMutation = useMutation({
    mutationFn: (request: UploadFileRequest) => ingestionService.uploadFile(request),
    onSuccess: (job) => {
      queryClient.invalidateQueries({ queryKey: ['ingestion-jobs'] });
      toast({
        title: 'File Uploaded Successfully',
        description: `Job ${job.jobNumber} created and queued for processing.`,
      });
      setTimeout(() => {
        navigate(`/ingestion/jobs/${job.id}`);
      }, 1500);
    },
    onError: (error: Error) => {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload file. Please try again.',
        variant: 'destructive',
      });
      setUploadProgress(undefined);
    },
  });

  const onSubmit = async (data: UploadFormData) => {
    if (!selectedFile) {
      toast({
        title: 'No File Selected',
        description: 'Please select a file to upload.',
        variant: 'destructive',
      });
      return;
    }

    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === undefined) return 0;
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await uploadMutation.mutateAsync({
        file: selectedFile,
        metadata: {
          partner: data.partner,
          reconciliationType: data.reconciliationType,
          period: data.period,
          notes: data.notes,
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(undefined);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadProgress(undefined);
  };

  const isUploading = uploadMutation.isPending;
  const isUploadComplete = uploadProgress === 100;
  const partner = watch('partner');
  const reconciliationType = watch('reconciliationType');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/ingestion')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload File</h1>
          <p className="text-muted-foreground">
            Upload a reconciliation file for processing
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Select File</CardTitle>
            <CardDescription>
              Choose a CSV or Excel file to upload (max 10MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploader
              onFileSelect={handleFileSelect}
              accept=".csv,.xlsx,.xls"
              maxSize={10 * 1024 * 1024}
              disabled={isUploading || isUploadComplete}
              uploadProgress={uploadProgress}
            />
          </CardContent>
        </Card>

        {/* Metadata Form */}
        <Card>
          <CardHeader>
            <CardTitle>File Metadata</CardTitle>
            <CardDescription>
              Provide information about the reconciliation data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Partner Selection */}
            <div className="space-y-2">
              <Label htmlFor="partner">
                Partner <span className="text-red-500">*</span>
              </Label>
              <Select
                value={partner}
                onValueChange={(value) => setValue('partner', value)}
                disabled={isUploading || isUploadComplete || partnersLoading}
              >
                <SelectTrigger id="partner">
                  <SelectValue placeholder="Select a partner" />
                </SelectTrigger>
                <SelectContent>
                  {partners?.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.partner && (
                <p className="text-sm text-red-500">{errors.partner.message}</p>
              )}
            </div>

            {/* Reconciliation Type */}
            <div className="space-y-2">
              <Label htmlFor="reconciliationType">
                Reconciliation Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={reconciliationType}
                onValueChange={(value) => setValue('reconciliationType', value)}
                disabled={isUploading || isUploadComplete || typesLoading}
              >
                <SelectTrigger id="reconciliationType">
                  <SelectValue placeholder="Select reconciliation type" />
                </SelectTrigger>
                <SelectContent>
                  {reconciliationTypes?.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.reconciliationType && (
                <p className="text-sm text-red-500">
                  {errors.reconciliationType.message}
                </p>
              )}
            </div>

            {/* Period */}
            <div className="space-y-2">
              <Label htmlFor="period">
                Period <span className="text-red-500">*</span>
              </Label>
              <Input
                id="period"
                type="month"
                {...register('period', {
                  required: 'Period is required',
                })}
                disabled={isUploading || isUploadComplete}
              />
              {errors.period && (
                <p className="text-sm text-red-500">{errors.period.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Select the month and year for this reconciliation
              </p>
            </div>

            {/* Notes (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes or context..."
                {...register('notes')}
                disabled={isUploading || isUploadComplete}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Optional notes about this reconciliation job
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        {selectedFile && partner && reconciliationType && (
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="text-lg">Upload Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">File:</span>
                <span className="font-medium">{selectedFile.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Partner:</span>
                <span className="font-medium">{partner}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">{reconciliationType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Period:</span>
                <span className="font-medium">
                  {watch('period') || 'Not specified'}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/ingestion')}
            disabled={isUploading || isUploadComplete}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              !selectedFile ||
              !partner ||
              !reconciliationType ||
              isUploading ||
              isUploadComplete
            }
          >
            {isUploadComplete ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Uploaded Successfully
              </>
            ) : isUploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-pulse" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UploadFilePage;
