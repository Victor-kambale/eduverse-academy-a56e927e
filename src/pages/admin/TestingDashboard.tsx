import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
} from "lucide-react";

const TestingDashboard = () => {
  const { user } = useAuth();
  const [testEmail, setTestEmail] = useState("");
  const [testPassword, setTestPassword] = useState("Test123!");
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isTestingPayment, setIsTestingPayment] = useState(false);
  const [testResults, setTestResults] = useState<{ name: string; status: "success" | "error" | "pending"; message: string }[]>([]);

  // Test Stripe Payment
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

  // Create test user
  const createTestUser = async (role: "student" | "teacher") => {
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
        // If teacher, also add role
        if (role === "teacher") {
          await supabase.from("user_roles").insert({
            user_id: data.user.id,
            role: "instructor",
          });
        }

        toast.success(`Test ${role} created: ${email}`);
        addTestResult(`Create Test ${role}`, "success", `User created: ${email}`);
      }
    } catch (error: any) {
      toast.error(`Failed to create test user: ${error.message}`);
      addTestResult(`Create Test ${role}`, "error", error.message);
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Test Notification System
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
      addTestResult("Notification System", "success", "Notification created successfully");
    } catch (error: any) {
      toast.error(`Notification test failed: ${error.message}`);
      addTestResult("Notification System", "error", error.message);
    }
  };

  // Test Email Function
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

  // Verify Database Connection
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Testing Dashboard</h1>
        <p className="text-muted-foreground">
          Test all platform functionality including payments, user accounts, and notifications
        </p>
      </div>

      <Tabs defaultValue="payments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
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
                    <p className="text-muted-foreground">Expiry & CVC:</p>
                    <code className="bg-background px-2 py-1 rounded">Any future date, any 3 digits</code>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-2 border-dashed">
                  <CardContent className="pt-6 text-center">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 text-success" />
                    <h3 className="font-semibold mb-2">Test Course Purchase</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Creates a $1.00 test checkout session
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
                    <h3 className="font-semibold mb-2">Test Teacher Payment</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Test the teacher registration fee flow
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => window.open('/teacher/register', '_blank')}
                      className="w-full"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Go to Teacher Registration
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-accent/10 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Payment Flow Steps</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Click "Start Payment Test" to create a checkout session</li>
                  <li>Stripe checkout page opens in a new tab</li>
                  <li>Enter test card number: 4242 4242 4242 4242</li>
                  <li>Use any future expiry date and any 3-digit CVC</li>
                  <li>Complete payment - you'll be redirected to success page</li>
                  <li>Check webhook logs in admin dashboard for confirmation</li>
                </ol>
              </div>
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
                Create test student and teacher accounts for testing
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

              <div className="grid gap-4 md:grid-cols-2">
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
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-4">Quick Access Links</h4>
                <div className="grid gap-2 md:grid-cols-3">
                  <Button variant="outline" onClick={() => window.open('/auth', '_blank')}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Login Page
                  </Button>
                  <Button variant="outline" onClick={() => window.open('/dashboard', '_blank')}>
                    <Users className="w-4 h-4 mr-2" />
                    Student Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => window.open('/teacher/dashboard', '_blank')}>
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Teacher Dashboard
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
                  onClick={() => window.open('/admin/chat', '_self')}
                  className="w-full"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Go to Chat Management
                </Button>
              </CardContent>
            </Card>
          </div>
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
                      <Badge variant={result.status === "success" ? "default" : "destructive"}>
                        {result.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              
              {testResults.length > 0 && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setTestResults([])}
                >
                  Clear Results
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestingDashboard;
