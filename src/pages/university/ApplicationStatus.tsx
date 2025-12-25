import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText, 
  AlertCircle,
  RefreshCw,
  Calendar,
  Mail,
  Phone,
  Globe,
  Shield,
  Eye,
  Upload
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import DocumentReupload from '@/components/university/DocumentReupload';

interface ApplicationData {
  id: string;
  institution_name: string;
  institution_type: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  country: string;
  city: string | null;
  website_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  approved_at: string | null;
  contract_signed_at: string | null;
  registration_payment_date: string | null;
  rejection_reason: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  contract_signed: boolean;
  registration_fee_paid: boolean;
  // Document URLs
  certificate_of_incorporation_url: string | null;
  accreditation_certificate_url: string | null;
  business_registration_url: string | null;
  tax_clearance_url: string | null;
  academic_charter_url: string | null;
  operating_license_url: string | null;
  government_approval_url: string | null;
  ministry_certificate_url: string | null;
  authorization_letter_url: string | null;
  quality_assurance_url: string | null;
  institutional_profile_url: string | null;
  leadership_cv_url: string | null;
}

const requiredDocuments = [
  { key: 'certificate_of_incorporation_url', label: 'Certificate of Incorporation' },
  { key: 'accreditation_certificate_url', label: 'Accreditation Certificate' },
  { key: 'business_registration_url', label: 'Business Registration' },
  { key: 'tax_clearance_url', label: 'Tax Clearance Certificate' },
  { key: 'operating_license_url', label: 'Operating License' },
  { key: 'government_approval_url', label: 'Government Approval' },
];

const optionalDocuments = [
  { key: 'academic_charter_url', label: 'Academic Charter' },
  { key: 'ministry_certificate_url', label: 'Ministry Certificate' },
  { key: 'authorization_letter_url', label: 'Authorization Letter' },
  { key: 'quality_assurance_url', label: 'Quality Assurance Document' },
  { key: 'institutional_profile_url', label: 'Institutional Profile' },
  { key: 'leadership_cv_url', label: 'Leadership CV' },
];

export default function ApplicationStatus() {
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplication();
  }, []);

  useEffect(() => {
    if (!application) return;

    // Real-time subscription for status updates
    const channel = supabase
      .channel('my-application-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'university_applications',
          filter: `id=eq.${application.id}`,
        },
        (payload) => {
          const updated = payload.new as ApplicationData;
          setApplication(updated);
          
          // Show notification based on status change
          if (updated.status === 'approved') {
            toast.success('🎉 Congratulations! Your application has been approved!', {
              duration: 10000,
            });
            const audio = new Audio('/sounds/success.mp3');
            audio.play().catch(() => {});
          } else if (updated.status === 'rejected') {
            toast.error('Application Update', {
              description: `Your application was not approved. Reason: ${updated.rejection_reason || 'Not specified'}`,
              duration: 10000,
            });
          } else if (updated.status === 'under_review') {
            toast.info('Your application is now under review', {
              duration: 5000,
            });
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [application?.id]);

  const fetchApplication = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth/university');
        return;
      }

      const { data, error } = await supabase
        .from('university_applications')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setApplication(data);
    } catch (error) {
      console.error('Error fetching application:', error);
      toast.error('Failed to load application status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
          label: 'Approved',
          description: 'Your university registration has been approved!',
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          label: 'Rejected',
          description: 'Unfortunately, your application was not approved.',
        };
      case 'under_review':
        return {
          icon: Eye,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
          label: 'Under Review',
          description: 'Your application is being reviewed by our team.',
        };
      default:
        return {
          icon: Clock,
          color: 'text-amber-500',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/20',
          label: 'Pending',
          description: 'Your application is awaiting review.',
        };
    }
  };

  const calculateProgress = () => {
    if (!application) return 0;
    let completed = 0;
    const total = 8;

    if (application.email_verified) completed++;
    if (application.phone_verified) completed++;
    if (application.contract_signed) completed++;
    if (application.registration_fee_paid) completed++;
    
    // Count required documents
    const docsUploaded = requiredDocuments.filter(
      doc => application[doc.key as keyof ApplicationData]
    ).length;
    completed += Math.min(docsUploaded, 3); // Max 3 points for docs

    if (application.status === 'approved') completed = total;

    return Math.round((completed / total) * 100);
  };

  const getVerificationSteps = () => {
    if (!application) return [];
    return [
      { 
        label: 'Application Submitted', 
        completed: true, 
        date: application.created_at 
      },
      { 
        label: 'Email Verified', 
        completed: application.email_verified, 
        date: null 
      },
      { 
        label: 'Phone Verified', 
        completed: application.phone_verified, 
        date: null 
      },
      { 
        label: 'Documents Uploaded', 
        completed: requiredDocuments.some(doc => application[doc.key as keyof ApplicationData]), 
        date: null 
      },
      { 
        label: 'Contract Signed', 
        completed: application.contract_signed, 
        date: application.contract_signed_at 
      },
      { 
        label: 'Registration Fee Paid', 
        completed: application.registration_fee_paid, 
        date: application.registration_payment_date 
      },
      { 
        label: 'Admin Review', 
        completed: application.status !== 'pending', 
        date: application.reviewed_at 
      },
      { 
        label: 'Final Approval', 
        completed: application.status === 'approved', 
        date: application.approved_at 
      },
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No Application Found</h2>
            <p className="text-muted-foreground mb-4">
              You haven't submitted a university registration application yet.
            </p>
            <Button onClick={() => navigate('/university-registration')}>
              Start Application
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(application.status);
  const StatusIcon = statusInfo.icon;
  const progress = calculateProgress();
  const steps = getVerificationSteps();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Application Status</h1>
            <p className="text-muted-foreground">Track your university registration progress</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs text-muted-foreground">{isConnected ? 'Live Updates' : 'Connecting...'}</span>
          </div>
        </div>

        {/* Status Card */}
        <Card className={`border-2 ${statusInfo.borderColor}`}>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className={`w-20 h-20 rounded-full ${statusInfo.bgColor} flex items-center justify-center`}>
                <StatusIcon className={`h-10 w-10 ${statusInfo.color}`} />
              </div>
              <div className="text-center md:text-left flex-1">
                <Badge className={`${statusInfo.bgColor} ${statusInfo.color} border ${statusInfo.borderColor} mb-2`}>
                  {statusInfo.label}
                </Badge>
                <h2 className="text-xl font-semibold">{application.institution_name}</h2>
                <p className="text-muted-foreground">{statusInfo.description}</p>
                {application.rejection_reason && (
                  <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-500">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      Reason: {application.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{progress}%</div>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
            </div>
            <Progress value={progress} className="mt-6 h-2" />
          </CardContent>
        </Card>

        {/* Progress Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Registration Progress
            </CardTitle>
            <CardDescription>Track each step of your application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step.completed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span className="text-sm">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 pb-4 border-b last:border-0">
                    <p className={`font-medium ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(step.date), 'PPP')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Application Details */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Institution Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Institution Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Institution Name</p>
                <p className="font-medium">{application.institution_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium capitalize">{application.institution_type.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{application.city ? `${application.city}, ` : ''}{application.country}</p>
              </div>
              {application.website_url && (
                <div>
                  <p className="text-sm text-muted-foreground">Website</p>
                  <a href={application.website_url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    {application.website_url}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Contact Person</p>
                <p className="font-medium">{application.contact_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium flex items-center gap-2">
                  {application.contact_email}
                  {application.email_verified && (
                    <Badge variant="outline" className="text-green-500 border-green-500/20">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </p>
              </div>
              {application.contact_phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium flex items-center gap-2">
                    {application.contact_phone}
                    {application.phone_verified && (
                      <Badge variant="outline" className="text-green-500 border-green-500/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Documents Status with Re-upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Document Status
            </CardTitle>
            <CardDescription>
              {application.status === 'rejected' 
                ? 'You can re-upload documents and resubmit your application'
                : 'Required documents for your application'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="required" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="required" className="text-xs sm:text-sm">Required Documents</TabsTrigger>
                <TabsTrigger value="optional" className="text-xs sm:text-sm">Optional Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="required" className="space-y-3">
                {requiredDocuments.map((doc) => (
                  <DocumentReupload
                    key={doc.key}
                    applicationId={application.id}
                    documentKey={doc.key}
                    documentLabel={doc.label}
                    currentUrl={application[doc.key as keyof ApplicationData] as string | null}
                    onUploadComplete={fetchApplication}
                    disabled={application.status === 'approved'}
                  />
                ))}
              </TabsContent>
              
              <TabsContent value="optional" className="space-y-3">
                {optionalDocuments.map((doc) => (
                  <DocumentReupload
                    key={doc.key}
                    applicationId={application.id}
                    documentKey={doc.key}
                    documentLabel={doc.label}
                    currentUrl={application[doc.key as keyof ApplicationData] as string | null}
                    onUploadComplete={fetchApplication}
                    disabled={application.status === 'approved'}
                  />
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <div>
                  <p className="font-medium">Application Submitted</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(application.created_at), 'PPP')} • {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              {application.reviewed_at && (
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <div>
                    <p className="font-medium">Review Started</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(application.reviewed_at), 'PPP')}
                    </p>
                  </div>
                </div>
              )}
              {application.approved_at && (
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div>
                    <p className="font-medium">Application Approved</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(application.approved_at), 'PPP')}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-muted" />
                <div>
                  <p className="font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(application.updated_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button variant="outline" onClick={() => navigate('/university/dashboard')}>
            Go to Dashboard
          </Button>
          <Button onClick={fetchApplication}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
        </div>
      </div>
    </div>
  );
}
