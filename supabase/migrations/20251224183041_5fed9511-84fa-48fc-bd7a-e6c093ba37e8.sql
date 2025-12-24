-- Create promo analytics table for tracking clicks and conversions
CREATE TABLE public.promo_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  banner_id UUID REFERENCES public.promotional_banners(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL DEFAULT 'click', -- 'click', 'view', 'conversion'
  user_id UUID,
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promo_analytics ENABLE ROW LEVEL SECURITY;

-- Allow system to insert analytics
CREATE POLICY "System can insert analytics" ON public.promo_analytics
  FOR INSERT WITH CHECK (true);

-- Admins can view all analytics
CREATE POLICY "Admins can view analytics" ON public.promo_analytics
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for performance
CREATE INDEX idx_promo_analytics_banner_id ON public.promo_analytics(banner_id);
CREATE INDEX idx_promo_analytics_created_at ON public.promo_analytics(created_at);

-- Enable realtime for promo analytics
ALTER PUBLICATION supabase_realtime ADD TABLE public.promo_analytics;

-- Add email_sent column to promotional_banners for tracking
ALTER TABLE public.promotional_banners 
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email_sent_count INTEGER DEFAULT 0;