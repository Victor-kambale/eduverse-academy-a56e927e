import { useState, useEffect } from 'react';
import { 
  Bell, 
  Filter, 
  Trash2, 
  CheckCheck, 
  Clock, 
  AlertCircle,
  Info,
  Search,
  Archive,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string | null;
  category: string | null;
  priority: string | null;
  read: boolean | null;
  is_archived: boolean | null;
  link: string | null;
  user_id: string;
  created_at: string;
}

const NotificationsDashboard = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    fetchNotifications();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('notifications-admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
    if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months ago`;
    return `${Math.floor(seconds / 31536000)} years ago`;
  };

  const handleMarkAsRead = async (ids: string[]) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', ids);

      if (error) throw error;
      toast.success(`Marked ${ids.length} notification(s) as read`);
      fetchNotifications();
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to update notifications');
    }
  };

  const handleArchive = async (ids: string[]) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_archived: true })
        .in('id', ids);

      if (error) throw error;
      toast.success(`Archived ${ids.length} notification(s)`);
      fetchNotifications();
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Error archiving:', error);
      toast.error('Failed to archive notifications');
    }
  };

  const handleDelete = async (ids: string[]) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .in('id', ids);

      if (error) throw error;
      toast.success(`Deleted ${ids.length} notification(s)`);
      fetchNotifications();
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete notifications');
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredNotifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  const getPriorityIcon = (priority: string | null) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'high':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'normal':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityBadge = (priority: string | null) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">High</Badge>;
      case 'normal':
        return <Badge variant="secondary">Normal</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || n.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || n.category === filterCategory;
    return matchesSearch && matchesPriority && matchesCategory && !n.is_archived;
  });

  const unreadCount = notifications.filter(n => !n.read && !n.is_archived).length;
  const categories = [...new Set(notifications.map(n => n.category).filter(Boolean))];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications Dashboard</h1>
            <p className="text-muted-foreground">
              Manage all system notifications ({unreadCount} unread)
            </p>
          </div>
          <Button onClick={fetchNotifications} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{notifications.length}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
          </CardContent>
        </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {notifications.filter(n => n.priority === 'urgent').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Urgent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Archive className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {notifications.filter(n => n.is_archived).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Archived</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat!}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleMarkAsRead(Array.from(selectedIds))}>
                    <CheckCheck className="w-4 h-4 mr-1" />
                    Mark Read
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleArchive(Array.from(selectedIds))}>
                    <Archive className="w-4 h-4 mr-1" />
                    Archive
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(Array.from(selectedIds))}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>All Notifications</CardTitle>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedIds.size === filteredNotifications.length && filteredNotifications.length > 0}
                  onCheckedChange={selectAll}
                />
                <span className="text-sm text-muted-foreground">Select All</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No notifications found</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                        notification.read ? 'bg-muted/30' : 'bg-card'
                      } ${selectedIds.has(notification.id) ? 'border-primary' : 'border-border'}`}
                    >
                      <Checkbox
                        checked={selectedIds.has(notification.id)}
                        onCheckedChange={() => toggleSelect(notification.id)}
                      />
                      <div className="flex-shrink-0">
                        {getPriorityIcon(notification.priority)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`font-medium ${notification.read ? 'text-muted-foreground' : ''}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {getPriorityBadge(notification.priority)}
                          {notification.category && (
                            <Badge variant="outline">{notification.category}</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default NotificationsDashboard;
