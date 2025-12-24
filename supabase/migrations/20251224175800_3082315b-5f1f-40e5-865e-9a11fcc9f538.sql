-- Create testimonials table for dynamic testimonials management
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Eduverse Graduate',
  country_code TEXT NOT NULL DEFAULT 'US',
  country_emoji TEXT NOT NULL DEFAULT '🇺🇸',
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  testimonial_text TEXT NOT NULL,
  photo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Create policies for testimonials
CREATE POLICY "Anyone can view active testimonials"
  ON public.testimonials
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all testimonials"
  ON public.testimonials
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert testimonials"
  ON public.testimonials
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update testimonials"
  ON public.testimonials
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete testimonials"
  ON public.testimonials
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create admin 2FA table
CREATE TABLE public.admin_2fa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  totp_secret TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  backup_codes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_2fa ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_2fa
CREATE POLICY "Admins can view their own 2FA settings"
  ON public.admin_2fa
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert their own 2FA settings"
  ON public.admin_2fa
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update their own 2FA settings"
  ON public.admin_2fa
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

-- Add updated_at trigger for testimonials
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for admin_2fa
CREATE TRIGGER update_admin_2fa_updated_at
  BEFORE UPDATE ON public.admin_2fa
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for testimonials
ALTER PUBLICATION supabase_realtime ADD TABLE public.testimonials;

-- Insert default testimonials
INSERT INTO public.testimonials (name, role, country_code, country_emoji, rating, testimonial_text, sort_order)
VALUES
  ('Ayesha J.', 'Eduverse Graduate', 'PK', '🇵🇰', 5, 'Each course on Eduverse has contributed to enhancing my career confidence and professional toolkit. The certifications I''ve earned not only validate my skills but also catch the attention of employers.', 1),
  ('Allan K.', 'Eduverse Graduate', 'UG', '🇺🇬', 5, 'Eduverse has truly changed my life! Through the platform, I completed a Diploma in Supervision and a Diploma in Logistics, which provided me with a solid platform for self-education and professional development.', 2),
  ('Gilbert N.', 'Eduverse Graduate', 'KE', '🇰🇪', 5, 'The flexibility of online learning allowed me to study at my own pace, and the valuable skills I gained helped me transition from bartending to a management role.', 3);