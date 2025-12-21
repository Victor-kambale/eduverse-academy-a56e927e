import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

interface CertificateData {
  studentName: string;
  courseName: string;
  issueDate: string;
  credentialId: string;
  instructorName?: string;
  courseDuration?: string;
}

interface PDFCertificateGeneratorProps {
  data: CertificateData;
  onDownload?: () => void;
}

export function PDFCertificateGenerator({ data, onDownload }: PDFCertificateGeneratorProps) {
  const [generating, setGenerating] = useState(false);

  const generateQRCode = async (text: string): Promise<string> => {
    try {
      return await QRCode.toDataURL(text, {
        width: 100,
        margin: 1,
        color: {
          dark: '#1a365d',
          light: '#ffffff'
        }
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

      // Background gradient effect with color blocks
      doc.setFillColor(26, 54, 93); // Deep blue
      doc.rect(0, 0, pageWidth, 20, 'F');
      doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');

      // Decorative border
      doc.setDrawColor(218, 165, 32); // Gold color
      doc.setLineWidth(2);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
      
      // Inner border
      doc.setLineWidth(0.5);
      doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

      // Corner decorations
      const cornerSize = 15;
      doc.setLineWidth(1);
      // Top left
      doc.line(10, 25, 25, 10);
      // Top right
      doc.line(pageWidth - 10, 25, pageWidth - 25, 10);
      // Bottom left
      doc.line(10, pageHeight - 25, 25, pageHeight - 10);
      // Bottom right
      doc.line(pageWidth - 10, pageHeight - 25, pageWidth - 25, pageHeight - 10);

      // Logo placeholder / Header text
      doc.setFontSize(16);
      doc.setTextColor(218, 165, 32);
      doc.setFont('helvetica', 'bold');
      doc.text('EDUVERSE', pageWidth / 2, 35, { align: 'center' });

      // Certificate title
      doc.setFontSize(36);
      doc.setTextColor(26, 54, 93);
      doc.text('CERTIFICATE', pageWidth / 2, 55, { align: 'center' });
      
      doc.setFontSize(18);
      doc.setTextColor(100, 100, 100);
      doc.text('OF COMPLETION', pageWidth / 2, 65, { align: 'center' });

      // Decorative line
      doc.setDrawColor(218, 165, 32);
      doc.setLineWidth(1);
      doc.line(pageWidth / 2 - 40, 72, pageWidth / 2 + 40, 72);

      // This is to certify text
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.text('This is to certify that', pageWidth / 2, 85, { align: 'center' });

      // Student name
      doc.setFontSize(28);
      doc.setTextColor(26, 54, 93);
      doc.setFont('helvetica', 'bold');
      doc.text(data.studentName, pageWidth / 2, 100, { align: 'center' });

      // Underline for name
      const nameWidth = doc.getTextWidth(data.studentName);
      doc.setDrawColor(218, 165, 32);
      doc.setLineWidth(0.5);
      doc.line(pageWidth / 2 - nameWidth / 2 - 10, 103, pageWidth / 2 + nameWidth / 2 + 10, 103);

      // Has successfully completed text
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.text('has successfully completed the course', pageWidth / 2, 115, { align: 'center' });

      // Course name
      doc.setFontSize(20);
      doc.setTextColor(26, 54, 93);
      doc.setFont('helvetica', 'bold');
      
      // Handle long course names
      const maxWidth = pageWidth - 80;
      const splitTitle = doc.splitTextToSize(data.courseName, maxWidth);
      let yPosition = 128;
      splitTitle.forEach((line: string) => {
        doc.text(line, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 8;
      });

      // Course details
      if (data.instructorName || data.courseDuration) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'normal');
        const details = [];
        if (data.instructorName) details.push(`Instructor: ${data.instructorName}`);
        if (data.courseDuration) details.push(`Duration: ${data.courseDuration}`);
        doc.text(details.join('  |  '), pageWidth / 2, yPosition + 5, { align: 'center' });
      }

      // Date and signature section
      const bottomY = pageHeight - 45;

      // Date
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text('Date of Issue', 60, bottomY);
      doc.setLineWidth(0.3);
      doc.line(40, bottomY - 8, 80, bottomY - 8);
      doc.setFontSize(12);
      doc.setTextColor(26, 54, 93);
      doc.text(data.issueDate, 60, bottomY - 12, { align: 'center' });

      // Signature placeholder
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text('Authorized Signature', pageWidth / 2, bottomY);
      doc.line(pageWidth / 2 - 30, bottomY - 8, pageWidth / 2 + 30, bottomY - 8);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(12);
      doc.text('EduVerse Team', pageWidth / 2, bottomY - 12, { align: 'center' });

      // Credential ID
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Credential ID: ${data.credentialId}`, pageWidth / 2, pageHeight - 25, { align: 'center' });

      // QR Code
      const verifyUrl = `${window.location.origin}/verify-certificate/${data.credentialId}`;
      const qrCodeDataUrl = await generateQRCode(verifyUrl);
      
      if (qrCodeDataUrl) {
        doc.addImage(qrCodeDataUrl, 'PNG', pageWidth - 55, bottomY - 30, 25, 25);
        doc.setFontSize(7);
        doc.text('Scan to verify', pageWidth - 42.5, bottomY + 2, { align: 'center' });
      }

      // Download
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
    const verifyUrl = `${window.location.origin}/verify-certificate/${data.credentialId}`;
    
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

  return (
    <div className="flex gap-3">
      <Button
        onClick={generatePDF}
        disabled={generating}
        className="gap-2"
      >
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
    </div>
  );
}
