import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen, Award, Clock, Play, Calendar, Trophy, Target, TrendingUp,
  ChevronRight, Settings, User, FileText, LogOut, Shield, Eye,
} from "lucide-react";
import { SecureCertificateSystem } from "@/components/certificate/SecureCertificateSystem";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { ProfilePhotoUpload } from "@/components/profile/ProfilePhotoUpload";
import { PurchaseHistory } from "@/components/dashboard/PurchaseHistory";
import { StudentNotifications } from "@/components/dashboard/StudentNotifications";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CopyProtection } from "@/components/security/CopyProtection";

interface EnrolledCourse {
  id: string;
  title: string;
  instructor_name: string;
  thumbnail_url: string | null;
  progress: number;
  lastAccessed: string;
  totalLessons: number;
  completedLessons: number;
}

interface Certificate {
  id: string;
  title: string;
  issueDate: string;
  credentialId: string;
}

interface DashboardStats {
  enrolledCourses: number;
  certificates: number;
  learningTime: number;
  achievements: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 } as const,
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } as const,
};

const stagger = {
  hidden: { opacity: 0 } as const,
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } } as const,
};

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("courses");
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ avatar_url: string | null; can_edit_profile: boolean; profile_disabled_reason: string | null } | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    enrolledCourses: 0, certificates: 0, learningTime: 0, achievements: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
      createLoginNotification();
    }
  }, [user?.id]);

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('avatar_url, can_edit_profile, profile_disabled_reason')
        .eq('user_id', user.id)
        .single();
      if (profileData) setProfile(profileData);

      const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`id, enrolled_at, completed_at, course_id, courses:course_id (id, title, instructor_name, thumbnail_url)`)
        .eq('user_id', user.id);

      if (enrollments) {
        const { data: lessonProgress } = await supabase
          .from('lesson_progress')
          .select('course_id, completed')
          .eq('user_id', user.id);

        const courseIds = enrollments.map(e => e.course_id);
        const { data: lessons } = await supabase
          .from('lessons')
          .select('course_id')
          .in('course_id', courseIds);

        const lessonCounts: Record<string, number> = {};
        const completedCounts: Record<string, number> = {};
        lessons?.forEach(l => { lessonCounts[l.course_id] = (lessonCounts[l.course_id] || 0) + 1; });
        lessonProgress?.forEach(lp => { if (lp.completed) completedCounts[lp.course_id] = (completedCounts[lp.course_id] || 0) + 1; });

        const mappedCourses: EnrolledCourse[] = enrollments.map(e => {
          const course = e.courses as any;
          const total = lessonCounts[e.course_id] || 1;
          const completed = completedCounts[e.course_id] || 0;
          return {
            id: course?.id || e.course_id,
            title: course?.title || 'Course',
            instructor_name: course?.instructor_name || 'Instructor',
            thumbnail_url: course?.thumbnail_url,
            progress: Math.round((completed / total) * 100),
            lastAccessed: new Date(e.enrolled_at).toLocaleDateString(),
            totalLessons: total,
            completedLessons: completed,
          };
        });
        setEnrolledCourses(mappedCourses);
      }

      const { data: certs } = await supabase
        .from('student_certificates')
        .select(`id, issued_at, credential_id, courses:course_id (title)`)
        .eq('student_id', user.id);

      if (certs) {
        setCertificates(certs.map(c => ({
          id: c.id,
          title: (c.courses as any)?.title || 'Certificate',
          issueDate: new Date(c.issued_at).toLocaleDateString(),
          credentialId: c.credential_id,
        })));
      }

      setStats({
        enrolledCourses: enrollments?.length || 0,
        certificates: certs?.length || 0,
        learningTime: enrollments?.length ? enrollments.length * 10 : 0,
        achievements: certs?.length ? Math.min(certs.length + 2, 10) : 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createLoginNotification = async () => {
    if (!user?.id) return;
    const { data: recentNotif } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('title', 'Login Successful')
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .limit(1);
    if (!recentNotif || recentNotif.length === 0) {
      await supabase.from('notifications').insert({
        user_id: user.id, title: 'Login Successful',
        message: `You have logged into Eduverse successfully. Welcome back!`, type: 'login',
      });
    }
  };

  const handlePhotoUpdated = (url: string) => {
    setProfile(prev => prev ? { ...prev, avatar_url: url } : null);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const getUserInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  const getUserName = () => user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  const weeklyGoal = { target: 5, completed: Math.min(stats.learningTime / 10, 5), unit: "hours" };

  const statCards = [
    { icon: BookOpen, label: "Enrolled Courses", value: stats.enrolledCourses, color: "text-accent" },
    { icon: Award, label: "Certificates", value: stats.certificates, color: "text-accent" },
    { icon: Clock, label: "Learning Time", value: `${stats.learningTime}h`, color: "text-accent" },
    { icon: Trophy, label: "Achievements", value: stats.achievements, color: "text-accent" },
  ];

  return (
    <CopyProtection>
    <Layout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-primary text-primary-foreground py-8"
      >
        <div className="container">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <ProfilePhotoUpload
                userId={user?.id || ''}
                currentPhotoUrl={profile?.avatar_url}
                userName={getUserName()}
                onPhotoUpdated={handlePhotoUpdated}
                disabled={profile?.can_edit_profile === false}
                disabledReason={profile?.profile_disabled_reason || 'Profile editing disabled by admin'}
              />
              <div>
                <h1 className="font-display text-2xl font-bold">Welcome back, {getUserName()}!</h1>
                <p className="text-primary-foreground/80">{user?.email}</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="hero-outline" size="sm"><Shield className="w-4 h-4 mr-2" />Admin Panel</Button>
                </Link>
              )}
              <StudentNotifications />
              <Link to="/settings"><Button variant="hero-outline" size="sm"><Settings className="w-4 h-4 mr-2" />Settings</Button></Link>
              <Button variant="hero-outline" size="sm" onClick={handleSignOut}><LogOut className="w-4 h-4 mr-2" />Sign Out</Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {/* Stats Cards with animation */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              {statCards.map((stat, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 text-center">
                      <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Tabs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="courses">My Courses</TabsTrigger>
                  <TabsTrigger value="purchases">Purchases</TabsTrigger>
                  <TabsTrigger value="certificates">Certificates</TabsTrigger>
                </TabsList>

                <TabsContent value="courses" className="space-y-4 mt-6">
                  {loading ? (
                    <Card><CardContent className="p-12 text-center"><p className="text-muted-foreground">Loading courses...</p></CardContent></Card>
                  ) : enrolledCourses.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="font-semibold text-lg mb-2">No courses yet</h3>
                        <p className="text-muted-foreground mb-4">Start learning by enrolling in a course!</p>
                        <Link to="/courses"><Button variant="accent">Browse Courses</Button></Link>
                      </CardContent>
                    </Card>
                  ) : (
                    <motion.div className="space-y-4" initial="hidden" animate="visible" variants={stagger}>
                      {enrolledCourses.map((course) => (
                        <motion.div key={course.id} variants={fadeUp}>
                          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="flex flex-col md:flex-row">
                              <div className="md:w-48 shrink-0">
                                <img
                                  src={course.thumbnail_url || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop"}
                                  alt={course.title}
                                  className="w-full h-32 md:h-full object-cover"
                                />
                              </div>
                              <CardContent className="flex-1 p-4">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <Link to={`/course/${course.id}`}>
                                      <h3 className="font-semibold hover:text-accent transition-colors">{course.title}</h3>
                                    </Link>
                                    <p className="text-sm text-muted-foreground mb-2">{course.instructor_name}</p>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                      <span>Enrolled: {course.lastAccessed}</span>
                                      <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                                    </div>
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between text-sm">
                                        <span>Progress</span>
                                        <span className="font-medium">{course.progress}%</span>
                                      </div>
                                      <Progress value={course.progress} className="h-2" />
                                    </div>
                                  </div>
                                  <div className="flex md:flex-col gap-2">
                                    {course.progress < 100 ? (
                                      <Link to={`/course/${course.id}/learn`} className="flex-1">
                                        <Button variant="accent" size="sm" className="w-full">
                                          <Play className="w-4 h-4 mr-2" />Continue
                                        </Button>
                                      </Link>
                                    ) : (
                                      <Badge variant="default" className="bg-green-500">Completed</Badge>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </TabsContent>

                <TabsContent value="purchases" className="mt-6">
                  <PurchaseHistory />
                </TabsContent>

                <TabsContent value="certificates" className="mt-6">
                  {certificates.length > 0 ? (
                    <div className="space-y-6">
                      <motion.div className="grid md:grid-cols-2 gap-4" initial="hidden" animate="visible" variants={stagger}>
                        {certificates.map((cert) => (
                          <motion.div key={cert.id} variants={fadeUp}>
                            <Card className="hover:shadow-lg transition-shadow">
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="flex items-center gap-2 mb-3">
                                      <Award className="w-10 h-10 text-accent" />
                                      <Badge variant="secondary" className="text-xs">CDP Certified</Badge>
                                    </div>
                                    <h3 className="font-semibold mb-1">{cert.title}</h3>
                                    <p className="text-sm text-muted-foreground">Issued: {cert.issueDate}</p>
                                    <p className="text-xs text-muted-foreground mt-1">ID: {cert.credentialId}</p>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <Link to={`/verify-certificate/${cert.credentialId}`}>
                                      <Button variant="outline" size="sm" className="w-full gap-1"><Eye className="w-3 h-3" />View</Button>
                                    </Link>
                                    <Button variant="ghost" size="sm" className="gap-1"><Shield className="w-3 h-3" />Claim</Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </motion.div>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-accent" />
                            Claim Your Certificates
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <SecureCertificateSystem 
                            certificates={certificates.map(cert => ({
                              studentName: getUserName(),
                              courseName: cert.title,
                              instructorName: 'Eduverse Instructor',
                              completionDate: cert.issueDate,
                              credentialId: cert.credentialId,
                              grade: 'A',
                              institutionName: 'Eduverse Academy',
                              courseDuration: '40 hours',
                              cpdHours: 40,
                              skills: ['Critical Thinking', 'Problem Solving'],
                            }))}
                            userRole="student"
                            onClaim={(claimedCerts) => {
                              toast.success(`Successfully claimed ${claimedCerts.length} certificate(s)!`);
                            }}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="font-semibold text-lg mb-2">No certificates yet</h3>
                        <p className="text-muted-foreground mb-4">Complete a course to earn your first certificate!</p>
                        <Link to="/courses"><Button variant="accent">Browse Courses</Button></Link>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          {/* Sidebar */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Target className="w-5 h-5 text-accent" />Weekly Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <p className="text-3xl font-bold">{weeklyGoal.completed.toFixed(0)}/{weeklyGoal.target}</p>
                  <p className="text-sm text-muted-foreground">{weeklyGoal.unit} this week</p>
                </div>
                <Progress value={(weeklyGoal.completed / weeklyGoal.target) * 100} className="h-3" />
                <p className="text-sm text-center mt-2 text-muted-foreground">
                  {Math.max(0, weeklyGoal.target - weeklyGoal.completed).toFixed(0)} {weeklyGoal.unit} to go!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Calendar className="w-5 h-5 text-accent" />Learning Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                    <div key={i} className="text-center text-xs text-muted-foreground">{day}</div>
                  ))}
                  {[1, 1, 1, 0, 1, 0, 0].map((active, i) => (
                    <div key={i} className={`aspect-square rounded-sm ${active ? "bg-accent" : "bg-muted"}`} />
                  ))}
                </div>
                <p className="text-center text-sm"><span className="font-bold text-accent">4 days</span> current streak</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Quick Links</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  { to: "/profile", icon: User, label: "My Profile" },
                  { to: "/settings", icon: Settings, label: "Settings" },
                  { to: "/help", icon: FileText, label: "Help Center" },
                ].map((link) => (
                  <Link key={link.to} to={link.to} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
                    <span className="flex items-center gap-2"><link.icon className="w-4 h-4" />{link.label}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
    </CopyProtection>
  );
};

export default DashboardPage;
