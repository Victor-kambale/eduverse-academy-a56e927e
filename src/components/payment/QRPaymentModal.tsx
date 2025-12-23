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
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Loader2,
  RefreshCw,
  Copy,
  Smartphone,
  Shield,
  Scan,
  QrCode
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
  isTest?: boolean;
}

export function QRPaymentModal({
  open,
  onOpenChange,
  paymentMethod,
  amount,
  currency = 'USD',
  onPaymentComplete,
  onPaymentFailed,
  isTest = false,
}: QRPaymentModalProps) {
  const [status, setStatus] = useState<'scanning' | 'pending' | 'checking' | 'securing' | 'success' | 'failed'>('scanning');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [scanProgress, setScanProgress] = useState(0);
  const [securityStep, setSecurityStep] = useState(0);

  const qrImages = {
    wechat: '/images/wechat-pay-qr.png',
    alipay: '/images/alipay-qr.jpg',
  };

  const paymentDetails = {
    wechat: {
      name: 'WeChat Pay',
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Scan with WeChat app to pay',
    },
    alipay: {
      name: 'Alipay',
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Scan with Alipay app to pay',
    },
  };

  const securitySteps = [
    'Verifying merchant identity...',
    'Checking secure payment environment...',
    'Encrypting transaction data...',
    'Connecting to payment gateway...',
    'Ready for payment confirmation',
  ];

  const details = paymentDetails[paymentMethod];

  // Scanning animation effect
  useEffect(() => {
    if (!open) {
      setStatus('scanning');
      setTimeLeft(300);
      setScanProgress(0);
      setSecurityStep(0);
      return;
    }

    // Simulate QR scanning process
    if (status === 'scanning') {
      const scanInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(scanInterval);
            setStatus('securing');
            return 100;
          }
          return prev + 5;
        });
      }, 100);
      return () => clearInterval(scanInterval);
    }

    // Security check animation
    if (status === 'securing') {
      const securityInterval = setInterval(() => {
        setSecurityStep(prev => {
          if (prev >= securitySteps.length - 1) {
            clearInterval(securityInterval);
            setStatus('pending');
            return prev;
          }
          return prev + 1;
        });
      }, 800);
      return () => clearInterval(securityInterval);
    }

    // Payment timer
    if (status === 'pending') {
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
    }
  }, [open, status]);

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
    setScanProgress(0);
    setSecurityStep(0);
    setStatus('scanning');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${details.color}`} />
            Pay with {details.name}
            {isTest && <Badge variant="secondary" className="ml-2">Test Mode</Badge>}
          </DialogTitle>
          <DialogDescription>
            {details.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Amount Display */}
          <div className={`text-center p-4 rounded-lg ${details.bgColor}`}>
            <p className="text-sm text-muted-foreground">Amount to Pay</p>
            <p className={`text-3xl font-bold ${details.textColor}`}>${amount.toFixed(2)} {currency}</p>
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

          {/* QR Code with Scanning Animation */}
          <div className="relative">
            <div className="flex justify-center p-4 bg-white rounded-lg border-2 border-dashed border-muted">
              <div className="relative">
                <img 
                  src={qrImages[paymentMethod]} 
                  alt={`${details.name} QR Code`}
                  className="w-52 h-52 object-contain"
                />
                
                {/* Scanning Overlay */}
                {status === 'scanning' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded">
                    <Scan className="h-12 w-12 text-white animate-pulse mb-2" />
                    <p className="text-white text-sm font-medium">Scanning QR Code...</p>
                    <Progress value={scanProgress} className="w-32 mt-2" />
                    <p className="text-white/70 text-xs mt-1">{scanProgress}%</p>
                  </div>
                )}
                
                {/* Security Check Overlay */}
                {status === 'securing' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded">
                    <Shield className="h-12 w-12 text-green-400 animate-pulse mb-3" />
                    <p className="text-green-400 text-sm font-medium text-center px-4">
                      {securitySteps[securityStep]}
                    </p>
                    <div className="flex gap-1 mt-3">
                      {securitySteps.map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-2 h-2 rounded-full transition-all ${
                            i <= securityStep ? 'bg-green-400' : 'bg-white/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Checking Overlay */}
                {status === 'checking' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded">
                    <Loader2 className="h-12 w-12 text-white animate-spin mb-2" />
                    <p className="text-white text-sm font-medium">Verifying Payment...</p>
                  </div>
                )}

                {/* Success Overlay */}
                {status === 'success' && (
                  <div className="absolute inset-0 bg-green-500/95 rounded flex items-center justify-center">
                    <div className="text-center text-white">
                      <CheckCircle className="h-16 w-16 mx-auto mb-2 animate-bounce" />
                      <p className="font-bold text-lg">Payment Successful!</p>
                      {isTest && <p className="text-sm opacity-80 mt-1">Test payment completed</p>}
                    </div>
                  </div>
                )}

                {/* Failed Overlay */}
                {status === 'failed' && (
                  <div className="absolute inset-0 bg-destructive/95 rounded flex items-center justify-center">
                    <div className="text-center text-white">
                      <AlertTriangle className="h-16 w-16 mx-auto mb-2" />
                      <p className="font-bold text-lg">Payment Expired</p>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="mt-3"
                        onClick={handleRefresh}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Scan corners decoration */}
            <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-accent" />
            <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-accent" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-accent" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-accent" />
          </div>

          {/* Timer */}
          {status === 'pending' && (
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className={`font-mono text-lg ${timeLeft < 60 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          )}

          {/* Instructions */}
          {(status === 'pending' || status === 'scanning' || status === 'securing') && (
            <div className="space-y-2 text-sm">
              <div className={`flex items-start gap-3 p-2 rounded ${status === 'scanning' ? details.bgColor : ''}`}>
                <QrCode className={`h-5 w-5 mt-0.5 flex-shrink-0 ${status === 'scanning' ? details.textColor : 'text-muted-foreground'}`} />
                <div>
                  <p className="font-medium">Step 1: Open {details.name}</p>
                  <p className="text-muted-foreground text-xs">Launch the app on your phone</p>
                </div>
              </div>
              <div className={`flex items-start gap-3 p-2 rounded ${status === 'pending' ? details.bgColor : ''}`}>
                <Scan className={`h-5 w-5 mt-0.5 flex-shrink-0 ${status === 'pending' ? details.textColor : 'text-muted-foreground'}`} />
                <div>
                  <p className="font-medium">Step 2: Scan QR Code</p>
                  <p className="text-muted-foreground text-xs">Use the scan feature in the app</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 rounded">
                <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-medium">Step 3: Confirm Payment</p>
                  <p className="text-muted-foreground text-xs">Complete ${amount.toFixed(2)} payment</p>
                </div>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm border border-green-200 dark:border-green-800">
            <p className="font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Secure Payment Environment
            </p>
            <p className="text-green-600 dark:text-green-500 mt-1 text-xs">
              256-bit SSL encryption • PCI DSS compliant • Verified by {details.name}
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
              className={`flex-1 ${details.color} hover:opacity-90`}
              onClick={handleCheckPayment}
              disabled={status === 'checking' || status === 'success' || status === 'scanning' || status === 'securing'}
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
              ) : status === 'scanning' || status === 'securing' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Preparing...
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
