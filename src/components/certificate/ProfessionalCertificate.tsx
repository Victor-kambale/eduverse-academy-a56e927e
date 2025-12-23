import { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { 
  Download, 
  Share2, 
  Printer, 
  Shield, 
  Award, 
  CheckCircle,
  Lock,
  Loader2,
  GraduationCap,
  Building2,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export interface CertificateTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  color: string;
  badgeColor: string;
}

export const certificateTiers: CertificateTier[] = [
  {
    id: 'basic',
    name: 'Basic Certificate',
    price: 29.99,
    features: ['Digital PDF', 'Basic Watermark', 'Credential ID'],
    color: 'from-slate-400 to-slate-600',
    badgeColor: 'bg-slate-500',
  },
  {
    id: 'verified',
    name: 'Verified Certificate',
    price: 49.99,
    features: ['Digital PDF', 'QR Verification', 'Director Signature', 'Seal'],
    color: 'from-blue-500 to-blue-700',
    badgeColor: 'bg-blue-600',
  },
  {
    id: 'professional',
    name: 'Professional Certificate',
    price: 89.99,
    features: ['Digital PDF', 'Full Verification', 'Director + Dean Signatures', 'Official Seal', 'Blockchain Verified', 'LinkedIn Badge'],
    color: 'from-amber-500 to-amber-700',
    badgeColor: 'bg-amber-600',
  },
  {
    id: 'executive',
    name: 'Executive Certificate',
    price: 149.99,
    features: ['Premium PDF', 'Full Verification Suite', 'All Signatures', 'Holographic Seal', 'Blockchain + NFT', 'LinkedIn + Resume Badge', 'Physical Copy Option'],
    color: 'from-purple-600 to-purple-900',
    badgeColor: 'bg-purple-700',
  },
];

export interface ProfessionalCertificateData {
  studentName: string;
  courseName: string;
  courseLevel: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  completionDate: string;
  credentialId: string;
  institutionName?: string;
  instructorName?: string;
  directorName?: string;
  deanName?: string;
  grade?: string;
  hoursCompleted?: number;
  tier: CertificateTier;
  isVerified?: boolean;
  universityVerified?: boolean;
  universityName?: string;
  universityLogo?: string;
}

interface ProfessionalCertificateProps {
  data: ProfessionalCertificateData;
  onDownload?: () => void;
  showDirectorSignature?: boolean; // Admin controlled
  showSeal?: boolean; // Admin controlled
}

export function ProfessionalCertificate({ 
  data, 
  onDownload,
  showDirectorSignature = true,
  showSeal = true
}: ProfessionalCertificateProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'certificate' | 'transcript'>('certificate');
  const certificateRef = useRef<HTMLDivElement>(null);

  const generateQRCode = async (text: string): Promise<string> => {
    try {
      return await QRCode.toDataURL(text, {
        width: 100,
        margin: 1,
        color: { dark: '#1e3a5f', light: '#ffffff' }
      });
    } catch (error) {
      console.error('QR generation failed:', error);
      return '';
    }
  };

  const generateCertificatePDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const width = doc.internal.pageSize.getWidth();
      const height = doc.internal.pageSize.getHeight();

      // Background gradient effect
      doc.setFillColor(250, 248, 245);
      doc.rect(0, 0, width, height, 'F');

      // Ornate border
      doc.setDrawColor(30, 58, 95);
      doc.setLineWidth(2);
      doc.rect(10, 10, width - 20, height - 20);
      doc.setLineWidth(0.5);
      doc.rect(15, 15, width - 30, height - 30);

      // Corner ornaments
      const drawCornerOrnament = (x: number, y: number, mirror: boolean = false) => {
        doc.setDrawColor(184, 134, 11);
        doc.setLineWidth(0.3);
        const m = mirror ? -1 : 1;
        doc.line(x, y, x + (20 * m), y);
        doc.line(x, y, x, y + 20);
        doc.line(x + (5 * m), y + 5, x + (15 * m), y + 5);
        doc.line(x + (5 * m), y + 5, x + (5 * m), y + 15);
      };
      drawCornerOrnament(15, 15);
      drawCornerOrnament(width - 15, 15, true);
      drawCornerOrnament(15, height - 15);
      drawCornerOrnament(width - 15, height - 15, true);

      // Large diagonal watermark (SAMPLE for unpurchased)
      if (!data.isVerified) {
        doc.setFontSize(100);
        doc.setTextColor(200, 200, 200);
        doc.saveGraphicsState();
        doc.text('SAMPLE', width / 2, height / 2, { 
          angle: -45, 
          align: 'center' 
        });
        doc.restoreGraphicsState();
      }

      // Eduverse Academy logo watermark in center
      doc.setFontSize(14);
      doc.setTextColor(220, 220, 220);
      doc.text('✦ EDUVERSE ACADEMY ✦', width / 2, height / 2, { align: 'center' });

      // Header with tier badge
      doc.setFontSize(12);
      doc.setTextColor(184, 134, 11);
      doc.text(data.tier.name.toUpperCase(), width / 2, 30, { align: 'center' });

      // Institution name
      doc.setFontSize(28);
      doc.setTextColor(30, 58, 95);
      doc.setFont('helvetica', 'bold');
      doc.text(data.institutionName || 'EDUVERSE ACADEMY', width / 2, 45, { align: 'center' });

      // Certificate title
      doc.setFontSize(20);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text('CERTIFICATE OF COMPLETION', width / 2, 58, { align: 'center' });

      // Decorative line
      doc.setDrawColor(184, 134, 11);
      doc.setLineWidth(0.5);
      doc.line(80, 65, width - 80, 65);

      // "This is to certify that"
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text('This is to certify that', width / 2, 78, { align: 'center' });

      // Student name
      doc.setFontSize(32);
      doc.setTextColor(30, 58, 95);
      doc.setFont('helvetica', 'bold');
      doc.text(data.studentName, width / 2, 95, { align: 'center' });

      // Course completion text
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.text('has successfully completed the course', width / 2, 108, { align: 'center' });

      // Course name
      doc.setFontSize(18);
      doc.setTextColor(30, 58, 95);
      doc.setFont('helvetica', 'bold');
      doc.text(data.courseName, width / 2, 122, { align: 'center' });

      // Course details
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      const details = `${data.courseLevel.charAt(0).toUpperCase() + data.courseLevel.slice(1)} Level • ${data.hoursCompleted || 40} Hours • Grade: ${data.grade || 'A'}`;
      doc.text(details, width / 2, 132, { align: 'center' });

      // Signatures section
      const sigY = 155;
      
      if (showDirectorSignature && data.tier.id !== 'basic') {
        // Director signature
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.line(50, sigY, 100, sigY);
        doc.text(data.directorName || 'Dr. James Wilson', 75, sigY + 5, { align: 'center' });
        doc.text('Director', 75, sigY + 10, { align: 'center' });

        // Instructor signature
        doc.line(width / 2 - 25, sigY, width / 2 + 25, sigY);
        doc.text(data.instructorName || 'Course Instructor', width / 2, sigY + 5, { align: 'center' });
        doc.text('Instructor', width / 2, sigY + 10, { align: 'center' });

        // Dean signature (professional+)
        if (data.tier.id === 'professional' || data.tier.id === 'executive') {
          doc.line(width - 100, sigY, width - 50, sigY);
          doc.text(data.deanName || 'Prof. Sarah Chen', width - 75, sigY + 5, { align: 'center' });
          doc.text('Dean of Studies', width - 75, sigY + 10, { align: 'center' });
        }
      }

      // Official seal
      if (showSeal && data.tier.id !== 'basic') {
        doc.setDrawColor(184, 134, 11);
        doc.setLineWidth(1);
        doc.circle(width / 2, 150, 15);
        doc.circle(width / 2, 150, 12);
        doc.setFontSize(6);
        doc.setTextColor(184, 134, 11);
        doc.text('OFFICIAL', width / 2, 148, { align: 'center' });
        doc.text('SEAL', width / 2, 152, { align: 'center' });
      }

      // QR Code and credentials
      const qrData = `https://eduverse.academy/verify/${data.credentialId}`;
      const qrCode = await generateQRCode(qrData);
      if (qrCode) {
        doc.addImage(qrCode, 'PNG', 20, height - 45, 25, 25);
      }

      // Credential info
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Credential ID: ${data.credentialId}`, 50, height - 35);
      doc.text(`Issued: ${new Date(data.completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 50, height - 30);
      doc.text(`Verify at: eduverse.academy/verify`, 50, height - 25);

      // University verification badge
      if (data.universityVerified && data.universityName) {
        doc.setFillColor(30, 58, 95);
        doc.roundedRect(width - 80, height - 45, 60, 20, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.text('UNIVERSITY VERIFIED', width - 50, height - 38, { align: 'center' });
        doc.text(data.universityName, width - 50, height - 32, { align: 'center' });
      }

      // Save the PDF
      doc.save(`Certificate_${data.studentName.replace(/\s+/g, '_')}_${data.courseName.replace(/\s+/g, '_')}.pdf`);
      
      toast.success('Certificate downloaded successfully!');
      onDownload?.();
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate certificate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTranscriptPDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const width = doc.internal.pageSize.getWidth();
      const height = doc.internal.pageSize.getHeight();

      // Header
      doc.setFillColor(30, 58, 95);
      doc.rect(0, 0, width, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('ACADEMIC TRANSCRIPT', width / 2, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(data.institutionName || 'Eduverse Academy', width / 2, 30, { align: 'center' });

      // Student info
      doc.setTextColor(30, 58, 95);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Student Information', 20, 55);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(`Name: ${data.studentName}`, 20, 65);
      doc.text(`Credential ID: ${data.credentialId}`, 20, 72);
      doc.text(`Issue Date: ${new Date(data.completionDate).toLocaleDateString()}`, 20, 79);

      // Course details
      doc.setTextColor(30, 58, 95);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Course Details', 20, 95);

      // Table header
      doc.setFillColor(240, 240, 240);
      doc.rect(20, 100, width - 40, 10, 'F');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text('Course Title', 25, 107);
      doc.text('Level', 100, 107);
      doc.text('Hours', 130, 107);
      doc.text('Grade', 155, 107);
      doc.text('Status', 175, 107);

      // Table row
      doc.setFontSize(10);
      doc.text(data.courseName, 25, 117);
      doc.text(data.courseLevel.charAt(0).toUpperCase() + data.courseLevel.slice(1), 100, 117);
      doc.text(`${data.hoursCompleted || 40}`, 130, 117);
      doc.text(data.grade || 'A', 155, 117);
      doc.setTextColor(34, 139, 34);
      doc.text('Completed', 175, 117);

      // Summary
      doc.setTextColor(30, 58, 95);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', 20, 140);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(`Total Hours Completed: ${data.hoursCompleted || 40}`, 20, 150);
      doc.text(`Certificate Tier: ${data.tier.name}`, 20, 157);
      doc.text(`Verification Status: ${data.isVerified ? 'Verified' : 'Pending'}`, 20, 164);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('This transcript is an official document of Eduverse Academy.', width / 2, height - 20, { align: 'center' });
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, width / 2, height - 15, { align: 'center' });

      doc.save(`Transcript_${data.studentName.replace(/\s+/g, '_')}.pdf`);
      toast.success('Transcript downloaded successfully!');
    } catch (error) {
      console.error('Transcript generation failed:', error);
      toast.error('Failed to generate transcript');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/verify/${data.credentialId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data.tier.name} - ${data.courseName}`,
          text: `I earned a ${data.tier.name} in ${data.courseName} from Eduverse Academy!`,
          url: shareUrl,
        });
      } catch (error) {
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    }
  };

  const getLevelBadge = () => {
    const colors = {
      beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      intermediate: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      advanced: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      professional: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    };
    return colors[data.courseLevel];
  };

  return (
    <div className="space-y-6">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={generateCertificatePDF} disabled={isGenerating} className="gap-2">
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download Certificate
        </Button>
        <Button onClick={generateTranscriptPDF} disabled={isGenerating} variant="outline" className="gap-2">
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download Transcript
        </Button>
        <Button onClick={handleShare} variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <Button onClick={() => window.print()} variant="outline" className="gap-2">
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>

      {/* Tabs for Certificate / Transcript preview */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'certificate' | 'transcript')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="certificate" className="gap-2">
            <Award className="h-4 w-4" />
            Certificate
          </TabsTrigger>
          <TabsTrigger value="transcript" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Transcript
          </TabsTrigger>
        </TabsList>

        <TabsContent value="certificate">
          {/* Certificate Preview */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div 
                ref={certificateRef}
                className="relative aspect-[1.414/1] bg-gradient-to-br from-amber-50 via-white to-amber-50 p-8 print:p-4 no-select protected-content"
              >
                {/* SAMPLE Watermark for unverified */}
                {!data.isVerified && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <span className="text-[120px] font-bold text-gray-200/60 -rotate-45 select-none">
                      SAMPLE
                    </span>
                  </div>
                )}

                {/* Eduverse Logo Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-5">
                  <div className="text-4xl font-bold text-gray-100/40 flex items-center gap-2">
                    <Star className="h-12 w-12" />
                    EDUVERSE ACADEMY
                    <Star className="h-12 w-12" />
                  </div>
                </div>

                {/* Ornate border */}
                <div className="absolute inset-4 border-4 border-primary/20 pointer-events-none" />
                <div className="absolute inset-6 border border-primary/10 pointer-events-none" />

                {/* Tier badge */}
                <div className="absolute top-6 right-6">
                  <Badge className={`${data.tier.badgeColor} text-white px-3 py-1`}>
                    {data.tier.name}
                  </Badge>
                </div>

                {/* Content */}
                <div className="relative z-20 flex flex-col items-center justify-center h-full text-center space-y-4">
                  {/* Institution */}
                  <div className="flex items-center gap-2 text-primary">
                    <Building2 className="h-6 w-6" />
                    <h2 className="text-2xl font-bold tracking-wide">
                      {data.institutionName || 'EDUVERSE ACADEMY'}
                    </h2>
                  </div>

                  {/* Title */}
                  <h1 className="text-lg text-muted-foreground tracking-widest">
                    CERTIFICATE OF COMPLETION
                  </h1>

                  {/* Decorative line */}
                  <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

                  {/* Certify text */}
                  <p className="text-sm text-muted-foreground">This is to certify that</p>

                  {/* Student name */}
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">
                    {data.studentName}
                  </h2>

                  {/* Completion text */}
                  <p className="text-sm text-muted-foreground">has successfully completed the course</p>

                  {/* Course name */}
                  <h3 className="text-xl md:text-2xl font-bold text-foreground px-4">
                    {data.courseName}
                  </h3>

                  {/* Level badge */}
                  <Badge className={getLevelBadge()}>
                    {data.courseLevel.charAt(0).toUpperCase() + data.courseLevel.slice(1)} Level
                  </Badge>

                  {/* Details */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{data.hoursCompleted || 40} Hours</span>
                    <span>•</span>
                    <span>Grade: {data.grade || 'A'}</span>
                    <span>•</span>
                    <span>{new Date(data.completionDate).toLocaleDateString()}</span>
                  </div>

                  {/* Signatures */}
                  {showDirectorSignature && data.tier.id !== 'basic' && (
                    <div className="flex justify-around w-full pt-4 mt-4 border-t border-dashed">
                      <div className="text-center">
                        <div className="w-24 h-px bg-foreground/30 mx-auto mb-1" />
                        <p className="text-xs font-medium">{data.directorName || 'Dr. James Wilson'}</p>
                        <p className="text-xs text-muted-foreground">Director</p>
                      </div>
                      {(data.tier.id === 'professional' || data.tier.id === 'executive') && (
                        <div className="text-center">
                          <div className="w-24 h-px bg-foreground/30 mx-auto mb-1" />
                          <p className="text-xs font-medium">{data.deanName || 'Prof. Sarah Chen'}</p>
                          <p className="text-xs text-muted-foreground">Dean of Studies</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Seal */}
                  {showSeal && data.tier.id !== 'basic' && (
                    <div className="absolute bottom-12 right-12">
                      <div className="w-16 h-16 rounded-full border-2 border-amber-500 flex items-center justify-center bg-amber-50">
                        <div className="text-center">
                          <Shield className="h-4 w-4 text-amber-600 mx-auto" />
                          <span className="text-[8px] text-amber-700 font-bold">OFFICIAL</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Credential ID */}
                  <div className="absolute bottom-4 left-4 text-left text-xs text-muted-foreground">
                    <p className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Credential ID: {data.credentialId}
                    </p>
                  </div>

                  {/* Verification badges */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    {data.isVerified && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                    {data.universityVerified && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
                        <Building2 className="h-3 w-3" />
                        University Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transcript">
          {/* Transcript Preview */}
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="bg-primary text-primary-foreground p-6 -m-6 mb-6 text-center">
                <h2 className="text-2xl font-bold">ACADEMIC TRANSCRIPT</h2>
                <p className="text-sm opacity-80">{data.institutionName || 'Eduverse Academy'}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">Student Information</h3>
                  <div className="space-y-1">
                    <p><span className="text-muted-foreground">Name:</span> {data.studentName}</p>
                    <p><span className="text-muted-foreground">Credential ID:</span> {data.credentialId}</p>
                    <p><span className="text-muted-foreground">Issue Date:</span> {new Date(data.completionDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">Certificate Details</h3>
                  <div className="space-y-1">
                    <p><span className="text-muted-foreground">Tier:</span> {data.tier.name}</p>
                    <p><span className="text-muted-foreground">Status:</span> {data.isVerified ? 'Verified' : 'Pending Verification'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-3">Course Record</h3>
                <div className="border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-5 gap-4 bg-muted p-3 text-sm font-medium">
                    <span>Course Title</span>
                    <span>Level</span>
                    <span>Hours</span>
                    <span>Grade</span>
                    <span>Status</span>
                  </div>
                  <div className="grid grid-cols-5 gap-4 p-3 text-sm border-t">
                    <span className="font-medium">{data.courseName}</span>
                    <span className="capitalize">{data.courseLevel}</span>
                    <span>{data.hoursCompleted || 40}</span>
                    <span className="font-semibold text-green-600">{data.grade || 'A'}</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 w-fit">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .protected-content, .protected-content * { visibility: visible; }
          .protected-content { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
