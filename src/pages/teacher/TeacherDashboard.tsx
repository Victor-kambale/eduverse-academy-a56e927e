import { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Award, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus,
  Loader2,
  BookOpen,
  MessageSquare,
  CreditCard,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';

interface Course {
  id: string;
  title: string;
}

interface Resource {
  id: string;
  title: string;
  description: string | null;
  file_type: string;
  is_approved: boolean | null;
  rejection_reason: string | null;
  created_at: string;
  course_id: string;
}

interface Certificate {
  id: string;
  template_name: string;
  description: string | null;
  is_approved: boolean | null;
  rejection_reason: string | null;
  created_at: string;
  course_id: string;
}

interface TeacherCredits {
  free_messages_remaining: number;
  is_premium: boolean;
  premium_expires_at: string | null;
}

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [credits, setCredits] = useState<TeacherCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [resourceForm, setResourceForm] = useState({
    title: '',
    description: '',
    isDownloadable: true,
  });
  const [certificateForm, setCertificateForm] = useState({
    templateName: '',
    description: '',
  });
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch teacher's courses
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, title')
        .eq('instructor_id', user?.id);

      setCourses(coursesData || []);

      // Fetch resources
      const { data: resourcesData } = await supabase
        .from('course_resources')
        .select('*')
        .eq('teacher_id', user?.id)
        .order('created_at', { ascending: false });

      setResources(resourcesData || []);

      // Fetch certificates
      const { data: certificatesData } = await supabase
        .from('certificates')
        .select('*')
        .eq('teacher_id', user?.id)
        .order('created_at', { ascending: false });

      setCertificates(certificatesData || []);

      // Fetch credits
      const { data: creditsData } = await supabase
        .from('teacher_credits')
        .select('*')
        .eq('teacher_id', user?.id)
        .maybeSingle();

      setCredits(creditsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResourceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedCourse) {
      toast.error('Please select a course and file');
      return;
    }

    const file = e.target.files[0];
    const allowedTypes = ['application/pdf'];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF files are allowed');
      return;
    }

    setUploading(true);
    try {
      const filePath = `${user?.id}/${selectedCourse}/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('course-resources')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from('course_resources').insert({
        course_id: selectedCourse,
        teacher_id: user?.id,
        title: resourceForm.title || file.name,
        description: resourceForm.description,
        file_url: filePath,
        file_type: 'pdf',
        file_size: file.size,
        is_downloadable: resourceForm.isDownloadable,
      });

      if (dbError) throw dbError;

      toast.success('Resource uploaded successfully! Awaiting admin approval.');
      setResourceDialogOpen(false);
      setResourceForm({ title: '', description: '', isDownloadable: true });
      fetchData();
    } catch (error) {
      console.error('Error uploading resource:', error);
      toast.error('Failed to upload resource');
    } finally {
      setUploading(false);
    }
  };

  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedCourse) {
      toast.error('Please select a course and file');
      return;
    }

    const file = e.target.files[0];
    setUploading(true);

    try {
      const filePath = `${user?.id}/${selectedCourse}/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from('certificates').insert({
        course_id: selectedCourse,
        teacher_id: user?.id,
        template_name: certificateForm.templateName || file.name,
        description: certificateForm.description,
        template_url: filePath,
      });

      if (dbError) throw dbError;

      toast.success('Certificate template uploaded! Awaiting admin approval.');
      setCertificateDialogOpen(false);
      setCertificateForm({ templateName: '', description: '' });
      fetchData();
    } catch (error) {
      console.error('Error uploading certificate:', error);
      toast.error('Failed to upload certificate template');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (isApproved: boolean | null, rejectionReason: string | null) => {
    if (isApproved === true) {
      return <Badge className="bg-green-500/10 text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
    }
    if (rejectionReason) {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    }
    return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Manage your course content and track approvals</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{courses.length}</p>
                  <p className="text-sm text-muted-foreground">Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{resources.length}</p>
                  <p className="text-sm text-muted-foreground">Resources</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{certificates.length}</p>
                  <p className="text-sm text-muted-foreground">Certificates</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{credits?.free_messages_remaining || 0}</p>
                  <p className="text-sm text-muted-foreground">Free Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Premium Status */}
        {credits && (
          <Card className="mb-8 border-accent/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-accent" />
                  <div>
                    <p className="font-medium">
                      {credits.is_premium ? 'Premium Member' : 'Free Tier'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {credits.is_premium 
                        ? `Expires: ${new Date(credits.premium_expires_at!).toLocaleDateString()}`
                        : `${credits.free_messages_remaining} free messages remaining this month`
                      }
                    </p>
                  </div>
                </div>
                {!credits.is_premium && (
                  <Button variant="accent">Upgrade to Premium</Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="resources" className="space-y-6">
          <TabsList>
            <TabsTrigger value="resources">PDF Resources</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
          </TabsList>

          <TabsContent value="resources" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Course Resources</h2>
              <Dialog open={resourceDialogOpen} onOpenChange={setResourceDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Resource
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload PDF Resource</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Course</Label>
                      <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={resourceForm.title}
                        onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                        placeholder="Resource title"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={resourceForm.description}
                        onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                        placeholder="Brief description"
                      />
                    </div>
                    <div>
                      <Label>PDF File</Label>
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={handleResourceUpload}
                        disabled={uploading || !selectedCourse}
                      />
                    </div>
                    {uploading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {resources.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No resources uploaded yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  resources.map((resource) => (
                    <Card key={resource.id}>
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                              <p className="font-medium">{resource.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(resource.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(resource.is_approved, resource.rejection_reason)}
                            {resource.rejection_reason && (
                              <span className="text-xs text-destructive">{resource.rejection_reason}</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="certificates" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Certificate Templates</h2>
              <Dialog open={certificateDialogOpen} onOpenChange={setCertificateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Certificate
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Certificate Template</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Course</Label>
                      <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Template Name</Label>
                      <Input
                        value={certificateForm.templateName}
                        onChange={(e) => setCertificateForm({ ...certificateForm, templateName: e.target.value })}
                        placeholder="Certificate template name"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={certificateForm.description}
                        onChange={(e) => setCertificateForm({ ...certificateForm, description: e.target.value })}
                        placeholder="Brief description"
                      />
                    </div>
                    <div>
                      <Label>Template File (PDF/Image)</Label>
                      <Input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleCertificateUpload}
                        disabled={uploading || !selectedCourse}
                      />
                    </div>
                    {uploading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {certificates.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Award className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No certificate templates uploaded yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  certificates.map((cert) => (
                    <Card key={cert.id}>
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                              <Award className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">{cert.template_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(cert.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(cert.is_approved, cert.rejection_reason)}
                            {cert.rejection_reason && (
                              <span className="text-xs text-destructive">{cert.rejection_reason}</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
