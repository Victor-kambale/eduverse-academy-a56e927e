import { useEffect, useState } from 'react';
import { Building2, Bell, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface UniversityApplication {
  id: string;
  institution_name: string;
  contact_name: string;
  contact_email: string;
  country: string;
  status: string;
  created_at: string;
}

export function UniversityApplicationsWidget() {
  const [applications, setApplications] = useState<UniversityApplication[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    fetchRecentApplications();

    // Set up real-time subscription for new university applications
    const channel = supabase
      .channel('university-applications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'university_applications',
        },
        (payload) => {
          const newApp = payload.new as UniversityApplication;
          setApplications(prev => [newApp, ...prev].slice(0, 5));
          setNewCount(prev => prev + 1);
          
          // Play notification sound
          const audio = new Audio('/sounds/notification.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {});

          toast.info('🏛️ New University Application', {
            description: `${newApp.institution_name} from ${newApp.country} has submitted an application`,
            duration: 8000,
            action: {
              label: 'View',
              onClick: () => window.location.href = '/admin/university-applications',
            },
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'university_applications',
        },
        (payload) => {
          const updatedApp = payload.new as UniversityApplication;
          setApplications(prev => 
            prev.map(app => app.id === updatedApp.id ? updatedApp : app)
          );
          
          toast.info('📋 Application Updated', {
            description: `${updatedApp.institution_name} status changed to ${updatedApp.status}`,
            duration: 5000,
          });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRecentApplications = async () => {
    const { data, error } = await supabase
      .from('university_applications')
      .select('id, institution_name, contact_name, contact_email, country, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching applications:', error);
      return;
    }

    setApplications(data || []);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20"><Eye className="h-3 w-3 mr-1" />Reviewing</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          University Applications
          {newCount > 0 && (
            <Badge variant="destructive" className="ml-2 animate-pulse">
              {newCount} new
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-muted-foreground">{isConnected ? 'Live' : 'Offline'}</span>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/university-applications">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No applications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {app.institution_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{app.institution_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {app.country} • {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {getStatusBadge(app.status)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
