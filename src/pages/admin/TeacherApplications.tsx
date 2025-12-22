import { useEffect, useState } from 'react';
import { 
  Eye, 
  Check, 
  X, 
  Search, 
  FileText, 
  User, 
  Download,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  ZoomIn,
  ZoomOut,
  RotateCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface TeacherApplication {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  country: string;
  bio: string | null;
  status: 'pending' | 'approved' | 'rejected';
  specializations: string[] | null;
  experience_years: number | null;
  university_name: string | null;
  degree_type: string | null;
  graduation_year: number | null;
  cv_url: string | null;
  photo_url: string | null;
  id_document_url: string | null;
  passport_url: string | null;
  graduation_degree_url: string | null;
  contract_signed: boolean | null;
  contract_signed_at: string | null;
  registration_fee_paid: boolean | null;
  created_at: string;
  rejection_reason: string | null;
}

export default function TeacherApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<TeacherApplication | null>(null);
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
      .from('teacher_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to fetch applications');
    } else {
      setApplications(data || []);
    }
    setLoading(false);
  };

  const handleApprove = async (application: TeacherApplication) => {
    try {
      const { error: updateError } = await supabase
        .from('teacher_applications')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
        })
        .eq('id', application.id);

      if (updateError) throw updateError;

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: application.user_id,
          role: 'instructor',
        });

      if (roleError && !roleError.message.includes('duplicate')) {
        throw roleError;
      }

      await supabase.from('notifications').insert({
        user_id: application.user_id,
        title: 'Application Approved!',
        message: 'Congratulations! Your teacher application has been approved. You can now create courses.',
        type: 'success',
        link: '/dashboard',
      });

      toast.success('Application approved successfully');
      fetchApplications();
      setIsViewDialogOpen(false);
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Failed to approve application');
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;

    try {
      const { error } = await supabase
        .from('teacher_applications')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
        })
        .eq('id', selectedApp.id);

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: selectedApp.user_id,
        title: 'Application Update',
        message: `Your teacher application was not approved. Reason: ${rejectionReason}`,
        type: 'warning',
      });

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
      // If the URL is a Supabase storage URL, we need to get a signed/public URL
      let previewUrl = url;
      
      // Check if it's a storage path (not a full URL)
      if (url && !url.startsWith('http')) {
        // Try to get public URL from storage
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
      // Still try to open with original URL
      setPreviewDoc({ label, url });
      setDocZoom(100);
      setDocRotation(0);
      setIsDocPreviewOpen(true);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = 
      app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const approvedCount = applications.filter(a => a.status === 'approved').length;
  const rejectedCount = applications.filter(a => a.status === 'rejected').length;

  const isPdfOrImage = (url: string) => {
    const lower = url.toLowerCase();
    return lower.endsWith('.pdf') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Teacher Applications</h1>
        <p className="text-muted-foreground">Review and manage teacher applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{applications.length}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
            <p className="text-sm text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Contract</TableHead>
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
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={app.photo_url || undefined} />
                        <AvatarFallback>
                          {app.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{app.full_name}</p>
                        <p className="text-sm text-muted-foreground">{app.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{app.country}</TableCell>
                  <TableCell>{app.experience_years || 0} years</TableCell>
                  <TableCell>
                    <Badge variant={app.registration_fee_paid ? 'default' : 'secondary'}>
                      {app.registration_fee_paid ? 'Paid' : 'Unpaid'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={app.contract_signed ? 'default' : 'secondary'}>
                      {app.contract_signed ? 'Signed' : 'Unsigned'}
                    </Badge>
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

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <Tabs defaultValue="info" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Personal Info</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="flex items-start gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={selectedApp.photo_url || undefined} />
                    <AvatarFallback className="text-2xl">
                      {selectedApp.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-bold">{selectedApp.full_name}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {selectedApp.email}
                      </span>
                      {selectedApp.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {selectedApp.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {selectedApp.country}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(selectedApp.status)}
                </div>

                {selectedApp.bio && (
                  <div>
                    <h4 className="font-semibold mb-2">Bio</h4>
                    <p className="text-muted-foreground">{selectedApp.bio}</p>
                  </div>
                )}

                {selectedApp.specializations && selectedApp.specializations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Specializations</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.specializations.map((spec, i) => (
                        <Badge key={i} variant="outline">{spec}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Experience</h4>
                    <p className="text-muted-foreground">{selectedApp.experience_years || 0} years</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Applied On</h4>
                    <p className="text-muted-foreground">
                      {format(new Date(selectedApp.created_at), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedApp.registration_fee_paid ? 'default' : 'secondary'}>
                      {selectedApp.registration_fee_paid ? '✓' : '✗'}
                    </Badge>
                    <span>$99 Registration Fee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedApp.contract_signed ? 'default' : 'secondary'}>
                      {selectedApp.contract_signed ? '✓' : '✗'}
                    </Badge>
                    <span>Contract Signed</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="education" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-primary/10">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{selectedApp.degree_type || 'Degree'}</h4>
                        <p className="text-muted-foreground">{selectedApp.university_name || 'University not specified'}</p>
                        {selectedApp.graduation_year && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Calendar className="h-4 w-4" />
                            Graduated {selectedApp.graduation_year}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'CV / Resume', url: selectedApp.cv_url },
                    { label: 'ID Document', url: selectedApp.id_document_url },
                    { label: 'Passport', url: selectedApp.passport_url },
                    { label: 'Graduation Degree', url: selectedApp.graduation_degree_url },
                  ].map((doc) => (
                    <Card key={doc.label}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <span>{doc.label}</span>
                        </div>
                        {doc.url ? (
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => openDocumentPreview(doc.label, doc.url!)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        ) : (
                          <Badge variant="secondary">Not uploaded</Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}

          {selectedApp && selectedApp.status === 'pending' && (
            <DialogFooter className="gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsRejectDialogOpen(true);
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => handleApprove(selectedApp)}
                disabled={!selectedApp.registration_fee_paid || !selectedApp.contract_signed}
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </DialogFooter>
          )}

          {selectedApp && selectedApp.status === 'rejected' && selectedApp.rejection_reason && (
            <div className="mt-4 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <h4 className="font-semibold text-destructive mb-1">Rejection Reason</h4>
              <p className="text-sm text-muted-foreground">{selectedApp.rejection_reason}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={isDocPreviewOpen} onOpenChange={setIsDocPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{previewDoc?.label}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setDocZoom(Math.max(25, docZoom - 25))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm w-16 text-center">{docZoom}%</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setDocZoom(Math.min(200, docZoom + 25))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setDocRotation((docRotation + 90) % 360)}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[75vh] flex items-center justify-center bg-muted rounded-lg p-4">
            {previewDoc?.url && (
              previewDoc.url.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={previewDoc.url}
                  className="w-full h-[70vh] border-0 rounded-lg"
                  title={previewDoc.label}
                />
              ) : (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.label}
                  className="max-w-full transition-transform duration-200"
                  style={{
                    transform: `scale(${docZoom / 100}) rotate(${docRotation}deg)`,
                  }}
                />
              )
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" asChild>
              <a href={previewDoc?.url} download target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}