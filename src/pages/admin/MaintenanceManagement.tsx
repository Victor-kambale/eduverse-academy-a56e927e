import { useState } from 'react';
import {
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Server,
  Shield,
  RefreshCw,
  Trash2,
  Download,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface SystemStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  uptime: string;
  lastChecked: Date;
}

const systemServices: SystemStatus[] = [
  { name: 'API Server', status: 'operational', uptime: '99.98%', lastChecked: new Date() },
  { name: 'Database', status: 'operational', uptime: '99.99%', lastChecked: new Date() },
  { name: 'Storage', status: 'operational', uptime: '99.95%', lastChecked: new Date() },
  { name: 'Authentication', status: 'operational', uptime: '99.99%', lastChecked: new Date() },
  { name: 'Email Service', status: 'operational', uptime: '99.90%', lastChecked: new Date() },
  { name: 'Payment Gateway', status: 'operational', uptime: '99.99%', lastChecked: new Date() },
];

export default function MaintenanceManagement() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [running, setRunning] = useState<string | null>(null);

  const runTask = async (taskName: string, duration: number = 3000) => {
    setRunning(taskName);
    await new Promise(resolve => setTimeout(resolve, duration));
    setRunning(null);
    toast.success(`${taskName} completed successfully`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'down': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Maintenance</h1>
        <p className="text-muted-foreground">Monitor system health and perform maintenance tasks</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{systemServices.filter(s => s.status === 'operational').length}</p>
            <p className="text-sm text-muted-foreground">Services Online</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <Activity className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">99.97%</p>
            <p className="text-sm text-muted-foreground">Overall Uptime</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Server className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">42ms</p>
            <p className="text-sm text-muted-foreground">Avg Response Time</p>
          </CardContent>
        </Card>
        <Card className={`${maintenanceMode ? 'bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/20' : 'bg-gradient-to-br from-gray-500/10 to-gray-600/10 border-gray-500/20'}`}>
          <CardContent className="p-4 text-center">
            <Wrench className={`w-8 h-8 mx-auto mb-2 ${maintenanceMode ? 'text-yellow-500' : 'text-gray-500'}`} />
            <p className="text-2xl font-bold">{maintenanceMode ? 'ON' : 'OFF'}</p>
            <p className="text-sm text-muted-foreground">Maintenance Mode</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Maintenance Mode</CardTitle>
              <CardDescription>Enable to show maintenance page to users</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={maintenanceMode}
                onCheckedChange={(checked) => {
                  setMaintenanceMode(checked);
                  toast.success(checked ? 'Maintenance mode enabled' : 'Maintenance mode disabled');
                }}
              />
              <Label>{maintenanceMode ? 'Enabled' : 'Disabled'}</Label>
            </div>
          </div>
        </CardHeader>
        {maintenanceMode && (
          <CardContent>
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Users will see a maintenance page instead of the application</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <Tabs defaultValue="status">
        <TabsList>
          <TabsTrigger value="status">System Status</TabsTrigger>
          <TabsTrigger value="tasks">Maintenance Tasks</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>Real-time status of all platform services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemServices.map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)}`} />
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">Uptime: {service.uptime}</p>
                      </div>
                    </div>
                    <Badge variant={service.status === 'operational' ? 'default' : 'destructive'}>
                      {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Database Optimization
                </CardTitle>
                <CardDescription>Optimize database tables and indexes</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => runTask('Database Optimization', 4000)}
                  disabled={running !== null}
                  className="w-full"
                >
                  {running === 'Database Optimization' ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Run Optimization
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Clear Cache
                </CardTitle>
                <CardDescription>Clear all application caches</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={() => runTask('Cache Clear', 2000)}
                  disabled={running !== null}
                  className="w-full"
                >
                  {running === 'Cache Clear' ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Clear Cache
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Scan
                </CardTitle>
                <CardDescription>Scan for security vulnerabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="secondary"
                  onClick={() => runTask('Security Scan', 5000)}
                  disabled={running !== null}
                  className="w-full"
                >
                  {running === 'Security Scan' ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4 mr-2" />
                  )}
                  Run Scan
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export System Report
                </CardTitle>
                <CardDescription>Generate comprehensive system report</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={() => runTask('Report Generation', 3000)}
                  disabled={running !== null}
                  className="w-full"
                >
                  {running === 'Report Generation' ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Recent System Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-sm">
                {[
                  { time: '12:45:32', level: 'INFO', message: 'User authentication successful' },
                  { time: '12:44:21', level: 'INFO', message: 'Payment processed successfully' },
                  { time: '12:43:15', level: 'WARN', message: 'Rate limit approaching for IP 192.168.1.100' },
                  { time: '12:42:08', level: 'INFO', message: 'Course enrollment completed' },
                  { time: '12:41:55', level: 'INFO', message: 'Email sent successfully' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center gap-4 p-2 bg-muted rounded">
                    <span className="text-muted-foreground">{log.time}</span>
                    <Badge variant={log.level === 'WARN' ? 'secondary' : 'outline'}>{log.level}</Badge>
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backups">
          <Card>
            <CardHeader>
              <CardTitle>Database Backups</CardTitle>
              <CardDescription>Automatic daily backups are enabled</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { date: 'Today, 03:00 AM', size: '2.4 GB', status: 'completed' },
                  { date: 'Yesterday, 03:00 AM', size: '2.3 GB', status: 'completed' },
                  { date: 'Dec 20, 03:00 AM', size: '2.3 GB', status: 'completed' },
                ].map((backup, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{backup.date}</p>
                      <p className="text-sm text-muted-foreground">Size: {backup.size}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500">Completed</Badge>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
