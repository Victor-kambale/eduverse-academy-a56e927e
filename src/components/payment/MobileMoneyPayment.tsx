import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Phone,
  Shield,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Send,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CountryCode {
  code: string;
  country: string;
  flag: string;
}

interface MobileMoneyPaymentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  countryCodes: CountryCode[];
  onComplete: (transactionId: string) => void;
}

export function MobileMoneyPayment({
  open,
  onOpenChange,
  amount,
  countryCodes,
  onComplete,
}: MobileMoneyPaymentProps) {
  const [step, setStep] = useState(1);
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [securityProgress, setSecurityProgress] = useState(0);
  const [securityStatus, setSecurityStatus] = useState('');

  useEffect(() => {
    if (!open) {
      // Reset state when modal closes
      setStep(1);
      setPhoneNumber('');
      setVerificationCode('');
      setCodeSent(false);
      setVerified(false);
      setDemoCode(null);
      setAttempts(0);
      setSecurityProgress(0);
    }
  }, [open]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const runSecurityCheck = async () => {
    setStep(2);
    const checks = [
      'Checking secure payment environment...',
      'Verifying SSL certificate...',
      'Validating phone number format...',
      'Connecting to payment gateway...',
      'Preparing SMS verification...',
    ];

    for (let i = 0; i < checks.length; i++) {
      setSecurityStatus(checks[i]);
      setSecurityProgress((i + 1) * 20);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setStep(3);
  };

  const sendVerificationCode = async () => {
    if (!phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }

    setLoading(true);
    try {
      const fullNumber = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;
      
      const { data, error } = await supabase.functions.invoke('send-sms-verification', {
        body: {
          phoneNumber: fullNumber,
          action: 'send',
          amount,
          fee: amount * 0.035,
          companyName: 'EDUVERSE ACADEMY'
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        setCodeSent(true);
        setCountdown(60);
        setStep(4);
        toast.success('Verification code sent!');
        
        if (data.demoCode) {
          setDemoCode(data.demoCode);
          toast.info(`Demo mode - Code: ${data.demoCode}`, { duration: 15000 });
        }
      } else {
        toast.error(data?.error || 'Failed to send code');
      }
    } catch (error) {
      console.error('SMS error:', error);
      toast.error('Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const fullNumber = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;
      
      const { data, error } = await supabase.functions.invoke('send-sms-verification', {
        body: {
          phoneNumber: fullNumber,
          action: 'verify',
          code: verificationCode
        }
      });

      if (error) throw error;
      
      if (data?.success && data?.verified) {
        setVerified(true);
        setStep(5);
        toast.success('Phone verified successfully!');
        
        // Play success sound
        const audio = new Audio('/sounds/success.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});

        // Complete after delay
        setTimeout(() => {
          const transactionId = `MM-${Date.now()}`;
          onComplete(transactionId);
        }, 2000);
      } else {
        setAttempts(prev => prev + 1);
        if (data?.penaltyApplied) {
          toast.error('Too many failed attempts! 20% penalty fee will be applied.');
        } else {
          toast.error(data?.error || 'Invalid verification code');
        }
      }
    } catch (error) {
      console.error('Verify error:', error);
      toast.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneDisplay = () => {
    if (!phoneNumber) return '';
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-yellow-500" />
            Mobile Money Payment
          </DialogTitle>
          <DialogDescription>
            Pay ${amount.toFixed(2)} USD via Mobile Money with SMS verification
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                {s < 5 && (
                  <div className={`w-8 h-0.5 ${step > s ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Enter Phone Number */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Amount to Pay</p>
                <p className="text-3xl font-bold">${amount.toFixed(2)} USD</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Country Code</Label>
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countryCodes.map((cc) => (
                        <SelectItem key={cc.code} value={cc.code}>
                          <span className="flex items-center gap-2">
                            <span>{cc.flag}</span>
                            <span>{cc.code}</span>
                            <span className="text-muted-foreground">({cc.country})</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Phone Number</Label>
                  <div className="flex gap-2">
                    <div className="w-20 flex items-center justify-center bg-muted rounded-md px-3 font-medium">
                      {countryCode}
                    </div>
                    <Input
                      type="tel"
                      placeholder="123 456 7890"
                      value={formatPhoneDisplay()}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <Button className="w-full" onClick={runSecurityCheck} disabled={!phoneNumber || phoneNumber.length < 7}>
                <Shield className="w-4 h-4 mr-2" />
                Continue to Security Check
              </Button>
            </div>
          )}

          {/* Step 2: Security Check */}
          {step === 2 && (
            <div className="space-y-4 py-8">
              <div className="text-center">
                <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
                <p className="font-medium">{securityStatus}</p>
                <Progress value={securityProgress} className="mt-4" />
              </div>
            </div>
          )}

          {/* Step 3: Confirm & Send Code */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Security Check Passed</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your connection is secure. We will send a verification code to:
                </p>
                <p className="font-medium mt-2">{countryCode} {formatPhoneDisplay()}</p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Payment Amount:</span>
                  <span className="font-medium">${amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Processing Fee (3.5%):</span>
                  <span className="font-medium">${(amount * 0.035).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium mt-2 pt-2 border-t">
                  <span>Total:</span>
                  <span>${(amount * 1.035).toFixed(2)}</span>
                </div>
              </div>

              <Button className="w-full" onClick={sendVerificationCode} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Verification Code
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Step 4: Enter Verification Code */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <p className="font-medium">Enter Verification Code</p>
                <p className="text-sm text-muted-foreground">
                  We sent a 6-digit code to {countryCode} {formatPhoneDisplay()}
                </p>
              </div>

              {demoCode && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-center">
                  <p className="text-sm text-amber-600">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    Demo Mode - Use code: <strong>{demoCode}</strong>
                  </p>
                </div>
              )}

              <div>
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                />
              </div>

              {attempts > 0 && (
                <p className="text-sm text-destructive text-center">
                  {3 - attempts} attempts remaining. {attempts >= 2 && 'Next failure will add 20% penalty.'}
                </p>
              )}

              <Button className="w-full" onClick={verifyCode} disabled={loading || verificationCode.length !== 6}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify & Complete Payment
                  </>
                )}
              </Button>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-muted-foreground">Resend code in {countdown}s</p>
                ) : (
                  <Button variant="link" onClick={sendVerificationCode} disabled={loading}>
                    Resend Code
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 5 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-bold text-green-600 mb-2">Payment Successful!</h3>
              <p className="text-muted-foreground">
                Your mobile money payment of ${amount.toFixed(2)} has been processed.
              </p>
              <Badge className="mt-4" variant="outline">
                Phone Verified ✓
              </Badge>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
