import { useState, useRef } from 'react';
import { 
  Award, 
  Download, 
  Share2, 
  Printer,
  QrCode,
  Shield,
  GraduationCap,
  Medal,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { toast } from 'sonner';

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
}

interface EnhancedCertificateGeneratorProps {
  data: CertificateData;
  onDownload?: () => void;
}

export function EnhancedCertificateGenerator({ data, onDownload }: EnhancedCertificateGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('certificate');
  const certificateRef = useRef<HTMLDivElement>(null);

  const verifyUrl = `${window.location.origin}/verify-certificate/${data.credentialId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(verifyUrl)}`;

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

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // === Page 1: Certificate ===
      
      // Watermark pattern
      doc.setFillColor(248, 250, 252);
      for (let x = 0; x < pageWidth; x += 40) {
        for (let y = 0; y < pageHeight; y += 40) {
          doc.setFontSize(8);
          doc.setTextColor(230, 230, 230);
          doc.text('EDUVERSE', x, y, { angle: 45 });
        }
      }

      // Background header/footer bands
      doc.setFillColor(26, 54, 93);
      doc.rect(0, 0, pageWidth, 25, 'F');
      doc.rect(0, pageHeight - 25, pageWidth, 25, 'F');

      // Decorative gold borders
      doc.setDrawColor(218, 165, 32);
      doc.setLineWidth(3);
      doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
      doc.setLineWidth(1);
      doc.rect(12, 12, pageWidth - 24, pageHeight - 24);
      doc.setLineWidth(0.5);
      doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

      // Corner ornaments
      const ornamentSize = 20;
      doc.setLineWidth(1);
      // Top-left
      doc.line(8, 28, 28, 8);
      doc.line(8, 35, 35, 8);
      // Top-right
      doc.line(pageWidth - 8, 28, pageWidth - 28, 8);
      doc.line(pageWidth - 8, 35, pageWidth - 35, 8);
      // Bottom-left
      doc.line(8, pageHeight - 28, 28, pageHeight - 8);
      doc.line(8, pageHeight - 35, 35, pageHeight - 8);
      // Bottom-right
      doc.line(pageWidth - 8, pageHeight - 28, pageWidth - 28, pageHeight - 8);
      doc.line(pageWidth - 8, pageHeight - 35, pageWidth - 35, pageHeight - 8);

      // Institution header
      doc.setFontSize(20);
      doc.setTextColor(218, 165, 32);
      doc.setFont('helvetica', 'bold');
      doc.text(data.institutionName || 'EDUVERSE', pageWidth / 2, 18, { align: 'center' });

      // Certificate title
      doc.setFontSize(42);
      doc.setTextColor(26, 54, 93);
      doc.text('CERTIFICATE', pageWidth / 2, 50, { align: 'center' });
      
      doc.setFontSize(20);
      doc.setTextColor(100, 100, 100);
      doc.text('OF COMPLETION', pageWidth / 2, 62, { align: 'center' });

      // Decorative line under title
      doc.setDrawColor(218, 165, 32);
      doc.setLineWidth(1.5);
      doc.line(pageWidth / 2 - 50, 68, pageWidth / 2 + 50, 68);

      // This certifies text
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.text('This is to certify that', pageWidth / 2, 82, { align: 'center' });

      // Student name
      doc.setFontSize(32);
      doc.setTextColor(26, 54, 93);
      doc.setFont('helvetica', 'bold');
      doc.text(data.studentName, pageWidth / 2, 98, { align: 'center' });

      // Decorative line under name
      const nameWidth = doc.getTextWidth(data.studentName);
      doc.setDrawColor(218, 165, 32);
      doc.setLineWidth(0.75);
      doc.line(pageWidth / 2 - nameWidth / 2 - 15, 102, pageWidth / 2 + nameWidth / 2 + 15, 102);

      // Has successfully completed
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.text('has successfully completed the course', pageWidth / 2, 115, { align: 'center' });

      // Course name
      doc.setFontSize(24);
      doc.setTextColor(26, 54, 93);
      doc.setFont('helvetica', 'bold');
      const maxTitleWidth = pageWidth - 80;
      const splitTitle = doc.splitTextToSize(data.courseName, maxTitleWidth);
      let yPos = 130;
      splitTitle.forEach((line: string) => {
        doc.text(line, pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;
      });

      // Course details
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      const details = [];
      if (data.instructorName) details.push(`Instructor: ${data.instructorName}`);
      if (data.courseDuration) details.push(`Duration: ${data.courseDuration}`);
      if (data.cpdHours) details.push(`${data.cpdHours} CPD Hours`);
      if (details.length > 0) {
        doc.text(details.join('  •  '), pageWidth / 2, yPos + 8, { align: 'center' });
      }

      // Grade badge
      if (data.grade) {
        doc.setFillColor(218, 165, 32);
        doc.roundedRect(pageWidth / 2 - 25, yPos + 15, 50, 12, 3, 3, 'F');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(`Grade: ${data.grade}`, pageWidth / 2, yPos + 23, { align: 'center' });
      }

      // Skills section
      if (data.skills && data.skills.length > 0) {
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.setFont('helvetica', 'normal');
        doc.text('Skills Acquired:', pageWidth / 2, yPos + 38, { align: 'center' });
        doc.text(data.skills.slice(0, 4).join(' • '), pageWidth / 2, yPos + 45, { align: 'center' });
      }

      // Footer section
      const footerY = pageHeight - 45;

      // Date of issue
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.text('Date of Issue', 55, footerY);
      doc.setLineWidth(0.3);
      doc.line(35, footerY - 8, 75, footerY - 8);
      doc.setFontSize(12);
      doc.setTextColor(26, 54, 93);
      doc.setFont('helvetica', 'bold');
      doc.text(data.completionDate, 55, footerY - 12, { align: 'center' });

      // Signature
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.text('Authorized Signature', pageWidth / 2, footerY);
      doc.line(pageWidth / 2 - 30, footerY - 8, pageWidth / 2 + 30, footerY - 8);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(12);
      doc.text(data.instructorName || 'EduVerse Team', pageWidth / 2, footerY - 12, { align: 'center' });

      // QR Code
      const qrCodeDataUrl = await generateQRCode(verifyUrl);
      if (qrCodeDataUrl) {
        doc.addImage(qrCodeDataUrl, 'PNG', pageWidth - 55, footerY - 35, 30, 30);
        doc.setFontSize(7);
        doc.setTextColor(80, 80, 80);
        doc.text('Scan to verify', pageWidth - 40, footerY + 2, { align: 'center' });
      }

      // Credential ID
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text(`Credential ID: ${data.credentialId}`, pageWidth / 2, pageHeight - 18, { align: 'center' });

      // Security watermark text in header band
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('VERIFIED CREDENTIAL', pageWidth / 2, pageHeight - 12, { align: 'center' });

      // === Page 2: Transcript (if available) ===
      if (data.transcript && data.transcript.length > 0) {
        doc.addPage();
        
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
        doc.text(`Student: ${data.studentName}`, 20, 45);
        if (data.studentId) {
          doc.text(`Student ID: ${data.studentId}`, 20, 52);
        }
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 20, 45, { align: 'right' });

        // Table headers
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

        // Table rows
        doc.setFont('helvetica', 'normal');
        let rowY = tableTop + 18;
        data.transcript.forEach((entry, index) => {
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

        // Total credits
        doc.setFont('helvetica', 'bold');
        doc.text(
          `Total Credits: ${data.transcript.reduce((sum, e) => sum + e.credits, 0)}`,
          pageWidth - 25,
          rowY + 10,
          { align: 'right' }
        );

        // QR code on transcript
        if (qrCodeDataUrl) {
          doc.addImage(qrCodeDataUrl, 'PNG', 20, pageHeight - 45, 25, 25);
          doc.setFontSize(7);
          doc.setTextColor(100, 100, 100);
          doc.text('Verify at:', 20, pageHeight - 18);
          doc.text(verifyUrl, 20, pageHeight - 14);
        }

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          'This transcript is an official record of academic achievement and can be verified online.',
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Save PDF
      doc.save(`EduVerse-Certificate-${data.credentialId}.pdf`);
      toast.success('Certificate downloaded successfully!');
      onDownload?.();
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate certificate');
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data.studentName}'s Certificate - ${data.courseName}`,
          text: `I just completed "${data.courseName}" on EduVerse!`,
          url: verifyUrl
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(verifyUrl);
          toast.success('Certificate link copied to clipboard!');
        }
      }
    } else {
      await navigator.clipboard.writeText(verifyUrl);
      toast.success('Certificate link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
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
          {/* Certificate Preview */}
          <div
            ref={certificateRef}
            id="certificate-container"
            className="relative w-full max-w-4xl mx-auto aspect-[1.414] bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg shadow-2xl overflow-hidden print:shadow-none"
          >
            {/* Repeating watermark pattern */}
            <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ctext x='50' y='50' font-family='Arial' font-size='10' fill='%23000' text-anchor='middle' transform='rotate(-45 50 50)'%3EEDUVERSE%3C/text%3E%3C/svg%3E")`,
                backgroundSize: '100px 100px'
              }}
            />

            {/* Top banner */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-primary" />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-primary" />

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
                    {data.institutionName || 'EduVerse'}
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
              <div className="space-y-6 max-w-2xl">
                <p className="text-muted-foreground">This is to certify that</p>
                
                <h1 className="text-4xl font-display font-bold text-primary border-b-2 border-accent pb-2 px-8 inline-block">
                  {data.studentName}
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

                {data.skills && data.skills.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {data.skills.slice(0, 4).map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  Instructed by <span className="font-medium text-foreground">{data.instructorName}</span>
                  {data.courseDuration && <> • {data.courseDuration}</>}
                  {data.cpdHours && <> • {data.cpdHours} CPD Hours</>}
                </p>
              </div>

              {/* Footer */}
              <div className="w-full flex items-end justify-between mb-4">
                {/* Signature Area */}
                <div className="text-left">
                  <div className="w-40 border-b border-primary/30 mb-1" />
                  <p className="text-xs text-muted-foreground">Instructor Signature</p>
                  <p className="text-sm font-medium">{data.instructorName}</p>
                </div>

                {/* Date and QR */}
                <div className="flex items-end gap-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Date of Completion</p>
                    <p className="font-medium">{data.completionDate}</p>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center">
                    <div className="p-1 bg-white rounded shadow-sm">
                      <img
                        src={qrCodeUrl}
                        alt="Verification QR Code"
                        className="w-16 h-16 rounded"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <QrCode className="w-3 h-3" />
                      Scan to verify
                    </p>
                  </div>
                </div>

                {/* Certificate ID */}
                <div className="text-right">
                  <div className="w-40 border-b border-primary/30 mb-1" />
                  <p className="text-xs text-muted-foreground">Platform Signature</p>
                  <p className="text-xs text-muted-foreground mt-2 font-mono">
                    ID: {data.credentialId}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="transcript">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Academic Transcript
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.transcript && data.transcript.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Course</th>
                        <th className="text-left p-3 font-semibold">Date</th>
                        <th className="text-center p-3 font-semibold">Grade</th>
                        <th className="text-center p-3 font-semibold">Credits</th>
                        <th className="text-left p-3 font-semibold">Instructor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.transcript.map((entry, i) => (
                        <tr key={i} className="border-b hover:bg-muted/50">
                          <td className="p-3">{entry.courseName}</td>
                          <td className="p-3 text-muted-foreground">{entry.completionDate}</td>
                          <td className="p-3 text-center">
                            <Badge variant="secondary">{entry.grade}</Badge>
                          </td>
                          <td className="p-3 text-center">{entry.credits}</td>
                          <td className="p-3 text-muted-foreground">{entry.instructor}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/30">
                        <td colSpan={3} className="p-3 font-semibold">Total</td>
                        <td className="p-3 text-center font-semibold">
                          {data.transcript.reduce((sum, e) => sum + e.credits, 0)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No transcript data available</p>
                  <p className="text-sm">Complete more courses to build your transcript</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 print:hidden">
        <Button onClick={generatePDF} disabled={generating} className="gap-2">
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download PDF
            </>
          )}
        </Button>
        <Button variant="outline" onClick={handleShare} className="gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
        <Button variant="outline" onClick={handlePrint} className="gap-2">
          <Printer className="w-4 h-4" />
          Print
        </Button>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #certificate-container, #certificate-container * {
            visibility: visible;
          }
          #certificate-container {
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