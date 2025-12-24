import { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  Shield, 
  User, 
  Key,
  Eye,
  Bell,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  user_id: string | null;
  created_at: string;
  metadata: any;
  ip_address: string | null;
}

const suspiciousActions = [
  'failed_login',
  'role_changed_to_admin',
  'multiple_failed_logins',
  'access_denied',
  'unauthorized_access',
  '2fa_disabled',
];

const getActionIcon = (action: string) => {
  if (action.includes('login')) return User;
  if (action.includes('role')) return Shield;
  if (action.includes('2fa')) return Key;
  if (action.includes('access')) return Eye;
  return Activity;
};

const getActionColor = (action: string, entityType: string) => {
  if (suspiciousActions.includes(action)) return 'destructive';
  if (action.includes('create') || action.includes('enable')) return 'default';
  if (action.includes('delete') || action.includes('disable')) return 'secondary';
  return 'outline';
};

export function AuditLogWidget() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    fetchLogs();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('audit-logs-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs',
        },
        (payload) => {
          const newLog = payload.new as AuditLog;
          setLogs(prev => [newLog, ...prev].slice(0, 10));
          
          // Check for suspicious activity
          if (suspiciousActions.includes(newLog.action)) {
            setAlertCount(prev => prev + 1);
            toast.error(`Suspicious activity detected: ${newLog.action}`, {
              icon: <AlertTriangle className="h-4 w-4" />,
              duration: 10000,
            });
            
            // Play alert sound
            const audio = new Audio('/sounds/warning.mp3');
            audio.volume = 0.5;
            audio.play().catch(() => {});
          } else {
            toast.info(`Audit: ${newLog.action}`, {
              icon: <Activity className="h-4 w-4" />,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setLogs(data || []);
      
      // Count suspicious activities
      const suspicious = (data || []).filter(log => 
        suspiciousActions.includes(log.action)
      ).length;
      setAlertCount(suspicious);
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAction = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Audit Log
            {alertCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {alertCount} Alert{alertCount > 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          <Link to="/admin/audit-logs">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {alertCount > 0 && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-semibold">Security Alerts Detected</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {alertCount} suspicious activit{alertCount > 1 ? 'ies' : 'y'} detected in recent logs. Review immediately.
            </p>
          </div>
        )}

        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            ) : (
              logs.map((log) => {
                const ActionIcon = getActionIcon(log.action);
                const isSuspicious = suspiciousActions.includes(log.action);
                
                return (
                  <div 
                    key={log.id} 
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                      isSuspicious 
                        ? 'bg-destructive/5 border border-destructive/20' 
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      isSuspicious ? 'bg-destructive/20' : 'bg-primary/10'
                    }`}>
                      <ActionIcon className={`h-4 w-4 ${
                        isSuspicious ? 'text-destructive' : 'text-primary'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">
                          {formatAction(log.action)}
                        </span>
                        <Badge variant={getActionColor(log.action, log.entity_type)} className="text-xs">
                          {log.entity_type}
                        </Badge>
                        {isSuspicious && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Alert
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</span>
                        {log.ip_address && (
                          <>
                            <span>•</span>
                            <span>IP: {log.ip_address}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Stats Summary */}
        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{logs.length}</div>
            <div className="text-xs text-muted-foreground">Recent Events</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-destructive">{alertCount}</div>
            <div className="text-xs text-muted-foreground">Alerts</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-500">
              {logs.filter(l => l.action.includes('login') && !l.action.includes('failed')).length}
            </div>
            <div className="text-xs text-muted-foreground">Logins</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}