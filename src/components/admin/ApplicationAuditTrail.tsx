import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  History, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Eye, 
  FileText, 
  Calculator,
  MessageSquare,
  RefreshCw,
  User
} from 'lucide-react';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  user_id: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

interface ApplicationAuditTrailProps {
  applicationId: string;
}

const ACTION_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  application_approved: { icon: CheckCircle, color: 'text-green-600', label: 'Approved' },
  application_rejected: { icon: XCircle, color: 'text-red-600', label: 'Rejected' },
  application_updated: { icon: Edit, color: 'text-blue-600', label: 'Updated' },
  application_viewed: { icon: Eye, color: 'text-gray-600', label: 'Viewed' },
  application_scored: { icon: Calculator, color: 'text-purple-600', label: 'Scored' },
  document_verified: { icon: FileText, color: 'text-green-600', label: 'Doc Verified' },
  document_rejected: { icon: FileText, color: 'text-red-600', label: 'Doc Rejected' },
  note_added: { icon: MessageSquare, color: 'text-yellow-600', label: 'Note Added' },
  status_changed: { icon: RefreshCw, color: 'text-orange-600', label: 'Status Changed' },
};

export function ApplicationAuditTrail({ applicationId }: ApplicationAuditTrailProps) {
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['application-audit-logs', applicationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('entity_id', applicationId)
        .eq('entity_type', 'university_application')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as AuditLog[];
    },
  });

  const formatAction = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getActionConfig = (action: string) => {
    return ACTION_CONFIG[action] || { icon: History, color: 'text-muted-foreground', label: formatAction(action) };
  };

  const formatChanges = (oldValue: Record<string, unknown> | null, newValue: Record<string, unknown> | null) => {
    if (!oldValue && !newValue) return null;
    
    const changes: { field: string; from: string; to: string }[] = [];
    
    if (newValue) {
      Object.keys(newValue).forEach((key) => {
        const oldVal = oldValue?.[key];
        const newVal = newValue[key];
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          changes.push({
            field: key.replace(/_/g, ' '),
            from: oldVal !== undefined ? String(oldVal) : '-',
            to: String(newVal),
          });
        }
      });
    }
    
    return changes.length > 0 ? changes : null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5" />
          Audit Trail
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!auditLogs || auditLogs.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No audit history for this application yet.
          </p>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border" />
              
              <div className="space-y-6">
                {auditLogs.map((log, index) => {
                  const config = getActionConfig(log.action);
                  const Icon = config.icon;
                  const changes = formatChanges(log.old_value, log.new_value);
                  
                  return (
                    <div key={log.id} className="relative pl-10">
                      {/* Timeline dot */}
                      <div className={`absolute left-2 w-5 h-5 rounded-full bg-background border-2 flex items-center justify-center ${config.color}`}>
                        <Icon className="h-3 w-3" />
                      </div>
                      
                      <div className="bg-muted/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className={config.color}>
                            {config.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                          </span>
                        </div>
                        
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div className="text-sm text-muted-foreground mb-2">
                            {log.metadata.scoring_notes && (
                              <p>Notes: {String(log.metadata.scoring_notes)}</p>
                            )}
                            {log.metadata.rejection_reason && (
                              <p>Reason: {String(log.metadata.rejection_reason)}</p>
                            )}
                          </div>
                        )}
                        
                        {changes && changes.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {changes.slice(0, 3).map((change, i) => (
                              <div key={i} className="text-xs flex items-center gap-2">
                                <span className="text-muted-foreground capitalize">{change.field}:</span>
                                {change.from !== '-' && (
                                  <>
                                    <span className="text-red-600 line-through">{change.from}</span>
                                    <span>→</span>
                                  </>
                                )}
                                <span className="text-green-600">{change.to}</span>
                              </div>
                            ))}
                            {changes.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{changes.length - 3} more changes
                              </span>
                            )}
                          </div>
                        )}
                        
                        {log.ip_address && (
                          <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            IP: {log.ip_address}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
