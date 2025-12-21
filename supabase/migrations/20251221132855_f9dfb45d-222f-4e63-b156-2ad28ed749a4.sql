-- Create newsletter subscribers table
CREATE TABLE public.newsletter_subscribers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  subscribed_at timestamp with time zone NOT NULL DEFAULT now(),
  unsubscribed_at timestamp with time zone,
  is_active boolean DEFAULT true,
  source text DEFAULT 'website',
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to subscribe (insert)
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscribers
FOR INSERT
WITH CHECK (true);

-- Users can view their own subscription
CREATE POLICY "Users can view their own subscription"
ON public.newsletter_subscribers
FOR SELECT
USING (email = current_setting('request.jwt.claims', true)::json->>'email' OR user_id = auth.uid());

-- Users can update their own subscription
CREATE POLICY "Users can update their own subscription"
ON public.newsletter_subscribers
FOR UPDATE
USING (email = current_setting('request.jwt.claims', true)::json->>'email' OR user_id = auth.uid());

-- Create code snippets table for lesson resources
CREATE TABLE public.code_snippets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  language text NOT NULL DEFAULT 'javascript',
  code text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  teacher_id uuid NOT NULL
);

-- Enable RLS
ALTER TABLE public.code_snippets ENABLE ROW LEVEL SECURITY;

-- Students enrolled can view snippets
CREATE POLICY "Enrolled students can view code snippets"
ON public.code_snippets
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM enrollments
    WHERE enrollments.course_id = code_snippets.course_id
    AND enrollments.user_id = auth.uid()
  )
);

-- Instructors can manage their snippets
CREATE POLICY "Instructors can manage their code snippets"
ON public.code_snippets
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = code_snippets.course_id
    AND courses.instructor_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = code_snippets.course_id
    AND courses.instructor_id = auth.uid()
  )
);

-- Admins can manage all snippets
CREATE POLICY "Admins can manage all code snippets"
ON public.code_snippets
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));