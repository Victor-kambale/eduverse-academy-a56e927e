import { useEffect, useState } from 'react';
import { Check, X, Eye, FileText, Award, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface Certificate {
  id: string;
  course_id: string;
  teacher_id: string;
  template_name: string;
  template_url: string | null;
  description: string | null;
  is_approved: boolean;
  rejection_reason: string | null;
  created_at: string;
}

interface CourseResource {
  id: string;
  course_id: string;
  lesson_id: string | null;
  teacher_id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  file_size: number | null;
  is_downloadable: boolean;
  is_approved: boolean;
  rejection_reason: string | null;
  created_at: string;
}

export default function ContentApprovals() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Certificate | CourseResource | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [itemType, setItemType] = useState<'certificate' | 'resource'>('certificate');

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch pending certificates
    const { data: certsData } = await supabase
      .from('certificates')
      .select('*')
      .eq('is_approved', false)
      .order('created_at', { ascending: false });
    
    if (certsData) setCertificates(certsData);

    // Fetch pending resources
    const { data: resourcesData } = await supabase
      .from('course_resources')
      .select('*')
      .eq('is_approved', false)
      .order('created_at', { ascending: false });
    
    if (resourcesData) setResources(resourcesData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const approveCertificate = async (id: string) => {
    const { error } = await supabase
      .from('certificates')
      .update({
        is_approved: true,
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      toast.error('Failed to approve certificate');
    } else {
      toast.success('Certificate approved successfully');
      fetchData();
    }
  };

  const approveResource = async (id: string, makeDownloadable: boolean = true) => {
    const { error } = await supabase
      .from('course_resources')
      .update({
        is_approved: true,
        is_downloadable: makeDownloadable,
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      toast.error('Failed to approve resource');
    } else {
      toast.success('Resource approved successfully');
      fetchData();
    }
  };

  const rejectItem = async () => {
    if (!selectedItem || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    const table = itemType === 'certificate' ? 'certificates' : 'course_resources';
    
    const { error } = await supabase
      .from(table)
      .update({
        rejection_reason: rejectionReason,
      })
      .eq('id', selectedItem.id);

    if (error) {
      toast.error('Failed to reject');
    } else {
      toast.success('Rejected successfully');
      setIsRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedItem(null);
      fetchData();
    }
  };

  const openRejectDialog = (item: Certificate | CourseResource, type: 'certificate' | 'resource') => {
    setSelectedItem(item);
    setItemType(type);
    setRejectionReason('');
    setIsRejectDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Approvals</h1>
        <p className="text-muted-foreground">Review and approve teacher-uploaded certificates and resources</p>
      </div>

      <Tabs defaultValue="certificates">
        <TabsList>
          <TabsTrigger value="certificates" className="gap-2">
            <Award className="h-4 w-4" />
            Certificates ({certificates.length})
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-2">
            <FileText className="h-4 w-4" />
            PDF Resources ({resources.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="certificates" className="mt-6">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : certificates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No pending certificates
                    </TableCell>
                  </TableRow>
                ) : (
                  certificates.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-medium">{cert.template_name}</TableCell>
                      <TableCell className="max-w-xs truncate">{cert.description || '-'}</TableCell>
                      <TableCell>{formatDate(cert.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Pending</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {cert.template_url && (
                            <Button variant="ghost" size="icon" asChild>
                              <a href={cert.template_url} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => approveCertificate(cert.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => openRejectDialog(cert, 'certificate')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : resources.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No pending resources
                    </TableCell>
                  </TableRow>
                ) : (
                  resources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium">{resource.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{resource.file_type.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>{formatFileSize(resource.file_size)}</TableCell>
                      <TableCell>{formatDate(resource.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Pending</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 gap-1"
                            onClick={() => approveResource(resource.id, true)}
                          >
                            <Download className="h-4 w-4" />
                            Approve (Downloadable)
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => openRejectDialog(resource, 'resource')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {itemType === 'certificate' ? 'Certificate' : 'Resource'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejection. This will be sent to the teacher.
            </p>
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={rejectItem}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}