import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface EnrollmentStatus {
  isEnrolled: boolean;
  isLoading: boolean;
  enrollmentDate: string | null;
}

export const useEnrollment = (courseId: string | undefined) => {
  const [status, setStatus] = useState<EnrollmentStatus>({
    isEnrolled: false,
    isLoading: true,
    enrollmentDate: null,
  });

  useEffect(() => {
    const checkEnrollment = async () => {
      if (!courseId) {
        setStatus({ isEnrolled: false, isLoading: false, enrollmentDate: null });
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setStatus({ isEnrolled: false, isLoading: false, enrollmentDate: null });
          return;
        }

        const { data: enrollment, error } = await supabase
          .from("enrollments")
          .select("enrolled_at")
          .eq("user_id", user.id)
          .eq("course_id", courseId)
          .maybeSingle();

        if (error) {
          console.error("Error checking enrollment:", error);
          setStatus({ isEnrolled: false, isLoading: false, enrollmentDate: null });
          return;
        }

        setStatus({
          isEnrolled: !!enrollment,
          isLoading: false,
          enrollmentDate: enrollment?.enrolled_at || null,
        });
      } catch (error) {
        console.error("Error checking enrollment:", error);
        setStatus({ isEnrolled: false, isLoading: false, enrollmentDate: null });
      }
    };

    checkEnrollment();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkEnrollment();
    });

    return () => subscription.unsubscribe();
  }, [courseId]);

  return status;
};
