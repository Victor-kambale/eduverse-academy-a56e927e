import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  Award,
  Clock,
  Play,
  Calendar,
  Trophy,
  Target,
  TrendingUp,
  ChevronRight,
  Bell,
  Settings,
  User,
  FileText,
  LogOut,
  Shield,
  Camera,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { ProfilePhotoUpload } from "@/components/profile/ProfilePhotoUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const enrolledCourses = [
  {
    id: 1,
    title: "Complete Web Development Bootcamp 2025",
    instructor: "Dr. Sarah Chen",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop",
    progress: 65,
    lastAccessed: "Today",
    nextLesson: "React Hooks Deep Dive",
    totalLessons: 285,
    completedLessons: 185,
  },
  {
    id: 2,
    title: "Machine Learning & AI Masterclass",
    instructor: "Prof. Michael Zhang",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop",
    progress: 30,
    lastAccessed: "Yesterday",
    nextLesson: "Neural Networks Introduction",
    totalLessons: 180,
    completedLessons: 54,
  },
  {
    id: 3,
    title: "Business Leadership & Management",
    instructor: "Emma Thompson, MBA",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop",
    progress: 100,
    lastAccessed: "Last week",
    nextLesson: "Completed!",
    totalLessons: 120,
    completedLessons: 120,
  },
];

const certificates = [
  {
    id: 1,
    title: "Business Leadership & Management",
    issueDate: "December 15, 2024",
    credentialId: "EDV-2024-BLM-12345",
  },
];

const achievements = [
  { title: "First Course Completed", icon: Trophy, date: "Dec 15, 2024" },
  { title: "7-Day Streak", icon: Target, date: "Dec 10, 2024" },
  { title: "Top 10% Learner", icon: TrendingUp, date: "Dec 5, 2024" },
];

const weeklyGoal = {
  target: 5,
  completed: 3,
  unit: "hours",
};

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("courses");
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ avatar_url: string | null; can_edit_profile: boolean; profile_disabled_reason: string | null } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url, can_edit_profile, profile_disabled_reason')
        .eq('user_id', user.id)
        .single();
      if (data) setProfile(data);
    };
    fetchProfile();
  }, [user?.id]);

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
      return user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  const getUserName = () => {
    return user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  };

  return (
    <Layout>
      <div className="bg-primary text-primary-foreground py-8">
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
                  <Button variant="hero-outline" size="sm">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Panel
                  </Button>
                </Link>
              )}
              <Button variant="hero-outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Link to="/settings">
                <Button variant="hero-outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button variant="hero-outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Enrolled Courses</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Award className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <p className="text-2xl font-bold">1</p>
                  <p className="text-sm text-muted-foreground">Certificates</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <p className="text-2xl font-bold">45h</p>
                  <p className="text-sm text-muted-foreground">Learning Time</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Achievements</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start">
                <TabsTrigger value="courses">My Courses</TabsTrigger>
                <TabsTrigger value="certificates">Certificates</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>

              <TabsContent value="courses" className="space-y-4 mt-6">
                {enrolledCourses.map((course) => (
                  <Card key={course.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-48 shrink-0">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-32 md:h-full object-cover"
                        />
                      </div>
                      <CardContent className="flex-1 p-4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="flex-1">
                            <Link to={`/course/${course.id}`}>
                              <h3 className="font-semibold hover:text-accent transition-colors">
                                {course.title}
                              </h3>
                            </Link>
                            <p className="text-sm text-muted-foreground mb-2">
                              {course.instructor}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <span>Last accessed: {course.lastAccessed}</span>
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
                              <>
                                <Link to={`/course/${course.id}/learn`} className="flex-1">
                                  <Button variant="accent" size="sm" className="w-full">
                                    <Play className="w-4 h-4 mr-2" />
                                    Continue
                                  </Button>
                                </Link>
                                <p className="text-xs text-muted-foreground text-center">
                                  Next: {course.nextLesson}
                                </p>
                              </>
                            ) : (
                              <Badge variant="default" className="bg-success">
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="certificates" className="mt-6">
                {certificates.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {certificates.map((cert) => (
                      <Card key={cert.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <Award className="w-10 h-10 text-accent mb-3" />
                              <h3 className="font-semibold mb-1">{cert.title}</h3>
                              <p className="text-sm text-muted-foreground">Issued: {cert.issueDate}</p>
                              <p className="text-xs text-muted-foreground mt-1">ID: {cert.credentialId}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button variant="outline" size="sm">View</Button>
                              <Button variant="ghost" size="sm">Share</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="font-semibold text-lg mb-2">No certificates yet</h3>
                      <p className="text-muted-foreground mb-4">Complete a course to earn your first certificate!</p>
                      <Link to="/courses">
                        <Button variant="accent">Browse Courses</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="achievements" className="mt-6">
                <div className="grid md:grid-cols-3 gap-4">
                  {achievements.map((achievement, index) => (
                    <Card key={index}>
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
                          <achievement.icon className="w-8 h-8 text-accent" />
                        </div>
                        <h3 className="font-semibold mb-1">{achievement.title}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.date}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weekly Goal */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent" />
                  Weekly Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <p className="text-3xl font-bold">
                    {weeklyGoal.completed}/{weeklyGoal.target}
                  </p>
                  <p className="text-sm text-muted-foreground">{weeklyGoal.unit} this week</p>
                </div>
                <Progress value={(weeklyGoal.completed / weeklyGoal.target) * 100} className="h-3" />
                <p className="text-sm text-center mt-2 text-muted-foreground">
                  {weeklyGoal.target - weeklyGoal.completed} {weeklyGoal.unit} to go!
                </p>
              </CardContent>
            </Card>

            {/* Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent" />
                  Learning Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                    <div key={i} className="text-center text-xs text-muted-foreground">{day}</div>
                  ))}
                  {[1, 1, 1, 0, 1, 0, 0].map((active, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-sm ${
                        active ? "bg-accent" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-center text-sm">
                  <span className="font-bold text-accent">4 days</span> current streak
                </p>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/profile" className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    My Profile
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link to="/settings" className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
                  <span className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link to="/help" className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Help Center
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
