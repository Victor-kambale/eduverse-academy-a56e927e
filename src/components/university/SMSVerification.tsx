import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, CheckCircle, AlertCircle, Loader2, RefreshCw, Shield, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SMSVerificationProps {
  phoneNumber: string;
  organizationName: string;
  onVerified: () => void;
  onBack: () => void;
}

export function SMSVerification({ phoneNumber, organizationName, onVerified, onBack }: SMSVerificationProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatPhoneNumber = (phone: string) => {
    // Mask phone number for display
    if (phone.length <= 4) return phone;
    return phone.slice(0, 3) + '****' + phone.slice(-4);
  };

  const sendVerificationCode = async () => {
    if (!phoneNumber) {
      setError('Phone number is required');
      return;
    }

    setIsSending(true);
    setError(null);
    
    try {
      const { data, error: funcError } = await supabase.functions.invoke('send-sms-verification', {
        body: {
          phoneNumber,
          action: 'send',
          companyName: organizationName || 'EDUVERSE ACADEMY',
        },
      });

      if (funcError) throw funcError;

      if (data.success) {
        setCodeSent(true);
        setCountdown(60);
        
        // For demo mode, store the code
        if (data.demoCode) {
          setDemoCode(data.demoCode);
        }
        
        toast.success('Verification code sent!', {
          description: `Check your phone at ${formatPhoneNumber(phoneNumber)}`,
        });

        // Play notification sound
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } else {
        throw new Error(data.error || 'Failed to send code');
      }
    } catch (error: any) {
      console.error('Failed to send SMS:', error);
      setError(error.message || 'Failed to send verification code');
      toast.error('Failed to send SMS');
    } finally {
      setIsSending(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, 6).split('');
      const newCode = [...code];
      pastedCode.forEach((char, i) => {
        if (index + i < 6 && /^\d$/.test(char)) {
          newCode[index + i] = char;
        }
      });
      setCode(newCode);
      const nextIndex = Math.min(index + pastedCode.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else if (/^\d$/.test(value) || value === '') {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      
      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
    setError(null);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async () => {
    const enteredCode = code.join('');
    
    if (enteredCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke('send-sms-verification', {
        body: {
          phoneNumber,
          action: 'verify',
          code: enteredCode,
        },
      });

      if (funcError) throw funcError;

      if (data.success && data.verified) {
        toast.success('Phone number verified successfully!');
        
        // Play success sound
        const audio = new Audio('/sounds/success.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
        
        onVerified();
      } else {
        setAttempts(prev => prev + 1);
        setError(data.error || 'Invalid verification code');
        
        // Play error sound
        const audio = new Audio('/sounds/error.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {});
        
        if (data.penaltyApplied) {
          toast.error('Too many failed attempts');
        }
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setError(error.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetVerification = () => {
    setCode(['', '', '', '', '', '']);
    setCodeSent(false);
    setDemoCode(null);
    setError(null);
    setAttempts(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <Card className="overflow-hidden border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/20 rounded-full">
              <Smartphone className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl">Phone Verification</CardTitle>
              <CardDescription>Verify your organization's phone number via SMS</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-6 space-y-6">
          <AnimatePresence mode="wait">
            {!codeSent ? (
              <motion.div
                key="send-code"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">SMS will be sent to:</p>
                    <p className="font-medium text-foreground">{formatPhoneNumber(phoneNumber)}</p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> Standard SMS rates may apply. 
                    Make sure your phone can receive text messages at this number.
                  </p>
                </div>

                <Button
                  onClick={sendVerificationCode}
                  disabled={isSending || !phoneNumber}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending SMS...
                    </>
                  ) : (
                    <>
                      <Phone className="mr-2 h-4 w-4" />
                      Send Verification SMS
                    </>
                  )}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="enter-code"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    SMS sent to {formatPhoneNumber(phoneNumber)}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit verification code from your SMS
                  </p>
                </div>

                {/* Demo Mode Notice */}
                {demoCode && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-lg p-4 text-center"
                  >
                    <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">Demo Mode - Use this code:</p>
                    <p className="font-mono text-2xl font-bold text-amber-800 dark:text-amber-200 tracking-widest">{demoCode}</p>
                  </motion.div>
                )}

                {/* OTP Input */}
                <div className="flex justify-center gap-2 sm:gap-3">
                  {code.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={cn(
                        'w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold',
                        error && 'border-destructive focus-visible:ring-destructive'
                      )}
                      disabled={isLoading}
                    />
                  ))}
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-lg"
                    >
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Verify Button */}
                <Button
                  onClick={verifyCode}
                  disabled={isLoading || code.some(d => !d)}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Verify Phone Number
                    </>
                  )}
                </Button>

                {/* Resend Code */}
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the SMS?
                  </p>
                  {countdown > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Resend available in <span className="font-mono font-bold">{countdown}s</span>
                    </p>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={sendVerificationCode}
                      disabled={isSending}
                    >
                      <RefreshCw className={cn('mr-2 h-4 w-4', isSending && 'animate-spin')} />
                      Resend SMS
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Back Button */}
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full"
          >
            Back to Edit Phone Number
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
