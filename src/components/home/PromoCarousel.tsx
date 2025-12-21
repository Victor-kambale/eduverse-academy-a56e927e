import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Star, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";

interface PromoCourse {
  id: string;
  title: string;
  instructor: string;
  image: string;
  rating: number;
  students: number;
  duration: string;
  price: number;
  originalPrice: number;
  category: string;
  level: string;
}

interface PromoMedia {
  id: string;
  type: "image" | "banner";
  imageUrl: string;
  title: string;
  subtitle?: string;
  link?: string;
}

interface PromoCarouselProps {
  courses?: PromoCourse[];
  promoMedia?: PromoMedia[];
  speed?: "slow" | "normal" | "fast";
  className?: string;
}

const defaultCourses: PromoCourse[] = [
  {
    id: "22222222-2222-2222-2222-222222222222",
    title: "Machine Learning & AI Masterclass",
    instructor: "Prof. Michael Zhang",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop",
    rating: 4.8,
    students: 89000,
    duration: "56 hours",
    price: 129.99,
    originalPrice: 299.99,
    category: "Data Science",
    level: "Intermediate",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    title: "Business Leadership & Management",
    instructor: "Emma Thompson, MBA",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop",
    rating: 4.7,
    students: 67000,
    duration: "28 hours",
    price: 79.99,
    originalPrice: 149.99,
    category: "Business",
    level: "Advanced",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    title: "Healthcare Professional Certificate",
    instructor: "Dr. James Williams",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=250&fit=crop",
    rating: 4.9,
    students: 45000,
    duration: "35 hours",
    price: 99.99,
    originalPrice: 199.99,
    category: "Health",
    level: "Intermediate",
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    title: "Digital Marketing Fundamentals",
    instructor: "Maria Garcia",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
    rating: 4.8,
    students: 78000,
    duration: "24 hours",
    price: 69.99,
    originalPrice: 149.99,
    category: "Marketing",
    level: "Beginner",
  },
];

const defaultPromoMedia: PromoMedia[] = [
  {
    id: "promo-1",
    type: "banner",
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=300&fit=crop",
    title: "New Year Special - 50% Off",
    subtitle: "Start your learning journey today",
    link: "/courses",
  },
  {
    id: "promo-2",
    type: "banner",
    imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=300&fit=crop",
    title: "Free Certificate Courses",
    subtitle: "Upgrade your skills for free",
    link: "/courses?filter=free",
  },
];

export const PromoCarousel = ({
  courses = defaultCourses,
  promoMedia = defaultPromoMedia,
  speed = "normal",
  className,
}: PromoCarouselProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    addAnimation();
  }, []);

  const addAnimation = () => {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);
      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });
      setStart(true);
    }
  };

  const getSpeed = () => {
    switch (speed) {
      case "slow":
        return "80s";
      case "normal":
        return "50s";
      case "fast":
        return "30s";
      default:
        return "50s";
    }
  };

  const allItems = [
    ...promoMedia.map((media) => ({ type: "media" as const, data: media })),
    ...courses.map((course) => ({ type: "course" as const, data: course })),
  ];

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative z-10 overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,white_5%,white_95%,transparent)]",
        className
      )}
    >
      <div
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full gap-4",
          start && "animate-scroll hover:[animation-play-state:paused]"
        )}
        style={{
          animationDuration: getSpeed(),
        }}
      >
        {allItems.map((item, index) => {
          if (item.type === "media") {
            const media = item.data as PromoMedia;
            return (
              <Link
                key={`${media.id}-${index}`}
                to={media.link || "/courses"}
                className="group shrink-0"
              >
                <div className="relative w-[300px] h-[180px] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <img
                    src={media.imageUrl}
                    alt={media.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4">
                    <h3 className="text-white font-bold text-lg">{media.title}</h3>
                    {media.subtitle && (
                      <p className="text-white/80 text-sm">{media.subtitle}</p>
                    )}
                  </div>
                </div>
              </Link>
            );
          }

          const course = item.data as PromoCourse;
          return (
            <Link
              key={`${course.id}-${index}`}
              to={`/course/${course.id}`}
              className="group shrink-0"
            >
              <div className="w-[280px] bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-border">
                <div className="relative h-[140px]">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
                    {course.level}
                  </Badge>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-accent transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{course.instructor}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1 text-accent">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{course.rating}</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {(course.students / 1000).toFixed(0)}k
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {course.duration}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="font-bold">${course.price}</span>
                    <span className="text-xs text-muted-foreground line-through">
                      ${course.originalPrice}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
