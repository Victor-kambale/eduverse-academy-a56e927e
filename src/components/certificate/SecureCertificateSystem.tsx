import { useState, useEffect, useRef } from 'react';
import { 
  Award, 
  Download, 
  Share2, 
  Shield,
  GraduationCap,
  Medal,
  Loader2,
  CheckCircle,
  FileText,
  Eye,
  Lock,
  AlertTriangle,
  Camera,
  Upload,
  X,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { toast } from 'sonner';
import { CopyProtection } from '@/components/security/CopyProtection';
import { SecurityScanAnimation } from './SecurityScanAnimation';
import { IdentityVerification } from './IdentityVerification';
import { TermsAcceptanceModal } from './TermsAcceptanceModal';

interface TranscriptEntry {
  courseName: string;
  completionDate: string;
  grade: string;
  credits: number;
  instructor: string;
}

interface CertificateData {
  studentName: string;
  studentId?: string;
  courseName: string;
  instructorName: string;
  completionDate: string;
  credentialId: string;
  grade?: string;
  institutionName?: string;
  courseDuration?: string;
  cpdHours?: number;
  skills?: string[];
  transcript?: TranscriptEntry[];
  price?: number;
}

interface SecureCertificateSystemProps {
  certificates: CertificateData[];
  onClaim?: (certificates: CertificateData[]) => void;
  isAdmin?: boolean;
  isTeacher?: boolean;
  userRole?: 'admin' | 'teacher' | 'student';
}

export function SecureCertificateSystem({ 
  certificates, 
  onClaim, 
  isAdmin = false, 
  isTeacher = false,
  userRole = 'student' 
}: SecureCertificateSystemProps) {
  const [selectedCertificates, setSelectedCertificates] = useState<string[]>([]);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showIdentityVerification, setShowIdentityVerification] = useState(false);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [showSecurityScan, setShowSecurityScan] = useState(false);
  const [securityScanType, setSecurityScanType] = useState<'environment' | 'payment'>('environment');
  const [canDownload, setCanDownload] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('certificate');
  const [studentFullName, setStudentFullName] = useState('');
  const [previewCertificate, setPreviewCertificate] = useState<CertificateData | null>(null);
  
  const certificateRef = useRef<HTMLDivElement>(null);
  const basePrice = 25; // Base price per certificate

  // Calculate total price based on selected certificates
  const totalPrice = selectedCertificates.length * basePrice;

  const handleSelectCertificate = (credentialId: string) => {
    setSelectedCertificates(prev => {
      if (prev.includes(credentialId)) {
        return prev.filter(id => id !== credentialId);
      }
      return [...prev, credentialId];
    });
  };

  const handleViewCertificate = (cert: CertificateData) => {
    if (!termsAccepted) {
      setPreviewCertificate(cert);
      setShowTermsModal(true);
    } else {
      setPreviewCertificate(cert);
    }
  };

  const handleTermsAccepted = () => {
    setTermsAccepted(true);
    setShowTermsModal(false);
    setCanDownload(true);
    toast.success('Terms accepted. You can now download certificates.');
  };

  const handleStartVerification = () => {
    setShowSecurityScan(true);
    setSecurityScanType('environment');
  };

  const handleSecurityScanComplete = () => {
    setShowSecurityScan(false);
    if (securityScanType === 'environment') {
      setShowIdentityVerification(true);
    } else {
      // Payment scan complete, proceed with payment
      handlePaymentProcess();
    }
  };

  const handleIdentityVerified = (verified: boolean, fullName?: string) => {
    setShowIdentityVerification(false);
    if (verified && fullName) {
      setIdentityVerified(true);
      setStudentFullName(fullName);
      toast.success('Identity verified successfully!');
    } else {
      toast.error('Identity verification failed. Please try again.');
    }
  };

  const handlePaymentProcess = () => {
    // Simulated payment process
    toast.success('Payment processed successfully!');
    onClaim?.(certificates.filter(c => selectedCertificates.includes(c.credentialId)));
  };

  const handleClaimCertificates = () => {
    if (selectedCertificates.length === 0) {
      toast.error('Please select at least one certificate to claim.');
      return;
    }
    
    if (!identityVerified) {
      handleStartVerification();
      return;
    }

    // Start payment security scan
    setSecurityScanType('payment');
    setShowSecurityScan(true);
  };

  const generateQRCode = async (text: string): Promise<string> => {
    try {
      return await QRCode.toDataURL(text, {
        width: 120,
        margin: 1,
        color: { dark: '#1a365d', light: '#ffffff' }
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      return '';
    }
  };

  const generateSecurePDF = async (cert: CertificateData) => {
    if (!canDownload && userRole === 'student') {
      setPreviewCertificate(cert);
      setShowTermsModal(true);
      return;
    }

    setGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const verifyUrl = `${window.location.origin}/verify-certificate/${cert.credentialId}`;

      // === Anti-copy watermark pattern ===
      doc.setFillColor(248, 250, 252);
      for (let x = 0; x < pageWidth; x += 35) {
        for (let y = 0; y < pageHeight; y += 35) {
          doc.setFontSize(6);
          doc.setTextColor(240, 240, 240);
          doc.text('EDUVERSE ACADEMY', x, y, { angle: 45 });
        }
      }

      // Security pattern overlay (makes copying difficult)
      doc.setDrawColor(250, 250, 250);
      doc.setLineWidth(0.1);
      for (let i = 0; i < pageHeight; i += 3) {
        doc.line(0, i, pageWidth, i);
      }

      // Top banner with gradient effect
      doc.setFillColor(26, 54, 93);
      doc.rect(0, 0, pageWidth, 28, 'F');
      doc.setFillColor(218, 165, 32);
      doc.rect(0, 28, pageWidth, 2, 'F');

      // Bottom banner
      doc.setFillColor(26, 54, 93);
      doc.rect(0, pageHeight - 28, pageWidth, 28, 'F');
      doc.setFillColor(218, 165, 32);
      doc.rect(0, pageHeight - 30, pageWidth, 2, 'F');

      // Decorative gold borders (triple border)
      doc.setDrawColor(218, 165, 32);
      doc.setLineWidth(3);
      doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
      doc.setLineWidth(1.5);
      doc.rect(12, 12, pageWidth - 24, pageHeight - 24);
      doc.setLineWidth(0.5);
      doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

      // Corner ornaments with circles
      const corners = [
        { x: 20, y: 20 },
        { x: pageWidth - 20, y: 20 },
        { x: 20, y: pageHeight - 20 },
        { x: pageWidth - 20, y: pageHeight - 20 }
      ];
      corners.forEach(corner => {
        doc.setFillColor(218, 165, 32);
        doc.circle(corner.x, corner.y, 3, 'F');
        doc.setDrawColor(26, 54, 93);
        doc.circle(corner.x, corner.y, 5, 'S');
      });

      // Institution header with logo placeholder
      doc.setFontSize(22);
      doc.setTextColor(218, 165, 32);
      doc.setFont('helvetica', 'bold');
      doc.text('EDUVERSE ACADEMY', pageWidth / 2, 18, { align: 'center' });
      
      doc.setFontSize(8);
      doc.setTextColor(200, 200, 200);
      doc.text('Excellence in Education • Since 2024', pageWidth / 2, 24, { align: 'center' });

      // Certificate title with decorative elements
      doc.setFontSize(42);
      doc.setTextColor(26, 54, 93);
      doc.text('CERTIFICATE', pageWidth / 2, 52, { align: 'center' });
      
      doc.setFontSize(18);
      doc.setTextColor(100, 100, 100);
      doc.text('OF COMPLETION', pageWidth / 2, 62, { align: 'center' });

      // Decorative lines under title
      doc.setDrawColor(218, 165, 32);
      doc.setLineWidth(1.5);
      doc.line(pageWidth / 2 - 60, 68, pageWidth / 2 + 60, 68);
      doc.setLineWidth(0.5);
      doc.line(pageWidth / 2 - 40, 71, pageWidth / 2 + 40, 71);

      // This certifies text
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.text('This is to certify that', pageWidth / 2, 82, { align: 'center' });

      // Student name with verified name if available
      const displayName = studentFullName || cert.studentName;
      doc.setFontSize(32);
      doc.setTextColor(26, 54, 93);
      doc.setFont('helvetica', 'bold');
      doc.text(displayName, pageWidth / 2, 98, { align: 'center' });

      // Name underline
      const nameWidth = doc.getTextWidth(displayName);
      doc.setDrawColor(218, 165, 32);
      doc.setLineWidth(0.75);
      doc.line(pageWidth / 2 - nameWidth / 2 - 15, 102, pageWidth / 2 + nameWidth / 2 + 15, 102);

      // Has successfully completed
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.text('has successfully completed the course', pageWidth / 2, 114, { align: 'center' });

      // Course name
      doc.setFontSize(22);
      doc.setTextColor(26, 54, 93);
      doc.setFont('helvetica', 'bold');
      const maxTitleWidth = pageWidth - 80;
      const splitTitle = doc.splitTextToSize(cert.courseName, maxTitleWidth);
      let yPos = 128;
      splitTitle.forEach((line: string) => {
        doc.text(line, pageWidth / 2, yPos, { align: 'center' });
        yPos += 9;
      });

      // Course details
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      const details = [];
      if (cert.instructorName) details.push(`Instructor: ${cert.instructorName}`);
      if (cert.courseDuration) details.push(`Duration: ${cert.courseDuration}`);
      if (cert.cpdHours) details.push(`${cert.cpdHours} CPD Hours`);
      if (details.length > 0) {
        doc.text(details.join('  •  '), pageWidth / 2, yPos + 8, { align: 'center' });
      }

      // Grade badge
      if (cert.grade) {
        doc.setFillColor(218, 165, 32);
        doc.roundedRect(pageWidth / 2 - 25, yPos + 12, 50, 12, 3, 3, 'F');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(`Grade: ${cert.grade}`, pageWidth / 2, yPos + 20, { align: 'center' });
      }

      // ==== EDUVERSE COMPANIES SEAL ====
      const sealX = 45;
      const sealY = pageHeight - 65;
      const sealRadius = 18;
      
      // Outer seal ring
      doc.setDrawColor(26, 54, 93);
      doc.setLineWidth(2);
      doc.circle(sealX, sealY, sealRadius, 'S');
      doc.setLineWidth(1);
      doc.circle(sealX, sealY, sealRadius - 3, 'S');
      
      // Inner decorative pattern
      doc.setFillColor(26, 54, 93);
      doc.circle(sealX, sealY, sealRadius - 6, 'F');
      
      // Seal text
      doc.setFontSize(5);
      doc.setTextColor(218, 165, 32);
      doc.text('EDUVERSE', sealX, sealY - 2, { align: 'center' });
      doc.text('COMPANIES', sealX, sealY + 2, { align: 'center' });
      doc.setFontSize(4);
      doc.text('OFFICIAL SEAL', sealX, sealY + 6, { align: 'center' });

      // ==== CDP CERTIFIED BADGE ====
      const cdpX = pageWidth - 45;
      const cdpY = pageHeight - 65;
      
      // CDP badge background
      doc.setFillColor(26, 54, 93);
      doc.roundedRect(cdpX - 20, cdpY - 15, 40, 30, 3, 3, 'F');
      
      // CDP text
      doc.setFontSize(12);
      doc.setTextColor(218, 165, 32);
      doc.setFont('helvetica', 'bold');
      doc.text('CDP', cdpX, cdpY - 4, { align: 'center' });
      doc.setFontSize(8);
      doc.text('CERTIFIED', cdpX, cdpY + 3, { align: 'center' });
      
      // Small text
      doc.setFontSize(4);
      doc.setTextColor(200, 200, 200);
      doc.text('The CDP Certification Services', cdpX, cdpY + 9, { align: 'center' });
      doc.text('Eduverse Academy', cdpX, cdpY + 12, { align: 'center' });

      // ==== DIRECTOR SIGNATURE ====
      const sigX = pageWidth / 2;
      const sigY = pageHeight - 55;
      
      // Signature line
      doc.setDrawColor(26, 54, 93);
      doc.setLineWidth(0.5);
      doc.line(sigX - 35, sigY - 5, sigX + 35, sigY - 5);
      
      // Signature (stylized)
      doc.setFontSize(14);
      doc.setTextColor(26, 54, 93);
      doc.setFont('helvetica', 'italic');
      doc.text('Victor K. Mbakus', sigX, sigY - 8, { align: 'center' });
      
      // Director title
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.text('Victor Kambale Mbakus', sigX, sigY, { align: 'center' });
      doc.setFontSize(7);
      doc.text('Director of Certification', sigX, sigY + 4, { align: 'center' });

      // Date of issue
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text('Date of Issue:', 75, pageHeight - 45);
      doc.setFontSize(10);
      doc.setTextColor(26, 54, 93);
      doc.setFont('helvetica', 'bold');
      doc.text(cert.completionDate, 75, pageHeight - 40, { align: 'center' });

      // ==== QR CODE with Eduverse Logo ====
      const qrCodeDataUrl = await generateQRCode(verifyUrl);
      if (qrCodeDataUrl) {
        doc.addImage(qrCodeDataUrl, 'PNG', pageWidth - 75, pageHeight - 85, 28, 28);
        
        // QR label
        doc.setFontSize(6);
        doc.setTextColor(80, 80, 80);
        doc.setFont('helvetica', 'normal');
        doc.text('Scan to verify', pageWidth - 61, pageHeight - 55, { align: 'center' });
        doc.text('Eduverse Academy', pageWidth - 61, pageHeight - 52, { align: 'center' });
      }

      // Credential ID in footer
      doc.setFontSize(7);
      doc.setTextColor(200, 200, 200);
      doc.text(`Credential ID: ${cert.credentialId}`, pageWidth / 2, pageHeight - 18, { align: 'center' });

      // Security footer text
      doc.setFontSize(6);
      doc.setTextColor(150, 150, 150);
      doc.text('This certificate is protected by Eduverse Academy security systems. Unauthorized reproduction is prohibited.', 
        pageWidth / 2, pageHeight - 14, { align: 'center' });

      // === Page 2: Transcript (if available) ===
      if (cert.transcript && cert.transcript.length > 0) {
        doc.addPage();
        
        // Apply same security watermark
        for (let x = 0; x < pageWidth; x += 35) {
          for (let y = 0; y < pageHeight; y += 35) {
            doc.setFontSize(6);
            doc.setTextColor(240, 240, 240);
            doc.text('EDUVERSE ACADEMY', x, y, { angle: 45 });
          }
        }

        // Header
        doc.setFillColor(26, 54, 93);
        doc.rect(0, 0, pageWidth, 30, 'F');
        
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('ACADEMIC TRANSCRIPT', pageWidth / 2, 20, { align: 'center' });

        // Student info
        doc.setFontSize(12);
        doc.setTextColor(26, 54, 93);
        doc.text(`Student: ${displayName}`, 20, 45);
        if (cert.studentId) {
          doc.text(`Student ID: ${cert.studentId}`, 20, 52);
        }
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 20, 45, { align: 'right' });

        // Table (same as before)
        const tableTop = 65;
        doc.setFillColor(240, 240, 240);
        doc.rect(20, tableTop, pageWidth - 40, 10, 'F');
        
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.setFont('helvetica', 'bold');
        doc.text('Course Name', 25, tableTop + 7);
        doc.text('Completion Date', 120, tableTop + 7);
        doc.text('Grade', 170, tableTop + 7);
        doc.text('Credits', 200, tableTop + 7);
        doc.text('Instructor', 230, tableTop + 7);

        doc.setFont('helvetica', 'normal');
        let rowY = tableTop + 18;
        cert.transcript.forEach((entry, index) => {
          if (index % 2 === 0) {
            doc.setFillColor(250, 250, 250);
            doc.rect(20, rowY - 5, pageWidth - 40, 10, 'F');
          }
          doc.setTextColor(80, 80, 80);
          doc.text(entry.courseName.slice(0, 40), 25, rowY);
          doc.text(entry.completionDate, 120, rowY);
          doc.text(entry.grade, 170, rowY);
          doc.text(entry.credits.toString(), 205, rowY);
          doc.text(entry.instructor.slice(0, 20), 230, rowY);
          rowY += 12;
        });

        // QR code on transcript
        if (qrCodeDataUrl) {
          doc.addImage(qrCodeDataUrl, 'PNG', 20, pageHeight - 45, 25, 25);
          doc.setFontSize(7);
          doc.setTextColor(100, 100, 100);
          doc.text('Verify at:', 20, pageHeight - 18);
          doc.text(verifyUrl, 20, pageHeight - 14);
        }

        // Seal and signature on transcript
        doc.setFontSize(8);
        doc.setTextColor(26, 54, 93);
        doc.text('Victor Kambale Mbakus', pageWidth - 50, pageHeight - 25, { align: 'center' });
        doc.setFontSize(6);
        doc.setTextColor(100, 100, 100);
        doc.text('Director of Certification', pageWidth - 50, pageHeight - 21, { align: 'center' });
      }

      // Save PDF with security metadata
      doc.setProperties({
        title: `Eduverse Certificate - ${displayName}`,
        subject: cert.courseName,
        author: 'Eduverse Academy',
        creator: 'Eduverse Certificate System',
        keywords: 'certificate, education, credential'
      });

      doc.save(`Eduverse-Certificate-${cert.credentialId}.pdf`);
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate certificate');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <CopyProtection showWarning={true}>
      <div className="space-y-6">
        {/* Security Scan Animation */}
        {showSecurityScan && (
          <SecurityScanAnimation 
            type={securityScanType}
            onComplete={handleSecurityScanComplete}
          />
        )}

        {/* Identity Verification Modal */}
        {showIdentityVerification && (
          <IdentityVerification 
            onVerified={handleIdentityVerified}
            onClose={() => setShowIdentityVerification(false)}
          />
        )}

        {/* Terms Acceptance Modal */}
        {showTermsModal && (
          <TermsAcceptanceModal 
            isOpen={showTermsModal}
            onAccept={handleTermsAccepted}
            onClose={() => setShowTermsModal(false)}
          />
        )}

        {/* Certificate Selection (for claiming multiple) */}
        {certificates.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-accent" />
                Select Certificates to Claim
              </CardTitle>
              <CardDescription>
                Choose the certificates you want to claim. Price adjusts automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {certificates.map((cert) => (
                <div 
                  key={cert.credentialId}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedCertificates.includes(cert.credentialId) 
                      ? 'border-accent bg-accent/5' 
                      : 'border-border hover:border-accent/50'
                  }`}
                  onClick={() => handleSelectCertificate(cert.credentialId)}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox 
                      checked={selectedCertificates.includes(cert.credentialId)}
                      onCheckedChange={() => handleSelectCertificate(cert.credentialId)}
                    />
                    <div>
                      <p className="font-medium">{cert.courseName}</p>
                      <p className="text-sm text-muted-foreground">
                        Completed: {cert.completionDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewCertificate(cert);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <span className="font-bold text-accent">${basePrice}</span>
                  </div>
                </div>
              ))}
              
              {/* Total and Claim Button */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Total Selected: {selectedCertificates.length}</p>
                  <p className="text-2xl font-bold text-accent">${totalPrice}</p>
                </div>
                <Button 
                  size="lg" 
                  onClick={handleClaimCertificates}
                  disabled={selectedCertificates.length === 0}
                  className="gap-2"
                >
                  <Shield className="w-5 h-5" />
                  Claim {selectedCertificates.length} Certificate{selectedCertificates.length !== 1 ? 's' : ''}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Single Certificate or Preview */}
        {(certificates.length === 1 || previewCertificate) && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="certificate" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Certificate
              </TabsTrigger>
              <TabsTrigger value="transcript" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Transcript
              </TabsTrigger>
            </TabsList>

            <TabsContent value="certificate">
              <CertificatePreview 
                data={previewCertificate || certificates[0]} 
                studentFullName={studentFullName}
                isAdmin={isAdmin}
                isTeacher={isTeacher}
              />
            </TabsContent>

            <TabsContent value="transcript">
              <TranscriptPreview 
                data={previewCertificate || certificates[0]}
                studentFullName={studentFullName}
              />
            </TabsContent>
          </Tabs>
        )}

        {/* Download Actions */}
        {(previewCertificate || certificates.length === 1) && (
          <div className="flex items-center justify-center gap-4 print:hidden">
            {!canDownload && userRole === 'student' && (
              <Alert className="mb-4">
                <Lock className="w-4 h-4" />
                <AlertDescription>
                  You must accept the terms and conditions before downloading.
                </AlertDescription>
              </Alert>
            )}
            
            <Button
              onClick={() => generateSecurePDF(previewCertificate || certificates[0])}
              disabled={generating || (!canDownload && userRole === 'student')}
              className="gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Secure PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download Secure PDF
                </>
              )}
            </Button>
            
            {canDownload && (
              <Button variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            )}
          </div>
        )}

        {/* Admin Controls */}
        {isAdmin && (
          <Card className="border-accent/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                Admin Certificate Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Edit Seal & Signature
                </Button>
                <Button variant="outline" className="gap-2">
                  <Award className="w-4 h-4" />
                  Edit CDP Badge
                </Button>
                <Button variant="outline" className="gap-2">
                  <Eye className="w-4 h-4" />
                  Preview Watermark
                </Button>
                <Button variant="outline" className="gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Edit Template
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </CopyProtection>
  );
}

// Certificate Preview Component
function CertificatePreview({ data, studentFullName, isAdmin, isTeacher }: { 
  data: CertificateData; 
  studentFullName?: string;
  isAdmin?: boolean;
  isTeacher?: boolean;
}) {
  const displayName = studentFullName || data.studentName;
  const verifyUrl = `${window.location.origin}/verify-certificate/${data.credentialId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(verifyUrl)}`;

  return (
    <div
      id="certificate-container"
      className="relative w-full max-w-4xl mx-auto aspect-[1.414] bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg shadow-2xl overflow-hidden print:shadow-none"
      style={{ userSelect: 'none' }}
    >
      {/* Repeating watermark pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Ctext x='40' y='40' font-family='Arial' font-size='8' fill='%23000' text-anchor='middle' transform='rotate(-45 40 40)'%3EEDUVERSE ACADEMY%3C/text%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px'
        }}
      />

      {/* Top banner */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-primary" />
      <div className="absolute top-16 left-0 right-0 h-1 bg-accent" />
      
      {/* Bottom banner */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-primary" />
      <div className="absolute bottom-16 left-0 right-0 h-1 bg-accent" />

      {/* Decorative borders */}
      <div className="absolute inset-3 border-4 border-double border-accent/50 rounded-lg" />
      <div className="absolute inset-5 border-2 border-accent/30 rounded-lg" />
      <div className="absolute inset-6 border border-accent/20 rounded-lg" />

      {/* Corner ornaments */}
      <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-accent" />
      <div className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-accent" />
      <div className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-accent" />
      <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-accent" />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-between p-12 text-center">
        {/* Header */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <Award className="w-7 h-7 text-accent-foreground" />
            </div>
            <span className="text-2xl font-display font-bold text-primary">
              EDUVERSE ACADEMY
            </span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-accent" />
            <p className="text-sm text-muted-foreground tracking-widest uppercase">
              Certificate of Completion
            </p>
            <Shield className="w-4 h-4 text-accent" />
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4 max-w-2xl">
          <p className="text-muted-foreground">This is to certify that</p>
          
          <h1 className="text-4xl font-display font-bold text-primary border-b-2 border-accent pb-2 px-8 inline-block">
            {displayName}
          </h1>
          
          <p className="text-muted-foreground">has successfully completed</p>
          
          <h2 className="text-2xl font-display font-semibold text-foreground">
            {data.courseName}
          </h2>

          {data.grade && (
            <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full">
              <Medal className="w-4 h-4 text-accent" />
              <span className="font-medium">Grade: {data.grade}</span>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Instructed by <span className="font-medium text-foreground">{data.instructorName}</span>
          </p>
        </div>

        {/* Footer with Seal, Signature, and CDP Badge */}
        <div className="w-full flex items-end justify-between mt-4">
          {/* Eduverse Seal */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center bg-primary/5">
              <div className="text-center">
                <p className="text-[8px] font-bold text-primary">EDUVERSE</p>
                <p className="text-[6px] text-primary">COMPANIES</p>
                <p className="text-[5px] text-muted-foreground">OFFICIAL SEAL</p>
              </div>
            </div>
          </div>

          {/* Director Signature */}
          <div className="text-center">
            <div className="w-40 border-b border-primary/30 mb-1" />
            <p className="text-sm font-medium italic text-primary">Victor K. Mbakus</p>
            <p className="text-xs text-muted-foreground">Victor Kambale Mbakus</p>
            <p className="text-xs text-muted-foreground">Director of Certification</p>
            <p className="text-xs text-muted-foreground mt-1">{data.completionDate}</p>
          </div>

          {/* QR Code and CDP Badge */}
          <div className="flex flex-col items-center gap-2">
            <img
              src={qrCodeUrl}
              alt="Verification QR Code"
              className="w-14 h-14 rounded"
            />
            <p className="text-[8px] text-muted-foreground">Scan to verify</p>
            
            {/* CDP Badge */}
            <div className="bg-primary rounded px-3 py-1 mt-1">
              <p className="text-[10px] font-bold text-accent">CDP CERTIFIED</p>
              <p className="text-[6px] text-primary-foreground">The CDP Certification Services</p>
              <p className="text-[6px] text-primary-foreground">Eduverse Academy</p>
            </div>
          </div>
        </div>

        {/* Credential ID */}
        <p className="text-xs text-muted-foreground mt-2">
          Credential ID: {data.credentialId}
        </p>
      </div>

      {/* Example/Watermark overlay for teachers */}
      {isTeacher && !isAdmin && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-6xl font-bold text-red-500/20 rotate-[-30deg]">
            EXAMPLE ONLY
          </div>
        </div>
      )}
    </div>
  );
}

// Transcript Preview Component
function TranscriptPreview({ data, studentFullName }: { data: CertificateData; studentFullName?: string }) {
  const displayName = studentFullName || data.studentName;
  
  return (
    <Card>
      <CardHeader className="bg-primary text-primary-foreground">
        <CardTitle className="text-center">ACADEMIC TRANSCRIPT</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Student</p>
            <p className="font-semibold">{displayName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Generated</p>
            <p className="font-semibold">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {data.transcript && data.transcript.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-2">Course</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-center p-2">Grade</th>
                  <th className="text-center p-2">Credits</th>
                  <th className="text-left p-2">Instructor</th>
                </tr>
              </thead>
              <tbody>
                {data.transcript.map((entry, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                    <td className="p-2">{entry.courseName}</td>
                    <td className="p-2">{entry.completionDate}</td>
                    <td className="p-2 text-center">{entry.grade}</td>
                    <td className="p-2 text-center">{entry.credits}</td>
                    <td className="p-2">{entry.instructor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <GraduationCap className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No transcript entries available</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-end mt-6 pt-6 border-t">
          <div className="text-xs text-muted-foreground">
            <p>Verified by Eduverse Academy</p>
            <p>Credential ID: {data.credentialId}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium italic">Victor K. Mbakus</p>
            <p className="text-xs text-muted-foreground">Director of Certification</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SecureCertificateSystem;
