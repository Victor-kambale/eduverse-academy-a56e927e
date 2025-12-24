import { useState, useEffect } from 'react';
import { 
  Shield, 
  Key, 
  QrCode, 
  Copy, 
  Check,
  AlertTriangle,
  RefreshCw,
  Smartphone,
  Lock,
  Unlock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import * as OTPAuth from 'otpauth';

interface TwoFASettings {
  id: string;
  user_id: string;
  totp_secret: string;
  is_enabled: boolean;
  backup_codes: string[] | null;
  created_at: string;
}

export default function Admin2FASettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<TwoFASettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [tempSecret, setTempSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [disabling, setDisabling] = useState(false);

  useEffect(() => {
    if (user) {
      fetch2FASettings();
    }
  }, [user]);

  const fetch2FASettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_2fa')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      setSettings(data);
    } catch (error: any) {
      console.error('Error fetching 2FA settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSecret = () => {
    const totp = new OTPAuth.TOTP({
      issuer: 'Eduverse Academy',
      label: user?.email || 'Admin',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromHex(
        Array.from(crypto.getRandomValues(new Uint8Array(20)))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
      ),
    });
    
    return {
      secret: totp.secret.base32,
      uri: totp.toString(),
    };
  };

  const generateBackupCodes = () => {
    return Array.from({ length: 10 }, () => 
      Array.from(crypto.getRandomValues(new Uint8Array(4)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()
    );
  };

  const handleStartSetup = () => {
    const { secret } = generateSecret();
    setTempSecret(secret);
    setBackupCodes(generateBackupCodes());
    setSetupStep(1);
    setVerificationCode('');
    setShowSetupDialog(true);
  };

  const handleVerifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setVerifying(true);
    try {
      // Verify the TOTP code
      const totp = new OTPAuth.TOTP({
        issuer: 'Eduverse Academy',
        label: user?.email || 'Admin',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(tempSecret),
      });

      const isValid = totp.validate({ token: verificationCode, window: 1 }) !== null;
      
      if (!isValid) {
        toast.error('Invalid verification code. Please try again.');
        setVerifying(false);
        return;
      }

      // Save to database
      const { error } = await supabase
        .from('admin_2fa')
        .upsert({
          user_id: user?.id,
          totp_secret: tempSecret,
          is_enabled: true,
          backup_codes: backupCodes,
        });

      if (error) throw error;

      // Log audit
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: '2fa_enabled',
        entity_type: 'admin_2fa',
        metadata: { enabled_at: new Date().toISOString() },
      });

      toast.success('Two-factor authentication enabled successfully!');
      setSetupStep(3);
      fetch2FASettings();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!disableCode || disableCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setDisabling(true);
    try {
      // Verify the TOTP code
      const totp = new OTPAuth.TOTP({
        issuer: 'Eduverse Academy',
        label: user?.email || 'Admin',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(settings?.totp_secret || ''),
      });

      const isValid = totp.validate({ token: disableCode, window: 1 }) !== null;
      
      if (!isValid) {
        toast.error('Invalid verification code');
        setDisabling(false);
        return;
      }

      const { error } = await supabase
        .from('admin_2fa')
        .update({ is_enabled: false })
        .eq('user_id', user?.id);

      if (error) throw error;

      // Log audit
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: '2fa_disabled',
        entity_type: 'admin_2fa',
        metadata: { disabled_at: new Date().toISOString() },
      });

      toast.success('Two-factor authentication disabled');
      setDisableCode('');
      fetch2FASettings();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setDisabling(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  const getQRCodeUrl = () => {
    const uri = `otpauth://totp/Eduverse%20Academy:${encodeURIComponent(user?.email || 'Admin')}?secret=${tempSecret}&issuer=Eduverse%20Academy&algorithm=SHA1&digits=6&period=30`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uri)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Two-Factor Authentication</h1>
        <p className="text-muted-foreground">Enhance your account security with TOTP-based 2FA</p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${settings?.is_enabled ? 'bg-green-500/20' : 'bg-amber-500/20'}`}>
                <Shield className={`h-6 w-6 ${settings?.is_enabled ? 'text-green-500' : 'text-amber-500'}`} />
              </div>
              <div>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  {settings?.is_enabled 
                    ? 'Your account is protected with 2FA' 
                    : 'Add an extra layer of security to your account'}
                </CardDescription>
              </div>
            </div>
            <Badge variant={settings?.is_enabled ? 'default' : 'secondary'}>
              {settings?.is_enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {!settings?.is_enabled ? (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Two-factor authentication is recommended for all admin accounts. It protects your account even if your password is compromised.
                </AlertDescription>
              </Alert>
              <Button onClick={handleStartSetup}>
                <Key className="h-4 w-4 mr-2" />
                Enable 2FA
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Check className="h-5 w-5" />
                <span>Two-factor authentication is active</span>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <Label>Enter your 2FA code to disable</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="max-w-[200px] font-mono text-center text-lg tracking-widest"
                  />
                  <Button 
                    variant="destructive" 
                    onClick={handleDisable2FA}
                    disabled={disabling || disableCode.length !== 6}
                  >
                    <Unlock className="h-4 w-4 mr-2" />
                    {disabling ? 'Verifying...' : 'Disable 2FA'}
                  </Button>
                </div>
              </div>

              {settings.backup_codes && settings.backup_codes.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Backup Codes</Label>
                      <Button variant="outline" size="sm" onClick={handleStartSetup}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Store these codes safely. Each can be used once if you lose access to your authenticator app.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {settings.backup_codes.map((code, i) => (
                        <code key={i} className="bg-muted px-2 py-1 rounded text-sm font-mono text-center">
                          {code}
                        </code>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle>How Two-Factor Authentication Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">1. Authenticator App</h3>
              <p className="text-sm text-muted-foreground">
                Install an authenticator app like Google Authenticator or Authy on your phone
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">2. Scan QR Code</h3>
              <p className="text-sm text-muted-foreground">
                Scan the QR code with your app to link your account
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">3. Enter Codes</h3>
              <p className="text-sm text-muted-foreground">
                Enter the time-based code from your app when logging in
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Step {setupStep} of 3
            </DialogDescription>
          </DialogHeader>

          {setupStep === 1 && (
            <div className="space-y-4">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Scan this QR code with your authenticator app
                </p>
                <div className="flex justify-center">
                  <img
                    src={getQRCodeUrl()}
                    alt="QR Code for 2FA"
                    className="w-48 h-48 border rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Or enter this code manually:</p>
                  <div className="flex items-center gap-2 justify-center">
                    <code className="bg-muted px-3 py-2 rounded font-mono text-sm break-all">
                      {tempSecret}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(tempSecret)}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <Button className="w-full" onClick={() => setSetupStep(2)}>
                Continue
              </Button>
            </div>
          )}

          {setupStep === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code from your authenticator app to verify setup
              </p>
              <div className="space-y-2">
                <Label>Verification Code</Label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setSetupStep(1)}>
                  Back
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleVerifyAndEnable}
                  disabled={verifying || verificationCode.length !== 6}
                >
                  {verifying ? 'Verifying...' : 'Verify & Enable'}
                </Button>
              </div>
            </div>
          )}

          {setupStep === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold">2FA Enabled Successfully!</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Save these backup codes in a safe place. You can use them if you lose access to your authenticator app.
                </p>
              </div>
              
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Backup Codes</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(backupCodes.join('\n'))}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy All
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, i) => (
                    <code key={i} className="bg-background px-2 py-1 rounded text-sm font-mono text-center">
                      {code}
                    </code>
                  ))}
                </div>
              </div>

              <Button className="w-full" onClick={() => setShowSetupDialog(false)}>
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}