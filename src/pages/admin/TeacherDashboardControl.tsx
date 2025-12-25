import { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  Eye, 
  Ban, 
  CheckCircle,
  MessageSquare,
  FileText,
  Search,
  Filter,
  MoreVertical,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Teacher {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  courses_count: number;
  total_earnings: number;
  is_suspended: boolean;
  created_at: string;
}

export default function TeacherDashboardControl() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teacher_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map to expected format
      const mappedTeachers: Teacher[] = (data || []).map(t => ({
        id: t.id,
        user_id: t.user_id,
        full_name: t.full_name,
        email: t.email,
        status: t.status || 'pending',
        courses_count: 0,
        total_earnings: 0,
        is_suspended: false,
        created_at: t.created_at
      }));

      setTeachers(mappedTeachers);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (teacherId: string) => {
    toast.success('Teacher account suspended');
    setTeachers(teachers.map(t => 
      t.id === teacherId ? { ...t, is_suspended: true } : t
    ));
  };

  const handleReactivate = async (teacherId: string) => {
    toast.success('Teacher account reactivated');
    setTeachers(teachers.map(t => 
      t.id === teacherId ? { ...t, is_suspended: false } : t
    ));
  };

  const filteredTeachers = teachers.filter(t => 
    t.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const approvedTeachers = filteredTeachers.filter(t => t.status === 'approved');
  const pendingTeachers = filteredTeachers.filter(t => t.status === 'pending');

  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    toast.info(`Filtering by: ${status === 'all' ? 'All Teachers' : status}`);
  };

  const displayedTeachers = statusFilter === 'all' 
    ? filteredTeachers 
    : filteredTeachers.filter(t => t.status === statusFilter);

  return (
    <div className="p-6 space-y-6 scroll-smooth">
      <div>
        <h1 className="text-3xl font-bold">Teacher Dashboard Control</h1>
        <p className="text-muted-foreground">Manage and monitor all teacher accounts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{approvedTeachers.length}</p>
                <p className="text-sm text-muted-foreground">Active Teachers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingTeachers.length}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">127</p>
                <p className="text-sm text-muted-foreground">Total Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">$45,230</p>
                <p className="text-sm text-muted-foreground">Teacher Payouts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search teachers..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              {statusFilter === 'all' ? 'Filters' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleFilterChange('all')}>
              All Teachers
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange('approved')}>
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Approved
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange('pending')}>
              <Clock className="w-4 h-4 mr-2 text-yellow-500" />
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange('rejected')}>
              <Ban className="w-4 h-4 mr-2 text-red-500" />
              Rejected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Teachers List */}
      <Card>
        <CardHeader>
          <CardTitle>All Teachers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[500px] overflow-y-auto scroll-smooth">
            {displayedTeachers.map((teacher) => (
              <div 
                key={teacher.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  teacher.is_suspended ? 'bg-destructive/5 border-destructive/20' : 'border-border'
                }`}
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {teacher.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{teacher.full_name}</h3>
                      {teacher.is_suspended && (
                        <Badge variant="destructive">Suspended</Badge>
                      )}
                      <Badge variant={
                        teacher.status === 'approved' ? 'default' :
                        teacher.status === 'pending' ? 'secondary' : 'destructive'
                      }>
                        {teacher.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{teacher.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="font-semibold">{teacher.courses_count}</p>
                    <p className="text-xs text-muted-foreground">Courses</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">${teacher.total_earnings}</p>
                    <p className="text-xs text-muted-foreground">Earnings</p>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        View Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send Message
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BookOpen className="w-4 h-4 mr-2" />
                        View Courses
                      </DropdownMenuItem>
                      {teacher.is_suspended ? (
                        <DropdownMenuItem onClick={() => handleReactivate(teacher.id)}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Reactivate Account
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem 
                          onClick={() => handleSuspend(teacher.id)}
                          className="text-destructive"
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Suspend Account
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}