import { useRef } from 'react';
import { Award } from 'lucide-react';
import { PDFCertificateGenerator } from './PDFCertificateGenerator';

interface CertificateData {
  studentName: string;
  courseName: string;
  instructorName: string;
  completionDate: string;
  credentialId: string;
  grade?: string;
  institutionName?: string;
  courseDuration?: string;
}

interface CertificateGeneratorProps {
  data: CertificateData;
  onDownload?: () => void;
}

export const CertificateGenerator = ({ data, onDownload }: CertificateGeneratorProps) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const generateQRCodeUrl = (credentialId: string) => {
    const verifyUrl = `${window.location.origin}/verify-certificate/${credentialId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(verifyUrl)}`;
  };

  return (
    <div className="space-y-6">
      {/* Certificate Preview */}
      <div
        ref={certificateRef}
        id="certificate-container"
        className="relative w-full max-w-4xl mx-auto aspect-[1.414] bg-white rounded-lg shadow-2xl overflow-hidden print:shadow-none"
        style={{
          backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <Award className="w-96 h-96" />
        </div>

        {/* Border Design */}
        <div className="absolute inset-4 border-4 border-double border-primary/30 rounded-lg" />
        <div className="absolute inset-6 border border-primary/20 rounded-lg" />

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-between p-12 text-center">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Award className="w-7 h-7 text-primary-foreground" />
              </div>
              <span className="text-2xl font-display font-bold text-primary">
                {data.institutionName || 'EduVerse'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground tracking-widest uppercase">
              Certificate of Completion
            </p>
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
                <Award className="w-4 h-4 text-accent" />
                <span className="font-medium">Grade: {data.grade}</span>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              Instructed by <span className="font-medium text-foreground">{data.instructorName}</span>
            </p>
          </div>

          {/* Footer */}
          <div className="w-full flex items-end justify-between">
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
                <img
                  src={generateQRCodeUrl(data.credentialId)}
                  alt="Verification QR Code"
                  className="w-16 h-16 rounded"
                />
                <p className="text-xs text-muted-foreground mt-1">Scan to verify</p>
              </div>
            </div>

            {/* Certificate ID */}
            <div className="text-right">
              <div className="w-40 border-b border-primary/30 mb-1" />
              <p className="text-xs text-muted-foreground">Platform Signature</p>
              <p className="text-xs text-muted-foreground mt-2">
                Credential ID: {data.credentialId}
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-accent/20 to-transparent" />
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/10 to-transparent" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-primary/10 to-transparent" />
      </div>

      {/* PDF Download Actions */}
      <div className="flex items-center justify-center print:hidden">
        <PDFCertificateGenerator
          data={{
            studentName: data.studentName,
            courseName: data.courseName,
            issueDate: data.completionDate,
            credentialId: data.credentialId,
            instructorName: data.instructorName,
            courseDuration: data.courseDuration,
          }}
          onDownload={onDownload}
        />
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
};