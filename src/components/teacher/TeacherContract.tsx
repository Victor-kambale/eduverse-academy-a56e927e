import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, CheckCircle2, Shield, AlertTriangle, QrCode } from "lucide-react";

interface TeacherContractProps {
  agreedToContract: boolean;
  onAgreeChange: (agreed: boolean) => void;
}

export const TeacherContract = ({ agreedToContract, onAgreeChange }: TeacherContractProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Instructor Agreement</h3>
          <p className="text-sm text-muted-foreground">
            Please review and accept the terms below
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          Legally Binding
        </Badge>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-base">Eduverse Instructor Contract</CardTitle>
                <p className="text-xs text-muted-foreground">Version 2.0 • Effective Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="text-center">
              <QrCode className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="text-xs text-muted-foreground mt-1">Verify</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="text-center mb-6 pb-6 border-b">
                <h2 className="text-xl font-bold text-primary">EDUVERSE COMPANY</h2>
                <p className="text-sm text-muted-foreground">
                  123 Education Street, Innovation District<br />
                  San Francisco, CA 94102, United States<br />
                  contact@eduverse.com • www.eduverse.com
                </p>
              </div>

              <h3 className="text-lg font-bold text-center mb-4">INSTRUCTOR PARTNERSHIP AGREEMENT</h3>

              <p className="mb-4">
                This Instructor Partnership Agreement ("Agreement") is entered into between Eduverse Company 
                ("Company", "We", "Us") and the undersigned individual ("Instructor", "You") as of the date 
                of electronic signature below.
              </p>

              <h4 className="font-bold mt-6 mb-2">1. PARTNERSHIP OVERVIEW</h4>
              <p>
                By signing this Agreement, you join an elite community of educators committed to transforming 
                lives through quality online education. As an Eduverse Instructor, you will have access to 
                our world-class platform, marketing support, and a global audience eager to learn from experts 
                like you.
              </p>

              <h4 className="font-bold mt-6 mb-2">2. REVENUE SHARING STRUCTURE</h4>
              <p>You will receive a competitive share of all course sales based on the following tier structure:</p>
              <ul className="list-disc pl-6 my-3">
                <li><strong>Beginner Level Courses:</strong> You receive 90% (Company receives 10%)</li>
                <li><strong>Intermediate Level Courses:</strong> You receive 85% (Company receives 15%)</li>
                <li><strong>Advanced Level Courses:</strong> You receive 75% (Company receives 25%)</li>
                <li><strong>Training/Workshop Courses:</strong> You receive 98% (Company receives 2%)</li>
              </ul>
              <p className="text-sm bg-muted p-3 rounded-lg">
                <strong>Example:</strong> If you sell an Intermediate course for $100, you receive $85 
                and Eduverse receives $15 for platform maintenance, marketing, and support services.
              </p>

              <h4 className="font-bold mt-6 mb-2">3. COURSE CREATION FEE</h4>
              <p>
                A nominal course creation fee of <strong>$5.00 USD</strong> is required for each new course 
                you create. This fee covers:
              </p>
              <ul className="list-disc pl-6 my-3">
                <li>Course hosting and streaming infrastructure</li>
                <li>Quality review and approval process</li>
                <li>Marketing and promotional materials</li>
                <li>Student support systems</li>
              </ul>

              <h4 className="font-bold mt-6 mb-2">4. PAYMENT TERMS</h4>
              <p>
                Earnings are calculated monthly and paid within 14 business days of the month's end. 
                Payments are made to your registered bank account or alternative payment method. 
                Minimum payout threshold is $50.00 USD.
              </p>

              <h4 className="font-bold mt-6 mb-2">5. CONTENT OWNERSHIP</h4>
              <p>
                You retain full intellectual property rights to all original content you create. 
                You grant Eduverse a non-exclusive license to distribute, market, and display your 
                content on our platform and marketing channels.
              </p>

              <h4 className="font-bold mt-6 mb-2">6. QUALITY STANDARDS</h4>
              <p>You agree to:</p>
              <ul className="list-disc pl-6 my-3">
                <li>Provide accurate and up-to-date course content</li>
                <li>Respond to student questions within 48 hours</li>
                <li>Maintain a minimum 4.0-star rating</li>
                <li>Update courses to reflect industry changes</li>
                <li>Not plagiarize or infringe on third-party rights</li>
              </ul>

              <h4 className="font-bold mt-6 mb-2">7. TERMINATION</h4>
              <p>
                Either party may terminate this Agreement with 30 days written notice. Upon termination, 
                your courses may be removed from the platform, and any pending earnings will be paid out 
                within 45 days.
              </p>

              <h4 className="font-bold mt-6 mb-2">8. CONFIDENTIALITY</h4>
              <p>
                Both parties agree to maintain confidentiality of proprietary information, including 
                but not limited to business strategies, student data, and technical implementations.
              </p>

              <h4 className="font-bold mt-6 mb-2">9. DISPUTE RESOLUTION</h4>
              <p>
                Any disputes arising from this Agreement shall be resolved through binding arbitration 
                in accordance with the rules of the American Arbitration Association, with proceedings 
                held in San Francisco, California.
              </p>

              <h4 className="font-bold mt-6 mb-2">10. MODIFICATIONS</h4>
              <p>
                Eduverse reserves the right to modify this Agreement with 30 days notice. Continued 
                use of the platform after such notice constitutes acceptance of the modified terms.
              </p>

              <div className="mt-8 pt-6 border-t">
                <h4 className="font-bold mb-4">ACKNOWLEDGMENT</h4>
                <p className="text-sm">
                  By checking the box below and submitting your application, you acknowledge that:
                </p>
                <ul className="list-disc pl-6 my-3 text-sm">
                  <li>You have read and understood this Agreement in its entirety</li>
                  <li>You agree to all terms and conditions stated herein</li>
                  <li>You are legally authorized to enter into this Agreement</li>
                  <li>The $99 registration fee is non-refundable</li>
                  <li>Your application is subject to approval by Eduverse within 3 business days</li>
                </ul>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-warning">Important Notice</p>
            <p className="text-muted-foreground mt-1">
              Your application will be reviewed by the Eduverse team within 3 business days. 
              Once approved, you will receive a notification and can download the signed contract 
              from your profile. The contract approval button will be enabled after review.
            </p>
          </div>
        </div>
      </div>

      <Card className={`${agreedToContract ? 'border-success bg-success/5' : 'border-muted'} transition-colors`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="agreeContract"
              checked={agreedToContract}
              onCheckedChange={(checked) => onAgreeChange(checked as boolean)}
              className="mt-1"
            />
            <div>
              <Label htmlFor="agreeContract" className="font-medium cursor-pointer">
                I have read, understood, and agree to the Instructor Partnership Agreement
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                By checking this box, I confirm that I am entering into a legally binding contract 
                with Eduverse Company and agree to abide by all terms and conditions outlined above.
              </p>
              {agreedToContract && (
                <div className="flex items-center gap-2 mt-3 text-success">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Agreement accepted</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
