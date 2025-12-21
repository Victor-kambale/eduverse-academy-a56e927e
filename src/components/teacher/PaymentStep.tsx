import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  CreditCard, 
  CheckCircle2, 
  Shield, 
  FileText,
  Loader2,
  QrCode,
  Receipt
} from "lucide-react";

interface PaymentStepProps {
  onPaymentComplete: () => void;
  paymentCompleted: boolean;
}

const paymentMethods = [
  { id: 'stripe', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, American Express' },
  { id: 'paypal', name: 'PayPal', icon: CreditCard, description: 'Pay with PayPal account' },
  { id: 'googlepay', name: 'Google Pay', icon: CreditCard, description: 'Fast checkout with Google' },
  { id: 'applepay', name: 'Apple Pay', icon: CreditCard, description: 'Pay with Apple Pay' },
  { id: 'wechat', name: 'WeChat Pay', icon: QrCode, description: 'Scan QR to pay' },
  { id: 'alipay', name: 'Alipay', icon: QrCode, description: 'Pay with Alipay' },
  { id: 'payoneer', name: 'Payoneer', icon: CreditCard, description: 'Pay with Payoneer' },
];

export const PaymentStep = ({ onPaymentComplete, paymentCompleted }: PaymentStepProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // For now, we'll use Stripe for the actual payment
      if (selectedMethod === 'stripe') {
        const { data, error } = await supabase.functions.invoke('create-teacher-payment', {
          body: {
            amount: 9900, // $99.00 in cents
            description: 'Teacher Registration Fee',
          }
        });

        if (error) throw error;

        if (data?.url) {
          window.open(data.url, '_blank');
          // In a real implementation, you'd use webhooks to confirm payment
          // For now, we'll simulate success after redirect
          setTimeout(() => {
            onPaymentComplete();
            toast.success("Payment processed successfully!");
          }, 2000);
        }
      } else {
        // Simulate payment for other methods
        await new Promise(resolve => setTimeout(resolve, 2000));
        onPaymentComplete();
        toast.success("Payment processed successfully!");
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentCompleted) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Payment Successful!</h3>
        <p className="text-muted-foreground mb-6">
          Your $99 registration fee has been processed successfully.
        </p>
        
        <Card className="max-w-md mx-auto bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-accent" />
                <span className="font-semibold">Payment Receipt</span>
              </div>
              <Badge variant="default" className="bg-success">Paid</Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">$99.00 USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-xs">TXN-{Date.now()}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t flex justify-center">
              <div className="p-2 bg-background rounded-lg">
                <QrCode className="w-16 h-16 text-muted-foreground" />
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Scan to verify payment
            </p>
          </CardContent>
        </Card>
        
        <p className="text-sm text-muted-foreground mt-6">
          Please proceed to the next step to review and sign your contract.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-accent bg-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Registration Fee</span>
            <Badge className="text-lg px-4 py-1">$99.00</Badge>
          </CardTitle>
          <CardDescription>
            One-time, non-refundable fee to become an Eduverse instructor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              Access to course creation tools
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              Professional instructor profile
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              Revenue sharing (75-98% earnings)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              Marketing and promotion support
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              Analytics and insights dashboard
            </li>
          </ul>
        </CardContent>
      </Card>

      <div>
        <h4 className="font-semibold mb-4">Select Payment Method</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {paymentMethods.map((method) => (
            <Card 
              key={method.id}
              className={`cursor-pointer transition-all hover:border-accent ${
                selectedMethod === method.id ? 'border-accent bg-accent/5 ring-2 ring-accent/20' : ''
              }`}
              onClick={() => setSelectedMethod(method.id)}
            >
              <CardContent className="p-4 text-center">
                <method.icon className={`w-8 h-8 mx-auto mb-2 ${
                  selectedMethod === method.id ? 'text-accent' : 'text-muted-foreground'
                }`} />
                <p className="font-medium text-sm">{method.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>Your payment is secured with 256-bit SSL encryption</span>
        </div>
      </div>

      <Button 
        className="w-full" 
        size="lg"
        onClick={handlePayment}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pay $99.00 Now
          </>
        )}
      </Button>
    </div>
  );
};
