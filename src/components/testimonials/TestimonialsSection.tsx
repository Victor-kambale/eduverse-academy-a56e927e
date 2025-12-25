import { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || testimonials.length <= 3) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % Math.max(1, testimonials.length - 2));
    }, 4000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
        .limit(10);

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

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => Math.min(testimonials.length - 3, prev + 1));
  };

  const scrollToSection = () => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (loading) {
    return (
      <div className="mt-16" ref={containerRef}>
        <h2 className="text-3xl font-bold text-center mb-8">What Eduverse's Graduates Have to Say</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse rounded-2xl">
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

  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + 3);

  return (
    <div className="mt-16 scroll-smooth" ref={containerRef}>
      <h2 className="text-3xl font-bold text-center mb-8">What Eduverse's Graduates Have to Say</h2>
      
      <div className="relative">
        {testimonials.length > 3 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background shadow-lg hover:scale-110 transition-transform"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background shadow-lg hover:scale-110 transition-transform"
              onClick={goToNext}
              disabled={currentIndex >= testimonials.length - 3}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
        
        <div className="overflow-hidden">
          <motion.div 
            className="grid md:grid-cols-3 gap-6"
            initial={false}
          >
            <AnimatePresence mode="popLayout">
              {visibleTestimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="relative h-full rounded-2xl border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="absolute top-4 right-4 text-4xl text-muted-foreground/20">"</div>
                      <div className="flex items-center gap-3 mb-4">
                        {testimonial.photo_url ? (
                          <img 
                            src={testimonial.photo_url} 
                            alt={testimonial.name}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center ring-2 ring-primary/20">
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
                      <p className="text-sm text-muted-foreground leading-relaxed">{testimonial.testimonial_text}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Carousel Indicators */}
        {testimonials.length > 3 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: Math.max(1, testimonials.length - 2) }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-primary w-6' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}