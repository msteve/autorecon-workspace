import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ingestionService } from '@/services/ingestionService';
import { toast } from '@/hooks/use-toast';
import { Upload, FileText, X } from 'lucide-react';

const IngestionUploadPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState('csv');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      await ingestionService.uploadFile(file, fileType, (progress) => {
        setProgress(progress);
      });
      
      toast({
        title: 'Upload Successful',
        description: 'File uploaded and processing started',
      });
      navigate('/ingestion');
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.response?.data?.message || 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload File</h1>
        <p className="text-muted-foreground">Upload reconciliation data files for processing</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>File Upload</CardTitle>
            <CardDescription>
              Upload CSV, Excel, or text files for reconciliation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 transition-colors hover:border-muted-foreground/50"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
              {file ? (
                <div className="text-center">
                  <div className="mb-2 flex items-center justify-center gap-2">
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">{file.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="rounded-full p-1 hover:bg-accent"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="mb-2 text-sm font-medium">
                    Drop your file here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports CSV, XLSX, XLS, TXT (Max 100MB)
                  </p>
                </div>
              )}
              <input
                id="file-input"
                type="file"
                className="hidden"
                accept=".csv,.xlsx,.xls,.txt"
                onChange={handleFileChange}
              />
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="file-type">File Type</Label>
              <select
                id="file-type"
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="csv">CSV</option>
                <option value="excel">Excel (XLSX/XLS)</option>
                <option value="txt">Text File</option>
                <option value="json">JSON</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleUpload} disabled={!file || uploading} className="flex-1">
                {uploading ? 'Uploading...' : 'Upload and Process'}
              </Button>
              <Button variant="outline" onClick={() => navigate('/ingestion')}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="mb-1 font-medium">Supported Formats</h4>
              <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                <li>CSV files (.csv)</li>
                <li>Excel files (.xlsx, .xls)</li>
                <li>Text files (.txt)</li>
                <li>JSON files (.json)</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-1 font-medium">File Requirements</h4>
              <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                <li>Maximum file size: 100MB</li>
                <li>Must include header row</li>
                <li>Date format: YYYY-MM-DD</li>
                <li>Amount format: Numeric only</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-1 font-medium">Processing Time</h4>
              <p className="text-muted-foreground">
                Files are processed asynchronously. You'll receive a notification when complete.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IngestionUploadPage;
