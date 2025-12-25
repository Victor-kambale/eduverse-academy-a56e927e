import { EnhancedPaymentTesting } from '@/components/payment/EnhancedPaymentTesting';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PaymentTesting() {
  const navigate = useNavigate();
  
  return (
    <div className="p-6 space-y-6 scroll-smooth">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Payment Testing</h1>
          <p className="text-muted-foreground">Test all payment methods with sandbox/test credentials</p>
        </div>
      </div>
      <EnhancedPaymentTesting />
    </div>
  );
}
