import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare, 
  ExternalLink, 
  Loader2,
  Calendar,
  Scan,
  AlertTriangle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { format, differenceInDays, addDays } from 'date-fns';

interface DocumentVerification {
  id: string;
  document_key: string;
  document_label: string;
  status: string;
  admin_comment: string | null;
  verified_at: string | null;
  admin_id: string | null;
  expiry_date: string | null;
  extracted_data: any;
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
  const [ocrLoading, setOcrLoading] = useState<string | null>(null);
  const [commentDialog, setCommentDialog] = useState<{
    open: boolean;
    docKey: string;
    docLabel: string;
    action: 'verified' | 'rejected';
  } | null>(null);
  const [comment, setComment] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [ocrResult, setOcrResult] = useState<{ docKey: string; data: any } | null>(null);

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
    const verification = getVerification(docKey);
    setCommentDialog({ open: true, docKey, docLabel, action });
    setComment('');
    setExpiryDate(verification?.expiry_date || '');
  };

  const submitVerification = async () => {
    if (!commentDialog) return;

    const { docKey, docLabel, action } = commentDialog;
    setActionLoading(docKey);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const existingVerification = getVerification(docKey);

      const updateData = {
        status: action,
        admin_comment: comment || null,
        admin_id: user.id,
        verified_at: action === 'verified' ? new Date().toISOString() : null,
        expiry_date: expiryDate || null,
      };

      if (existingVerification) {
        const { error } = await supabase
          .from('university_document_verifications')
          .update(updateData)
          .eq('id', existingVerification.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('university_document_verifications')
          .insert({
            application_id: applicationId,
            document_key: docKey,
            document_label: docLabel,
            ...updateData,
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

  const handleOCR = async (docKey: string, docLabel: string, docUrl: string) => {
    setOcrLoading(docKey);
    try {
      const { data, error } = await supabase.functions.invoke('extract-document-ocr', {
        body: { documentUrl: docUrl, documentType: docLabel },
      });

      if (error) throw error;

      if (data.extractedData) {
        setOcrResult({ docKey, data: data.extractedData });

        // Auto-fill expiry date if found
        if (data.extractedData.expiryDate) {
          const verification = getVerification(docKey);
          if (verification) {
            await supabase
              .from('university_document_verifications')
              .update({ 
                extracted_data: data.extractedData,
                expiry_date: data.extractedData.expiryDate 
              })
              .eq('id', verification.id);
          }
          await fetchVerifications();
        }

        toast.success('Document analyzed successfully');
      }
    } catch (error: any) {
      console.error('OCR error:', error);
      toast.error('Failed to analyze document');
    } finally {
      setOcrLoading(null);
    }
  };

  const getStatusBadge = (verification: DocumentVerification | undefined) => {
    if (!verification) {
      return <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }

    const isExpiring = verification.expiry_date && 
      differenceInDays(new Date(verification.expiry_date), new Date()) <= 30;

    switch (verification.status) {
      case 'verified':
        return (
          <div className="flex items-center gap-1">
            <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
              <CheckCircle className="w-3 h-3 mr-1" /> Verified
            </Badge>
            {isExpiring && (
              <Badge className="bg-orange-500/20 text-orange-700 border-orange-500/30">
                <AlertTriangle className="w-3 h-3 mr-1" /> Expiring
              </Badge>
            )}
          </div>
        );
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
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{doc.label}</span>
                          {getStatusBadge(verification)}
                        </div>
                        {verification?.expiry_date && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Expires: {format(new Date(verification.expiry_date), 'MMM d, yyyy')}
                          </p>
                        )}
                        {verification?.admin_comment && (
                          <div className="flex items-start gap-1 mt-1 text-xs text-muted-foreground">
                            <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
                            <span className="line-clamp-2">{verification.admin_comment}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      {docUrl && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(docUrl, '_blank')}
                            className="h-8"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOCR(doc.key, doc.label, docUrl)}
                            disabled={ocrLoading === doc.key}
                            className="h-8"
                          >
                            {ocrLoading === doc.key ? (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <Scan className="w-3 h-3 mr-1" />
                            )}
                            OCR
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerifyAction(doc.key, doc.label, 'verified')}
                        disabled={actionLoading === doc.key}
                        className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verify
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerifyAction(doc.key, doc.label, 'rejected')}
                        disabled={actionLoading === doc.key}
                        className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Verification Dialog */}
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
            
            {commentDialog?.action === 'verified' && (
              <div className="space-y-2">
                <Label htmlFor="expiry-date">Document Expiry Date (Optional)</Label>
                <Input
                  id="expiry-date"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
                <p className="text-xs text-muted-foreground">
                  Set an expiry date to receive automatic reminders
                </p>
              </div>
            )}

            <Textarea
              placeholder={commentDialog?.action === 'verified' 
                ? "Optional comment..." 
                : "Reason for rejection..."
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
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* OCR Result Dialog */}
      <Dialog open={ocrResult !== null} onOpenChange={(open) => !open && setOcrResult(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scan className="w-5 h-5" />
              Extracted Information
            </DialogTitle>
          </DialogHeader>
          {ocrResult && (
            <div className="space-y-3">
              {Object.entries(ocrResult.data).map(([key, value]) => {
                if (!value || key === 'confidence') return null;
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                return (
                  <div key={key} className="flex flex-col">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="text-sm font-medium">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </span>
                  </div>
                );
              })}
              {ocrResult.data.confidence && (
                <Badge variant={ocrResult.data.confidence === 'high' ? 'default' : 'secondary'}>
                  Confidence: {ocrResult.data.confidence}
                </Badge>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setOcrResult(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
