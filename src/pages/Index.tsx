import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Layout } from "@/components/layout/Layout";
import {
  GraduationCap,
  Users,
  Globe,
  Award,
  Play,
  Star,
  Clock,
  BookOpen,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { PromoCarousel } from "@/components/home/PromoCarousel";
import { useSmartTranslation } from "@/hooks/useSmartTranslation";

const featuredCourses = [
  {
    id: 1,
    title: "Complete Web Development Bootcamp 2025",
    instructor: "Dr. Sarah Chen",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop",
    category: "Technology",
    level: "Beginner",
    duration: "42 hours",
    rating: 4.9,
    students: 125000,
    price: 89.99,
    originalPrice: 199.99,
    isBestseller: true,
  },
  {
    id: 2,
    title: "Machine Learning & AI Masterclass",
    instructor: "Prof. Michael Zhang",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop",
    category: "Data Science",
    level: "Intermediate",
    duration: "56 hours",
    rating: 4.8,
    students: 89000,
    price: 129.99,
    originalPrice: 299.99,
    isBestseller: true,
  },
  {
    id: 3,
    title: "Business Leadership & Management",
    instructor: "Emma Thompson, MBA",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop",
    category: "Business",
    level: "Advanced",
    duration: "28 hours",
    rating: 4.7,
    students: 67000,
    price: 79.99,
    originalPrice: 149.99,
    isBestseller: false,
  },
  {
    id: 4,
    title: "Healthcare Professional Certificate",
    instructor: "Dr. James Williams",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=250&fit=crop",
    category: "Health",
    level: "Intermediate",
    duration: "35 hours",
    rating: 4.9,
    students: 45000,
    price: 99.99,
    originalPrice: 199.99,
    isBestseller: false,
  },
];

const categories = [
  { name: "Technology", icon: "💻", courses: 450, color: "from-blue-500 to-cyan-500" },
  { name: "Business", icon: "📊", courses: 320, color: "from-purple-500 to-pink-500" },
  { name: "Data Science", icon: "📈", courses: 280, color: "from-green-500 to-emerald-500" },
  { name: "Health", icon: "🏥", courses: 190, color: "from-red-500 to-orange-500" },
  { name: "Languages", icon: "🌍", courses: 150, color: "from-yellow-500 to-amber-500" },
  { name: "Personal Dev", icon: "🎯", courses: 210, color: "from-indigo-500 to-violet-500" },
];

const stats = [
  { number: "50M+", label: "Learners Worldwide", icon: Users },
  { number: "15M+", label: "Graduates", icon: GraduationCap },
  { number: "193", label: "Countries", icon: Globe },
  { number: "6,000+", label: "Courses", icon: BookOpen },
];

const partners = [
  "Google", "Microsoft", "IBM", "Amazon", "Meta", "Stanford", "MIT", "Harvard"
];

const Index = () => {
  const { tSmart } = useSmartTranslation();

  const splitLastWord = (text: string) => {
    const parts = text.trim().split(" ");
    if (parts.length <= 1) return { rest: "", last: text.trim() };
    const last = parts.pop() || "";
    return { rest: parts.join(" "), last };
  };

  const heroTitle = tSmart(["hero.title", "home.hero.title"], {
    defaultValue: "Learn Without Limits",
  });
  const { rest: heroTitleRest, last: heroTitleLast } = splitLastWord(heroTitle);

  return (
    <Layout>
      {/* Promo Carousel */}
      <section className="bg-secondary/30 border-b border-border">
        <PromoCarousel speed="normal" />
      </section>

      {/* Hero Section */}
      <section className="relative gradient-hero text-primary-foreground overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-hero-pattern opacity-30" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-accent/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        
        <div className="container relative py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 animate-fade-in">
                <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>
                    {tSmart(["hero.joinLearners", "home.hero.joinLearners"], {
                      defaultValue: "Join 50 million learners worldwide",
                    })}
                  </span>
                </div>

                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  {heroTitleRest ? <span>{heroTitleRest} </span> : null}
                  <span className="text-gradient">{heroTitleLast}</span>
                </h1>

                <p className="text-lg md:text-xl text-primary-foreground/80 max-w-xl">
                  {tSmart(["hero.subtitle", "home.hero.subtitle"], {
                    defaultValue:
                      "Access world-class education from top universities and industry leaders. Earn certificates and degrees that advance your career.",
                  })}
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link to="/courses">
                    <Button variant="hero" size="lg">
                      {tSmart(["hero.exploreCourses", "home.hero.exploreCourses"], {
                        defaultValue: "Explore Courses",
                      })}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/auth?mode=signup">
                    <Button variant="hero-outline" size="lg">
                      {tSmart([
                        "hero.startFreeTrial",
                        "home.hero.cta",
                        "common.getStarted",
                      ], {
                        defaultValue: "Start Free Trial",
                      })}
                    </Button>
                  </Link>
                </div>
              
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-accent/30 border-2 border-primary flex items-center justify-center text-sm font-bold">
                      {["S", "M", "J", "A"][i - 1]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-accent">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-primary-foreground/70">4.9 from 2M+ reviews</p>
                </div>
              </div>
            </div>
            
            {/* Hero Image/Card */}
            <div className="relative hidden lg:block animate-fade-in" style={{ animationDelay: "200ms" }}>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=500&fit=crop"
                  alt="Students learning together"
                  className="rounded-2xl shadow-2xl"
                />
                
                {/* Floating Stats Card */}
                <div className="absolute -bottom-6 -left-6 bg-card text-card-foreground p-4 rounded-xl shadow-xl animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">94%</p>
                      <p className="text-sm text-muted-foreground">Career Growth</p>
                    </div>
                  </div>
                </div>
                
                {/* Course Preview Card */}
                <div className="absolute -top-4 -right-4 bg-card text-card-foreground p-3 rounded-xl shadow-xl animate-float" style={{ animationDelay: "1s" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                      <Play className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Live Classes</p>
                      <p className="text-xs text-muted-foreground">Starting now</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <p className="text-3xl md:text-4xl font-bold text-foreground">{stat.number}</p>
                <p className="text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section - Infinite Carousel */}
      <section className="py-12 border-b border-border overflow-hidden">
        <div className="container">
          <p className="text-center text-muted-foreground mb-8">
            {tSmart(["home.trustedBy"], {
              defaultValue: "Trusted by learners from leading companies",
            })}
          </p>
        </div>
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
          <div className="flex gap-16 animate-scroll hover:[animation-play-state:paused]">
            {[...partners, ...partners, ...partners, ...partners].map((partner, index) => (
              <span 
                key={`${partner}-${index}`} 
                className="text-xl font-semibold text-muted-foreground whitespace-nowrap opacity-60 hover:opacity-100 transition-opacity"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {tSmart(["home.categories"], { defaultValue: "Explore Top Categories" })}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {tSmart(["home.whyChooseUs"], {
                defaultValue:
                  "Browse courses from our extensive catalog across all major fields",
              })}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                to={`/courses?category=${category.name.toLowerCase()}`}
                className="group animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Card className="h-full hover-lift border-2 border-transparent hover:border-accent/50 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {category.icon}
                    </div>
                    <h3 className="font-semibold mb-1 group-hover:text-accent transition-colors">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.courses} courses</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
                {tSmart(["courses.featured", "home.featured"], {
                  defaultValue: "Featured Courses",
                })}
              </h2>
              <p className="text-muted-foreground">
                {tSmart(["home.popular"], {
                  defaultValue: "Start learning from our most popular courses",
                })}
              </p>
            </div>
            <Link to="/courses">
              <Button variant="outline">
                {tSmart(["common.viewAll", "courses.all"], {
                  defaultValue: "View All Courses",
                })}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCourses.map((course, index) => (
              <Link
                key={course.id}
                to={`/course/${course.id}`}
                className="group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="h-full overflow-hidden hover-lift border-0 shadow-md hover:shadow-xl transition-all duration-300">
                  <div className="relative">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {course.isBestseller && (
                      <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
                        {tSmart(["courses.bestseller", "courses.bestsellerLabel"], {
                          defaultValue: "Bestseller",
                        })}
                      </Badge>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <Button variant="accent" size="sm" className="w-full">
                        <Play className="w-4 h-4 mr-2" />
                        {tSmart(["courses.preview", "courses.viewCourse"], {
                          defaultValue: "Preview",
                        })}
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <Badge variant="secondary" className="mb-2">{course.category}</Badge>
                    <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-accent transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">{course.instructor}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1 text-accent">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-semibold">{course.rating}</span>
                      </div>
                      <span className="text-muted-foreground text-sm">({course.students.toLocaleString()})</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                      </span>
                      <Badge variant="outline" className="text-xs">{course.level}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-foreground">${course.price}</span>
                      <span className="text-sm text-muted-foreground line-through">${course.originalPrice}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero text-primary-foreground">
        <div className="container text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Start Your Learning Journey Today
            </h2>
            <p className="text-lg text-primary-foreground/80">
              Join millions of learners and get access to world-class education. 
              Your first course is free!
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link to="/auth?mode=signup">
                <Button variant="hero" size="lg">
                  Get Started for Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 pt-8">
              {["Free courses available", "Earn certificates", "Learn at your own pace"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
