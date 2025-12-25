-- Add video and social media fields to testimonials table
ALTER TABLE public.testimonials 
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS social_facebook text,
ADD COLUMN IF NOT EXISTS social_twitter text,
ADD COLUMN IF NOT EXISTS social_linkedin text,
ADD COLUMN IF NOT EXISTS social_instagram text,
ADD COLUMN IF NOT EXISTS testimonial_type text DEFAULT 'text' CHECK (testimonial_type IN ('text', 'video'));

-- Create gift_cards table for admin management
CREATE TABLE IF NOT EXISTS public.gift_cards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  gradient text NOT NULL,
  category text NOT NULL DEFAULT 'special',
  icon text,
  is_active boolean NOT NULL DEFAULT true,
  is_disabled boolean NOT NULL DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;

-- Create policies for gift cards
CREATE POLICY "Anyone can view active gift cards" 
ON public.gift_cards 
FOR SELECT 
USING (is_active = true AND is_disabled = false);

CREATE POLICY "Admins can manage gift cards" 
ON public.gift_cards 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.gift_cards;

-- Insert default gift cards
INSERT INTO public.gift_cards (name, gradient, category, sort_order) VALUES
('Christmas Gift Card', 'from-red-500 to-red-700', 'holiday', 1),
('Hanukkah Gift Card', 'from-blue-800 to-blue-950', 'holiday', 2),
('Happy Holidays Gift Card', 'from-green-600 to-green-800', 'holiday', 3),
('Achieve Your Dreams Gift Card', 'from-yellow-200 to-amber-300', 'special', 4),
('Birthday Gift Card', 'from-orange-300 to-pink-400', 'celebration', 5),
('Congratulations Gift Card', 'from-purple-200 to-purple-400', 'celebration', 6),
('Diwali Gift Card', 'from-purple-600 to-purple-900', 'holiday', 7),
('Eid Gift Card', 'from-blue-400 to-blue-600', 'holiday', 8),
('Farewell Gift Card', 'from-indigo-800 to-pink-600', 'special', 9),
('Father''s Day Gift Card', 'from-sky-300 to-sky-500', 'celebration', 10),
('For Someone Special Gift Card', 'from-pink-200 to-pink-400', 'special', 11),
('Happy Graduation Gift Card', 'from-blue-300 to-sky-400', 'celebration', 12),
('Just For You Gift Card', 'from-amber-100 to-pink-200', 'special', 13),
('Mother''s Day Gift Card', 'from-teal-300 to-teal-500', 'celebration', 14),
('Thank You Gift Card', 'from-slate-800 to-slate-900', 'special', 15),
('Thanksgiving Gift Card', 'from-orange-600 to-amber-700', 'holiday', 16),
('Thinking of You Gift Card', 'from-rose-300 to-rose-500', 'special', 17),
('Valentine''s Day Gift Card', 'from-pink-400 to-red-500', 'holiday', 18),
('Women''s Day Gift Card', 'from-pink-200 to-pink-400', 'celebration', 19),
('Create Your Own Gift Card', 'from-lime-400 to-green-500', 'custom', 20)
ON CONFLICT DO NOTHING;

-- Create updated_at trigger for gift_cards
CREATE TRIGGER update_gift_cards_updated_at
BEFORE UPDATE ON public.gift_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();