-- Create university_applications table for tracking registration submissions
CREATE TABLE public.university_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    
    -- Basic Information
    institution_name TEXT NOT NULL,
    institution_type TEXT NOT NULL,
    founding_year INTEGER,
    country TEXT NOT NULL,
    city TEXT,
    website_url TEXT,
    primary_email TEXT NOT NULL,
    primary_phone TEXT,
    
    -- Contact Person
    contact_name TEXT NOT NULL,
    contact_title TEXT,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    
    -- Academic Information
    student_count TEXT,
    faculty_count TEXT,
    programs_offered TEXT[],
    accreditation_bodies TEXT[],
    
    -- Documents (URLs from storage)
    certificate_of_incorporation_url TEXT,
    business_registration_url TEXT,
    tax_clearance_url TEXT,
    operating_license_url TEXT,
    government_approval_url TEXT,
    ministry_certificate_url TEXT,
    accreditation_certificate_url TEXT,
    quality_assurance_url TEXT,
    academic_charter_url TEXT,
    institutional_profile_url TEXT,
    leadership_cv_url TEXT,
    authorization_letter_url TEXT,
    
    -- Verification Status
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    contract_signed BOOLEAN DEFAULT false,
    contract_signed_at TIMESTAMPTZ,
    registration_fee_paid BOOLEAN DEFAULT false,
    registration_payment_id TEXT,
    registration_payment_date TIMESTAMPTZ,
    
    -- Application Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
    rejection_reason TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.university_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own applications
CREATE POLICY "Users can view own university applications"
ON public.university_applications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own applications
CREATE POLICY "Users can create university applications"
ON public.university_applications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending applications
CREATE POLICY "Users can update own pending applications"
ON public.university_applications
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all applications
CREATE POLICY "Admins can view all university applications"
ON public.university_applications
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update any application
CREATE POLICY "Admins can update university applications"
ON public.university_applications
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger
CREATE TRIGGER update_university_applications_updated_at
BEFORE UPDATE ON public.university_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.university_applications;