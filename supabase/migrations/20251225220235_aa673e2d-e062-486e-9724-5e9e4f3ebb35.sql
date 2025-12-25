-- Create document templates table for sample documents
CREATE TABLE public.document_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  document_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID,
  is_active BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add scoring columns to university_applications
ALTER TABLE public.university_applications 
ADD COLUMN IF NOT EXISTS completeness_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS document_quality_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS overall_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_scored_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS scoring_notes TEXT;

-- Enable RLS on document_templates
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for document_templates
CREATE POLICY "Admins can manage document templates"
ON public.document_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active document templates"
ON public.document_templates
FOR SELECT
USING (is_active = true);

-- Create index for faster queries
CREATE INDEX idx_document_templates_type ON public.document_templates(document_type);
CREATE INDEX idx_university_applications_score ON public.university_applications(overall_score DESC);

-- Trigger for updated_at
CREATE TRIGGER update_document_templates_updated_at
BEFORE UPDATE ON public.document_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();