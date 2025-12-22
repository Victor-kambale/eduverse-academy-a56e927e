import { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  TrendingUp, 
  GraduationCap, 
  Building2, 
  Award, 
  CreditCard,
  Eye,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const revenueData = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 5000 },
  { name: 'Apr', revenue: 4500 },
  { name: 'May', revenue: 6000 },
  { name: 'Jun', revenue: 5500 },
];

const enrollmentData = [
  { name: 'Mon', enrollments: 12 },
  { name: 'Tue', enrollments: 19 },
  { name: 'Wed', enrollments: 15 },
  { name: 'Thu', enrollments: 22 },
  { name: 'Fri', enrollments: 18 },
  { name: 'Sat', enrollments: 25 },
  { name: 'Sun', enrollments: 20 },
];

const COLORS = ['hsl(262, 80%, 50%)', 'hsl(330, 80%, 60%)', 'hsl(45, 80%, 50%)', 'hsl(180, 60%, 45%)'];

interface DashboardSection {
  id: string;
  title: string;
  description: string;
  icon: any;
  link: string;
  color: string;
}

const backendDashboards: DashboardSection[] = [
  { id: 'courses', title: 'Courses', description: 'Manage all courses', icon: BookOpen, link: '/admin/courses', color: 'from-purple-500 to-purple-700' },
  { id: 'users', title: 'Users', description: 'User management', icon: Users, link: '/admin/users', color: 'from-pink-500 to-pink-700' },
  { id: 'withdrawals', title: 'Withdrawals', description: 'Handle payouts', icon: DollarSign, link: '/admin/withdrawals', color: 'from-amber-500 to-orange-600' },
  { id: 'approvals', title: 'Approvals', description: 'Content approvals', icon: Eye, link: '/admin/content-approvals', color: 'from-cyan-500 to-cyan-700' },
];

const frontendDashboards: DashboardSection[] = [
  { id: 'promos', title: 'Promos', description: 'Promotional banners', icon: TrendingUp, link: '/admin/promos', color: 'from-emerald-500 to-emerald-700' },
  { id: 'footer', title: 'Footer Links', description: 'Manage footer', icon: Eye, link: '/admin/footer-links', color: 'from-blue-500 to-blue-700' },
  { id: 'languages', title: 'Languages', description: 'Translation settings', icon: Eye, link: '/admin/languages', color: 'from-violet-500 to-violet-700' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalUsers: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    totalTeachers: 0,
    totalUniversities: 0,
    totalCertificates: 0,
    pendingWithdrawals: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchStats = async () => {
      const [coursesRes, profilesRes, enrollmentsRes, teachersRes, certificatesRes, withdrawalsRes] = await Promise.all([
        supabase.from('courses').select('id, price', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('enrollments').select('id', { count: 'exact' }),
        supabase.from('teacher_applications').select('id', { count: 'exact' }).eq('status', 'approved'),
        supabase.from('student_certificates').select('id', { count: 'exact' }),
        supabase.from('withdrawals').select('id', { count: 'exact' }).eq('status', 'pending'),
      ]);

      setStats({
        totalCourses: coursesRes.count || 0,
        totalUsers: profilesRes.count || 0,
        totalEnrollments: enrollmentsRes.count || 0,
        totalRevenue: 24500,
        totalTeachers: teachersRes.count || 0,
        totalUniversities: 3,
        totalCertificates: certificatesRes.count || 0,
        pendingWithdrawals: withdrawalsRes.count || 0,
      });
    };

    fetchStats();
  }, []);

  const pieData = [
    { name: 'Courses', value: stats.totalCourses || 1 },
    { name: 'Enrollments', value: stats.totalEnrollments || 1 },
    { name: 'Teachers', value: stats.totalTeachers || 1 },
    { name: 'Certificates', value: stats.totalCertificates || 1 },
  ];

  const totalPages = Math.ceil(revenueData.length / itemsPerPage);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">ADMIN PANEL</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>🏠</span>
          <span>/</span>
          <span className="text-foreground">Dashboard</span>
        </div>
      </div>

      {/* Colorful Stats Cards - Like reference image */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white border-0 overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <p className="text-purple-100 text-sm font-medium">Total Courses</p>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-3xl md:text-4xl font-bold">{stats.totalCourses}</span>
              <div className="bg-purple-600/50 rounded-lg px-3 py-1">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-400 to-pink-600 text-white border-0 overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <p className="text-pink-100 text-sm font-medium">Total Users</p>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-3xl md:text-4xl font-bold">{stats.totalUsers}</span>
              <div className="bg-pink-500/50 rounded-lg px-3 py-1">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-400 to-yellow-500 text-white border-0 overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <p className="text-amber-100 text-sm font-medium">Enrollments</p>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-3xl md:text-4xl font-bold">{stats.totalEnrollments}</span>
              <div className="bg-amber-500/50 rounded-lg px-3 py-1">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-400 to-teal-500 text-white border-0 overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <p className="text-cyan-100 text-sm font-medium">Total Revenue</p>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-3xl md:text-4xl font-bold">${stats.totalRevenue.toLocaleString()}</span>
              <div className="bg-cyan-500/50 rounded-lg px-3 py-1">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Sections - Flex Layout */}
      <div className="space-y-6">
        {/* Backend & Frontend Dashboards in Flex */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Backend Dashboard Section */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                Backend Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {backendDashboards.map((item) => (
                  <Link key={item.id} to={item.link}>
                    <div className={`p-4 rounded-xl bg-gradient-to-br ${item.color} text-white hover:scale-105 transition-transform cursor-pointer`}>
                      <item.icon className="h-6 w-6 mb-2" />
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-xs opacity-80">{item.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Frontend Dashboard Section */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                  <Eye className="h-4 w-4 text-white" />
                </div>
                Frontend Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {frontendDashboards.map((item) => (
                  <Link key={item.id} to={item.link}>
                    <div className={`p-4 rounded-xl bg-gradient-to-br ${item.color} text-white hover:scale-105 transition-transform cursor-pointer`}>
                      <item.icon className="h-6 w-6 mb-2" />
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-xs opacity-80">{item.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role Dashboards - Flex */}
        <div className="flex flex-col md:flex-row gap-4">
          <Link to="/admin/student-control" className="flex-1">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold">Student Dashboard</p>
                  <p className="text-sm text-muted-foreground">Manage students & enrollments</p>
                </div>
                <ArrowRight className="h-5 w-5 ml-auto text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/teacher-control" className="flex-1">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-purple-500">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="font-semibold">Teacher Dashboard</p>
                  <p className="text-sm text-muted-foreground">{stats.totalTeachers} approved teachers</p>
                </div>
                <ArrowRight className="h-5 w-5 ml-auto text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/certificates" className="flex-1">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-amber-500">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="font-semibold">Universities Dashboard</p>
                  <p className="text-sm text-muted-foreground">{stats.totalUniversities} registered</p>
                </div>
                <ArrowRight className="h-5 w-5 ml-auto text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Charts with Pagination */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Revenue Overview</CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">{currentPage}/{totalPages || 1}</span>
              <Button
                variant="ghost"
                size="icon"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-muted-foreground" tick={{ fontSize: 12 }} />
                <YAxis className="text-muted-foreground" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary) / 0.2)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-muted-foreground" tick={{ fontSize: 12 }} />
                <YAxis className="text-muted-foreground" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="enrollments" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Platform Overview Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Platform Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 flex-1">
              {pieData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-2xl font-bold">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/admin/courses">Manage Courses</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/users">View Users</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/withdrawals">
                Process Withdrawals
                {stats.pendingWithdrawals > 0 && (
                  <Badge className="ml-2 bg-destructive">{stats.pendingWithdrawals}</Badge>
                )}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/testing">Testing Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
