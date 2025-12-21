import { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Award, 
  Eye, 
  Ban, 
  CheckCircle,
  Search,
  Filter,
  MoreVertical,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Student {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  enrolled_courses: number;
  completed_courses: number;
  certificates_earned: number;
  is_suspended: boolean;
  created_at: string;
  last_active: string;
}

export default function StudentDashboardControl() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get enrollment counts
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('user_id');

      const enrollmentCounts: Record<string, number> = {};
      enrollments?.forEach(e => {
        enrollmentCounts[e.user_id] = (enrollmentCounts[e.user_id] || 0) + 1;
      });

      const mappedStudents: Student[] = (profiles || []).map(p => ({
        id: p.id,
        user_id: p.user_id,
        full_name: p.full_name || 'Unknown User',
        email: p.email || '',
        enrolled_courses: enrollmentCounts[p.user_id] || 0,
        completed_courses: 0,
        certificates_earned: 0,
        is_suspended: !p.can_edit_profile,
        created_at: p.created_at,
        last_active: p.updated_at
      }));

      setStudents(mappedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (studentId: string, userId: string) => {
    try {
      await supabase
        .from('profiles')
        .update({ can_edit_profile: false, profile_disabled_reason: 'Suspended by admin' })
        .eq('user_id', userId);
      
      toast.success('Student account suspended');
      setStudents(students.map(s => 
        s.id === studentId ? { ...s, is_suspended: true } : s
      ));
    } catch (error) {
      toast.error('Failed to suspend account');
    }
  };

  const handleReactivate = async (studentId: string, userId: string) => {
    try {
      await supabase
        .from('profiles')
        .update({ can_edit_profile: true, profile_disabled_reason: null })
        .eq('user_id', userId);
      
      toast.success('Student account reactivated');
      setStudents(students.map(s => 
        s.id === studentId ? { ...s, is_suspended: false } : s
      ));
    } catch (error) {
      toast.error('Failed to reactivate account');
    }
  };

  const filteredStudents = students.filter(s => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEnrollments = students.reduce((sum, s) => sum + s.enrolled_courses, 0);
  const activeStudents = students.filter(s => s.enrolled_courses > 0).length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Student Dashboard Control</h1>
        <p className="text-muted-foreground">Manage and monitor all student accounts</p>
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
                <p className="text-2xl font-bold">{students.length}</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeStudents}</p>
                <p className="text-sm text-muted-foreground">Active Learners</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalEnrollments}</p>
                <p className="text-sm text-muted-foreground">Total Enrollments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">89</p>
                <p className="text-sm text-muted-foreground">Certificates Issued</p>
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
            placeholder="Search students..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <div 
                key={student.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  student.is_suspended ? 'bg-destructive/5 border-destructive/20' : 'border-border'
                }`}
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {student.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{student.full_name}</h3>
                      {student.is_suspended && (
                        <Badge variant="destructive">Suspended</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="font-semibold">{student.enrolled_courses}</p>
                    <p className="text-xs text-muted-foreground">Enrolled</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{student.completed_courses}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{student.certificates_earned}</p>
                    <p className="text-xs text-muted-foreground">Certificates</p>
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
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BookOpen className="w-4 h-4 mr-2" />
                        View Enrollments
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Award className="w-4 h-4 mr-2" />
                        View Certificates
                      </DropdownMenuItem>
                      {student.is_suspended ? (
                        <DropdownMenuItem onClick={() => handleReactivate(student.id, student.user_id)}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Reactivate Account
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem 
                          onClick={() => handleSuspend(student.id, student.user_id)}
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