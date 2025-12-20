import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star,
  Clock,
  Users,
  Play,
  Award,
  Globe,
  BookOpen,
  CheckCircle,
  Lock,
  Heart,
  Share2,
  PlayCircle,
  FileText,
  Download,
  MessageSquare,
  BarChart,
  Trophy,
  Loader2,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useEnrollment } from "@/hooks/useEnrollment";

// Mock course data
const courseData = {
  id: 1,
  title: "Complete Web Development Bootcamp 2025",
  subtitle: "Learn HTML, CSS, JavaScript, React, Node.js, and more. Build real-world projects and become a full-stack developer.",
  instructor: {
    name: "Dr. Sarah Chen",
    title: "Senior Software Engineer & Educator",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    students: 250000,
    courses: 12,
    rating: 4.9,
  },
  image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop",
  category: "Technology",
  level: "Beginner",
  language: "English",
  duration: "42 hours",
  lectures: 285,
  rating: 4.9,
  ratingsCount: 45000,
  students: 125000,
  price: 89.99,
  originalPrice: 199.99,
  lastUpdated: "December 2024",
  isBestseller: true,
  whatYouWillLearn: [
    "Build 16+ real-world web development projects",
    "Master HTML5, CSS3, and modern JavaScript (ES6+)",
    "Learn React.js from scratch to advanced concepts",
    "Build backend applications with Node.js and Express",
    "Work with databases like MongoDB and PostgreSQL",
    "Deploy your applications to the cloud",
    "Master Git and GitHub for version control",
    "Learn responsive web design and CSS frameworks",
  ],
  requirements: [
    "No programming experience needed - we'll teach you everything",
    "A computer with internet access",
    "Willingness to learn and practice",
  ],
  curriculum: [
    {
      title: "Getting Started",
      lectures: 8,
      duration: "45 min",
      items: [
        { title: "Welcome to the Course", duration: "5:00", preview: true },
        { title: "How to Get the Most Out of This Course", duration: "8:00", preview: true },
        { title: "Setting Up Your Development Environment", duration: "12:00", preview: false },
        { title: "Understanding How the Web Works", duration: "10:00", preview: false },
      ],
    },
    {
      title: "HTML Fundamentals",
      lectures: 24,
      duration: "2.5 hours",
      items: [
        { title: "Introduction to HTML", duration: "8:00", preview: true },
        { title: "HTML Document Structure", duration: "12:00", preview: false },
        { title: "Working with Text Elements", duration: "15:00", preview: false },
        { title: "Lists and Tables", duration: "18:00", preview: false },
      ],
    },
    {
      title: "CSS Mastery",
      lectures: 36,
      duration: "4 hours",
      items: [
        { title: "Introduction to CSS", duration: "10:00", preview: true },
        { title: "Selectors and Specificity", duration: "15:00", preview: false },
        { title: "The Box Model", duration: "12:00", preview: false },
        { title: "Flexbox Layout", duration: "20:00", preview: false },
      ],
    },
    {
      title: "JavaScript Essentials",
      lectures: 48,
      duration: "6 hours",
      items: [
        { title: "Introduction to JavaScript", duration: "8:00", preview: true },
        { title: "Variables and Data Types", duration: "14:00", preview: false },
        { title: "Functions and Scope", duration: "18:00", preview: false },
        { title: "DOM Manipulation", duration: "22:00", preview: false },
      ],
    },
  ],
  reviews: [
    {
      id: 1,
      user: "John D.",
      avatar: "JD",
      rating: 5,
      date: "2 weeks ago",
      comment: "This is hands down the best web development course I've ever taken. Dr. Chen explains everything so clearly!",
    },
    {
      id: 2,
      user: "Maria S.",
      avatar: "MS",
      rating: 5,
      date: "1 month ago",
      comment: "I went from knowing nothing about coding to building my own full-stack applications. Highly recommended!",
    },
    {
      id: 3,
      user: "Alex K.",
      avatar: "AK",
      rating: 4,
      date: "1 month ago",
      comment: "Great content and well-structured curriculum. Would love to see more advanced topics added.",
    },
  ],
};

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { isEnrolled, isLoading: isEnrollmentLoading } = useEnrollment(id);

  const handleEnroll = async () => {
    setIsProcessingPayment(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          courseId: id,
          courseTitle: courseData.title,
          amount: courseData.price,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground">
        <div className="container py-8 lg:py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Link to="/courses" className="hover:text-accent">Courses</Link>
                <span>/</span>
                <Link to={`/courses?category=${courseData.category.toLowerCase()}`} className="hover:text-accent">
                  {courseData.category}
                </Link>
              </div>

              <h1 className="font-display text-3xl md:text-4xl font-bold">
                {courseData.title}
              </h1>

              <p className="text-lg text-primary-foreground/80">
                {courseData.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                {courseData.isBestseller && (
                  <Badge className="bg-accent text-accent-foreground">Bestseller</Badge>
                )}
                <div className="flex items-center gap-1">
                  <span className="font-bold text-accent">{courseData.rating}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <span className="text-primary-foreground/70">
                    ({courseData.ratingsCount.toLocaleString()} ratings)
                  </span>
                </div>
                <span>{courseData.students.toLocaleString()} students</span>
              </div>

              <div className="flex items-center gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={courseData.instructor.avatar} />
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Created by {courseData.instructor.name}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-primary-foreground/70">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Last updated {courseData.lastUpdated}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  {courseData.language}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display">What you'll learn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {courseData.whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course Content */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Course Content</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {courseData.curriculum.length} sections • {courseData.lectures} lectures • {courseData.duration} total length
                </p>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {courseData.curriculum.map((section, index) => (
                    <AccordionItem key={index} value={`section-${index}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span className="font-semibold text-left">{section.title}</span>
                          <span className="text-sm text-muted-foreground">
                            {section.lectures} lectures • {section.duration}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {section.items.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted"
                            >
                              <div className="flex items-center gap-3">
                                {item.preview ? (
                                  <PlayCircle className="w-4 h-4 text-accent" />
                                ) : (
                                  <Lock className="w-4 h-4 text-muted-foreground" />
                                )}
                                <span className="text-sm">{item.title}</span>
                                {item.preview && (
                                  <Badge variant="outline" className="text-xs">Preview</Badge>
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground">{item.duration}</span>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {courseData.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground mt-2" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Instructor */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Your Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={courseData.instructor.avatar} />
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{courseData.instructor.name}</h3>
                    <p className="text-muted-foreground">{courseData.instructor.title}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-accent" />
                        {courseData.instructor.rating} Rating
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {courseData.instructor.students.toLocaleString()} Students
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {courseData.instructor.courses} Courses
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Student Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {courseData.reviews.map((review) => (
                  <div key={review.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarFallback>{review.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{review.user}</h4>
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                        <div className="flex items-center gap-1 my-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i <= review.rating ? "fill-accent text-accent" : "text-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Sticky Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="shadow-xl overflow-hidden">
                {/* Video Preview */}
                <div className="relative aspect-video bg-muted">
                  <img
                    src={courseData.image}
                    alt={courseData.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                    <Button variant="accent" size="lg" className="rounded-full w-16 h-16">
                      <Play className="w-6 h-6" />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4">
                  {/* Price */}
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold">${courseData.price}</span>
                    <span className="text-lg text-muted-foreground line-through">
                      ${courseData.originalPrice}
                    </span>
                    <Badge variant="destructive">
                      {Math.round((1 - courseData.price / courseData.originalPrice) * 100)}% off
                    </Badge>
                  </div>

                  <p className="text-sm text-destructive font-medium">
                    ⏰ Sale ends in 2 days!
                  </p>

                  {/* Action Buttons */}
                  {isEnrollmentLoading ? (
                    <Button variant="accent" size="lg" className="w-full" disabled>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </Button>
                  ) : isEnrolled ? (
                    <Button 
                      variant="accent" 
                      size="lg" 
                      className="w-full" 
                      onClick={() => navigate(`/course/${id}/learn`)}
                    >
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Continue Learning
                    </Button>
                  ) : (
                    <Button 
                      variant="accent" 
                      size="lg" 
                      className="w-full" 
                      onClick={handleEnroll}
                      disabled={isProcessingPayment}
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Enroll Now"
                      )}
                    </Button>
                  )}

                  <Button variant="outline" size="lg" className="w-full" onClick={handleWishlist}>
                    <Heart className={`w-4 h-4 mr-2 ${isWishlisted ? "fill-destructive text-destructive" : ""}`} />
                    {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    30-Day Money-Back Guarantee
                  </p>

                  {/* Course Includes */}
                  <div className="pt-4 border-t border-border space-y-3">
                    <h4 className="font-semibold">This course includes:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Play className="w-4 h-4 text-muted-foreground" />
                        <span>{courseData.duration} on-demand video</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span>45 articles</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-muted-foreground" />
                        <span>65 downloadable resources</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span>Access on mobile and TV</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-muted-foreground" />
                        <span>Certificate of completion</span>
                      </div>
                    </div>
                  </div>

                  {/* Share */}
                  <Button variant="ghost" size="sm" className="w-full">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share this course
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CourseDetailPage;
