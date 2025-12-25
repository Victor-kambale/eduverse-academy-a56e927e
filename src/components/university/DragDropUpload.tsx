import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Image, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

interface DragDropUploadProps {
  label: string;
  description?: string;
  accept?: Record<string, string[]>;
  maxSize?: number;
  maxFiles?: number;
  onFileSelect?: (file: File | null) => void;
  onFilesUploaded?: (files: { name: string; url: string; type: string }[]) => void;
  file?: File | null;
  previewUrl?: string;
  isRequired?: boolean;
  isValidated?: boolean;
  validationError?: string;
  bucketName?: string;
  folderPath?: string;
  multiple?: boolean;
}

export function DragDropUpload({
  label,
  description,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10,
  onFileSelect,
  onFilesUploaded,
  file,
  previewUrl,
  isRequired = false,
  isValidated = false,
  validationError,
  bucketName = 'teacher-documents',
  folderPath = '',
  multiple = false,
}: DragDropUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [bulkFiles, setBulkFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Single file mode
    if (!multiple && acceptedFiles.length === 1) {
      const selectedFile = acceptedFiles[0];
      setUploading(true);
      setUploadProgress(0);
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setUploading(false);
            return 100;
          }
          return prev + 20;
        });
      }, 150);

      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setLocalPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setLocalPreview(null);
      }

      onFileSelect?.(selectedFile);
      return;
    }

    // Multiple file mode with upload
    if (multiple && onFilesUploaded) {
      const newFiles: UploadedFile[] = acceptedFiles.map((f) => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file: f,
        name: f.name,
        size: f.size,
        type: f.type,
        progress: 0,
        status: 'pending' as const,
      }));

      setBulkFiles((prev) => [...prev, ...newFiles].slice(0, maxFiles));
      setUploading(true);
      const uploadedFiles: { name: string; url: string; type: string }[] = [];

      for (const uploadFile of newFiles) {
        try {
          setBulkFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id ? { ...f, status: 'uploading' as const, progress: 10 } : f
            )
          );

          const { data: userData } = await supabase.auth.getUser();
          const userId = userData.user?.id || 'anonymous';
          const timestamp = Date.now();
          const filePath = folderPath
            ? `${folderPath}/${userId}/${timestamp}_${uploadFile.name}`
            : `${userId}/${timestamp}_${uploadFile.name}`;

          const progressInterval = setInterval(() => {
            setBulkFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id && f.progress < 90
                  ? { ...f, progress: f.progress + 10 }
                  : f
              )
            );
          }, 200);

          const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, uploadFile.file, {
              cacheControl: '3600',
              upsert: false,
            });

          clearInterval(progressInterval);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

          setBulkFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? { ...f, status: 'success' as const, progress: 100, url: urlData.publicUrl }
                : f
            )
          );

          uploadedFiles.push({
            name: uploadFile.name,
            url: urlData.publicUrl,
            type: uploadFile.type,
          });
        } catch (error: any) {
          setBulkFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? { ...f, status: 'error' as const, error: error.message || 'Upload failed' }
                : f
            )
          );
          toast.error(`Failed to upload ${uploadFile.name}`);
        }
      }

      setUploading(false);

      if (uploadedFiles.length > 0) {
        onFilesUploaded(uploadedFiles);
        toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
      }
    }
  }, [multiple, maxFiles, bucketName, folderPath, onFileSelect, onFilesUploaded]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
    maxFiles: multiple ? maxFiles : 1,
  });

  const removeFile = () => {
    setLocalPreview(null);
    setUploadProgress(0);
    onFileSelect?.(null);
  };

  const removeBulkFile = (id: string) => {
    setBulkFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const preview = localPreview || previewUrl;
  const isImage = file?.type?.startsWith('image/') || preview?.startsWith('data:image') || preview?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="text-sm font-medium flex items-center gap-2">
          {label}
          {isRequired && <span className="text-destructive">*</span>}
          {isValidated && !validationError && (
            <Badge variant="default" className="bg-green-500/20 text-green-600 border-green-500/30 text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
          {validationError && (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Invalid
            </Badge>
          )}
        </label>
        {multiple && (
          <span className="text-xs text-muted-foreground">
            Max {maxFiles} files, {formatFileSize(maxSize)} each
          </span>
        )}
      </div>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      <AnimatePresence mode="wait">
        {!multiple && (file || preview) ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative border rounded-lg overflow-hidden bg-muted/30"
          >
            {isImage && preview ? (
              <div className="relative aspect-video">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-white">
                    <Image className="h-4 w-4" />
                    <span className="text-sm font-medium truncate max-w-[150px] sm:max-w-[200px]">
                      {file?.name || 'Uploaded image'}
                    </span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={removeFile}
                    className="h-8"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate max-w-[150px] sm:max-w-[200px]">
                      {file?.name || 'Uploaded document'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {file ? formatFileSize(file.size) : 'Document'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={removeFile}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}

            {uploading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <div className="w-48 space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm">Uploading...</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-lg p-4 sm:p-6 text-center cursor-pointer transition-all duration-200',
                isDragActive && !isDragReject && 'border-primary bg-primary/5 scale-[1.02]',
                isDragReject && 'border-destructive bg-destructive/5',
                !isDragActive && 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30'
              )}
            >
              <input {...getInputProps()} />
              <Upload className={cn(
                'h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-3 transition-colors',
                isDragActive ? 'text-primary' : 'text-muted-foreground'
              )} />
              
              {isDragActive ? (
                <p className="text-sm font-medium text-primary">
                  Drop the {multiple ? 'files' : 'file'} here
                </p>
              ) : (
                <>
                  <p className="text-sm font-medium">
                    Drag & drop {multiple ? 'files' : 'your file'} here, or{' '}
                    <span className="text-primary">browse</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Max size: {formatFileSize(maxSize)}
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk files list */}
      {multiple && bulkFiles.length > 0 && (
        <div className="space-y-2">
          {bulkFiles.map((uploadFile) => (
            <motion.div
              key={uploadFile.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                'border rounded-lg p-3 flex items-center gap-3 transition-colors',
                uploadFile.status === 'error' && 'border-destructive bg-destructive/5',
                uploadFile.status === 'success' && 'border-green-500/30 bg-green-500/5'
              )}
            >
              {uploadFile.type.startsWith('image/') ? (
                <Image className="h-5 w-5 text-blue-500 flex-shrink-0" />
              ) : (
                <FileText className="h-5 w-5 text-amber-500 flex-shrink-0" />
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{uploadFile.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(uploadFile.size)}
                  </p>
                  {uploadFile.status === 'uploading' && (
                    <Progress value={uploadFile.progress} className="h-1 flex-1 max-w-[100px]" />
                  )}
                  {uploadFile.status === 'error' && (
                    <span className="text-xs text-destructive truncate">{uploadFile.error}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {uploadFile.status === 'uploading' && (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                )}
                {uploadFile.status === 'success' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {uploadFile.status === 'error' && (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeBulkFile(uploadFile.id)}
                  disabled={uploadFile.status === 'uploading'}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {validationError && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-destructive flex items-center gap-1"
        >
          <AlertCircle className="h-3 w-3" />
          {validationError}
        </motion.p>
      )}

      {uploading && multiple && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Uploading files...
        </p>
      )}
    </div>
  );
}
