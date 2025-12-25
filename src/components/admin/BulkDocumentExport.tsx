import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Download, Loader2, FileArchive } from 'lucide-react';

interface BulkDocumentExportProps {
  applicationId: string;
  institutionName: string;
}

export const BulkDocumentExport: React.FC<BulkDocumentExportProps> = ({
  applicationId,
  institutionName,
}) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to export documents');
        return;
      }

      const { data, error } = await supabase.functions.invoke('export-documents', {
        body: { applicationId },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Export failed');
      }

      // Convert base64 to blob and download
      const byteCharacters = atob(data.zipContent);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/zip' });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Downloaded ${data.documentCount} documents`);
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message || 'Failed to export documents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileArchive className="w-4 h-4" />
      )}
      <span className="hidden sm:inline">Export ZIP</span>
      <span className="sm:hidden">ZIP</span>
    </Button>
  );
};
