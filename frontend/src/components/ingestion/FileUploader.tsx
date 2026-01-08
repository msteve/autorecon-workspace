import { useState, useRef, DragEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, File, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
  disabled?: boolean;
  uploadProgress?: number;
  error?: string;
}

export const FileUploader = ({
  onFileSelect,
  accept = '.csv,.xlsx,.xls',
  maxSize = 10 * 1024 * 1024, // 10MB default
  disabled = false,
  uploadProgress,
  error,
}: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File size exceeds ${(maxSize / 1024 / 1024).toFixed(0)}MB limit`;
    }

    // Check file type if accept prop is provided
    if (accept) {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      const mimeType = file.type;

      const isValidExtension = acceptedTypes.some(type => 
        type === fileExtension || 
        type === mimeType ||
        type === '*'
      );

      if (!isValidExtension) {
        return `File type not supported. Accepted types: ${accept}`;
      }
    }

    return null;
  };

  const handleFile = (file: File) => {
    const error = validateFile(file);
    
    if (error) {
      setValidationError(error);
      setSelectedFile(null);
      return;
    }

    setValidationError('');
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValidationError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const displayError = error || validationError;
  const isUploading = uploadProgress !== undefined && uploadProgress > 0 && uploadProgress < 100;
  const isUploadComplete = uploadProgress === 100;

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      <Card
        className={cn(
          'border-2 border-dashed transition-all',
          isDragging && 'border-primary bg-primary/5',
          displayError && 'border-red-500 bg-red-50 dark:bg-red-950/20',
          disabled && 'opacity-50 cursor-not-allowed',
          !selectedFile && !disabled && 'hover:border-primary/50 cursor-pointer'
        )}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!selectedFile && !disabled ? handleBrowseClick : undefined}
      >
        <CardContent className="p-8">
          {!selectedFile ? (
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className={cn(
                'rounded-full p-4',
                isDragging ? 'bg-primary/10' : 'bg-muted'
              )}>
                <Upload className={cn(
                  'h-10 w-10',
                  isDragging ? 'text-primary' : 'text-muted-foreground'
                )} />
              </div>

              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {isDragging ? 'Drop file here' : 'Drag and drop your file here'}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse from your computer
                </p>
              </div>

              <div className="flex flex-col items-center space-y-1 text-xs text-muted-foreground">
                <p>Supported formats: {accept}</p>
                <p>Maximum file size: {formatFileSize(maxSize)}</p>
              </div>

              {!disabled && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBrowseClick();
                  }}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Select File
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={cn(
                    'rounded-lg p-2 flex-shrink-0',
                    isUploadComplete ? 'bg-green-100 dark:bg-green-950' :
                    displayError ? 'bg-red-100 dark:bg-red-950' :
                    'bg-blue-100 dark:bg-blue-950'
                  )}>
                    {isUploadComplete ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    ) : displayError ? (
                      <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    ) : (
                      <File className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>

                    {isUploading && (
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {isUploadComplete && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Upload complete
                      </p>
                    )}
                  </div>
                </div>

                {!disabled && !isUploading && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {!isUploading && !isUploadComplete && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleBrowseClick}
                  className="w-full"
                >
                  Choose Different File
                </Button>
              )}
            </div>
          )}

          {displayError && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{displayError}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
