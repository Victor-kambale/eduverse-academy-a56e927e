import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedTeacherRouteProps {
  children: React.ReactNode;
}

const ProtectedTeacherRoute = ({ children }: ProtectedTeacherRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isInstructor, isAdmin, loading: roleLoading } = useUserRole();
  const [hasApprovedApplication, setHasApprovedApplication] = useState<boolean | null>(null);
  const [checkingApplication, setCheckingApplication] = useState(true);

  useEffect(() => {
    const checkTeacherApplication = async () => {
      if (!user) {
        setCheckingApplication(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('teacher_applications')
          .select('status')
          .eq('user_id', user.id)
          .eq('status', 'approved')
          .maybeSingle();

        if (error) throw error;
        setHasApprovedApplication(!!data);
      } catch (error) {
        console.error('Error checking teacher application:', error);
        setHasApprovedApplication(false);
      } finally {
        setCheckingApplication(false);
      }
    };

    if (!authLoading && user) {
      checkTeacherApplication();
    } else if (!authLoading) {
      setCheckingApplication(false);
    }
  }, [user, authLoading]);

  if (authLoading || roleLoading || checkingApplication) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Verifying teacher access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/teacher" replace />;
  }

  // Allow if user is admin, has instructor role, or has approved teacher application
  if (!isAdmin && !isInstructor && !hasApprovedApplication) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md mx-auto p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access the Teacher Dashboard. Please apply to become a teacher first.
          </p>
          <div className="flex gap-4 justify-center">
            <a 
              href="/teacher/register" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Apply as Teacher
            </a>
            <a 
              href="/dashboard" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedTeacherRoute;
