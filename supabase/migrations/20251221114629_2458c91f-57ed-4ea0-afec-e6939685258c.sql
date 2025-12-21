-- Create certificates table (teacher creates, admin approves)
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL,
  template_name TEXT NOT NULL,
  template_url TEXT,
  description TEXT,
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student certificates (issued to students after course completion)
CREATE TABLE public.student_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_id UUID NOT NULL REFERENCES public.certificates(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  certificate_url TEXT,
  credential_id TEXT NOT NULL UNIQUE
);

-- Create course resources table (PDFs, teacher uploads, admin approves)
CREATE TABLE public.course_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  is_downloadable BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_resources ENABLE ROW LEVEL SECURITY;

-- Certificates policies
CREATE POLICY "Teachers can create certificates for their courses"
ON public.certificates FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = certificates.course_id 
    AND courses.instructor_id = auth.uid()
  )
);

CREATE POLICY "Teachers can view their certificates"
ON public.certificates FOR SELECT
USING (teacher_id = auth.uid());

CREATE POLICY "Admins can view all certificates"
ON public.certificates FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update certificates"
ON public.certificates FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Teachers can update their pending certificates"
ON public.certificates FOR UPDATE
USING (teacher_id = auth.uid() AND is_approved = false);

CREATE POLICY "Students can view approved certificates for enrolled courses"
ON public.certificates FOR SELECT
USING (
  is_approved = true AND
  EXISTS (
    SELECT 1 FROM enrollments 
    WHERE enrollments.course_id = certificates.course_id 
    AND enrollments.user_id = auth.uid()
  )
);

-- Student certificates policies
CREATE POLICY "Students can view their own certificates"
ON public.student_certificates FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "System can create student certificates"
ON public.student_certificates FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all student certificates"
ON public.student_certificates FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Course resources policies
CREATE POLICY "Teachers can create resources for their courses"
ON public.course_resources FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = course_resources.course_id 
    AND courses.instructor_id = auth.uid()
  )
);

CREATE POLICY "Teachers can view their resources"
ON public.course_resources FOR SELECT
USING (teacher_id = auth.uid());

CREATE POLICY "Admins can view all resources"
ON public.course_resources FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update resources"
ON public.course_resources FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Teachers can update their pending resources"
ON public.course_resources FOR UPDATE
USING (teacher_id = auth.uid() AND is_approved = false);

CREATE POLICY "Students can view approved downloadable resources for enrolled courses"
ON public.course_resources FOR SELECT
USING (
  is_approved = true AND
  EXISTS (
    SELECT 1 FROM enrollments 
    WHERE enrollments.course_id = course_resources.course_id 
    AND enrollments.user_id = auth.uid()
  )
);

-- Create storage bucket for course resources/PDFs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('course-resources', 'course-resources', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for course resources
CREATE POLICY "Teachers can upload course resources"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-resources' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view approved course resources"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'course-resources' AND
  auth.uid() IS NOT NULL
);

-- Create storage bucket for certificates
INSERT INTO storage.buckets (id, name, public) 
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for certificates
CREATE POLICY "Teachers can upload certificates"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'certificates' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Anyone can view certificates"
ON storage.objects FOR SELECT
USING (bucket_id = 'certificates');