import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Award, Loader2, Calendar, User, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';

interface CertificateData {
  id: string;
  credential_id: string;
  issued_at: string;
  student_id: string;
  course_id: string;
  course?: {
    title: string;
    instructor_name: string;
  };
  profile?: {
    full_name: string;
  };
}

const VerifyCertificate = () => {
  const { credentialId } = useParams();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (credentialId) {
      verifyCertificate(credentialId);
    }
  }, [credentialId]);

  const verifyCertificate = async (id: string) => {
    try {
      // Fetch certificate with related data
      const { data, error: fetchError } = await supabase
        .from('student_certificates')
        .select(`*, courses:course_id (title, instructor_name)`)
        .eq('credential_id', id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setError('Certificate not found. This credential ID is invalid.');
        return;
      }

      setCertificate({
        ...data,
        course: data.courses,
        profile: null,
      });
    } catch (err) {
      console.error('Error verifying certificate:', err);
      setError('An error occurred while verifying the certificate.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Verifying certificate...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Certificate Verification</h1>
          <p className="text-muted-foreground">
            Credential ID: <code className="bg-muted px-2 py-1 rounded">{credentialId}</code>
          </p>
        </div>

        {error ? (
          <Card className="border-destructive">
            <CardContent className="py-12 text-center">
              <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold text-destructive mb-2">Invalid Certificate</h2>
              <p className="text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        ) : certificate ? (
          <Card className="border-green-500">
            <CardHeader className="text-center border-b bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <Badge className="bg-green-500">Verified</Badge>
              </div>
              <CardTitle className="text-green-700 dark:text-green-400">
                This certificate is authentic
              </CardTitle>
            </CardHeader>
            <CardContent className="py-8 space-y-6">
              {/* Recipient */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Awarded To</p>
                  <p className="text-lg font-semibold">{certificate.profile?.full_name || 'Student'}</p>
                </div>
              </div>

              {/* Course */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Course Completed</p>
                  <p className="text-lg font-semibold">{certificate.course?.title || 'Course'}</p>
                  <p className="text-sm text-muted-foreground">
                    Instructed by {certificate.course?.instructor_name || 'Instructor'}
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date Issued</p>
                  <p className="text-lg font-semibold">
                    {new Date(certificate.issued_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Award */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Credential ID</p>
                  <p className="font-mono text-sm">{certificate.credential_id}</p>
                </div>
              </div>

              <div className="pt-4 border-t text-center">
                <p className="text-sm text-muted-foreground">
                  This certificate was issued by EduVerse and verifies that the recipient 
                  has successfully completed the course requirements.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </Layout>
  );
};

export default VerifyCertificate;
