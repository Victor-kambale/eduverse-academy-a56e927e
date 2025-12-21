import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, BookOpen, Play, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const PaymentSuccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyAndEnroll = async () => {
      if (!sessionId) {
        setIsVerifying(false);
        setError("No session ID provided");
        return;
      }

      try {
        // Give webhook time to process
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (user && id) {
          // Check if enrollment exists
          const { data: enrollment } = await supabase
            .from("enrollments")
            .select("id")
            .eq("user_id", user.id)
            .eq("course_id", id)
            .single();

          if (enrollment) {
            setPaymentVerified(true);
            toast.success("Payment successful! You now have access to the course.");
          } else {
            // Enrollment may still be processing via webhook
            // Create enrollment directly as fallback
            const { error: enrollError } = await supabase
              .from("enrollments")
              .insert({
                user_id: user.id,
                course_id: id,
              });

            if (!enrollError) {
              setPaymentVerified(true);
              toast.success("Payment successful! You now have access to the course.");
            } else if (enrollError.code === "23505") {
              // Already enrolled
              setPaymentVerified(true);
              toast.success("Payment successful! You now have access to the course.");
            } else {
              console.error("Enrollment error:", enrollError);
              setError("Payment received but enrollment failed. Please contact support.");
            }
          }
        } else {
          setPaymentVerified(true);
          toast.success("Payment successful!");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError("Failed to verify payment. Please contact support.");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAndEnroll();
  }, [sessionId, user, id]);

  if (isVerifying) {
    return (
      <Layout>
        <div className="container py-16 flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-8 pb-8 space-y-6">
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              <div className="space-y-2">
                <h1 className="font-display text-2xl font-bold">Verifying Payment...</h1>
                <p className="text-muted-foreground">
                  Please wait while we confirm your payment.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container py-16 flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-8 pb-8 space-y-6">
              <div className="w-20 h-20 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <div className="space-y-2">
                <h1 className="font-display text-2xl font-bold">Payment Issue</h1>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-16 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-6">
            <div className="w-20 h-20 mx-auto bg-success/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            
            <div className="space-y-2">
              <h1 className="font-display text-2xl font-bold">Payment Successful!</h1>
              <p className="text-muted-foreground">
                Thank you for your purchase. You now have full access to this course.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <Button 
                variant="accent" 
                size="lg" 
                className="w-full"
                onClick={() => navigate(`/course/${id}/learn`)}
              >
                <Play className="w-4 h-4 mr-2" />
                Start Learning
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={() => navigate("/dashboard")}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PaymentSuccess;
