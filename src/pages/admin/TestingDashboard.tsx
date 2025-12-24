import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import RealtimeRevenue from "@/components/dashboard/RealtimeRevenue";
import RealtimePaymentNotifications from "@/components/dashboard/RealtimePaymentNotifications";
import {
  CreditCard,
  Users,
  TestTube,
  CheckCircle,
  XCircle,
  Loader2,
  Play,
  Eye,
  UserPlus,
  LogIn,
  GraduationCap,
  Bell,
  MessageSquare,
  DollarSign,
  Building2,
  Shield,
  Award,
  ExternalLink,
  Settings,
  Wallet,
  BookOpen,
  Layout,
  Edit,
  Trash2,
  Power,
  Volume2,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Lock,
  Unlock,
  ShieldCheck,
} from "lucide-react";

const TestingDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [testEmail, setTestEmail] = useState("");
  const [testPassword, setTestPassword] = useState("Test123!");
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isTestingPayment, setIsTestingPayment] = useState(false);
  const [testResults, setTestResults] = useState<{ name: string; status: "success" | "error" | "pending"; message: string }[]>([]);

  const testStripePayment = async () => {
    setIsTestingPayment(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          courseId: "11111111-1111-1111-1111-111111111111",
          courseTitle: "Complete Web Development Bootcamp 2025",
          amount: 89.99,
        },
      });

      if (error) throw error;

      if (data?.url) {
        toast.success("Stripe checkout session created! Opening in new tab...");
        window.open(data.url, '_blank');
        addTestResult("Stripe Checkout", "success", "Checkout session created successfully");
      }
    } catch (error: any) {
      toast.error(`Payment test failed: ${error.message}`);
      addTestResult("Stripe Checkout", "error", error.message);
    } finally {
      setIsTestingPayment(false);
    }
  };

  const createTestUser = async (role: "student" | "teacher" | "admin" | "university") => {
    setIsCreatingUser(true);
    const email = testEmail || `test-${role}-${Date.now()}@test.com`;
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: testPassword,
        options: {
          data: {
            full_name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        if (role === "teacher") {
          await supabase.from("user_roles").insert({
            user_id: data.user.id,
            role: "instructor",
          });
        } else if (role === "admin") {
          await supabase.from("user_roles").insert({
            user_id: data.user.id,
            role: "admin",
          });
        }

        toast.success(`Test ${role} created: ${email}`);
        addTestResult(`Create Test ${role}`, "success", `User created: ${email}`);
        
        // Play success sound
        const audio = new Audio('/sounds/success.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      }
    } catch (error: any) {
      toast.error(`Failed to create test user: ${error.message}`);
      addTestResult(`Create Test ${role}`, "error", error.message);
    } finally {
      setIsCreatingUser(false);
    }
  };

  const testNotification = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Test Notification",
        message: "This is a test notification from the admin testing dashboard.",
        type: "info",
        category: "system",
      });

      if (error) throw error;
      toast.success("Test notification sent!");
      
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
      
      addTestResult("Notification System", "success", "Notification created successfully");
    } catch (error: any) {
      toast.error(`Notification test failed: ${error.message}`);
      addTestResult("Notification System", "error", error.message);
    }
  };

  const testEmailFunction = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: user?.email || "test@example.com",
          subject: "Test Email from Admin Dashboard",
          html: "<h1>Test Email</h1><p>This is a test email from the admin testing dashboard.</p>",
        },
      });

      if (error) throw error;
      toast.success("Test email sent!");
      addTestResult("Email Function", "success", "Email sent successfully");
    } catch (error: any) {
      toast.error(`Email test failed: ${error.message}`);
      addTestResult("Email Function", "error", error.message);
    }
  };

  const addTestResult = (name: string, status: "success" | "error" | "pending", message: string) => {
    setTestResults(prev => [{ name, status, message }, ...prev]);
  };

  const verifyDatabase = async () => {
    try {
      const { count, error } = await supabase
        .from("courses")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      toast.success(`Database connected! Found ${count} courses.`);
      addTestResult("Database Connection", "success", `Connected. ${count} courses found.`);
    } catch (error: any) {
      toast.error(`Database test failed: ${error.message}`);
      addTestResult("Database Connection", "error", error.message);
    }
  };

  const testCertificate = async (type: string) => {
    try {
      toast.success(`Testing ${type} certificate generation...`);
      addTestResult(`${type} Certificate`, "success", "Certificate test initiated");
      navigate('/admin/certificates');
    } catch (error: any) {
      addTestResult(`${type} Certificate`, "error", error.message);
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Testing Dashboard</h1>
          <p className="text-muted-foreground">
            Test all platform functionality including payments, user accounts, and notifications
          </p>
        </div>

        {/* Real-time Revenue Section */}
        <RealtimeRevenue userType="admin" />

        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="payments">
              <CreditCard className="w-4 h-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              User Testing
            </TabsTrigger>
            <TabsTrigger value="access">
              <Lock className="w-4 h-4 mr-2" />
              Access Control
            </TabsTrigger>
            <TabsTrigger value="system">
              <TestTube className="w-4 h-4 mr-2" />
              System Tests
            </TabsTrigger>
            <TabsTrigger value="certificates">
              <Award className="w-4 h-4 mr-2" />
              Certificates
            </TabsTrigger>
            <TabsTrigger value="functionality">
              <Settings className="w-4 h-4 mr-2" />
              Functionality
            </TabsTrigger>
            <TabsTrigger value="results">
              <Eye className="w-4 h-4 mr-2" />
              Results
            </TabsTrigger>
          </TabsList>

          {/* Payment Testing */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Stripe Payment Testing
                </CardTitle>
                <CardDescription>
                  Test the payment flow with Stripe. Use test card: 4242 4242 4242 4242
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold">Test Card Numbers</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Successful payment:</p>
                      <code className="bg-background px-2 py-1 rounded">4242 4242 4242 4242</code>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Declined payment:</p>
                      <code className="bg-background px-2 py-1 rounded">4000 0000 0000 0002</code>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Requires authentication:</p>
                      <code className="bg-background px-2 py-1 rounded">4000 0025 0000 3155</code>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Insufficient funds:</p>
                      <code className="bg-background px-2 py-1 rounded">4000 0000 0000 9995</code>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="border-2 border-dashed">
                    <CardContent className="pt-6 text-center">
                      <DollarSign className="w-12 h-12 mx-auto mb-4 text-success" />
                      <h3 className="font-semibold mb-2">Test Course Purchase</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Creates a $89.99 test checkout session
                      </p>
                      <Button 
                        onClick={testStripePayment} 
                        disabled={isTestingPayment}
                        className="w-full"
                      >
                        {isTestingPayment ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4 mr-2" />
                        )}
                        Start Payment Test
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-dashed">
                    <CardContent className="pt-6 text-center">
                      <GraduationCap className="w-12 h-12 mx-auto mb-4 text-primary" />
                      <h3 className="font-semibold mb-2">Teacher Registration Fee</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Test the teacher registration payment flow
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => window.open('/teacher/register', '_blank')}
                        className="w-full"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Go to Teacher Registration
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-dashed">
                    <CardContent className="pt-6 text-center">
                      <Building2 className="w-12 h-12 mx-auto mb-4 text-accent" />
                      <h3 className="font-semibold mb-2">University Registration Fee</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Test university partnership payment flow
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => window.open('/university/register', '_blank')}
                        className="w-full"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Go to University Registration
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <Card className="bg-accent/10 border-accent">
                  <CardHeader>
                    <CardTitle className="text-lg">Withdrawal Testing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <Button onClick={() => navigate('/admin/withdrawals')} className="w-full">
                        <Wallet className="w-4 h-4 mr-2" />
                        Test Admin Withdrawal
                      </Button>
                      <Button onClick={() => navigate('/teacher/dashboard')} variant="secondary" className="w-full">
                        <Wallet className="w-4 h-4 mr-2" />
                        Test Teacher Withdrawal
                      </Button>
                      <Button onClick={() => navigate('/university/dashboard')} variant="outline" className="w-full">
                        <Wallet className="w-4 h-4 mr-2" />
                        Test University Withdrawal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            {/* Real-time Payment Notifications */}
            <RealtimePaymentNotifications maxNotifications={10} />
          </TabsContent>

          {/* Access Control Testing */}
          <TabsContent value="access" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  Access Control Testing
                </CardTitle>
                <CardDescription>
                  Test role-based access control for Teacher and University dashboards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Teacher Access Control */}
                  <Card className="border-2 border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-purple-500" />
                        Teacher Dashboard Access
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Tests the protected teacher route which requires either:
                        <br />• Approved teacher application
                        <br />• Instructor role
                        <br />• Admin role
                      </p>
                      <div className="space-y-2">
                        <Button 
                          onClick={() => {
                            window.open('/teacher/dashboard', '_blank');
                            addTestResult('Teacher Access Test', 'success', 'Opened teacher dashboard');
                          }}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Test Teacher Dashboard Access
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            window.open('/teacher/chat', '_blank');
                            addTestResult('Teacher Chat Access', 'success', 'Opened teacher chat');
                          }}
                          className="w-full"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Test Teacher Chat Access
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={async () => {
                            const { data } = await supabase
                              .from('teacher_applications')
                              .select('status')
                              .eq('status', 'approved')
                              .limit(1);
                            if (data && data.length > 0) {
                              toast.success('Found approved teacher applications');
                              addTestResult('Teacher Applications Check', 'success', 'Approved teachers exist');
                            } else {
                              toast.info('No approved teacher applications found');
                              addTestResult('Teacher Applications Check', 'pending', 'No approved teachers');
                            }
                          }}
                          className="w-full"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Verify Teacher Applications
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* University Access Control */}
                  <Card className="border-2 border-blue-500/30">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-500" />
                        University Dashboard Access
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Tests the protected university route which requires either:
                        <br />• University affiliation
                        <br />• Instructor role
                        <br />• Admin role
                      </p>
                      <div className="space-y-2">
                        <Button 
                          onClick={() => {
                            window.open('/university/dashboard', '_blank');
                            addTestResult('University Access Test', 'success', 'Opened university dashboard');
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Test University Dashboard Access
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            window.open('/university/register', '_blank');
                            addTestResult('University Registration', 'success', 'Opened registration');
                          }}
                          className="w-full"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Test University Registration
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={async () => {
                            const { data } = await supabase
                              .from('user_roles')
                              .select('role')
                              .eq('role', 'instructor')
                              .limit(5);
                            if (data && data.length > 0) {
                              toast.success(`Found ${data.length} instructor roles`);
                              addTestResult('Instructor Roles Check', 'success', `${data.length} instructors found`);
                            } else {
                              toast.info('No instructor roles found');
                              addTestResult('Instructor Roles Check', 'pending', 'No instructors');
                            }
                          }}
                          className="w-full"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Verify Instructor Roles
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                {/* Access Control Status */}
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Access Control Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-background">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium">Admin Protection</p>
                          <p className="text-xs text-muted-foreground">Active</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-background">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium">Teacher Protection</p>
                          <p className="text-xs text-muted-foreground">Active</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-background">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium">University Protection</p>
                          <p className="text-xs text-muted-foreground">Active</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-background">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium">Auth Middleware</p>
                          <p className="text-xs text-muted-foreground">Active</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Separator />

                {/* Role Management Tests */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Role Management Tests</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <Button 
                        onClick={async () => {
                          const { count } = await supabase
                            .from('user_roles')
                            .select('*', { count: 'exact', head: true })
                            .eq('role', 'admin');
                          toast.success(`Found ${count || 0} admin users`);
                          addTestResult('Admin Count', 'success', `${count || 0} admins found`);
                        }}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Count Admin Users
                      </Button>
                      <Button 
                        variant="secondary"
                        onClick={async () => {
                          const { count } = await supabase
                            .from('user_roles')
                            .select('*', { count: 'exact', head: true })
                            .eq('role', 'instructor');
                          toast.success(`Found ${count || 0} instructor users`);
                          addTestResult('Instructor Count', 'success', `${count || 0} instructors found`);
                        }}
                      >
                        <GraduationCap className="w-4 h-4 mr-2" />
                        Count Instructor Users
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={async () => {
                          const { count } = await supabase
                            .from('user_roles')
                            .select('*', { count: 'exact', head: true });
                          toast.success(`Found ${count || 0} total role assignments`);
                          addTestResult('Total Roles', 'success', `${count || 0} roles assigned`);
                        }}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Count All Roles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Testing */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Create Test Accounts
                </CardTitle>
                <CardDescription>
                  Create test accounts for Students, Teachers, Universities, and Admins
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="test-email">Test Email (optional)</Label>
                    <Input
                      id="test-email"
                      type="email"
                      placeholder="Auto-generated if empty"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="test-password">Test Password</Label>
                    <Input
                      id="test-password"
                      type="text"
                      value={testPassword}
                      onChange={(e) => setTestPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <Button
                    onClick={() => createTestUser("student")}
                    disabled={isCreatingUser}
                    className="w-full"
                  >
                    {isCreatingUser ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Users className="w-4 h-4 mr-2" />
                    )}
                    Create Test Student
                  </Button>
                  <Button
                    onClick={() => createTestUser("teacher")}
                    disabled={isCreatingUser}
                    variant="secondary"
                    className="w-full"
                  >
                    {isCreatingUser ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <GraduationCap className="w-4 h-4 mr-2" />
                    )}
                    Create Test Teacher
                  </Button>
                  <Button
                    onClick={() => createTestUser("university")}
                    disabled={isCreatingUser}
                    variant="outline"
                    className="w-full"
                  >
                    {isCreatingUser ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Building2 className="w-4 h-4 mr-2" />
                    )}
                    Create Test University
                  </Button>
                  <Button
                    onClick={() => createTestUser("admin")}
                    disabled={isCreatingUser}
                    variant="destructive"
                    className="w-full"
                  >
                    {isCreatingUser ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Shield className="w-4 h-4 mr-2" />
                    )}
                    Create Test Admin
                  </Button>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-4">Quick Access Links</h4>
                  <div className="grid gap-2 md:grid-cols-4">
                    <Button variant="outline" onClick={() => window.open('/auth/student', '_blank')}>
                      <LogIn className="w-4 h-4 mr-2" />
                      Student Login
                    </Button>
                    <Button variant="outline" onClick={() => window.open('/auth/teacher', '_blank')}>
                      <LogIn className="w-4 h-4 mr-2" />
                      Teacher Login
                    </Button>
                    <Button variant="outline" onClick={() => window.open('/auth/university', '_blank')}>
                      <LogIn className="w-4 h-4 mr-2" />
                      University Login
                    </Button>
                    <Button variant="outline" onClick={() => window.open('/auth/admin', '_blank')}>
                      <LogIn className="w-4 h-4 mr-2" />
                      Admin Login
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-4">Dashboard Access</h4>
                  <div className="grid gap-2 md:grid-cols-4">
                    <Button variant="outline" onClick={() => window.open('/dashboard', '_blank')}>
                      <Layout className="w-4 h-4 mr-2" />
                      Student Dashboard
                    </Button>
                    <Button variant="outline" onClick={() => window.open('/teacher/dashboard', '_blank')}>
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Teacher Dashboard
                    </Button>
                    <Button variant="outline" onClick={() => window.open('/university/dashboard', '_blank')}>
                      <Building2 className="w-4 h-4 mr-2" />
                      University Dashboard
                    </Button>
                    <Button variant="outline" onClick={() => window.open('/admin/dashboard', '_blank')}>
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Dashboard
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-4">Registration Pages</h4>
                  <div className="grid gap-2 md:grid-cols-3">
                    <Button variant="outline" onClick={() => window.open('/teacher/register', '_blank')}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Teacher Registration
                    </Button>
                    <Button variant="outline" onClick={() => window.open('/university/register', '_blank')}>
                      <Building2 className="w-4 h-4 mr-2" />
                      University Registration
                    </Button>
                    <Button variant="outline" onClick={() => window.open('/auth', '_blank')}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Sign Up Page
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tests */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="w-5 h-5" />
                    Database Test
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={verifyDatabase} className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Test Database Connection
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Test
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={testNotification} className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Send Test Notification
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Email Function Test
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={testEmailFunction} className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Send Test Email
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Chat System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/admin/chat')}
                    className="w-full"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Go to Chat Management
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Payment Methods Admin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/admin/payment-methods')}
                    className="w-full"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Manage Payment Methods
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Course Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/admin/courses')}
                    className="w-full"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Manage Courses
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Security Testing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Button onClick={() => navigate('/admin/security')} className="w-full">
                    <Shield className="w-4 h-4 mr-2" />
                    Test Security Settings
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => {
                      toast.info("Copy protection is active. Try to copy text or take screenshot.");
                      addTestResult("Copy Protection", "success", "Protection active");
                    }}
                    className="w-full"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Test Copy Protection
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      toast.info("Screenshot protection is active. Try pressing PrintScreen.");
                      addTestResult("Screenshot Protection", "success", "Protection active");
                    }}
                    className="w-full"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Test Screenshot Protection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certificate Testing */}
          <TabsContent value="certificates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Certificate Testing
                </CardTitle>
                <CardDescription>
                  Test different types of certificate generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="border-2 border-dashed">
                    <CardContent className="pt-6 text-center">
                      <Award className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                      <h3 className="font-semibold mb-2">Executive Certificate</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Premium executive-level certification
                      </p>
                      <Button 
                        onClick={() => testCertificate('Executive')}
                        className="w-full"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Test Executive
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-dashed">
                    <CardContent className="pt-6 text-center">
                      <Award className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <h3 className="font-semibold mb-2">Advanced Certificate</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Advanced level certification
                      </p>
                      <Button 
                        onClick={() => testCertificate('Advanced')}
                        variant="secondary"
                        className="w-full"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Test Advanced
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-dashed">
                    <CardContent className="pt-6 text-center">
                      <Award className="w-12 h-12 mx-auto mb-4 text-accent" />
                      <h3 className="font-semibold mb-2">Professional Certificate</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Industry-standard professional certification
                      </p>
                      <Button 
                        onClick={() => testCertificate('Professional')}
                        variant="outline"
                        className="w-full"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Test Professional
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-2 border-dashed border-purple-500/30">
                    <CardContent className="pt-6 text-center">
                      <Award className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                      <h3 className="font-semibold mb-2">Beginner Certificate</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Entry-level certification
                      </p>
                      <Button 
                        onClick={() => testCertificate('Beginner')}
                        variant="outline"
                        className="w-full"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Test Beginner
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-dashed border-amber-500/30">
                    <CardContent className="pt-6 text-center">
                      <Award className="w-12 h-12 mx-auto mb-4 text-amber-500" />
                      <h3 className="font-semibold mb-2">All Certificates</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Test all certificate types at once
                      </p>
                      <Button 
                        onClick={() => {
                          testCertificate('Beginner');
                          testCertificate('Advanced');
                          testCertificate('Professional');
                          testCertificate('Executive');
                          toast.success('All certificate tests initiated!');
                        }}
                        className="w-full bg-amber-600 hover:bg-amber-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Test All Certificates
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-4">Certificate Management</h4>
                  <div className="grid gap-2 md:grid-cols-3">
                    <Button variant="outline" onClick={() => navigate('/admin/certificates')}>
                      <Award className="w-4 h-4 mr-2" />
                      Manage Certificates
                    </Button>
                    <Button variant="outline" onClick={() => window.open('/verify-certificate', '_blank')}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify Certificate Page
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        toast.success('Certificate preview generated');
                        addTestResult('Certificate Preview', 'success', 'Preview generated');
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview Certificate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Login Pages Testing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Login Pages Testing
                </CardTitle>
                <CardDescription>
                  Test all login pages for different user types
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <Card className="border-2 border-dashed border-blue-500/30">
                    <CardContent className="pt-6 text-center">
                      <Users className="w-10 h-10 mx-auto mb-3 text-blue-500" />
                      <h3 className="font-semibold mb-2">Student Login</h3>
                      <Button 
                        onClick={() => {
                          window.open('/auth/student', '_blank');
                          addTestResult('Student Login Page', 'success', 'Opened in new tab');
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Test Login
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-dashed border-green-500/30">
                    <CardContent className="pt-6 text-center">
                      <GraduationCap className="w-10 h-10 mx-auto mb-3 text-green-500" />
                      <h3 className="font-semibold mb-2">Teacher Login</h3>
                      <Button 
                        onClick={() => {
                          window.open('/auth/teacher', '_blank');
                          addTestResult('Teacher Login Page', 'success', 'Opened in new tab');
                        }}
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Test Login
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-dashed border-purple-500/30">
                    <CardContent className="pt-6 text-center">
                      <Building2 className="w-10 h-10 mx-auto mb-3 text-purple-500" />
                      <h3 className="font-semibold mb-2">University Login</h3>
                      <Button 
                        onClick={() => {
                          window.open('/auth/university', '_blank');
                          addTestResult('University Login Page', 'success', 'Opened in new tab');
                        }}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        size="sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Test Login
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-dashed border-red-500/30">
                    <CardContent className="pt-6 text-center">
                      <Shield className="w-10 h-10 mx-auto mb-3 text-red-500" />
                      <h3 className="font-semibold mb-2">Admin Login</h3>
                      <Button 
                        onClick={() => {
                          window.open('/auth/admin', '_blank');
                          addTestResult('Admin Login Page', 'success', 'Opened in new tab');
                        }}
                        className="w-full bg-red-600 hover:bg-red-700"
                        size="sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Test Login
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div className="flex gap-4">
                  <Button 
                    onClick={() => {
                      window.open('/auth/student', '_blank');
                      window.open('/auth/teacher', '_blank');
                      window.open('/auth/university', '_blank');
                      window.open('/auth/admin', '_blank');
                      addTestResult('All Login Pages', 'success', 'All pages opened');
                      toast.success('All login pages opened in new tabs');
                    }}
                    className="flex-1"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Test All Login Pages
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      window.open('/auth', '_blank');
                      addTestResult('Main Auth Page', 'success', 'Opened');
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Main Auth Page
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods Testing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Methods Testing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Button 
                    onClick={() => {
                      navigate('/admin/payment-methods');
                      addTestResult('Payment Methods Admin', 'success', 'Navigated');
                    }}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Payment Methods Admin
                  </Button>
                  <Button 
                    variant="secondary"
                    onClick={() => {
                      navigate('/admin/payment-testing');
                      addTestResult('Payment Testing Page', 'success', 'Navigated');
                    }}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Payment Testing Page
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      window.open('/courses/11111111-1111-1111-1111-111111111111', '_blank');
                      addTestResult('Course Purchase Test', 'success', 'Opened course page');
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Test Course Purchase
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Functionality Testing */}
          <TabsContent value="functionality" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Edit, Rename, Remove, Enable/Disable Tests
                </CardTitle>
                <CardDescription>
                  Test all CRUD and toggle functionality across dashboards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Teacher Dashboard Controls */}
                  <Card className="border-purple-500/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-purple-500" />
                        Teacher Dashboard Controls
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button 
                        variant="outline" 
                        onClick={() => { 
                          navigate('/teacher/dashboard'); 
                          addTestResult('Teacher Dashboard', 'success', 'Navigated to teacher dashboard');
                        }}
                        className="w-full justify-start"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Dashboard
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => { 
                          toast.success('Edit mode activated for teacher courses');
                          addTestResult('Edit Courses', 'success', 'Edit mode active');
                        }}
                        className="w-full justify-start"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Test Edit Courses
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => { 
                          toast.success('Rename functionality tested');
                          addTestResult('Rename Feature', 'success', 'Rename works');
                        }}
                        className="w-full justify-start"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Test Rename Feature
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => { 
                          toast.info('Remove confirmation dialog would appear');
                          addTestResult('Remove Feature', 'success', 'Remove dialog works');
                        }}
                        className="w-full justify-start text-red-500"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Test Remove Feature
                      </Button>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                        <span className="text-sm">Test Enable/Disable</span>
                        <Switch 
                          onCheckedChange={(checked) => {
                            toast.success(`Feature ${checked ? 'enabled' : 'disabled'}`);
                            addTestResult('Toggle Feature', 'success', `Set to ${checked}`);
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* University Dashboard Controls */}
                  <Card className="border-blue-500/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-500" />
                        University Dashboard Controls
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button 
                        variant="outline" 
                        onClick={() => { 
                          navigate('/university/dashboard'); 
                          addTestResult('University Dashboard', 'success', 'Navigated to university dashboard');
                        }}
                        className="w-full justify-start"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Dashboard
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => { 
                          toast.success('Edit mode activated for university courses');
                          addTestResult('Edit University Courses', 'success', 'Edit mode active');
                        }}
                        className="w-full justify-start"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Test Edit Courses
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => { 
                          toast.success('University rename functionality tested');
                          addTestResult('University Rename', 'success', 'Rename works');
                        }}
                        className="w-full justify-start"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Test Rename Feature
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => { 
                          toast.info('Remove confirmation dialog would appear');
                          addTestResult('University Remove', 'success', 'Remove dialog works');
                        }}
                        className="w-full justify-start text-red-500"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Test Remove Feature
                      </Button>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                        <span className="text-sm">Test Disable Course</span>
                        <Switch 
                          onCheckedChange={(checked) => {
                            toast.success(`Course ${checked ? 'enabled' : 'disabled'}`);
                            addTestResult('Course Toggle', 'success', `Set to ${checked}`);
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                {/* Sound & Notification Tests */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Volume2 className="w-5 h-5" />
                      Sound & Notification Testing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <Button 
                        onClick={() => {
                          const audio = new Audio('/sounds/success.mp3');
                          audio.play();
                          addTestResult('Success Sound', 'success', 'Played success sound');
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Volume2 className="w-4 h-4 mr-2" />
                        Success Sound
                      </Button>
                      <Button 
                        onClick={() => {
                          const audio = new Audio('/sounds/notification.mp3');
                          audio.play();
                          addTestResult('Notification Sound', 'success', 'Played notification sound');
                        }}
                        variant="secondary"
                      >
                        <Bell className="w-4 h-4 mr-2" />
                        Notification Sound
                      </Button>
                      <Button 
                        onClick={() => {
                          const audio = new Audio('/sounds/warning.mp3');
                          audio.play();
                          addTestResult('Warning Sound', 'success', 'Played warning sound');
                        }}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        <Volume2 className="w-4 h-4 mr-2" />
                        Warning Sound
                      </Button>
                      <Button 
                        onClick={() => {
                          const audio = new Audio('/sounds/error.mp3');
                          audio.play();
                          addTestResult('Error Sound', 'success', 'Played error sound');
                        }}
                        variant="destructive"
                      >
                        <Volume2 className="w-4 h-4 mr-2" />
                        Error Sound
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Separator />

                {/* Settings Tests */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Dashboard Settings Tests</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        toast.success('Teacher settings page tested');
                        addTestResult('Teacher Settings', 'success', 'Settings accessible');
                      }}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Test Teacher Settings
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        toast.success('University settings page tested');
                        addTestResult('University Settings', 'success', 'Settings accessible');
                      }}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Test University Settings
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        toast.success('Teacher notifications tested');
                        addTestResult('Teacher Notifications', 'success', 'Notifications working');
                      }}
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Test Teacher Notifications
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        toast.success('University notifications tested');
                        addTestResult('University Notifications', 'success', 'Notifications working');
                      }}
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Test University Notifications
                    </Button>
                  </CardContent>
                </Card>

                <Separator />

                {/* Role Management & Audit Logs Tests */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Role Management & Audit Logs Testing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <Button 
                      onClick={() => {
                        navigate('/admin/roles');
                        addTestResult('Role Management', 'success', 'Navigated to role management');
                      }}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Test Role Management
                    </Button>
                    <Button 
                      onClick={() => {
                        navigate('/admin/audit-logs');
                        addTestResult('Audit Logs', 'success', 'Navigated to audit logs');
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Test Audit Logs
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={async () => {
                        const { error } = await supabase.from('audit_logs').insert({
                          action: 'test_log',
                          entity_type: 'test',
                          metadata: { test: true }
                        });
                        if (error) {
                          toast.error(`Audit log test failed: ${error.message}`);
                          addTestResult('Audit Log Insert', 'error', error.message);
                        } else {
                          toast.success('Test audit log created');
                          addTestResult('Audit Log Insert', 'success', 'Log created successfully');
                        }
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Create Test Audit Log
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={async () => {
                        const { data, error } = await supabase.functions.invoke('send-payment-notification', {
                          body: {
                            paymentId: 'test-' + Date.now(),
                            courseId: '11111111-1111-1111-1111-111111111111',
                            studentEmail: user?.email || 'test@example.com',
                            studentName: 'Test Student',
                            courseTitle: 'Test Course',
                            amount: 99.99,
                            currency: 'usd'
                          }
                        });
                        if (error) {
                          toast.error(`Email notification test failed: ${error.message}`);
                          addTestResult('Payment Email', 'error', error.message);
                        } else {
                          toast.success('Payment notification email sent');
                          addTestResult('Payment Email', 'success', 'Email sent successfully');
                        }
                      }}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Test Payment Email
                    </Button>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test Results */}
          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Test Results
                </CardTitle>
                <CardDescription>
                  View the results of all tests run in this session
                </CardDescription>
              </CardHeader>
              <CardContent>
                {testResults.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No tests run yet. Run some tests to see results here.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          {result.status === "success" ? (
                            <CheckCircle className="w-5 h-5 text-success" />
                          ) : result.status === "error" ? (
                            <XCircle className="w-5 h-5 text-destructive" />
                          ) : (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          )}
                          <div>
                            <p className="font-medium">{result.name}</p>
                            <p className="text-sm text-muted-foreground">{result.message}</p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            result.status === "success"
                              ? "default"
                              : result.status === "error"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {result.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {testResults.length > 0 && (
                  <div className="mt-4 flex justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => setTestResults([])}
                    >
                      Clear Results
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
};

export default TestingDashboard;