import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  CreditCard, 
  Smartphone, 
  Building, 
  Users,
  GraduationCap,
  Save,
  RefreshCw,
  Check,
} from 'lucide-react';

// Payment methods configuration
const paymentMethods = [
  { id: 'stripe', name: 'Stripe', icon: CreditCard },
  { id: 'paypal', name: 'PayPal', icon: CreditCard },
  { id: 'google_pay', name: 'Google Pay', icon: CreditCard },
  { id: 'apple_pay', name: 'Apple Pay', icon: CreditCard },
  { id: 'wechat_pay', name: 'WeChat Pay', icon: CreditCard },
  { id: 'alipay', name: 'Alipay', icon: CreditCard },
  { id: 'visa_direct', name: 'Visa Direct', icon: CreditCard },
  { id: 'amex', name: 'American Express', icon: CreditCard },
  { id: 'cash_app', name: 'Cash App', icon: CreditCard },
  { id: 'payoneer', name: 'Payoneer', icon: CreditCard },
  { id: 'mobile_money', name: 'Mobile Money', icon: Smartphone },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'EduPlatform',
    supportEmail: 'support@eduplatform.com',
    allowRegistrations: true,
    requireEmailVerification: false,
    enablePayments: true,
    commissionRate: 10,
  });

  const [paymentSettings, setPaymentSettings] = useState<{
    [key: string]: {
      enabledForStudents: boolean;
      enabledForTeachers: boolean;
      enabledForUniversities: boolean;
    };
  }>({});

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Initialize payment settings
  useEffect(() => {
    const initialPaymentSettings: typeof paymentSettings = {};
    paymentMethods.forEach(method => {
      initialPaymentSettings[method.id] = {
        enabledForStudents: true,
        enabledForTeachers: true,
        enabledForUniversities: true,
      };
    });
    // Mobile money disabled by default for students
    initialPaymentSettings.mobile_money = {
      enabledForStudents: false,
      enabledForTeachers: true,
      enabledForUniversities: true,
    };
    setPaymentSettings(initialPaymentSettings);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSaving(false);
    setSaved(true);
    toast.success('Settings saved successfully!');
    
    // Reset saved state after animation
    setTimeout(() => setSaved(false), 2000);
  };

  const togglePaymentMethod = (
    methodId: string, 
    userType: 'enabledForStudents' | 'enabledForTeachers' | 'enabledForUniversities'
  ) => {
    setPaymentSettings(prev => ({
      ...prev,
      [methodId]: {
        ...prev[methodId],
        [userType]: !prev[methodId]?.[userType],
      },
    }));
  };

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="p-6 space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your platform settings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic platform configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Settings</CardTitle>
            <CardDescription>Control user registration and authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Registrations</Label>
                <p className="text-sm text-muted-foreground">
                  Allow new users to register on the platform
                </p>
              </div>
              <Switch
                checked={settings.allowRegistrations}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, allowRegistrations: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Email Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Users must verify their email before accessing the platform
                </p>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, requireEmailVerification: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
            <CardDescription>Configure payment and revenue options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Payments</Label>
                <p className="text-sm text-muted-foreground">
                  Allow course purchases on the platform
                </p>
              </div>
              <Switch
                checked={settings.enablePayments}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enablePayments: checked })
                }
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="commission">Platform Commission Rate (%)</Label>
              <Input
                id="commission"
                type="number"
                min="0"
                max="100"
                value={settings.commissionRate}
                onChange={(e) =>
                  setSettings({ ...settings, commissionRate: parseInt(e.target.value) })
                }
                className="max-w-[100px]"
              />
              <p className="text-sm text-muted-foreground">
                Percentage taken from each course sale
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods Control
            </CardTitle>
            <CardDescription>
              Enable or disable payment methods for different user types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 mb-4">
              <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground">
                <div>Payment Method</div>
                <div className="flex items-center gap-1 justify-center">
                  <GraduationCap className="h-4 w-4" />
                  Students
                </div>
                <div className="flex items-center gap-1 justify-center">
                  <Users className="h-4 w-4" />
                  Teachers
                </div>
                <div className="flex items-center gap-1 justify-center">
                  <Building className="h-4 w-4" />
                  Universities
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const MethodIcon = method.icon;
                const methodSetting = paymentSettings[method.id];
                
                return (
                  <div 
                    key={method.id} 
                    className="grid grid-cols-4 gap-4 items-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MethodIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{method.name}</span>
                    </div>
                    <div className="flex justify-center">
                      <Switch
                        checked={methodSetting?.enabledForStudents ?? true}
                        onCheckedChange={() => togglePaymentMethod(method.id, 'enabledForStudents')}
                      />
                    </div>
                    <div className="flex justify-center">
                      <Switch
                        checked={methodSetting?.enabledForTeachers ?? true}
                        onCheckedChange={() => togglePaymentMethod(method.id, 'enabledForTeachers')}
                      />
                    </div>
                    <div className="flex justify-center">
                      <Switch
                        checked={methodSetting?.enabledForUniversities ?? true}
                        onCheckedChange={() => togglePaymentMethod(method.id, 'enabledForUniversities')}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-sm text-amber-600">
                <strong>Note:</strong> When a payment method is disabled, users will see 
                "Not available at the moment" message below that option.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="sticky bottom-0 bg-background border-t pt-4 pb-6">
          <Button 
            onClick={handleSave} 
            size="lg" 
            className="w-full sm:w-auto"
            disabled={saving}
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Saved Successfully!
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}
