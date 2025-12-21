-- Create enum for application status
CREATE TYPE public.teacher_application_status AS ENUM ('pending', 'approved', 'rejected');

-- Create teacher_applications table
CREATE TABLE public.teacher_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT NOT NULL,
  date_of_birth DATE,
  bio TEXT,
  experience_years INTEGER DEFAULT 0,
  specializations TEXT[],
  linkedin_url TEXT,
  website_url TEXT,
  
  -- Document references (URLs from storage)
  id_document_url TEXT,
  passport_url TEXT,
  graduation_degree_url TEXT,
  cv_url TEXT,
  photo_url TEXT,
  
  -- University information
  university_name TEXT,
  university_country TEXT,
  graduation_year INTEGER,
  degree_type TEXT,
  academic_reference_contact TEXT,
  
  -- Bank account info
  bank_country TEXT,
  bank_name TEXT,
  account_holder_name TEXT,
  account_number TEXT,
  routing_number TEXT,
  swift_code TEXT,
  iban TEXT,
  has_external_card_link BOOLEAN DEFAULT false,
  
  -- Payment status
  registration_fee_paid BOOLEAN DEFAULT false,
  registration_payment_id TEXT,
  registration_payment_date TIMESTAMPTZ,
  
  -- Application status
  status teacher_application_status DEFAULT 'pending',
  rejection_reason TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  
  -- Contract
  contract_signed BOOLEAN DEFAULT false,
  contract_signed_at TIMESTAMPTZ,
  contract_document_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.teacher_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teacher_applications
CREATE POLICY "Users can view their own application"
ON public.teacher_applications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own application"
ON public.teacher_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending application"
ON public.teacher_applications FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all applications"
ON public.teacher_applications FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any application"
ON public.teacher_applications FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Create course_fees table for tracking $5 per course
CREATE TABLE public.course_creation_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL DEFAULT 5.00,
  currency TEXT DEFAULT 'usd',
  payment_id TEXT,
  payment_method TEXT,
  paid_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.course_creation_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their own fees"
ON public.course_creation_fees FOR SELECT
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create fees"
ON public.course_creation_fees FOR INSERT
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Admins can view all fees"
ON public.course_creation_fees FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Create admin_revenue table
CREATE TABLE public.admin_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL, -- 'course_sale', 'registration_fee', 'course_creation_fee'
  source_id UUID,
  teacher_id UUID REFERENCES auth.users(id),
  course_id UUID REFERENCES public.courses(id),
  student_id UUID REFERENCES auth.users(id),
  total_amount NUMERIC NOT NULL,
  commission_percentage NUMERIC NOT NULL,
  commission_amount NUMERIC NOT NULL,
  teacher_amount NUMERIC,
  course_level TEXT, -- 'beginner', 'intermediate', 'advanced', 'training'
  currency TEXT DEFAULT 'usd',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.admin_revenue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all revenue"
ON public.admin_revenue FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert revenue"
ON public.admin_revenue FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view their revenue"
ON public.admin_revenue FOR SELECT
USING (auth.uid() = teacher_id);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info', 'success', 'warning', 'error', 'payment', 'course', 'contract'
  read BOOLEAN DEFAULT false,
  link TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Add profile_can_edit column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS can_edit_profile BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_disabled_reason TEXT;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('teacher-documents', 'teacher-documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('course-media', 'course-media', true);

-- Storage policies for teacher-documents (private)
CREATE POLICY "Users can upload their own teacher documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'teacher-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own teacher documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'teacher-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all teacher documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'teacher-documents' AND has_role(auth.uid(), 'admin'));

-- Storage policies for profile-photos (public)
CREATE POLICY "Anyone can view profile photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload their own profile photo"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile photo"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile photo"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for course-media
CREATE POLICY "Anyone can view course media"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-media');

CREATE POLICY "Instructors and admins can upload course media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'course-media' AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'instructor')));

CREATE POLICY "Instructors and admins can update course media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'course-media' AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'instructor')));

CREATE POLICY "Instructors and admins can delete course media"
ON storage.objects FOR DELETE
USING (bucket_id = 'course-media' AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'instructor')));

-- Update trigger for teacher_applications
CREATE TRIGGER update_teacher_applications_updated_at
BEFORE UPDATE ON public.teacher_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();