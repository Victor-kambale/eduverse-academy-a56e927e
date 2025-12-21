import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Video, 
  File, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

interface MediaUploadProps {
  courseId?: string;
  bucket?: string;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  onUploadComplete?: (files: { name: string; url: string; type: string }[]) => void;
}

export function MediaUpload({
  courseId,
  bucket = 'course-media',
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    'video/*': ['.mp4', '.webm', '.mov'],
  },
  maxFiles = 10,
  maxSize = 100 * 1024 * 1024, // 100MB
  onUploadComplete,
}: MediaUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const id = crypto.randomUUID();
    const fileExt = file.name.split('.').pop();
    const filePath = courseId 
      ? `${courseId}/${id}.${fileExt}`
      : `uploads/${id}.${fileExt}`;

    // Add file to state
    const uploadedFile: UploadedFile = {
      id,
      name: file.name,
      size: file.size,
      type: file.type,
      url: '',
      status: 'uploading',
      progress: 0,
    };

    setFiles((prev) => [...prev, uploadedFile]);

    try {
      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const successFile: UploadedFile = {
        ...uploadedFile,
        url: urlData.publicUrl,
        status: 'success',
        progress: 100,
      };

      setFiles((prev) =>
        prev.map((f) => (f.id === id ? successFile : f))
      );

      return successFile;
    } catch (error: any) {
      const errorFile: UploadedFile = {
        ...uploadedFile,
        status: 'error',
        progress: 0,
        error: error.message || 'Upload failed',
      };

      setFiles((prev) =>
        prev.map((f) => (f.id === id ? errorFile : f))
      );

      return errorFile;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const uploadPromises = acceptedFiles.map(uploadFile);
    const results = await Promise.all(uploadPromises);
    
    const successfulUploads = results.filter((f) => f.status === 'success');
    if (successfulUploads.length > 0) {
      onUploadComplete?.(
        successfulUploads.map((f) => ({
          name: f.name,
          url: f.url,
          type: f.type,
        }))
      );
      toast.success(`${successfulUploads.length} file(s) uploaded successfully`);
    }

    const failedUploads = results.filter((f) => f.status === 'error');
    if (failedUploads.length > 0) {
      toast.error(`${failedUploads.length} file(s) failed to upload`);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    multiple: true,
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon;
    if (type.startsWith('video/')) return Video;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
          isDragActive && !isDragReject && 'border-primary bg-primary/5',
          isDragReject && 'border-destructive bg-destructive/5',
          !isDragActive && 'border-muted-foreground/25 hover:border-primary/50'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div className={cn(
            'p-4 rounded-full',
            isDragActive ? 'bg-primary/10' : 'bg-muted'
          )}>
            <Upload className={cn(
              'h-8 w-8',
              isDragActive ? 'text-primary' : 'text-muted-foreground'
            )} />
          </div>
          <div>
            <p className="font-medium">
              {isDragActive
                ? 'Drop files here...'
                : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Supports: Images (PNG, JPG, GIF, WebP) and Videos (MP4, WebM, MOV)
            <br />
            Max file size: {formatFileSize(maxSize)} | Max {maxFiles} files
          </p>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Uploaded Files</h4>
          <div className="space-y-2">
            {files.map((file) => {
              const FileIcon = getFileIcon(file.type);
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                >
                  {/* Preview or Icon */}
                  <div className="shrink-0">
                    {file.status === 'success' && file.type.startsWith('image/') ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                        <FileIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                    {file.status === 'uploading' && (
                      <Progress value={file.progress} className="h-1 mt-2" />
                    )}
                    {file.status === 'error' && (
                      <p className="text-xs text-destructive mt-1">{file.error}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="shrink-0">
                    {file.status === 'uploading' && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                    )}
                    {file.status === 'success' && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>

                  {/* Remove button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
