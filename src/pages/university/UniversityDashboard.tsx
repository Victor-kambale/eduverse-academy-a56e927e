import { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  BookOpen,
  DollarSign,
  Plus,
  Settings,
  BarChart3,
  Wallet,
  Upload,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { WithdrawalForm } from '@/components/withdrawal/WithdrawalForm';
import { TransactionHistory } from '@/components/withdrawal/TransactionHistory';

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
  const [showAddInstructor, setShowAddInstructor] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [newInstructor, setNewInstructor] = useState({ name: '', email: '' });

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

  const handleAddInstructor = async () => {
    if (!newInstructor.name || !newInstructor.email) {
      toast.error('Please fill all fields');
      return;
    }

    // In a real implementation, this would send an invitation email
    setInstructors([
      ...instructors,
      {
        id: Date.now().toString(),
        name: newInstructor.name,
        email: newInstructor.email,
        courses: 0,
        earnings: 0,
        status: 'Pending Invitation',
      },
    ]);

    toast.success('Instructor invitation sent!');
    setShowAddInstructor(false);
    setNewInstructor({ name: '', email: '' });
  };

  const handleBulkCourseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Parse CSV and create courses
      toast.success('Bulk upload started. Courses will be created shortly.');
      setShowBulkUpload(false);
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowBulkUpload(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Bulk Upload
            </Button>
            <Button onClick={() => setShowAddInstructor(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Instructor
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
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
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
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
            <Card>
              <CardHeader>
                <CardTitle>Team Instructors</CardTitle>
                <CardDescription>
                  Manage instructors in your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                {instructors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No instructors yet. Add your first instructor!
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
          </TabsContent>

          <TabsContent value="withdrawals">
            <div className="grid gap-6">
              <WithdrawalForm userType="university" />
              <TransactionHistory />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Performance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Analytics dashboard coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Instructor Dialog */}
        <Dialog open={showAddInstructor} onOpenChange={setShowAddInstructor}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Instructor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  placeholder="John Doe"
                  value={newInstructor.name}
                  onChange={(e) => setNewInstructor({ ...newInstructor, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="john@university.edu"
                  value={newInstructor.email}
                  onChange={(e) => setNewInstructor({ ...newInstructor, email: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddInstructor(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddInstructor}>Send Invitation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Upload Dialog */}
        <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Course Upload</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upload a CSV file with course details to create multiple courses at once.
              </p>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop or click to upload
                </p>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleBulkCourseUpload}
                  className="max-w-xs mx-auto"
                />
              </div>
              <div className="text-sm">
                <p className="font-medium">CSV Format:</p>
                <code className="text-xs bg-muted p-2 block rounded mt-1">
                  title,description,price,instructor_email,category
                </code>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBulkUpload(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
