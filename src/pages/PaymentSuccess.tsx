import { useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, BookOpen, Play } from "lucide-react";
import { toast } from "sonner";

const PaymentSuccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      toast.success("Payment successful! You now have access to the course.");
    }
  }, [sessionId]);

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
