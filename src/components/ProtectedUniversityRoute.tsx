import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedUniversityRouteProps {
  children: React.ReactNode;
}

const ProtectedUniversityRoute = ({ children }: ProtectedUniversityRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [isUniversityMember, setIsUniversityMember] = useState<boolean | null>(null);
  const [checkingMembership, setCheckingMembership] = useState(true);

  useEffect(() => {
    const checkUniversityMembership = async () => {
      if (!user) {
        setCheckingMembership(false);
        return;
      }

      try {
        // Check if user has approved teacher application with university affiliation
        // or has a specific university role
        const { data: teacherApp, error: teacherError } = await supabase
          .from('teacher_applications')
          .select('university_name, status')
          .eq('user_id', user.id)
          .eq('status', 'approved')
          .not('university_name', 'is', null)
          .maybeSingle();

        if (teacherError) throw teacherError;

        // Check if user is an instructor (universities can have instructor roles)
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'instructor')
          .maybeSingle();

        if (roleError) throw roleError;

        setIsUniversityMember(!!teacherApp || !!roleData);
      } catch (error) {
        console.error('Error checking university membership:', error);
        setIsUniversityMember(false);
      } finally {
        setCheckingMembership(false);
      }
    };

    if (!authLoading && user) {
      checkUniversityMembership();
    } else if (!authLoading) {
      setCheckingMembership(false);
    }
  }, [user, authLoading]);

  if (authLoading || roleLoading || checkingMembership) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Verifying university access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/university" replace />;
  }

  // Allow if user is admin or has university membership
  if (!isAdmin && !isUniversityMember) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md mx-auto p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access the University Dashboard. Please register your university first.
          </p>
          <div className="flex gap-4 justify-center">
            <a 
              href="/university/register" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Register University
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

export default ProtectedUniversityRoute;
