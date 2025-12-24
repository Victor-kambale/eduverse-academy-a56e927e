-- Add A/B testing columns to promotional_banners
ALTER TABLE public.promotional_banners 
ADD COLUMN IF NOT EXISTS variant_name text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_ab_test boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ab_parent_id uuid REFERENCES public.promotional_banners(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS email_template text DEFAULT 'default';

-- Add index for A/B testing queries
CREATE INDEX IF NOT EXISTS idx_promo_banners_ab_parent ON promotional_banners(ab_parent_id) WHERE ab_parent_id IS NOT NULL;