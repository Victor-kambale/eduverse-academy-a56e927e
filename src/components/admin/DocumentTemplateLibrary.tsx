import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { FileText, Upload, Download, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';

interface DocumentTemplate {
  id: string;
  name: string;
  description: string | null;
  document_type: string;
  file_url: string;
  file_size: number | null;
  is_active: boolean;
  download_count: number;
  created_at: string;
}

const DOCUMENT_TYPES = [
  { value: 'accreditation_certificate', label: 'Accreditation Certificate' },
  { value: 'business_registration', label: 'Business Registration' },
  { value: 'government_approval', label: 'Government Approval' },
  { value: 'ministry_certificate', label: 'Ministry Certificate' },
  { value: 'operating_license', label: 'Operating License' },
  { value: 'tax_clearance', label: 'Tax Clearance' },
  { value: 'academic_charter', label: 'Academic Charter' },
  { value: 'authorization_letter', label: 'Authorization Letter' },
  { value: 'quality_assurance', label: 'Quality Assurance' },
  { value: 'leadership_cv', label: 'Leadership CV' },
  { value: 'institutional_profile', label: 'Institutional Profile' },
  { value: 'certificate_of_incorporation', label: 'Certificate of Incorporation' },
];

export function DocumentTemplateLibrary() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    document_type: '',
    file: null as File | null,
  });

  const { data: templates, isLoading } = useQuery({
    queryKey: ['document-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .order('document_type', { ascending: true });
      if (error) throw error;
      return data as DocumentTemplate[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (template: typeof newTemplate) => {
      if (!template.file) throw new Error('No file selected');

      setUploading(true);
      const fileExt = template.file.name.split('.').pop();
      const fileName = `${Date.now()}-${template.document_type}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('course-resources')
        .upload(`templates/${fileName}`, template.file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('course-resources')
        .getPublicUrl(`templates/${fileName}`);

      const { error: insertError } = await supabase
        .from('document_templates')
        .insert({
          name: template.name,
          description: template.description || null,
          document_type: template.document_type,
          file_url: publicUrl,
          file_size: template.file.size,
        });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      toast.success('Template uploaded successfully');
      setIsDialogOpen(false);
      setNewTemplate({ name: '', description: '', document_type: '', file: null });
      setUploading(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setUploading(false);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('document_templates')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      toast.success('Template status updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('document_templates')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      toast.success('Template deleted');
    },
  });

  const handleDownload = async (template: DocumentTemplate) => {
    await supabase
      .from('document_templates')
      .update({ download_count: template.download_count + 1 })
      .eq('id', template.id);
    
    window.open(template.file_url, '_blank');
    queryClient.invalidateQueries({ queryKey: ['document-templates'] });
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Template Library
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Template name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              />
              <Textarea
                placeholder="Description (optional)"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
              />
              <Select
                value={newTemplate.document_type}
                onValueChange={(value) => setNewTemplate({ ...newTemplate, document_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setNewTemplate({ ...newTemplate, file: e.target.files?.[0] || null })}
              />
              <Button
                className="w-full"
                disabled={!newTemplate.name || !newTemplate.document_type || !newTemplate.file || uploading}
                onClick={() => uploadMutation.mutate(newTemplate)}
              >
                {uploading ? (
                  <>Uploading...</>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Template
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {templates?.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No templates uploaded yet. Add your first template above.
          </p>
        ) : (
          <div className="space-y-3">
            {templates?.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{template.name}</h4>
                    <Badge variant={template.is_active ? 'default' : 'secondary'}>
                      {template.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <span>{DOCUMENT_TYPES.find(t => t.value === template.document_type)?.label || template.document_type}</span>
                    <span>•</span>
                    <span>{formatFileSize(template.file_size)}</span>
                    <span>•</span>
                    <span>{template.download_count} downloads</span>
                  </div>
                  {template.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{template.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(template)}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleActiveMutation.mutate({ id: template.id, is_active: !template.is_active })}
                    title={template.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {template.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteMutation.mutate(template.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
