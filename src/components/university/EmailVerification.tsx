import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle, Loader2, RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EmailVerificationProps {
  email: string;
  organizationName: string;
  onVerified: () => void;
  onBack: () => void;
}

export function EmailVerification({ email, organizationName, onVerified, onBack }: EmailVerificationProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
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

  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendVerificationCode = async () => {
    setIsSending(true);
    setError(null);
    
    try {
      const newCode = generateCode();
      setVerificationCode(newCode);

      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject: `Verification Code for ${organizationName} Registration - EduVerse Academy`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); border-radius: 16px 16px 0 0;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🎓 EduVerse Academy</h1>
                          <p style="margin: 10px 0 0; color: #bfdbfe; font-size: 14px;">University Partner Registration</p>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px;">
                          <h2 style="margin: 0 0 20px; color: #1e3a5f; font-size: 24px; font-weight: 600; text-align: center;">
                            Email Verification Required
                          </h2>
                          
                          <p style="margin: 0 0 30px; color: #64748b; font-size: 16px; line-height: 1.6; text-align: center;">
                            Please use the verification code below to complete your registration for <strong style="color: #1e3a5f;">${organizationName}</strong>
                          </p>
                          
                          <!-- Verification Code Box -->
                          <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #0ea5e9; border-radius: 12px; padding: 30px; text-align: center; margin: 0 0 30px;">
                            <p style="margin: 0 0 10px; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                            <p style="margin: 0; color: #0369a1; font-size: 42px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">${newCode}</p>
                            <p style="margin: 15px 0 0; color: #64748b; font-size: 12px;">⏰ This code expires in 10 minutes</p>
                          </div>
                          
                          <!-- Security Note -->
                          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; border-radius: 0 8px 8px 0; margin: 0 0 30px;">
                            <p style="margin: 0; color: #92400e; font-size: 14px;">
                              <strong>🔒 Security Notice:</strong> Never share this code with anyone. EduVerse staff will never ask for your verification code.
                            </p>
                          </div>
                          
                          <p style="margin: 0; color: #94a3b8; font-size: 14px; text-align: center;">
                            If you didn't request this code, please ignore this email.
                          </p>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="padding: 20px 40px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                          <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                            © ${new Date().getFullYear()} EduVerse Academy. All rights reserved.<br>
                            This is an automated message, please do not reply.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `,
        },
      });

      if (emailError) {
        throw emailError;
      }

      setCodeSent(true);
      setCountdown(60);
      toast.success('Verification code sent!', {
        description: `Check your inbox at ${email}`,
      });

      // Play notification sound
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});

    } catch (error) {
      console.error('Failed to send verification code:', error);
      setError('Failed to send verification code. Please try again.');
      toast.error('Failed to send verification code');
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

    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (enteredCode === verificationCode) {
      toast.success('Email verified successfully!');
      
      // Play success sound
      const audio = new Audio('/sounds/success.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
      
      onVerified();
    } else {
      setAttempts(prev => prev + 1);
      setError('Invalid verification code. Please try again.');
      
      // Play error sound
      const audio = new Audio('/sounds/error.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});
      
      if (attempts >= 2) {
        setError('Too many failed attempts. Please request a new code.');
      }
    }

    setIsLoading(false);
  };

  const resetVerification = () => {
    setCode(['', '', '', '', '', '']);
    setCodeSent(false);
    setVerificationCode(null);
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
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-full">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl">Email Verification</CardTitle>
              <CardDescription>Verify your organization's email address</CardDescription>
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
                  <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">Verification code will be sent to:</p>
                    <p className="font-medium text-foreground truncate">{email}</p>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Important:</strong> Make sure you have access to this email address. 
                    The verification code will expire in 10 minutes.
                  </p>
                </div>

                <Button
                  onClick={sendVerificationCode}
                  disabled={isSending}
                  className="w-full"
                  size="lg"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Verification Code
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
                  <Badge variant="secondary" className="text-xs">
                    Code sent to {email}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit verification code
                  </p>
                </div>

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
                  className="w-full"
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
                      Verify Code
                    </>
                  )}
                </Button>

                {/* Resend Code */}
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the code?
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
                      Resend Code
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
            Back to Edit Email
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
