import { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DocumentReuploadProps {
  applicationId: string;
  documentKey: string;
  documentLabel: string;
  currentUrl: string | null;
  onUploadComplete: () => void;
  disabled?: boolean;
}

export default function DocumentReupload({
  applicationId,
  documentKey,
  documentLabel,
  currentUrl,
  onUploadComplete,
  disabled = false
}: DocumentReuploadProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${documentKey}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('teacher-documents')
        .upload(fileName, selectedFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('teacher-documents')
        .getPublicUrl(fileName);

      const updateData: Record<string, string> = {};
      updateData[documentKey] = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('university_applications')
        .update(updateData)
        .eq('id', applicationId);

      if (updateError) throw updateError;

      toast.success(`${documentLabel} uploaded successfully`);
      setIsDialogOpen(false);
      setSelectedFile(null);
      onUploadComplete();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const isUploaded = !!currentUrl;

  return (
    <>
      <div
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-lg border ${
          isUploaded ? 'bg-green-500/5 border-green-500/20' : 'bg-amber-500/5 border-amber-500/20'
        }`}
      >
        <div className="flex items-center gap-3">
          <FileText className={`h-5 w-5 flex-shrink-0 ${isUploaded ? 'text-green-500' : 'text-amber-500'}`} />
          <span className="text-sm font-medium">{documentLabel}</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isUploaded ? (
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
              <CheckCircle className="h-3 w-3 mr-1" />
              Uploaded
            </Badge>
          ) : (
            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
              <AlertCircle className="h-3 w-3 mr-1" />
              Required
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            disabled={disabled}
            className="ml-auto sm:ml-0"
          >
            <Upload className="h-4 w-4 mr-1" />
            {isUploaded ? 'Update' : 'Upload'}
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {isUploaded ? 'Update' : 'Upload'} {documentLabel}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              {selectedFile ? (
                <div className="space-y-2">
                  <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-primary" />
                  <p className="font-medium text-sm sm:text-base break-all">{selectedFile.name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground" />
                  <p className="font-medium text-sm sm:text-base">Click to select a file</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    PDF, JPG, PNG, DOC up to 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setSelectedFile(null);
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full sm:w-auto"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
