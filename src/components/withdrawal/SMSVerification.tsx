import { useState, useEffect } from 'react';
import { 
  Phone, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SMSVerificationProps {
  phoneNumber: string;
  onVerified: () => void;
  amount?: number;
  fee?: number;
  disabled?: boolean;
}

export function SMSVerification({ 
  phoneNumber, 
  onVerified, 
  amount,
  fee,
  disabled 
}: SMSVerificationProps) {
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatPhoneNumber = (phone: string) => {
    // Mask phone number for display
    if (phone.length > 6) {
      return phone.slice(0, 3) + '****' + phone.slice(-4);
    }
    return phone;
  };

  const sendVerificationCode = async () => {
    if (!phoneNumber || countdown > 0) return;

    setSending(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-sms-verification', {
        body: {
          phoneNumber,
          action: 'send',
          amount,
          fee,
          companyName: 'EduVerse'
        },
      });

      if (error) throw error;

      if (data?.success) {
        setCodeSent(true);
        setCountdown(60); // 60 second cooldown
        toast.success('Verification code sent!');
        
        // If demo mode, show the code in toast
        if (data.demoCode) {
          toast.info(`Demo mode: Your code is ${data.demoCode}`, { duration: 10000 });
        }
      } else {
        throw new Error(data?.message || 'Failed to send code');
      }
    } catch (err) {
      console.error('Error sending verification code:', err);
      setError('Failed to send verification code. Please try again.');
      toast.error('Failed to send verification code');
    } finally {
      setSending(false);
    }
  };

  const verifyCode = async () => {
    if (!code || code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-sms-verification', {
        body: {
          phoneNumber,
          action: 'verify',
          code,
        },
      });

      if (error) throw error;

      if (data?.success) {
        setVerified(true);
        toast.success('Phone number verified!');
        onVerified();
      } else {
        setAttempts(prev => prev + 1);
        if (data?.attemptsRemaining !== undefined) {
          setError(`Invalid code. ${data.attemptsRemaining} attempts remaining.`);
        } else if (data?.penalty) {
          setError(data.message || 'Too many failed attempts. Please wait before trying again.');
        } else {
          setError(data?.message || 'Invalid verification code');
        }
      }
    } catch (err) {
      console.error('Error verifying code:', err);
      setError('Failed to verify code. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  if (verified) {
    return (
      <Card className="border-green-500/50 bg-green-500/5">
        <CardContent className="p-6 flex items-center gap-4">
          <CheckCircle className="h-10 w-10 text-green-500" />
          <div>
            <p className="font-semibold text-green-600">Phone Verified</p>
            <p className="text-sm text-muted-foreground">
              {formatPhoneNumber(phoneNumber)} has been verified
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Phone Verification
        </CardTitle>
        <CardDescription>
          Verify your phone number to complete the withdrawal request
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            A verification code will be sent to:
          </p>
          <p className="font-semibold">{formatPhoneNumber(phoneNumber)}</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!codeSent ? (
          <Button 
            onClick={sendVerificationCode} 
            disabled={sending || disabled}
            className="w-full"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Phone className="h-4 w-4 mr-2" />
                Send Verification Code
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Enter 6-digit code</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest"
                disabled={verifying}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={sendVerificationCode}
                disabled={countdown > 0 || sending}
                className="flex-1"
              >
                {countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Resend Code
                  </>
                )}
              </Button>
              <Button
                onClick={verifyCode}
                disabled={verifying || code.length !== 6}
                className="flex-1"
              >
                {verifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify
                  </>
                )}
              </Button>
            </div>

            {attempts >= 3 && (
              <p className="text-sm text-destructive text-center">
                Multiple failed attempts. Consider requesting a new code.
              </p>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Standard SMS rates may apply. The code expires in 10 minutes.
        </p>
      </CardContent>
    </Card>
  );
}