import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  Search, 
  RefreshCw,
  Eye,
  Clock,
  User,
  Activity,
  Filter,
  Download,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_value: any;
  new_value: any;
  ip_address: string | null;
  user_agent: string | null;
  metadata: any;
  created_at: string;
}

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');

  useEffect(() => {
    fetchLogs();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('audit-logs-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs'
        },
        (payload) => {
          setLogs(prev => [payload.new as AuditLog, ...prev]);
          toast.info('New audit log entry', {
            description: (payload.new as AuditLog).action
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      setLogs(data || []);
      toast.success('Logs refreshed successfully');
    } catch (error: any) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const actionColors: Record<string, string> = {
      'role_assigned': 'bg-green-500',
      'role_removed': 'bg-red-500',
      'login': 'bg-blue-500',
      'logout': 'bg-gray-500',
      'payment_completed': 'bg-emerald-500',
      'access_denied': 'bg-red-600',
      'access_granted': 'bg-green-600',
      'profile_updated': 'bg-purple-500',
      'course_created': 'bg-cyan-500',
      'course_updated': 'bg-cyan-600',
      'withdrawal_requested': 'bg-orange-500',
      'default': 'bg-primary'
    };

    const color = actionColors[action] || actionColors.default;
    return <Badge className={color}>{action.replace(/_/g, ' ')}</Badge>;
  };

  const getEntityBadge = (entityType: string) => {
    const colors: Record<string, string> = {
      'user_roles': 'border-purple-500 text-purple-500',
      'users': 'border-blue-500 text-blue-500',
      'payments': 'border-green-500 text-green-500',
      'courses': 'border-cyan-500 text-cyan-500',
      'withdrawals': 'border-orange-500 text-orange-500',
      'default': 'border-muted-foreground text-muted-foreground'
    };

    const color = colors[entityType] || colors.default;
    return <Badge variant="outline" className={color}>{entityType}</Badge>;
  };

  const exportLogs = () => {
    const csvContent = [
      ['ID', 'User ID', 'Action', 'Entity Type', 'Entity ID', 'Created At'].join(','),
      ...logs.map(log => [
        log.id,
        log.user_id,
        log.action,
        log.entity_type,
        log.entity_id || '',
        log.created_at
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('Audit logs exported');
  };

  const uniqueActions = [...new Set(logs.map(l => l.action))];
  const uniqueEntities = [...new Set(logs.map(l => l.entity_type))];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.user_id && log.user_id.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesEntity = entityFilter === 'all' || log.entity_type === entityFilter;

    return matchesSearch && matchesAction && matchesEntity;
  });

  const stats = {
    total: logs.length,
    today: logs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length,
    roleChanges: logs.filter(l => l.action.includes('role')).length,
    accessEvents: logs.filter(l => l.action.includes('access')).length
  };

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Audit Logs</h1>
            <p className="text-muted-foreground">Security monitoring and activity tracking</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportLogs}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={fetchLogs}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Logs</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <Activity className="w-10 h-10 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today</p>
                  <p className="text-3xl font-bold text-blue-500">{stats.today}</p>
                </div>
                <Clock className="w-10 h-10 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Role Changes</p>
                  <p className="text-3xl font-bold text-purple-500">{stats.roleChanges}</p>
                </div>
                <Shield className="w-10 h-10 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Access Events</p>
                  <p className="text-3xl font-bold text-orange-500">{stats.accessEvents}</p>
                </div>
                <Eye className="w-10 h-10 text-orange-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActions.map(action => (
                    <SelectItem key={action} value={action}>
                      {action.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {uniqueEntities.map(entity => (
                    <SelectItem key={entity} value={entity}>
                      {entity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activity Log
            </CardTitle>
            <CardDescription>
              Showing {filteredLogs.length} of {logs.length} entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                <p>No audit logs found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>{getEntityBadge(log.entity_type)}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.user_id ? log.user_id.slice(0, 8) + '...' : 'System'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground text-sm">
                        {log.new_value && JSON.stringify(log.new_value)}
                        {log.old_value && ` (was: ${JSON.stringify(log.old_value)})`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

export default AuditLogs;
