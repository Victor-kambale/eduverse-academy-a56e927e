-- Create document verification table
CREATE TABLE public.university_document_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.university_applications(id) ON DELETE CASCADE,
  document_key TEXT NOT NULL,
  document_label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  admin_id UUID,
  admin_comment TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(application_id, document_key)
);

-- Enable RLS
ALTER TABLE public.university_document_verifications ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage document verifications" 
ON public.university_document_verifications 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Universities can view their document verifications" 
ON public.university_document_verifications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.university_applications ua 
    WHERE ua.id = application_id AND ua.user_id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_university_document_verifications_updated_at
BEFORE UPDATE ON public.university_document_verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add reminder tracking to university_applications
ALTER TABLE public.university_applications 
ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reminder_count INTEGER DEFAULT 0;