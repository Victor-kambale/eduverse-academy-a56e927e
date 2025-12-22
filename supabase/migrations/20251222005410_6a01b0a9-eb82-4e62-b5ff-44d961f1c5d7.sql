-- Create language_settings table for managing platform languages
CREATE TABLE public.language_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  native_name TEXT,
  flag TEXT,
  is_rtl BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.language_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active languages" 
ON public.language_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage languages" 
ON public.language_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_language_settings_updated_at
BEFORE UPDATE ON public.language_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default languages
INSERT INTO public.language_settings (code, name, native_name, flag, is_rtl, is_active, is_default, sort_order) VALUES
('en', 'English', 'English', '🇺🇸', false, true, true, 1),
('zh', 'Chinese', '中文', '🇨🇳', false, true, false, 2),
('es', 'Spanish', 'Español', '🇪🇸', false, true, false, 3),
('fr', 'French', 'Français', '🇫🇷', false, true, false, 4),
('hi', 'Hindi', 'हिन्दी', '🇮🇳', false, true, false, 5),
('ar', 'Arabic', 'العربية', '🇸🇦', true, true, false, 6),
('ru', 'Russian', 'Русский', '🇷🇺', false, true, false, 7),
('de', 'German', 'Deutsch', '🇩🇪', false, true, false, 8),
('it', 'Italian', 'Italiano', '🇮🇹', false, true, false, 9),
('lg', 'Luganda', 'Oluganda', '🇺🇬', false, true, false, 10);