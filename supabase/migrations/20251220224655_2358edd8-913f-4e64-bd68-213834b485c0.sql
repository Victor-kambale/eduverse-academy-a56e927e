-- Fix security: Restrict quiz answer visibility - users should not see is_correct until after answering
-- Drop existing permissive SELECT policy for quiz_answers
DROP POLICY IF EXISTS "Anyone can view answers for published course quizzes" ON public.quiz_answers;

-- Create new policy: Only show answer content, not correctness, for unenrolled users
-- Enrolled users can see answers after quiz attempt is complete
CREATE POLICY "Users can view answers for their completed quiz attempts" 
ON public.quiz_answers 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.quiz_attempts qa
    JOIN public.quiz_questions qq ON qq.quiz_id = qa.quiz_id
    WHERE qq.id = quiz_answers.question_id
    AND qa.user_id = auth.uid()
    AND qa.completed_at IS NOT NULL
  )
  OR has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.quiz_questions qq
    JOIN public.quizzes q ON q.id = qq.quiz_id
    JOIN public.courses c ON c.id = q.course_id
    WHERE qq.id = quiz_answers.question_id
    AND c.instructor_id = auth.uid()
  )
);

-- Create a separate view for taking quizzes (shows answer text but not is_correct)
CREATE OR REPLACE VIEW public.quiz_answers_public AS
SELECT 
  id,
  question_id,
  answer_text,
  sort_order
FROM public.quiz_answers;

-- Grant access to the view
GRANT SELECT ON public.quiz_answers_public TO authenticated;
GRANT SELECT ON public.quiz_answers_public TO anon;

-- Fix security: Add anonymous access protection to profiles table
-- Ensure profiles are only visible to their owners and admins
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Ensure anonymous users cannot access profiles at all (RLS is already enabled)
-- The existing policies already require auth.uid() to match, so anon users get no access

-- Add policy for admins to view all profiles for user management
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));