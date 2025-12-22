-- Create footer_links table for admin to manage footer content
CREATE TABLE public.footer_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_external BOOLEAN DEFAULT false,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.footer_links ENABLE ROW LEVEL SECURITY;

-- Anyone can view active footer links
CREATE POLICY "Anyone can view active footer links"
  ON public.footer_links FOR SELECT
  USING (is_active = true);

-- Admins can manage all footer links
CREATE POLICY "Admins can manage footer links"
  ON public.footer_links FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_footer_links_updated_at
  BEFORE UPDATE ON public.footer_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default footer links
INSERT INTO public.footer_links (section, title, url, description, sort_order, is_active, is_external) VALUES
-- Resources section
('resources', 'Help Center', '/help', 'Get help and support', 1, true, false),
('resources', 'Blog', '/blog', 'Read our latest articles', 2, true, false),
('resources', 'Community', '/community', 'Join our community', 3, true, false),
('resources', 'Certificates', '/certificates', 'View and verify certificates', 4, true, false),
('resources', 'Careers', '/careers', 'Join our team', 5, true, false),
-- Company section
('company', 'About Us', '/about', 'Learn about our mission', 1, true, false),
('company', 'Become an Instructor', '/teacher-registration', 'Start teaching with us', 2, true, false),
('company', 'For Enterprise', '/enterprise', 'Enterprise solutions', 3, true, false),
('company', 'Press', '/press', 'Press and media', 4, true, false),
('company', 'Contact', '/contact', 'Get in touch with us', 5, true, false),
-- Legal section
('legal', 'Terms of Service', '/terms', 'Our terms and conditions', 1, true, false),
('legal', 'Privacy Policy', '/privacy', 'How we handle your data', 2, true, false),
('legal', 'Cookie Policy', '/cookies', 'Our cookie usage policy', 3, true, false),
('legal', 'Accessibility', '/accessibility', 'Accessibility statement', 4, true, false);