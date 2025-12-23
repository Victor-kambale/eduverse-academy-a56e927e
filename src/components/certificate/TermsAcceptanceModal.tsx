import { useState } from 'react';
import { 
  Shield, 
  CheckCircle, 
  FileText,
  Scale,
  AlertTriangle,
  Lock,
  Ban,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';

interface TermsAcceptanceModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onClose: () => void;
}

export function TermsAcceptanceModal({ isOpen, onAccept, onClose }: TermsAcceptanceModalProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedUsage, setAcceptedUsage] = useState(false);
  const [acceptedNoViolence, setAcceptedNoViolence] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const allAccepted = acceptedTerms && acceptedPrivacy && acceptedUsage && acceptedNoViolence;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    if (isAtBottom) {
      setHasScrolled(true);
    }
  };

  const handleAccept = () => {
    if (allAccepted) {
      onAccept();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            Terms, Conditions & Policies
          </DialogTitle>
          <DialogDescription>
            Please read and accept the following terms before viewing and downloading your certificate.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea 
          className="h-[400px] pr-4" 
          onScrollCapture={handleScroll}
        >
          <div className="space-y-6">
            {/* Introduction */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Eduverse Academy Certificate Terms
              </h3>
              <p className="text-sm text-muted-foreground">
                By accepting these terms, you agree to the following conditions regarding the use, 
                distribution, and protection of your Eduverse Academy certificate.
              </p>
            </div>

            <Separator />

            {/* Section 1: Certificate Ownership */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                1. Certificate Ownership & Authenticity
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li>This certificate is issued exclusively to the verified individual named on the document.</li>
                <li>The certificate contains security features including digital watermarks, QR verification codes, and official seals.</li>
                <li>Any attempt to alter, forge, or misrepresent this certificate is strictly prohibited and may result in legal action.</li>
                <li>The certificate remains the intellectual property of Eduverse Academy.</li>
                <li>Certificates are non-transferable and may only be used by the named recipient.</li>
              </ul>
            </div>

            <Separator />

            {/* Section 2: Usage Rights */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Eye className="w-4 h-4" />
                2. Permitted Uses
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li>You may display your certificate on personal portfolios, resumes, and professional profiles.</li>
                <li>You may share the verification QR code or link for third-party verification.</li>
                <li>You may print the certificate for personal or professional display purposes.</li>
                <li>Digital sharing is permitted through official Eduverse Academy sharing mechanisms.</li>
              </ul>
            </div>

            <Separator />

            {/* Section 3: Prohibited Actions */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-destructive">
                <Ban className="w-4 h-4" />
                3. Prohibited Actions
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li>Modifying, editing, or altering any information on the certificate.</li>
                <li>Removing security features, watermarks, or verification codes.</li>
                <li>Creating unauthorized copies or reproductions for fraudulent purposes.</li>
                <li>Using the certificate to misrepresent qualifications or achievements.</li>
                <li>Selling, transferring, or licensing the certificate to third parties.</li>
                <li>Using automated tools to capture or reproduce the certificate.</li>
              </ul>
            </div>

            <Separator />

            {/* Section 4: Security & Protection */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Lock className="w-4 h-4" />
                4. Security & Copy Protection
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li>This certificate is protected by advanced security measures.</li>
                <li>Screenshot, screen recording, and copy functions are disabled for security.</li>
                <li>The certificate includes invisible digital watermarks for tracking.</li>
                <li>Unauthorized reproduction attempts are logged and may be investigated.</li>
                <li>Physical and digital certificates can be verified through our verification portal.</li>
              </ul>
            </div>

            <Separator />

            {/* Section 5: No Violence Policy */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-orange-600">
                <AlertTriangle className="w-4 h-4" />
                5. Code of Conduct & No Violence Policy
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li>Certificate holders agree to uphold the values of Eduverse Academy.</li>
                <li>Any form of violence, harassment, or discrimination is strictly prohibited.</li>
                <li>Misuse of the certificate in connection with illegal activities will result in revocation.</li>
                <li>Eduverse Academy reserves the right to revoke certificates for violations of this policy.</li>
                <li>All disputes shall be resolved in accordance with applicable laws and regulations.</li>
              </ul>
            </div>

            <Separator />

            {/* Section 6: Legal */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Scale className="w-4 h-4" />
                6. Legal Disclaimer
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li>Eduverse Academy makes no warranties regarding the acceptance of this certificate by third parties.</li>
                <li>The certificate represents completion of the specified course curriculum.</li>
                <li>Eduverse Academy reserves the right to update these terms at any time.</li>
                <li>Continued use of the certificate constitutes acceptance of any updated terms.</li>
              </ul>
            </div>

            {!hasScrolled && (
              <Alert className="mt-4">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  Please scroll to the bottom to read all terms before accepting.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </ScrollArea>

        {/* Acceptance Checkboxes */}
        <div className="space-y-3 py-4 border-t">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="terms" 
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
              disabled={!hasScrolled}
            />
            <Label 
              htmlFor="terms" 
              className={`text-sm cursor-pointer ${!hasScrolled ? 'text-muted-foreground' : ''}`}
            >
              I have read and accept the Terms and Conditions of Eduverse Academy certificates.
            </Label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox 
              id="privacy" 
              checked={acceptedPrivacy}
              onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
              disabled={!hasScrolled}
            />
            <Label 
              htmlFor="privacy" 
              className={`text-sm cursor-pointer ${!hasScrolled ? 'text-muted-foreground' : ''}`}
            >
              I agree to the Privacy Policy and consent to the processing of my personal data.
            </Label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox 
              id="usage" 
              checked={acceptedUsage}
              onCheckedChange={(checked) => setAcceptedUsage(checked as boolean)}
              disabled={!hasScrolled}
            />
            <Label 
              htmlFor="usage" 
              className={`text-sm cursor-pointer ${!hasScrolled ? 'text-muted-foreground' : ''}`}
            >
              I understand the permitted and prohibited uses of my certificate.
            </Label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox 
              id="violence" 
              checked={acceptedNoViolence}
              onCheckedChange={(checked) => setAcceptedNoViolence(checked as boolean)}
              disabled={!hasScrolled}
            />
            <Label 
              htmlFor="violence" 
              className={`text-sm cursor-pointer ${!hasScrolled ? 'text-muted-foreground' : ''}`}
            >
              I agree to the No Violence Policy and Code of Conduct.
            </Label>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAccept}
            disabled={!allAccepted}
            className="gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Accept & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TermsAcceptanceModal;
