import { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Key,
  UserX,
  Globe,
  Activity,
  Ban,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface SecuritySettings {
  twoFactorRequired: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  ipWhitelist: boolean;
  captchaEnabled: boolean;
}

interface SecurityEvent {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  ip: string;
  timestamp: Date;
}

export default function SecurityManagement() {
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorRequired: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    ipWhitelist: false,
    captchaEnabled: true,
  });

  const [securityEvents] = useState<SecurityEvent[]>([
    { id: '1', type: 'Failed Login', severity: 'low', message: 'Multiple failed login attempts', ip: '192.168.1.100', timestamp: new Date() },
    { id: '2', type: 'Suspicious Activity', severity: 'medium', message: 'Unusual API access pattern detected', ip: '10.0.0.50', timestamp: new Date(Date.now() - 3600000) },
    { id: '3', type: 'Password Reset', severity: 'low', message: 'Password reset requested', ip: '172.16.0.25', timestamp: new Date(Date.now() - 7200000) },
  ]);

  const [blockedIPs] = useState<string[]>(['192.168.1.100', '10.0.0.99', '172.16.0.1']);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const updateSetting = (key: keyof SecuritySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success('Security setting updated');
  };

  const handleUnblockIP = (ip: string) => {
    toast.success(`IP ${ip} has been unblocked`);
  };

  const handleBlockIP = (ip: string) => {
    if (!ip) {
      toast.error('Please enter an IP address');
      return;
    }
    toast.success(`IP ${ip} has been blocked`);
  };

  const [newIPToBlock, setNewIPToBlock] = useState('');

  return (
    <div className="p-6 space-y-6 scroll-smooth">
      <div>
        <h1 className="text-3xl font-bold">Security Dashboard</h1>
        <p className="text-muted-foreground">Monitor and manage platform security</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <CardContent className="p-4 text-center">
            <Shield className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">Secure</p>
            <p className="text-sm text-muted-foreground">System Status</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">{securityEvents.length}</p>
            <p className="text-sm text-muted-foreground">Security Events</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/20">
          <CardContent className="p-4 text-center">
            <Ban className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <p className="text-2xl font-bold">{blockedIPs.length}</p>
            <p className="text-sm text-muted-foreground">Blocked IPs</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <Activity className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">Active</p>
            <p className="text-sm text-muted-foreground">Monitoring</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
          <TabsTrigger value="blocked">Blocked IPs</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Settings</CardTitle>
              <CardDescription>Configure authentication security options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-h-[500px] overflow-y-auto scroll-smooth">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Require Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Require 2FA for all admin users</p>
                </div>
                <Switch
                  checked={settings.twoFactorRequired}
                  onCheckedChange={(v) => updateSetting('twoFactorRequired', v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">CAPTCHA Protection</Label>
                  <p className="text-sm text-muted-foreground">Enable CAPTCHA on login forms</p>
                </div>
                <Switch
                  checked={settings.captchaEnabled}
                  onCheckedChange={(v) => updateSetting('captchaEnabled', v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Session Timeout (minutes)</Label>
                  <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
                </div>
                <Input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                  className="w-24"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Maximum Login Attempts</Label>
                  <p className="text-sm text-muted-foreground">Before account lockout</p>
                </div>
                <Input
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
                  className="w-24"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Minimum Password Length</Label>
                  <p className="text-sm text-muted-foreground">Required for all passwords</p>
                </div>
                <Input
                  type="number"
                  value={settings.passwordMinLength}
                  onChange={(e) => updateSetting('passwordMinLength', parseInt(e.target.value))}
                  className="w-24"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>Monitor suspicious activity and security alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[400px] overflow-y-auto scroll-smooth">
                {securityEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <AlertTriangle className={`w-5 h-5 ${event.severity === 'high' || event.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'}`} />
                      <div>
                        <p className="font-medium">{event.type}</p>
                        <p className="text-sm text-muted-foreground">{event.message}</p>
                        <p className="text-xs text-muted-foreground">IP: {event.ip}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getSeverityColor(event.severity)}>{event.severity.toUpperCase()}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{event.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle>Access Control</CardTitle>
              <CardDescription>Manage role-based access permissions</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto scroll-smooth">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Dashboard Access</TableHead>
                    <TableHead>User Management</TableHead>
                    <TableHead>Content Management</TableHead>
                    <TableHead>Financial Access</TableHead>
                    <TableHead>System Settings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { role: 'Admin', permissions: [true, true, true, true, true] },
                    { role: 'Instructor', permissions: [true, false, true, false, false] },
                    { role: 'User', permissions: [true, false, false, false, false] },
                  ].map((item) => (
                    <TableRow key={item.role}>
                      <TableCell className="font-medium">{item.role}</TableCell>
                      {item.permissions.map((perm, i) => (
                        <TableCell key={i}>
                          {perm ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Lock className="w-5 h-5 text-muted-foreground" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blocked">
          <Card>
            <CardHeader>
              <CardTitle>Blocked IP Addresses</CardTitle>
              <CardDescription>IPs blocked due to suspicious activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[300px] overflow-y-auto scroll-smooth">
                {blockedIPs.map((ip) => (
                  <div key={ip} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <Ban className="w-4 h-4 text-red-500" />
                      <code>{ip}</code>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUnblockIP(ip)}
                    >
                      Unblock
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Input 
                  placeholder="Enter IP address to block..." 
                  value={newIPToBlock}
                  onChange={(e) => setNewIPToBlock(e.target.value)}
                />
                <Button onClick={() => {
                  handleBlockIP(newIPToBlock);
                  setNewIPToBlock('');
                }}>Block IP</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
