import { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  BookOpen,
  DollarSign,
  BarChart3,
  Wallet,
  Bell,
  Settings,
  Plus,
  GraduationCap,
  Clock,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { WithdrawalForm } from '@/components/withdrawal/WithdrawalForm';
import { TransactionHistory } from '@/components/withdrawal/TransactionHistory';
import { InstructorInvitation } from '@/components/university/InstructorInvitation';
import { BulkCourseImport } from '@/components/university/BulkCourseImport';
import { toast } from 'sonner';

interface Instructor {
  id: string;
  name: string;
  email: string;
  courses: number;
  earnings: number;
  status: string;
}

interface Course {
  id: string;
  title: string;
  instructor_name: string;
  enrollments: number;
  revenue: number;
  status: string;
  is_published: boolean;
  price: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export default function UniversityDashboard() {
  const { user } = useAuth();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [stats, setStats] = useState({
    totalInstructors: 0,
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    unreadNotifications: 0,
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    enrollmentAlerts: true,
    paymentAlerts: true,
    courseApprovalAlerts: true,
    autoPublishCourses: false,
  });

  useEffect(() => {
    fetchData();
    fetchNotifications();
    setupRealtimeSubscription();
  }, [user?.id]);

  const setupRealtimeSubscription = () => {
    if (!user?.id) return;

    const channel = supabase
      .channel('university-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'enrollments',
        },
        (payload) => {
          toast.success('New student enrolled!');
          fetchData();
          
          const audio = new Audio('/sounds/notification.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {});
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchData = async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      // Fetch courses
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*, enrollments(count)')
        .eq('instructor_id', user.id);

      if (coursesData) {
        const formattedCourses = coursesData.map((c) => ({
          id: c.id,
          title: c.title,
          instructor_name: c.instructor_name || 'Organization',
          enrollments: (c.enrollments as any)?.[0]?.count || 0,
          revenue: (c.price || 0) * ((c.enrollments as any)?.[0]?.count || 0) * 0.8,
          status: c.is_published ? 'Published' : 'Draft',
          is_published: c.is_published || false,
          price: c.price || 0,
        }));
        setCourses(formattedCourses);

        const totalStudents = formattedCourses.reduce((sum, c) => sum + c.enrollments, 0);
        const totalRevenue = formattedCourses.reduce((sum, c) => sum + c.revenue, 0);

        setStats(prev => ({
          ...prev,
          totalInstructors: instructors.length,
          totalCourses: formattedCourses.length,
          totalStudents,
          totalRevenue,
        }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    if (!user?.id) return;

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setNotifications(data);
      setStats(prev => ({
        ...prev,
        unreadNotifications: data.filter(n => !n.read).length,
      }));
    }
  };

  const markNotificationAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    
    fetchNotifications();
  };

  const deleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) {
      toast.error('Failed to delete course');
    } else {
      toast.success('Course deleted successfully');
      fetchData();
    }
  };

  const toggleCourseStatus = async (courseId: string, isPublished: boolean) => {
    const { error } = await supabase
      .from('courses')
      .update({ is_published: !isPublished })
      .eq('id', courseId);

    if (error) {
      toast.error('Failed to update course status');
    } else {
      toast.success(`Course ${isPublished ? 'unpublished' : 'published'} successfully`);
      fetchData();
    }
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.instructor_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const saveSettings = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <Layout>
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="container py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Building2 className="h-8 w-8 text-accent" />
                University Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage your organization's courses and instructors
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchData}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{stats.totalInstructors}</p>
                    <p className="text-xs text-muted-foreground">Instructors</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{stats.totalCourses}</p>
                    <p className="text-xs text-muted-foreground">Courses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{stats.totalStudents}</p>
                    <p className="text-xs text-muted-foreground">Students</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">${stats.totalRevenue.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{stats.pendingApprovals}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{stats.unreadNotifications}</p>
                    <p className="text-xs text-muted-foreground">Unread</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="courses">
            <TabsList className="mb-6 flex-wrap">
              <TabsTrigger value="courses" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Courses
              </TabsTrigger>
              <TabsTrigger value="instructors" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Instructors
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
                {stats.unreadNotifications > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                    {stats.unreadNotifications}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="withdrawals" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Withdrawals
              </TabsTrigger>
              <TabsTrigger value="bulk-import" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Bulk Import
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="courses">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>Organization Courses</CardTitle>
                      <CardDescription>
                        All courses created under your organization
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search courses..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 w-64"
                        />
                      </div>
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : filteredCourses.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No courses yet. Create your first course!
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course</TableHead>
                          <TableHead>Instructor</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Students</TableHead>
                          <TableHead>Revenue</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCourses.map((course) => (
                          <TableRow key={course.id}>
                            <TableCell className="font-medium">{course.title}</TableCell>
                            <TableCell>{course.instructor_name}</TableCell>
                            <TableCell>${course.price}</TableCell>
                            <TableCell>{course.enrollments}</TableCell>
                            <TableCell>${course.revenue.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant={course.is_published ? 'default' : 'secondary'}>
                                {course.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => toggleCourseStatus(course.id, course.is_published)}>
                                    {course.is_published ? (
                                      <>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Unpublish
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Publish
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => deleteCourse(course.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="instructors">
              <div className="space-y-6">
                <InstructorInvitation 
                  universityId={user?.id || ''} 
                  universityName="Your University" 
                />
                
                <Card>
                  <CardHeader>
                    <CardTitle>Team Instructors</CardTitle>
                    <CardDescription>
                      Instructors who have joined your organization
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {instructors.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No instructors yet. Send invitations to grow your team!
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Courses</TableHead>
                            <TableHead>Earnings</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {instructors.map((instructor) => (
                            <TableRow key={instructor.id}>
                              <TableCell className="font-medium">{instructor.name}</TableCell>
                              <TableCell>{instructor.email}</TableCell>
                              <TableCell>{instructor.courses}</TableCell>
                              <TableCell>${instructor.earnings.toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{instructor.status}</Badge>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      Message
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Remove
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Notifications</CardTitle>
                      <CardDescription>
                        Stay updated with enrollments, payments, and more
                      </CardDescription>
                    </div>
                    <Button variant="outline" onClick={fetchNotifications}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No notifications yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`p-4 rounded-lg border ${
                            notification.read ? 'bg-muted/50' : 'bg-accent/5 border-accent/20'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{notification.title}</h4>
                                {!notification.read && (
                                  <Badge variant="default" className="text-xs">New</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(notification.created_at).toLocaleString()}
                              </p>
                            </div>
                            {!notification.read && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => markNotificationAsRead(notification.id)}
                              >
                                Mark as read
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="withdrawals">
              <div className="grid gap-6">
                <WithdrawalForm userType="university" />
                <TransactionHistory />
              </div>
            </TabsContent>

            <TabsContent value="bulk-import">
              <BulkCourseImport universityId={user?.id || ''} />
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Settings</CardTitle>
                  <CardDescription>
                    Configure your notification and dashboard preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Notification Preferences</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive updates via email</p>
                        </div>
                        <Switch
                          checked={settings.emailNotifications}
                          onCheckedChange={(v) => setSettings(prev => ({ ...prev, emailNotifications: v }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>SMS Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive updates via SMS</p>
                        </div>
                        <Switch
                          checked={settings.smsNotifications}
                          onCheckedChange={(v) => setSettings(prev => ({ ...prev, smsNotifications: v }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enrollment Alerts</Label>
                          <p className="text-sm text-muted-foreground">Get notified when students enroll</p>
                        </div>
                        <Switch
                          checked={settings.enrollmentAlerts}
                          onCheckedChange={(v) => setSettings(prev => ({ ...prev, enrollmentAlerts: v }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Payment Alerts</Label>
                          <p className="text-sm text-muted-foreground">Get notified on payments received</p>
                        </div>
                        <Switch
                          checked={settings.paymentAlerts}
                          onCheckedChange={(v) => setSettings(prev => ({ ...prev, paymentAlerts: v }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Course Approval Alerts</Label>
                          <p className="text-sm text-muted-foreground">Get notified on course approvals</p>
                        </div>
                        <Switch
                          checked={settings.courseApprovalAlerts}
                          onCheckedChange={(v) => setSettings(prev => ({ ...prev, courseApprovalAlerts: v }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Course Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-Publish Courses</Label>
                          <p className="text-sm text-muted-foreground">Automatically publish new courses</p>
                        </div>
                        <Switch
                          checked={settings.autoPublishCourses}
                          onCheckedChange={(v) => setSettings(prev => ({ ...prev, autoPublishCourses: v }))}
                        />
                      </div>
                    </div>
                  </div>

                  <Button onClick={saveSettings}>Save Settings</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </Layout>
  );
}
