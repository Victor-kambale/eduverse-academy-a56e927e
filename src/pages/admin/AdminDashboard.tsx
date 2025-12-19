import { useEffect, useState } from 'react';
import { BookOpen, Users, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/admin/StatsCard';
import { supabase } from '@/integrations/supabase/client';
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

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalUsers: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [coursesRes, profilesRes, enrollmentsRes] = await Promise.all([
        supabase.from('courses').select('id, price', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('enrollments').select('id', { count: 'exact' }),
      ]);

      setStats({
        totalCourses: coursesRes.count || 0,
        totalUsers: profilesRes.count || 0,
        totalEnrollments: enrollmentsRes.count || 0,
        totalRevenue: 24500, // Mock data for now
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Courses"
          value={stats.totalCourses}
          change="+12% from last month"
          changeType="positive"
          icon={BookOpen}
        />
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          change="+8% from last month"
          changeType="positive"
          icon={Users}
        />
        <StatsCard
          title="Enrollments"
          value={stats.totalEnrollments}
          change="+23% from last month"
          changeType="positive"
          icon={TrendingUp}
        />
        <StatsCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          change="+18% from last month"
          changeType="positive"
          icon={DollarSign}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
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
            <CardTitle>Weekly Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
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
    </div>
  );
}
