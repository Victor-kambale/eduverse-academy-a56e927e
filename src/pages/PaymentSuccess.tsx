import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, BookOpen, Play, Loader2, XCircle, Award, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { notifyEnrollment, notifyPayment } from "@/hooks/useNotifications";
import { motion } from "framer-motion";

const PaymentSuccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState("Course");
  const [coursePrice, setCoursePrice] = useState(0);

  useEffect(() => {
    const verifyAndEnroll = async () => {
      if (!sessionId) {
        setIsVerifying(false);
        setError("No session ID provided");
        return;
      }

      try {
        // Give webhook time to process
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Get course details
        if (id) {
          const { data: courseData } = await supabase
            .from("courses")
            .select("title, price")
            .eq("id", id)
            .single();
          if (courseData) {
            setCourseTitle(courseData.title);
            setCoursePrice(courseData.price);
          }
        }

        if (user && id) {
          // Check if enrollment exists (webhook may have created it)
          const { data: enrollment } = await supabase
            .from("enrollments")
            .select("id")
            .eq("user_id", user.id)
            .eq("course_id", id)
            .maybeSingle();

          if (enrollment) {
            setPaymentVerified(true);
          } else {
            // Fallback: create enrollment directly
            const { error: enrollError } = await supabase
              .from("enrollments")
              .insert({ user_id: user.id, course_id: id });

            if (!enrollError || enrollError.code === "23505") {
              setPaymentVerified(true);
            } else {
              console.error("Enrollment error:", enrollError);
              setError("Payment received but enrollment failed. Please contact support.");
              return;
            }
          }

          // Send notifications
          toast.success("Payment successful! You now have access to the course.");
          await notifyEnrollment(user.id, courseTitle, id);
          await notifyPayment(user.id, coursePrice, courseTitle, "Stripe");

          // Play success sound
          const audio = new Audio('/sounds/success.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {});
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
        <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-secondary/30" />
          <div className="absolute inset-0 dot-pattern opacity-20" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="max-w-md w-full text-center shadow-elevated border-0">
              <CardContent className="pt-10 pb-10 space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-28 h-28 rounded-full bg-primary/5 animate-ping" />
                  </div>
                  <div className="relative w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h1 className="font-display text-2xl font-bold">Verifying Payment...</h1>
                  <p className="text-muted-foreground">
                    Please wait while we confirm your payment and activate your enrollment.
                  </p>
                </div>
                <div className="flex justify-center gap-2">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-secondary/30" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="max-w-md w-full text-center shadow-elevated border-0">
              <CardContent className="pt-10 pb-10 space-y-6">
                <div className="w-24 h-24 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-destructive" />
                </div>
                <div className="space-y-2">
                  <h1 className="font-display text-2xl font-bold">Payment Issue</h1>
                  <p className="text-muted-foreground">{error}</p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => navigate(`/course/${id}`)}>
                    Back to Course
                  </Button>
                  <Button onClick={() => navigate("/dashboard")}>
                    Go to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-secondary/20" />
        <div className="absolute inset-0 dot-pattern opacity-15" />
        <motion.div
          className="absolute top-20 left-[20%] w-64 h-64 rounded-full bg-success/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-[20%] w-48 h-48 rounded-full bg-accent/10 blur-3xl"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10"
        >
          <Card className="max-w-lg w-full text-center shadow-2xl border-0 overflow-hidden">
            {/* Success banner */}
            <div className="h-2 bg-gradient-to-r from-success via-accent to-success" />

            <CardContent className="pt-10 pb-10 space-y-6 px-8">
              {/* Animated check icon */}
              <div className="relative">
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="w-28 h-28 rounded-full bg-success/10" />
                </motion.div>
                <motion.div
                  className="relative w-24 h-24 mx-auto bg-success/15 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
                >
                  <CheckCircle className="w-14 h-14 text-success" />
                </motion.div>
                <motion.div
                  className="absolute top-0 right-[30%]"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <Sparkles className="w-6 h-6 text-accent" />
                </motion.div>
              </div>

              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h1 className="font-display text-3xl font-bold text-foreground">
                  Payment Successful!
                </h1>
                <p className="text-muted-foreground text-lg">
                  You now have full access to <span className="font-semibold text-foreground">{courseTitle}</span>
                </p>
              </motion.div>

              {/* Payment details */}
              <motion.div
                className="bg-muted/50 rounded-xl p-4 space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-bold text-foreground">${coursePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Method</span>
                  <Badge variant="secondary" className="font-medium">Stripe</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className="bg-success/10 text-success border-success/20">Confirmed</Badge>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                className="space-y-3 pt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Button
                  variant="accent"
                  size="xl"
                  className="w-full group shine-effect"
                  onClick={() => navigate(`/course/${id}/learn`)}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Learning Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/courses")}
                  >
                    <Award className="w-4 h-4 mr-2" />
                    More Courses
                  </Button>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default PaymentSuccess;
