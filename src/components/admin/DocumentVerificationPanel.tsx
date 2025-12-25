import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, MessageSquare, ExternalLink, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface DocumentVerification {
  id: string;
  document_key: string;
  document_label: string;
  status: string;
  admin_comment: string | null;
  verified_at: string | null;
  admin_id: string | null;
}

interface DocumentVerificationPanelProps {
  applicationId: string;
  documents: Record<string, string | null>;
}

const documentConfig = [
  { key: 'certificate_of_incorporation_url', label: 'Certificate of Incorporation' },
  { key: 'business_registration_url', label: 'Business Registration' },
  { key: 'accreditation_certificate_url', label: 'Accreditation Certificate' },
  { key: 'tax_clearance_url', label: 'Tax Clearance Certificate' },
  { key: 'ministry_certificate_url', label: 'Ministry Certificate' },
  { key: 'operating_license_url', label: 'Operating License' },
  { key: 'government_approval_url', label: 'Government Approval' },
  { key: 'academic_charter_url', label: 'Academic Charter' },
  { key: 'quality_assurance_url', label: 'Quality Assurance Document' },
  { key: 'authorization_letter_url', label: 'Authorization Letter' },
  { key: 'institutional_profile_url', label: 'Institutional Profile' },
  { key: 'leadership_cv_url', label: 'Leadership CV' },
];

export const DocumentVerificationPanel: React.FC<DocumentVerificationPanelProps> = ({
  applicationId,
  documents,
}) => {
  const [verifications, setVerifications] = useState<DocumentVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [commentDialog, setCommentDialog] = useState<{
    open: boolean;
    docKey: string;
    docLabel: string;
    action: 'verified' | 'rejected';
  } | null>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchVerifications();
  }, [applicationId]);

  const fetchVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from('university_document_verifications')
        .select('*')
        .eq('application_id', applicationId);

      if (error) throw error;
      setVerifications(data || []);
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVerification = (docKey: string) => {
    return verifications.find(v => v.document_key === docKey);
  };

  const handleVerifyAction = (docKey: string, docLabel: string, action: 'verified' | 'rejected') => {
    setCommentDialog({ open: true, docKey, docLabel, action });
    setComment('');
  };

  const submitVerification = async () => {
    if (!commentDialog) return;

    const { docKey, docLabel, action } = commentDialog;
    setActionLoading(docKey);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const existingVerification = getVerification(docKey);

      if (existingVerification) {
        const { error } = await supabase
          .from('university_document_verifications')
          .update({
            status: action,
            admin_comment: comment || null,
            admin_id: user.id,
            verified_at: action === 'verified' ? new Date().toISOString() : null,
          })
          .eq('id', existingVerification.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('university_document_verifications')
          .insert({
            application_id: applicationId,
            document_key: docKey,
            document_label: docLabel,
            status: action,
            admin_comment: comment || null,
            admin_id: user.id,
            verified_at: action === 'verified' ? new Date().toISOString() : null,
          });

        if (error) throw error;
      }

      toast.success(`Document marked as ${action}`);
      await fetchVerifications();
      setCommentDialog(null);
    } catch (error: any) {
      console.error('Error updating verification:', error);
      toast.error('Failed to update verification');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500/20 text-green-700 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" /> Verified</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-700 border-red-500/30"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  const uploadedDocs = documentConfig.filter(doc => documents[doc.key]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Document Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {uploadedDocs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No documents uploaded yet
            </p>
          ) : (
            uploadedDocs.map((doc) => {
              const verification = getVerification(doc.key);
              const docUrl = documents[doc.key];

              return (
                <div
                  key={doc.key}
                  className="p-3 border rounded-lg space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm truncate">{doc.label}</span>
                        {getStatusBadge(verification?.status || 'pending')}
                      </div>
                      {verification?.admin_comment && (
                        <div className="flex items-start gap-1 mt-1 text-xs text-muted-foreground">
                          <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
                          <span className="line-clamp-2">{verification.admin_comment}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      {docUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(docUrl, '_blank')}
                          className="h-8"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerifyAction(doc.key, doc.label, 'verified')}
                        disabled={actionLoading === doc.key}
                        className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <CheckCircle className="w-3 h-3 sm:mr-1" />
                        <span className="hidden sm:inline">Verify</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerifyAction(doc.key, doc.label, 'rejected')}
                        disabled={actionLoading === doc.key}
                        className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="w-3 h-3 sm:mr-1" />
                        <span className="hidden sm:inline">Reject</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Dialog open={commentDialog?.open || false} onOpenChange={(open) => !open && setCommentDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {commentDialog?.action === 'verified' ? 'Verify' : 'Reject'} Document
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {commentDialog?.action === 'verified' 
                ? `Confirm verification of "${commentDialog?.docLabel}"?`
                : `Please provide a reason for rejecting "${commentDialog?.docLabel}".`
              }
            </p>
            <Textarea
              placeholder={commentDialog?.action === 'verified' 
                ? "Optional comment..." 
                : "Reason for rejection (required for rejected documents)..."
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setCommentDialog(null)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={submitVerification}
              disabled={actionLoading !== null || (commentDialog?.action === 'rejected' && !comment.trim())}
              className={`w-full sm:w-auto ${
                commentDialog?.action === 'verified' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Confirm {commentDialog?.action === 'verified' ? 'Verification' : 'Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
