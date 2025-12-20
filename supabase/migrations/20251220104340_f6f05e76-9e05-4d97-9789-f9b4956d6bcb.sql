-- Create quizzes table (can be per lesson or final exam)
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_final_exam BOOLEAN DEFAULT false,
  passing_score INTEGER DEFAULT 70,
  time_limit_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create questions table
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice',
  points INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create answer options table
CREATE TABLE public.quiz_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

-- Create user quiz attempts table
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INTEGER,
  total_points INTEGER,
  passed BOOLEAN,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create user answers table
CREATE TABLE public.user_quiz_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  selected_answer_id UUID REFERENCES public.quiz_answers(id),
  is_correct BOOLEAN
);

-- Create payments table for tracking purchases
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Quizzes policies (anyone can view quizzes for published courses)
CREATE POLICY "Anyone can view quizzes for published courses"
ON public.quizzes FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.courses 
  WHERE courses.id = quizzes.course_id AND courses.is_published = true
));

CREATE POLICY "Instructors can manage quizzes for their courses"
ON public.quizzes FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.courses 
  WHERE courses.id = quizzes.course_id AND courses.instructor_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.courses 
  WHERE courses.id = quizzes.course_id AND courses.instructor_id = auth.uid()
));

CREATE POLICY "Admins can manage all quizzes"
ON public.quizzes FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Quiz questions policies
CREATE POLICY "Anyone can view questions for published course quizzes"
ON public.quiz_questions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.quizzes q
  JOIN public.courses c ON c.id = q.course_id
  WHERE q.id = quiz_questions.quiz_id AND c.is_published = true
));

CREATE POLICY "Instructors can manage questions for their quizzes"
ON public.quiz_questions FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.quizzes q
  JOIN public.courses c ON c.id = q.course_id
  WHERE q.id = quiz_questions.quiz_id AND c.instructor_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.quizzes q
  JOIN public.courses c ON c.id = q.course_id
  WHERE q.id = quiz_questions.quiz_id AND c.instructor_id = auth.uid()
));

CREATE POLICY "Admins can manage all questions"
ON public.quiz_questions FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Quiz answers policies
CREATE POLICY "Anyone can view answers for published course quizzes"
ON public.quiz_answers FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.quiz_questions qq
  JOIN public.quizzes q ON q.id = qq.quiz_id
  JOIN public.courses c ON c.id = q.course_id
  WHERE qq.id = quiz_answers.question_id AND c.is_published = true
));

CREATE POLICY "Instructors can manage answers for their quizzes"
ON public.quiz_answers FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.quiz_questions qq
  JOIN public.quizzes q ON q.id = qq.quiz_id
  JOIN public.courses c ON c.id = q.course_id
  WHERE qq.id = quiz_answers.question_id AND c.instructor_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.quiz_questions qq
  JOIN public.quizzes q ON q.id = qq.quiz_id
  JOIN public.courses c ON c.id = q.course_id
  WHERE qq.id = quiz_answers.question_id AND c.instructor_id = auth.uid()
));

CREATE POLICY "Admins can manage all answers"
ON public.quiz_answers FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Quiz attempts policies
CREATE POLICY "Users can view their own attempts"
ON public.quiz_attempts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own attempts"
ON public.quiz_attempts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attempts"
ON public.quiz_attempts FOR UPDATE
USING (auth.uid() = user_id);

-- User quiz answers policies
CREATE POLICY "Users can view their own answers"
ON public.user_quiz_answers FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.quiz_attempts 
  WHERE quiz_attempts.id = user_quiz_answers.attempt_id 
  AND quiz_attempts.user_id = auth.uid()
));

CREATE POLICY "Users can create their own answers"
ON public.user_quiz_answers FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.quiz_attempts 
  WHERE quiz_attempts.id = user_quiz_answers.attempt_id 
  AND quiz_attempts.user_id = auth.uid()
));

-- Payments policies
CREATE POLICY "Users can view their own payments"
ON public.payments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments"
ON public.payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments"
ON public.payments FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Add triggers for updated_at
CREATE TRIGGER update_quizzes_updated_at
BEFORE UPDATE ON public.quizzes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();