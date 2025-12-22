import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Loader2,
  RefreshCw,
  Copy,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';

interface QRPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentMethod: 'wechat' | 'alipay';
  amount: number;
  currency?: string;
  onPaymentComplete?: () => void;
  onPaymentFailed?: () => void;
}

export function QRPaymentModal({
  open,
  onOpenChange,
  paymentMethod,
  amount,
  currency = 'USD',
  onPaymentComplete,
  onPaymentFailed,
}: QRPaymentModalProps) {
  const [status, setStatus] = useState<'pending' | 'checking' | 'success' | 'failed'>('pending');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  const qrImages = {
    wechat: '/images/wechat-pay-qr.png',
    alipay: '/images/alipay-qr.jpg',
  };

  const paymentDetails = {
    wechat: {
      name: 'WeChat Pay',
      color: 'bg-green-500',
      description: 'Scan with WeChat app to pay',
    },
    alipay: {
      name: 'Alipay',
      color: 'bg-blue-500',
      description: 'Scan with Alipay app to pay',
    },
  };

  const details = paymentDetails[paymentMethod];

  useEffect(() => {
    if (!open) {
      setStatus('pending');
      setTimeLeft(300);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus('failed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCheckPayment = () => {
    setStatus('checking');
    // Simulate checking payment status
    setTimeout(() => {
      // For testing, randomly succeed or stay pending
      const isSuccess = Math.random() > 0.3;
      if (isSuccess) {
        setStatus('success');
        toast.success('Payment received successfully!');
        onPaymentComplete?.();
      } else {
        setStatus('pending');
        toast.info('Payment not yet received. Please complete the payment and check again.');
      }
    }, 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(amount.toString());
    toast.success('Amount copied to clipboard');
  };

  const handleRefresh = () => {
    setTimeLeft(300);
    setStatus('pending');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${details.color}`} />
            Pay with {details.name}
          </DialogTitle>
          <DialogDescription>
            {details.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Amount Display */}
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Amount to Pay</p>
            <p className="text-3xl font-bold">${amount.toFixed(2)} {currency}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-1"
              onClick={handleCopyAmount}
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy Amount
            </Button>
          </div>

          {/* QR Code */}
          <div className="relative">
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <img 
                src={qrImages[paymentMethod]} 
                alt={`${details.name} QR Code`}
                className="w-48 h-48 object-contain"
              />
            </div>
            
            {status === 'success' && (
              <div className="absolute inset-0 bg-green-500/90 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <CheckCircle className="h-16 w-16 mx-auto mb-2" />
                  <p className="font-bold text-lg">Payment Successful!</p>
                </div>
              </div>
            )}

            {status === 'failed' && (
              <div className="absolute inset-0 bg-destructive/90 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <AlertTriangle className="h-16 w-16 mx-auto mb-2" />
                  <p className="font-bold text-lg">Payment Expired</p>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="mt-2"
                    onClick={handleRefresh}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Timer */}
          {status === 'pending' && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Expires in {formatTime(timeLeft)}</span>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Smartphone className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>Open {details.name} app on your phone</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 flex items-center justify-center flex-shrink-0 font-medium">2</span>
              <p>Scan the QR code above</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 flex items-center justify-center flex-shrink-0 font-medium">3</span>
              <p>Complete the payment of ${amount.toFixed(2)}</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 flex items-center justify-center flex-shrink-0 font-medium">4</span>
              <p>Click "I've Paid" button below</p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-3 bg-accent/10 rounded-lg text-sm">
            <p className="font-medium text-accent">🔒 Secure Payment</p>
            <p className="text-muted-foreground mt-1">
              This payment is secured by {details.name}. Your financial information is protected.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1"
              onClick={handleCheckPayment}
              disabled={status === 'checking' || status === 'success'}
            >
              {status === 'checking' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : status === 'success' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completed
                </>
              ) : (
                "I've Paid"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
