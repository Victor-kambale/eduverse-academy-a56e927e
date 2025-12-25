-- Add expiration tracking to document verifications
ALTER TABLE public.university_document_verifications 
ADD COLUMN IF NOT EXISTS expiry_date DATE,
ADD COLUMN IF NOT EXISTS expiry_notified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS extracted_data JSONB;

-- Create index for expiry date queries
CREATE INDEX IF NOT EXISTS idx_doc_verifications_expiry 
ON public.university_document_verifications(expiry_date) 
WHERE expiry_date IS NOT NULL;