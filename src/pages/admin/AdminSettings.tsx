import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'EduPlatform',
    supportEmail: 'support@eduplatform.com',
    allowRegistrations: true,
    requireEmailVerification: false,
    enablePayments: true,
    commissionRate: 10,
  });

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
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

      <Button onClick={handleSave} size="lg">
        Save Settings
      </Button>
    </div>
  );
}
