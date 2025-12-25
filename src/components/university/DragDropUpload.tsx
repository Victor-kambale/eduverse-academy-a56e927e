import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Image, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface DragDropUploadProps {
  label: string;
  description?: string;
  accept?: Record<string, string[]>;
  maxSize?: number;
  onFileSelect: (file: File | null) => void;
  file?: File | null;
  previewUrl?: string;
  isRequired?: boolean;
  isValidated?: boolean;
  validationError?: string;
}

export function DragDropUpload({
  label,
  description,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  onFileSelect,
  file,
  previewUrl,
  isRequired = false,
  isValidated = false,
  validationError,
}: DragDropUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      // Simulate upload progress
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

      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setLocalPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setLocalPreview(null);
      }

      onFileSelect(selectedFile);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  const removeFile = () => {
    setLocalPreview(null);
    setUploadProgress(0);
    onFileSelect(null);
  };

  const preview = localPreview || previewUrl;
  const isImage = file?.type?.startsWith('image/') || preview?.startsWith('data:image') || preview?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
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
      </div>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      <AnimatePresence mode="wait">
        {file || preview ? (
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
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <Image className="h-4 w-4" />
                    <span className="text-sm font-medium truncate max-w-[200px]">
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
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm truncate max-w-[200px]">
                      {file?.name || 'Uploaded document'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Document'}
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
                'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200',
                isDragActive && !isDragReject && 'border-primary bg-primary/5 scale-[1.02]',
                isDragReject && 'border-destructive bg-destructive/5',
                !isDragActive && 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30'
              )}
            >
              <input {...getInputProps()} />
              <Upload className={cn(
                'h-10 w-10 mx-auto mb-3 transition-colors',
                isDragActive ? 'text-primary' : 'text-muted-foreground'
              )} />
              
              {isDragActive ? (
                <p className="text-sm font-medium text-primary">Drop the file here</p>
              ) : (
                <>
                  <p className="text-sm font-medium">
                    Drag & drop your file here, or{' '}
                    <span className="text-primary">browse</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Max size: {(maxSize / 1024 / 1024).toFixed(0)}MB
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
    </div>
  );
}
