import { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  BookOpen,
  DollarSign,
  BarChart3,
  Wallet,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { WithdrawalForm } from '@/components/withdrawal/WithdrawalForm';
import { TransactionHistory } from '@/components/withdrawal/TransactionHistory';
import { InstructorInvitation } from '@/components/university/InstructorInvitation';
import { BulkCourseImport } from '@/components/university/BulkCourseImport';

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
}

export default function UniversityDashboard() {
  const { user } = useAuth();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalInstructors: 0,
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchData();
  }, [user?.id]);

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
        }));
        setCourses(formattedCourses);

        const totalStudents = formattedCourses.reduce((sum, c) => sum + c.enrollments, 0);
        const totalRevenue = formattedCourses.reduce((sum, c) => sum + c.revenue, 0);

        setStats({
          totalInstructors: instructors.length,
          totalCourses: formattedCourses.length,
          totalStudents,
          totalRevenue,
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Building2 className="h-8 w-8 text-accent" />
              University Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your organization's courses and instructors
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalInstructors}</p>
                  <p className="text-sm text-muted-foreground">Instructors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalCourses}</p>
                  <p className="text-sm text-muted-foreground">Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalStudents}</p>
                  <p className="text-sm text-muted-foreground">Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="courses">
          <TabsList className="mb-6">
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="instructors" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Instructors
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Withdrawals
            </TabsTrigger>
            <TabsTrigger value="bulk-import" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Bulk Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Organization Courses</CardTitle>
                <CardDescription>
                  All courses created under your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : courses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No courses yet. Create your first course!
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium">{course.title}</TableCell>
                          <TableCell>{course.instructor_name}</TableCell>
                          <TableCell>{course.enrollments}</TableCell>
                          <TableCell>${course.revenue.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={course.status === 'Published' ? 'default' : 'secondary'}>
                              {course.status}
                            </Badge>
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
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
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
        </Tabs>
      </div>
    </Layout>
  );
}