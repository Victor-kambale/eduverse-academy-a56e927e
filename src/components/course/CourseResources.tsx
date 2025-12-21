import { useState, useEffect } from 'react';
import { FileText, Download, Loader2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Resource {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  file_size: number | null;
  lesson_id: string | null;
  is_downloadable: boolean | null;
}

interface CourseResourcesProps {
  courseId: string;
  lessonId?: string;
}

export const CourseResources = ({ courseId, lessonId }: CourseResourcesProps) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetchResources();
  }, [courseId, lessonId]);

  const fetchResources = async () => {
    try {
      let query = supabase
        .from('course_resources')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_approved', true)
        .eq('is_downloadable', true);

      if (lessonId) {
        query = query.eq('lesson_id', lessonId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (resource: Resource) => {
    setDownloading(resource.id);
    try {
      // Get signed URL for download
      const { data, error } = await supabase.storage
        .from('course-resources')
        .createSignedUrl(resource.file_url, 60);

      if (error) throw error;

      // Open download in new tab
      window.open(data.signedUrl, '_blank');
      toast.success(`Downloading ${resource.title}`);
    } catch (error) {
      console.error('Error downloading resource:', error);
      toast.error('Failed to download resource');
    } finally {
      setDownloading(null);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <FolderOpen className="w-10 h-10 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No resources available for this lesson</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Course Resources
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{resource.title}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {resource.file_type.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(resource.file_size)}
                  </span>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDownload(resource)}
              disabled={downloading === resource.id}
            >
              {downloading === resource.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
