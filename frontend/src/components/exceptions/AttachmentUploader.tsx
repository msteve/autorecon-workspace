import React, { useCallback, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  File, 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Trash2,
  Paperclip,
  X
} from 'lucide-react';
import { ExceptionAttachment } from '@/services/exceptionsService';
import { formatDistanceToNow } from 'date-fns';

interface AttachmentUploaderProps {
  attachments: ExceptionAttachment[];
  onUpload: (file: File) => Promise<void>;
  onDelete?: (attachmentId: string) => Promise<void>;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
  loading?: boolean;
  className?: string;
}

/**
 * AttachmentUploader Component
 * 
 * Handles file uploads and displays list of attachments with download/delete actions.
 * 
 * @example
 * ```tsx
 * <AttachmentUploader
 *   attachments={attachments}
 *   onUpload={handleUpload}
 *   onDelete={handleDelete}
 *   maxFileSize={5 * 1024 * 1024} // 5MB
 *   allowedTypes={['application/pdf', 'image/*']}
 * />
 * ```
 */
export const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
  attachments,
  onUpload,
  onDelete,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = ['*'],
  loading = false,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-blue-600" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-600" />;
    } else {
      return <File className="h-5 w-5 text-gray-600" />;
    }
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File size exceeds ${formatFileSize(maxFileSize)}`;
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes('*')) {
      const isAllowed = allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', ''));
        }
        return file.type === type;
      });

      if (!isAllowed) {
        return `File type ${file.type} is not allowed`;
      }
    }

    return null;
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    const file = files[0];

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      setError('Failed to upload file. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, []);

  const handleDelete = async (attachmentId: string) => {
    if (!onDelete) return;
    
    try {
      await onDelete(attachmentId);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paperclip className="h-5 w-5" />
          Attachments ({attachments.length})
        </CardTitle>
        <CardDescription>
          Upload files up to {formatFileSize(maxFileSize)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm font-medium mb-2">
              {uploading ? 'Uploading...' : 'Drag and drop files here'}
            </p>
            <p className="text-xs text-muted-foreground mb-4">or</p>
            <div>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
                disabled={uploading}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={uploading}
              >
                Browse Files
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <X className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Upload Failed</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Attachments List */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading attachments...
            </div>
          ) : attachments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Paperclip className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No attachments yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  {getFileIcon(attachment.fileType)}
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{attachment.fileName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(attachment.fileSize)}</span>
                      <span>•</span>
                      <span>Uploaded by {attachment.uploadedByName}</span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(attachment.uploadedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(attachment.url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(attachment.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
