import { useEffect, useState } from 'react';
import { 
  Eye, 
  Check, 
  X, 
  Search, 
  FileText, 
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  Users,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  FileArchive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import ApplicationNotesPanel from '@/components/admin/ApplicationNotesPanel';
import { DocumentVerificationPanel } from '@/components/admin/DocumentVerificationPanel';
import { BulkDocumentExport } from '@/components/admin/BulkDocumentExport';

interface UniversityApplication {
  id: string;
  user_id: string;
  institution_name: string;
  institution_type: string;
  founding_year: number | null;
  country: string;
  city: string | null;
  website_url: string | null;
  primary_email: string;
  primary_phone: string | null;
  contact_name: string;
  contact_title: string | null;
  contact_email: string;
  contact_phone: string | null;
  student_count: string | null;
  faculty_count: string | null;
  programs_offered: string[] | null;
  accreditation_bodies: string[] | null;
  certificate_of_incorporation_url: string | null;
  business_registration_url: string | null;
  tax_clearance_url: string | null;
  operating_license_url: string | null;
  government_approval_url: string | null;
  ministry_certificate_url: string | null;
  accreditation_certificate_url: string | null;
  quality_assurance_url: string | null;
  academic_charter_url: string | null;
  institutional_profile_url: string | null;
  leadership_cv_url: string | null;
  authorization_letter_url: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  contract_signed: boolean;
  contract_signed_at: string | null;
  registration_fee_paid: boolean;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function UniversityApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<UniversityApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<UniversityApplication | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Document preview state
  const [isDocPreviewOpen, setIsDocPreviewOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{ label: string; url: string } | null>(null);
  const [docZoom, setDocZoom] = useState(100);
  const [docRotation, setDocRotation] = useState(0);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('university_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to fetch applications');
    } else {
      setApplications((data as UniversityApplication[]) || []);
    }
    setLoading(false);
  };

  const sendEmailNotification = async (email: string, subject: string, content: string) => {
    try {
      await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject,
          html: content
        }
      });
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  };

  const handleApprove = async (application: UniversityApplication) => {
    try {
      const { error: updateError } = await supabase
        .from('university_applications')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
        })
        .eq('id', application.id);

      if (updateError) throw updateError;

      // Add instructor role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: application.user_id,
          role: 'instructor',
        });

      if (roleError && !roleError.message.includes('duplicate')) {
        throw roleError;
      }

      // Create notification
      await supabase.from('notifications').insert({
        user_id: application.user_id,
        title: 'University Registration Approved!',
        message: `Congratulations! ${application.institution_name} has been approved to join our platform. You can now create and publish courses.`,
        type: 'success',
        link: '/university/dashboard',
      });

      // Send email notification
      await sendEmailNotification(
        application.primary_email,
        'University Registration Approved - EduVerse',
        `
          <h1>Congratulations!</h1>
          <p>Your university registration for <strong>${application.institution_name}</strong> has been approved.</p>
          <p>You can now access your university dashboard and start creating courses.</p>
          <p>Best regards,<br>The EduVerse Team</p>
        `
      );

      toast.success('Application approved successfully');
      fetchApplications();
      setIsViewDialogOpen(false);
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Failed to approve application');
    }
  };

  const handleMarkUnderReview = async (application: UniversityApplication) => {
    try {
      const { error } = await supabase
        .from('university_applications')
        .update({
          status: 'under_review',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq('id', application.id);

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: application.user_id,
        title: 'Application Under Review',
        message: `Your university registration for ${application.institution_name} is now being reviewed by our team.`,
        type: 'info',
      });

      await sendEmailNotification(
        application.primary_email,
        'University Registration Under Review - EduVerse',
        `
          <h1>Application Update</h1>
          <p>Your university registration for <strong>${application.institution_name}</strong> is now under review.</p>
          <p>Our team is reviewing your documents and will get back to you soon.</p>
          <p>Best regards,<br>The EduVerse Team</p>
        `
      );

      toast.success('Application marked as under review');
      fetchApplications();
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application');
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;

    try {
      const { error } = await supabase
        .from('university_applications')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
        })
        .eq('id', selectedApp.id);

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: selectedApp.user_id,
        title: 'University Registration Update',
        message: `Your registration for ${selectedApp.institution_name} was not approved. Reason: ${rejectionReason}`,
        type: 'warning',
      });

      await sendEmailNotification(
        selectedApp.primary_email,
        'University Registration Update - EduVerse',
        `
          <h1>Application Update</h1>
          <p>We regret to inform you that your university registration for <strong>${selectedApp.institution_name}</strong> was not approved.</p>
          <p><strong>Reason:</strong> ${rejectionReason}</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>The EduVerse Team</p>
        `
      );

      toast.success('Application rejected');
      fetchApplications();
      setIsRejectDialogOpen(false);
      setIsViewDialogOpen(false);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    }
  };

  const openDocumentPreview = async (label: string, url: string) => {
    try {
      let previewUrl = url;
      if (url && !url.startsWith('http')) {
        const { data } = supabase.storage
          .from('teacher-documents')
          .getPublicUrl(url);
        previewUrl = data?.publicUrl || url;
      }
      
      setPreviewDoc({ label, url: previewUrl });
      setDocZoom(100);
      setDocRotation(0);
      setIsDocPreviewOpen(true);
    } catch (error) {
      console.error('Error opening document:', error);
      setPreviewDoc({ label, url });
      setDocZoom(100);
      setDocRotation(0);
      setIsDocPreviewOpen(true);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-500 hover:bg-blue-600"><Clock className="h-3 w-3 mr-1" />Under Review</Badge>;
      default:
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = 
      app.institution_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.primary_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.contact_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const underReviewCount = applications.filter(a => a.status === 'under_review').length;
  const approvedCount = applications.filter(a => a.status === 'approved').length;
  const rejectedCount = applications.filter(a => a.status === 'rejected').length;

  const documentFields = [
    { key: 'certificate_of_incorporation_url', label: 'Certificate of Incorporation' },
    { key: 'business_registration_url', label: 'Business Registration' },
    { key: 'tax_clearance_url', label: 'Tax Clearance Certificate' },
    { key: 'operating_license_url', label: 'Operating License' },
    { key: 'government_approval_url', label: 'Government Approval Letter' },
    { key: 'ministry_certificate_url', label: 'Ministry of Education Certificate' },
    { key: 'accreditation_certificate_url', label: 'Accreditation Certificate' },
    { key: 'quality_assurance_url', label: 'Quality Assurance Certificate' },
    { key: 'academic_charter_url', label: 'Academic Charter' },
    { key: 'institutional_profile_url', label: 'Institutional Profile' },
    { key: 'leadership_cv_url', label: 'Leadership CV' },
    { key: 'authorization_letter_url', label: 'Authorization Letter' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">University Applications</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Review and manage university registration applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold">{applications.length}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">{underReviewCount}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Under Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-green-600">{approvedCount}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-red-600">{rejectedCount}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by institution, email, or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table - Desktop */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Institution</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No applications found
                </TableCell>
              </TableRow>
            ) : (
              filteredApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{app.institution_name}</p>
                        <p className="text-sm text-muted-foreground">{app.primary_email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{app.institution_type}</TableCell>
                  <TableCell>{app.country}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{app.contact_name}</p>
                      <p className="text-sm text-muted-foreground">{app.contact_title}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Badge variant={app.email_verified ? 'default' : 'secondary'} className="text-xs">
                        {app.email_verified ? '✓' : '✗'} Email
                      </Badge>
                      <Badge variant={app.phone_verified ? 'default' : 'secondary'} className="text-xs">
                        {app.phone_verified ? '✓' : '✗'} Phone
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(app.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedApp(app);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No applications found</div>
        ) : (
          filteredApplications.map((app) => (
            <Card key={app.id} className="cursor-pointer" onClick={() => {
              setSelectedApp(app);
              setIsViewDialogOpen(true);
            }}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium truncate">{app.institution_name}</p>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{app.primary_email}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{app.country}</span>
                      <span>•</span>
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(app.created_at), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <Badge variant={app.email_verified ? 'default' : 'secondary'} className="text-xs">
                        {app.email_verified ? '✓' : '✗'} Email
                      </Badge>
                      <Badge variant={app.phone_verified ? 'default' : 'secondary'} className="text-xs">
                        {app.phone_verified ? '✓' : '✗'} Phone
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Application Details</DialogTitle>
            {selectedApp && (
              <BulkDocumentExport 
                applicationId={selectedApp.id} 
                institutionName={selectedApp.institution_name} 
              />
            )}
          </DialogHeader>
          {selectedApp && (
            <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 overflow-hidden">
              {/* Main Content */}
              <div className="flex-1 overflow-y-auto">
                <Tabs defaultValue="info" className="mt-2">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
                    <TabsTrigger value="info" className="text-xs sm:text-sm">Institution</TabsTrigger>
                    <TabsTrigger value="contact" className="text-xs sm:text-sm">Contact</TabsTrigger>
                    <TabsTrigger value="academic" className="text-xs sm:text-sm">Academic</TabsTrigger>
                    <TabsTrigger value="documents" className="text-xs sm:text-sm">Documents</TabsTrigger>
                    <TabsTrigger value="verification" className="text-xs sm:text-sm">Verification</TabsTrigger>
                  </TabsList>

              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="flex items-start gap-6">
                  <div className="h-20 w-20 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-10 w-10 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-bold">{selectedApp.institution_name}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1 capitalize">
                        <Building2 className="h-4 w-4" />
                        {selectedApp.institution_type}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {selectedApp.city ? `${selectedApp.city}, ` : ''}{selectedApp.country}
                      </span>
                      {selectedApp.website_url && (
                        <a href={selectedApp.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                          <Globe className="h-4 w-4" />
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(selectedApp.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Primary Email
                    </h4>
                    <p className="text-muted-foreground">{selectedApp.primary_email}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Phone className="h-4 w-4" /> Primary Phone
                    </h4>
                    <p className="text-muted-foreground">{selectedApp.primary_phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Founded
                    </h4>
                    <p className="text-muted-foreground">{selectedApp.founding_year || 'Not provided'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Applied On
                    </h4>
                    <p className="text-muted-foreground">
                      {format(new Date(selectedApp.created_at), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedApp.email_verified ? 'default' : 'secondary'}>
                      {selectedApp.email_verified ? '✓' : '✗'}
                    </Badge>
                    <span>Email Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedApp.phone_verified ? 'default' : 'secondary'}>
                      {selectedApp.phone_verified ? '✓' : '✗'}
                    </Badge>
                    <span>Phone Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedApp.contract_signed ? 'default' : 'secondary'}>
                      {selectedApp.contract_signed ? '✓' : '✗'}
                    </Badge>
                    <span>Contract Signed</span>
                  </div>
                </div>

                {selectedApp.rejection_reason && (
                  <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                    <h4 className="font-semibold text-destructive mb-2">Rejection Reason</h4>
                    <p className="text-muted-foreground">{selectedApp.rejection_reason}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="contact" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Contact Name</h4>
                          <p className="text-muted-foreground">{selectedApp.contact_name}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Title/Position</h4>
                          <p className="text-muted-foreground">{selectedApp.contact_title || 'Not provided'}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Contact Email</h4>
                          <p className="text-muted-foreground">{selectedApp.contact_email}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Contact Phone</h4>
                          <p className="text-muted-foreground">{selectedApp.contact_phone || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="academic" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Users className="h-4 w-4" /> Student Count
                        </h4>
                        <p className="text-muted-foreground">{selectedApp.student_count || 'Not provided'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Users className="h-4 w-4" /> Faculty Count
                        </h4>
                        <p className="text-muted-foreground">{selectedApp.faculty_count || 'Not provided'}</p>
                      </div>
                    </div>

                    {selectedApp.programs_offered && selectedApp.programs_offered.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Programs Offered</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedApp.programs_offered.map((program, i) => (
                            <Badge key={i} variant="outline">{program}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedApp.accreditation_bodies && selectedApp.accreditation_bodies.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Accreditation Bodies</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedApp.accreditation_bodies.map((body, i) => (
                            <Badge key={i} variant="outline">{body}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {documentFields.map(({ key, label }) => {
                    const url = selectedApp[key as keyof UniversityApplication] as string | null;
                    return (
                      <Card key={key} className={url ? '' : 'opacity-50'}>
                        <CardContent className="p-3 sm:p-4 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs sm:text-sm truncate">{label}</span>
                          </div>
                          {url ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDocumentPreview(label, url)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">View</span>
                            </Button>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Not uploaded</Badge>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="verification" className="space-y-4 mt-4">
                <DocumentVerificationPanel
                  applicationId={selectedApp.id}
                  documents={{
                    certificate_of_incorporation_url: selectedApp.certificate_of_incorporation_url,
                    business_registration_url: selectedApp.business_registration_url,
                    accreditation_certificate_url: selectedApp.accreditation_certificate_url,
                    tax_clearance_url: selectedApp.tax_clearance_url,
                    ministry_certificate_url: selectedApp.ministry_certificate_url,
                    operating_license_url: selectedApp.operating_license_url,
                    government_approval_url: selectedApp.government_approval_url,
                    academic_charter_url: selectedApp.academic_charter_url,
                    quality_assurance_url: selectedApp.quality_assurance_url,
                    authorization_letter_url: selectedApp.authorization_letter_url,
                    institutional_profile_url: selectedApp.institutional_profile_url,
                    leadership_cv_url: selectedApp.leadership_cv_url,
                  }}
                />
              </TabsContent>
                </Tabs>
              </div>

              {/* Notes Panel - Sidebar on larger screens */}
              <div className="lg:w-80 lg:border-l lg:pl-4 border-t lg:border-t-0 pt-4 lg:pt-0">
                <ScrollArea className="h-64 lg:h-[60vh]">
                  <ApplicationNotesPanel applicationId={selectedApp.id} />
                </ScrollArea>
              </div>
            </div>
          )}
          {selectedApp && selectedApp.status !== 'approved' && selectedApp.status !== 'rejected' && (
            <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setIsRejectDialogOpen(true)}
                className="w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
              {selectedApp.status === 'pending' && (
                <Button
                  variant="secondary"
                  onClick={() => handleMarkUnderReview(selectedApp)}
                  className="w-full sm:w-auto"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Mark Under Review
                </Button>
              )}
              <Button
                onClick={() => handleApprove(selectedApp)}
                disabled={!selectedApp.email_verified || !selectedApp.contract_signed}
                className="w-full sm:w-auto"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground">
              Please provide a reason for rejecting this application. This will be sent to the applicant.
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
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={isDocPreviewOpen} onOpenChange={setIsDocPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{previewDoc?.label}</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setDocZoom(z => Math.max(50, z - 25))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm w-12 text-center">{docZoom}%</span>
                <Button variant="outline" size="icon" onClick={() => setDocZoom(z => Math.min(200, z + 25))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setDocRotation(r => (r + 90) % 360)}>
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[70vh] flex items-center justify-center bg-muted/50 rounded-lg p-4">
            {previewDoc && (
              previewDoc.url.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={previewDoc.url}
                  className="w-full h-[60vh]"
                  style={{ transform: `scale(${docZoom / 100}) rotate(${docRotation}deg)` }}
                />
              ) : (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.label}
                  style={{
                    transform: `scale(${docZoom / 100}) rotate(${docRotation}deg)`,
                    transition: 'transform 0.2s ease-in-out'
                  }}
                  className="max-w-full"
                />
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}