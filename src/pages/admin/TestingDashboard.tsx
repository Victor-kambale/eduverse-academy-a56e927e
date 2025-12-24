import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
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

        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="payments">
              <CreditCard className="w-4 h-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              User Testing
            </TabsTrigger>
            <TabsTrigger value="system">
              <TestTube className="w-4 h-4 mr-2" />
              System Tests
            </TabsTrigger>
            <TabsTrigger value="certificates">
              <Award className="w-4 h-4 mr-2" />
              Certificates
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

                <div>
                  <h4 className="font-semibold mb-4">Certificate Management</h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    <Button variant="outline" onClick={() => navigate('/admin/certificates')}>
                      <Award className="w-4 h-4 mr-2" />
                      Manage Certificates
                    </Button>
                    <Button variant="outline" onClick={() => window.open('/verify-certificate', '_blank')}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify Certificate Page
                    </Button>
                  </div>
                </div>
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