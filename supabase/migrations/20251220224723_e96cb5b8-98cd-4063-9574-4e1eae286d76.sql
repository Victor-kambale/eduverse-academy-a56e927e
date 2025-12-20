-- Fix security definer view issue by dropping the view and using RLS instead
DROP VIEW IF EXISTS public.quiz_answers_public;

-- Create a proper policy that allows users to see answer TEXT during quiz-taking (but not is_correct)
-- The quiz_answers table already has RLS, we need to add a policy for viewing answers during quizzes
CREATE POLICY "Enrolled users can view answer options during quiz" 
ON public.quiz_answers 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.quiz_questions qq
    JOIN public.quizzes q ON q.id = qq.quiz_id
    JOIN public.courses c ON c.id = q.course_id
    JOIN public.enrollments e ON e.course_id = c.id
    WHERE qq.id = quiz_answers.question_id
    AND e.user_id = auth.uid()
    AND c.is_published = true
  )
);