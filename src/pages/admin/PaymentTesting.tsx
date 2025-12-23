import { EnhancedPaymentTesting } from '@/components/payment/EnhancedPaymentTesting';

export default function PaymentTesting() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Testing</h1>
        <p className="text-muted-foreground">Test all payment methods with sandbox/test credentials</p>
      </div>
      <EnhancedPaymentTesting />
    </div>
  );
}
