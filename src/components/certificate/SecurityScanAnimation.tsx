import { useState, useEffect } from 'react';
import { Shield, Lock, CheckCircle, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface SecurityScanAnimationProps {
  type: 'environment' | 'payment';
  onComplete: () => void;
}

export function SecurityScanAnimation({ type, onComplete }: SecurityScanAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(true);

  const environmentSteps = [
    'Initializing security protocols...',
    'Checking device integrity...',
    'Verifying secure connection...',
    'Scanning for screen capture software...',
    'Validating browser security...',
    'Checking for unauthorized extensions...',
    'Securing document environment...',
    'Finalizing security check...'
  ];

  const paymentSteps = [
    'Initializing secure payment gateway...',
    'Encrypting transaction data...',
    'Verifying payment credentials...',
    'Checking fraud prevention systems...',
    'Validating transaction security...',
    'Connecting to payment processor...',
    'Securing payment environment...',
    'Finalizing secure connection...'
  ];

  const steps = type === 'environment' ? environmentSteps : paymentSteps;
  const title = type === 'environment' 
    ? 'Checking for secure environment...' 
    : 'Checking for secure payment environment...';

  useEffect(() => {
    const duration = 5000; // 5 seconds total
    const interval = duration / 100;
    const stepInterval = duration / steps.length;

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 1;
      });
    }, interval);

    const stepTimer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(stepTimer);
          return prev;
        }
        return prev + 1;
      });
    }, stepInterval);

    const completeTimer = setTimeout(() => {
      setIsOpen(false);
      onComplete();
    }, duration + 500);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, steps.length]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md text-center"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center py-8 space-y-6">
          {/* Shield Icon with Animation */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-12 h-12 text-primary animate-pulse" />
            </div>
            {/* Rotating ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground min-h-[20px] transition-all duration-300">
              {steps[currentStep]}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">{progress}%</p>
          </div>

          {/* Security Indicators */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-green-500" />
              <span>256-bit Encryption</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-green-500" />
              <span>Secure Connection</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SecurityScanAnimation;
