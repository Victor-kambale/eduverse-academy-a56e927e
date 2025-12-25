-- Create admin comments/notes table for university applications
CREATE TABLE public.university_application_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.university_applications(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL,
  note TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.university_application_notes ENABLE ROW LEVEL SECURITY;

-- Admins can manage all notes
CREATE POLICY "Admins can manage application notes"
  ON public.university_application_notes
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_university_application_notes_updated_at
  BEFORE UPDATE ON public.university_application_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();