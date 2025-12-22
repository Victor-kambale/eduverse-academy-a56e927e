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
  Eye,
  DollarSign,
  TrendingUp,
  Users,
  Star,
  Bell,
  Settings,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { InfiniteCarousel } from '@/components/ui/infinite-carousel';
import { Link } from 'react-router-dom';

interface Course {
  id: string;
  title: string;
  thumbnail_url: string | null;
  price: number;
  level: string | null;
  category: string | null;
  is_published: boolean | null;
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
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, title, thumbnail_url, price, level, category, is_published')
        .eq('instructor_id', user?.id);

      setCourses(coursesData || []);

      const { data: resourcesData } = await supabase
        .from('course_resources')
        .select('*')
        .eq('teacher_id', user?.id)
        .order('created_at', { ascending: false });

      setResources(resourcesData || []);

      const { data: certificatesData } = await supabase
        .from('certificates')
        .select('*')
        .eq('teacher_id', user?.id)
        .order('created_at', { ascending: false });

      setCertificates(certificatesData || []);

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

      toast.success('Resource uploaded successfully!');
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

      toast.success('Certificate template uploaded!');
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
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
    }
    if (rejectionReason) {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    }
    return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
            <p className="text-purple-200">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAyIi8+PC9nPjwvc3ZnPg==')] opacity-40" />
          
          <div className="container py-12 relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Teacher Dashboard
                </h1>
                <p className="text-purple-200/70">Manage your courses, content, and track your success</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="icon" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
                  <Bell className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="icon" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
                  <Settings className="w-5 h-5" />
                </Button>
                <Link to="/teacher/chat">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Messages
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <BookOpen className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-white">{courses.length}</p>
                      <p className="text-purple-300/70">Total Courses</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 border-pink-500/30 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-700 flex items-center justify-center shadow-lg shadow-pink-500/30">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-white">{resources.length}</p>
                      <p className="text-pink-300/70">Resources</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 border-emerald-500/30 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <Award className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-white">{certificates.length}</p>
                      <p className="text-emerald-300/70">Certificates</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-600/20 to-cyan-800/20 border-cyan-500/30 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                      <MessageSquare className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-white">{credits?.free_messages_remaining || 0}</p>
                      <p className="text-cyan-300/70">Free Messages</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Premium Status */}
            {credits && (
              <Card className="mb-10 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border-amber-500/30 backdrop-blur-sm">
                <CardContent className="py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-lg">
                          {credits.is_premium ? '✨ Premium Member' : 'Free Tier'}
                        </p>
                        <p className="text-amber-300/70">
                          {credits.is_premium 
                            ? `Premium expires: ${new Date(credits.premium_expires_at!).toLocaleDateString()}`
                            : `${credits.free_messages_remaining} free messages remaining this month`
                          }
                        </p>
                      </div>
                    </div>
                    {!credits.is_premium && (
                      <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/30">
                        Upgrade to Premium
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Courses Carousel Section */}
        {courses.length > 0 && (
          <div className="py-10 bg-slate-900/50">
            <div className="container mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-purple-400" />
                Your Courses
              </h2>
              <p className="text-purple-300/60">Manage and view your created courses</p>
            </div>
            
            {/* Left to Right Carousel */}
            <InfiniteCarousel direction="left" speed="slow" className="mb-6">
              {courses.map((course) => (
                <div key={course.id} className="w-80 flex-shrink-0">
                  <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-purple-500/20 overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
                    <div className="relative h-44 overflow-hidden">
                      <img 
                        src={course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                      <Badge className={`absolute top-3 right-3 ${course.is_published ? 'bg-emerald-500/80' : 'bg-amber-500/80'}`}>
                        {course.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-white line-clamp-2 mb-2">{course.title}</h3>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-purple-300 border-purple-500/30 capitalize">
                          {course.level || 'All Levels'}
                        </Badge>
                        <span className="text-lg font-bold text-emerald-400">
                          ${course.price}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </InfiniteCarousel>

            {/* Right to Left Carousel */}
            <InfiniteCarousel direction="right" speed="slow">
              {[...courses].reverse().map((course) => (
                <div key={`reverse-${course.id}`} className="w-80 flex-shrink-0">
                  <Card className="bg-gradient-to-br from-pink-900/30 to-purple-900/30 border-pink-500/20 overflow-hidden hover:border-pink-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/20">
                    <div className="relative h-44 overflow-hidden">
                      <img 
                        src={course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-900 to-transparent" />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-white line-clamp-2 mb-2">{course.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-purple-300/70">
                        <span>{course.category || 'General'}</span>
                        <span>•</span>
                        <span className="capitalize">{course.level || 'All'}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </InfiniteCarousel>
          </div>
        )}

        {/* Main Content */}
        <div className="container py-10">
          <Tabs defaultValue="resources" className="space-y-6">
            <TabsList className="bg-slate-800/50 border border-purple-500/20 p-1">
              <TabsTrigger value="resources" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <FileText className="w-4 h-4 mr-2" />
                PDF Resources
              </TabsTrigger>
              <TabsTrigger value="certificates" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <Award className="w-4 h-4 mr-2" />
                Certificates
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="resources" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Course Resources</h2>
                <Dialog open={resourceDialogOpen} onOpenChange={setResourceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Upload Resource
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-purple-500/30">
                    <DialogHeader>
                      <DialogTitle className="text-white">Upload PDF Resource</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-purple-200">Course</Label>
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                          <SelectTrigger className="bg-slate-800 border-purple-500/30 text-white">
                            <SelectValue placeholder="Select a course" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-purple-500/30">
                            {courses.map((course) => (
                              <SelectItem key={course.id} value={course.id} className="text-white">
                                {course.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-purple-200">Title</Label>
                        <Input
                          value={resourceForm.title}
                          onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                          placeholder="Resource title"
                          className="bg-slate-800 border-purple-500/30 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-purple-200">Description</Label>
                        <Textarea
                          value={resourceForm.description}
                          onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                          placeholder="Brief description"
                          className="bg-slate-800 border-purple-500/30 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-purple-200">PDF File</Label>
                        <Input
                          type="file"
                          accept=".pdf"
                          onChange={handleResourceUpload}
                          disabled={uploading || !selectedCourse}
                          className="bg-slate-800 border-purple-500/30 text-white"
                        />
                      </div>
                      {uploading && (
                        <div className="flex items-center gap-2 text-purple-300">
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
                    <Card className="bg-slate-800/50 border-purple-500/20">
                      <CardContent className="py-12 text-center">
                        <FileText className="w-16 h-16 mx-auto text-purple-500/50 mb-4" />
                        <p className="text-purple-300/70">No resources uploaded yet</p>
                        <Button 
                          className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600"
                          onClick={() => setResourceDialogOpen(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Upload Your First Resource
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    resources.map((resource) => (
                      <Card key={resource.id} className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/40 transition-colors">
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-white">{resource.title}</p>
                                <p className="text-sm text-purple-300/70">
                                  {new Date(resource.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {getStatusBadge(resource.is_approved, resource.rejection_reason)}
                              {resource.rejection_reason && (
                                <span className="text-xs text-red-400 max-w-[150px] truncate">{resource.rejection_reason}</span>
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
                <h2 className="text-xl font-semibold text-white">Certificate Templates</h2>
                <Dialog open={certificateDialogOpen} onOpenChange={setCertificateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-emerald-600 to-cyan-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Upload Certificate
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-emerald-500/30">
                    <DialogHeader>
                      <DialogTitle className="text-white">Upload Certificate Template</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-emerald-200">Course</Label>
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                          <SelectTrigger className="bg-slate-800 border-emerald-500/30 text-white">
                            <SelectValue placeholder="Select a course" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-emerald-500/30">
                            {courses.map((course) => (
                              <SelectItem key={course.id} value={course.id} className="text-white">
                                {course.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-emerald-200">Template Name</Label>
                        <Input
                          value={certificateForm.templateName}
                          onChange={(e) => setCertificateForm({ ...certificateForm, templateName: e.target.value })}
                          placeholder="Certificate name"
                          className="bg-slate-800 border-emerald-500/30 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-emerald-200">Description</Label>
                        <Textarea
                          value={certificateForm.description}
                          onChange={(e) => setCertificateForm({ ...certificateForm, description: e.target.value })}
                          placeholder="Brief description"
                          className="bg-slate-800 border-emerald-500/30 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-emerald-200">Template File</Label>
                        <Input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={handleCertificateUpload}
                          disabled={uploading || !selectedCourse}
                          className="bg-slate-800 border-emerald-500/30 text-white"
                        />
                      </div>
                      {uploading && (
                        <div className="flex items-center gap-2 text-emerald-300">
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
                    <Card className="bg-slate-800/50 border-emerald-500/20">
                      <CardContent className="py-12 text-center">
                        <Award className="w-16 h-16 mx-auto text-emerald-500/50 mb-4" />
                        <p className="text-emerald-300/70">No certificate templates yet</p>
                        <Button 
                          className="mt-4 bg-gradient-to-r from-emerald-600 to-cyan-600"
                          onClick={() => setCertificateDialogOpen(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Certificate
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    certificates.map((cert) => (
                      <Card key={cert.id} className="bg-slate-800/50 border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
                                <Award className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-white">{cert.template_name}</p>
                                <p className="text-sm text-emerald-300/70">
                                  {new Date(cert.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {getStatusBadge(cert.is_approved, cert.rejection_reason)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/20">
                      <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <p className="text-3xl font-bold text-white">0</p>
                      <p className="text-purple-300/70">Total Students</p>
                    </div>
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 border border-emerald-500/20">
                      <DollarSign className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <p className="text-3xl font-bold text-white">$0</p>
                      <p className="text-emerald-300/70">Total Earnings</p>
                    </div>
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-amber-600/20 to-amber-800/20 border border-amber-500/20">
                      <Star className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                      <p className="text-3xl font-bold text-white">0.0</p>
                      <p className="text-amber-300/70">Average Rating</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
