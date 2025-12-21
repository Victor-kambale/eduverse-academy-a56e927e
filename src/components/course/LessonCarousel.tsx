import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  thumbnail?: string;
}

interface LessonCarouselProps {
  lessons: Lesson[];
  currentLessonId: string;
  onSelectLesson: (lessonId: string) => void;
  completedLessons: Set<string>;
}

export const LessonCarousel = ({
  lessons,
  currentLessonId,
  onSelectLesson,
  completedLessons,
}: LessonCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="relative group">
      {/* Left Arrow */}
      {canScrollLeft && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      )}

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth py-2 px-1"
        onScroll={checkScroll}
      >
        {lessons.map((lesson, index) => (
          <button
            key={lesson.id}
            onClick={() => onSelectLesson(lesson.id)}
            className={cn(
              "flex-shrink-0 w-64 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl",
              currentLessonId === lesson.id
                ? "ring-2 ring-accent shadow-lg"
                : "shadow-md hover:ring-1 hover:ring-border"
            )}
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-muted">
              <img
                src={lesson.thumbnail || `https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=225&fit=crop`}
                alt={lesson.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-accent/90 flex items-center justify-center">
                  <Play className="w-5 h-5 text-accent-foreground ml-0.5" />
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                {completedLessons.has(lesson.id) ? (
                  <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-success-foreground" />
                  </div>
                ) : currentLessonId === lesson.id ? (
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                    <Play className="w-3 h-3 text-accent-foreground" />
                  </div>
                ) : null}
              </div>

              {/* Lesson Number */}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-xs text-white font-medium">
                Lesson {index + 1}
              </div>
            </div>

            {/* Info */}
            <div className="p-3 bg-card">
              <h4 className="font-medium text-sm truncate text-left">{lesson.title}</h4>
              <p className="text-xs text-muted-foreground text-left">{lesson.duration}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Right Arrow */}
      {canScrollRight && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};
