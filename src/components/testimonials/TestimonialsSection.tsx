import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  country_emoji: string;
  rating: number;
  testimonial_text: string;
  photo_url: string | null;
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();

    // Set up real-time subscription
    const channel = supabase
      .channel('testimonials-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'testimonials',
        },
        () => {
          fetchTestimonials();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
        .limit(3);

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      // Use fallback data
      setTestimonials([
        {
          id: '1',
          name: 'Ayesha J.',
          role: 'Eduverse Graduate',
          country_emoji: '🇵🇰',
          rating: 5,
          testimonial_text: 'Each course on Eduverse has contributed to enhancing my career confidence and professional toolkit.',
          photo_url: null,
        },
        {
          id: '2',
          name: 'Allan K.',
          role: 'Eduverse Graduate',
          country_emoji: '🇺🇬',
          rating: 5,
          testimonial_text: 'Eduverse has truly changed my life! The platform provided me with a solid foundation for professional development.',
          photo_url: null,
        },
        {
          id: '3',
          name: 'Gilbert N.',
          role: 'Eduverse Graduate',
          country_emoji: '🇰🇪',
          rating: 5,
          testimonial_text: 'The flexibility of online learning allowed me to study at my own pace and transition to a management role.',
          photo_url: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-center mb-8">What Eduverse's Graduates Have to Say</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-muted" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-muted rounded" />
                    <div className="h-3 w-32 bg-muted rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-muted rounded" />
                  <div className="h-3 w-full bg-muted rounded" />
                  <div className="h-3 w-2/3 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16">
      <h2 className="text-3xl font-bold text-center mb-8">What Eduverse's Graduates Have to Say</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className="relative">
            <CardContent className="p-6">
              <div className="absolute top-4 right-4 text-4xl text-muted-foreground/20">"</div>
              <div className="flex items-center gap-3 mb-4">
                {testimonial.photo_url ? (
                  <img 
                    src={testimonial.photo_url} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <span className="text-lg font-bold">{testimonial.name.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role} {testimonial.country_emoji}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-amber-500 fill-amber-500" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{testimonial.testimonial_text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}