import { useState, useEffect } from 'react';
import {
  Award,
  Search,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  QrCode,
  FileText,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface StudentCertificate {
  id: string;
  student_id: string;
  course_id: string;
  certificate_id: string;
  credential_id: string;
  issued_at: string;
  certificate_url: string | null;
}

interface CertificateTemplate {
  id: string;
  course_id: string;
  teacher_id: string;
  template_name: string;
  description: string | null;
  is_approved: boolean;
  created_at: string;
}

export default function CertificatesManagement() {
  const [studentCertificates, setStudentCertificates] = useState<StudentCertificate[]>([]);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState<StudentCertificate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [certRes, templateRes] = await Promise.all([
      supabase.from('student_certificates').select('*').order('issued_at', { ascending: false }),
      supabase.from('certificates').select('*').order('created_at', { ascending: false }),
    ]);

    if (certRes.data) setStudentCertificates(certRes.data);
    if (templateRes.data) setTemplates(templateRes.data);
    setLoading(false);
  };

  const handleApproveTemplate = async (templateId: string, approve: boolean) => {
    const { error } = await supabase
      .from('certificates')
      .update({ is_approved: approve, approved_at: new Date().toISOString() })
      .eq('id', templateId);

    if (error) {
      toast.error('Failed to update template');
    } else {
      toast.success(approve ? 'Template approved' : 'Template rejected');
      fetchData();
    }
  };

  const stats = {
    total: studentCertificates.length,
    templates: templates.length,
    pendingTemplates: templates.filter(t => !t.is_approved).length,
    approvedTemplates: templates.filter(t => t.is_approved).length,
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Certificates Management</h1>
        <p className="text-muted-foreground">Manage certificate templates and issued certificates</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Award className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Issued Certificates</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{stats.templates}</p>
            <p className="text-sm text-muted-foreground">Templates</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <Shield className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">{stats.pendingTemplates}</p>
            <p className="text-sm text-muted-foreground">Pending Approval</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{stats.approvedTemplates}</p>
            <p className="text-sm text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="issued">
        <TabsList>
          <TabsTrigger value="issued">Issued Certificates</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="verify">Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="issued" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by credential ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Credential ID</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Course ID</TableHead>
                  <TableHead>Issued Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : studentCertificates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No certificates issued yet
                    </TableCell>
                  </TableRow>
                ) : (
                  studentCertificates
                    .filter(c => c.credential_id.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-mono">{cert.credential_id}</TableCell>
                        <TableCell>{cert.student_id.slice(0, 8)}...</TableCell>
                        <TableCell>{cert.course_id.slice(0, 8)}...</TableCell>
                        <TableCell>{format(new Date(cert.issued_at), 'MMM d, yyyy')}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedCertificate(cert); setPreviewOpen(true); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <QrCode className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No templates found
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.template_name}</TableCell>
                      <TableCell>{template.description || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={template.is_approved ? 'default' : 'secondary'}>
                          {template.is_approved ? 'Approved' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(template.created_at), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {!template.is_approved && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleApproveTemplate(template.id, true)}>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleApproveTemplate(template.id, false)}>
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="verify">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Verification Tool</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <Input placeholder="Enter Credential ID to verify..." />
                </div>
                <Button className="w-full">
                  <QrCode className="w-4 h-4 mr-2" />
                  Verify Certificate
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Or scan the QR code on the certificate to verify authenticity
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Certificate Preview</DialogTitle>
          </DialogHeader>
          {selectedCertificate && (
            <div className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 border-4 border-amber-600 rounded-lg">
              <div className="text-center space-y-4">
                <Award className="w-16 h-16 mx-auto text-amber-600" />
                <h2 className="text-3xl font-serif font-bold text-amber-900">Certificate of Completion</h2>
                <p className="text-lg text-amber-800">This is to certify that</p>
                <p className="text-2xl font-bold text-amber-900">[Student Name]</p>
                <p className="text-amber-800">has successfully completed the course</p>
                <p className="text-xl font-semibold text-amber-900">[Course Title]</p>
                <div className="pt-4">
                  <p className="text-sm text-amber-700">Credential ID: {selectedCertificate.credential_id}</p>
                  <p className="text-sm text-amber-700">
                    Issued: {format(new Date(selectedCertificate.issued_at), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
