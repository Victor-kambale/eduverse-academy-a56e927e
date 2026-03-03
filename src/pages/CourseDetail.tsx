import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EnhancedPaymentFlow } from "@/components/payment/EnhancedPaymentFlow";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star, Clock, Users, Play, Award, Globe, BookOpen, CheckCircle, Lock,
  Heart, Share2, PlayCircle, FileText, Download, MessageSquare, BarChart,
  Trophy, Loader2, GraduationCap, Sparkles, Shield, Zap,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useEnrollment } from "@/hooks/useEnrollment";
import { useAuth } from "@/hooks/useAuth";
import { GuestPrompt, useGuestPrompt } from "@/components/layout/GuestPrompt";

const fadeUp = {
  hidden: { opacity: 0, y: 30 } as const,
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } as const,
};
const staggerContainer = {
  hidden: { opacity: 0 } as const,
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } } as const,
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 } as const,
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } } as const,
};

// Fallback data for courses not found in DB
const fallbackCourse = {
  title: "Course",
  subtitle: "Learn from industry experts.",
  instructor_name: "Instructor",
  thumbnail_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop",
  category: "General",
  level: "Beginner",
  duration_hours: 10,
  price: 0,
  short_description: "",
};

const staticMeta = {
  language: "English",
  ratingsCount: 1200,
  students: 5000,
  lectures: 40,
  isBestseller: false,
  whatYouWillLearn: [
    "Build real-world projects",
    "Master core concepts",
    "Learn best practices",
    "Earn a certificate of completion",
  ],
  requirements: [
    "No prior experience required",
    "A computer with internet access",
  ],
  curriculum: [
    {
      title: "Getting Started", lectures: 4, duration: "30 min",
      items: [
        { title: "Welcome", duration: "5:00", preview: true },
        { title: "Course Overview", duration: "8:00", preview: true },
        { title: "Setup", duration: "10:00", preview: false },
        { title: "First Steps", duration: "7:00", preview: false },
      ],
    },
    {
      title: "Core Concepts", lectures: 6, duration: "1.5 hours",
      items: [
        { title: "Introduction", duration: "10:00", preview: true },
        { title: "Deep Dive", duration: "15:00", preview: false },
        { title: "Hands-on Practice", duration: "20:00", preview: false },
        { title: "Advanced Techniques", duration: "18:00", preview: false },
      ],
    },
  ],
  reviews: [
    { id: 1, user: "John D.", avatar: "JD", rating: 5, date: "2 weeks ago", comment: "Excellent course with great practical examples!" },
    { id: 2, user: "Maria S.", avatar: "MS", rating: 5, date: "1 month ago", comment: "Very well structured and easy to follow." },
  ],
};

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showPrompt, GuestPromptComponent } = useGuestPrompt();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { isEnrolled, isLoading: isEnrollmentLoading } = useEnrollment(id);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (data) {
          setCourse(data);
        }
      } catch (err) {
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const courseTitle = course?.title || fallbackCourse.title;
  const coursePrice = course?.price ?? fallbackCourse.price;
  const courseCategory = course?.category || fallbackCourse.category;
  const courseLevel = course?.level || fallbackCourse.level;
  const courseDuration = course?.duration_hours ? `${course.duration_hours} hours` : `${fallbackCourse.duration_hours} hours`;
  const courseImage = course?.thumbnail_url || fallbackCourse.thumbnail_url;
  const courseInstructor = course?.instructor_name || fallbackCourse.instructor_name;
  const courseDescription = course?.description || course?.short_description || fallbackCourse.subtitle;
  const originalPrice = coursePrice > 0 ? Math.round(coursePrice * 2.2 * 100) / 100 : 0;

  const handleEnroll = async () => {
    if (!user) {
      showPrompt("enroll in this course");
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (paymentMethod: string) => {
    setShowPaymentModal(false);
    toast.success("Payment successful! You can now start learning.");
    navigate(`/course/${id}/learn`);
  };

  const handleWishlist = () => {
    if (!user) {
      showPrompt("add courses to your wishlist");
      return;
    }
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <GuestPromptComponent />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary-foreground rounded-full blur-3xl" />
        </div>

        <div className="container py-10 lg:py-16 relative z-10">
          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div
              className="lg:col-span-2 space-y-5"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeUp} className="flex items-center gap-2 text-sm">
                <Link to="/courses" className="hover:text-accent transition-colors">Courses</Link>
                <span>/</span>
                <Link to={`/courses?category=${courseCategory.toLowerCase()}`} className="hover:text-accent transition-colors">
                  {courseCategory}
                </Link>
              </motion.div>

              <motion.h1 variants={fadeUp} className="font-display text-3xl md:text-5xl font-bold leading-tight">
                {courseTitle}
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg text-primary-foreground/80 max-w-2xl">
                {courseDescription}
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
                {staticMeta.isBestseller && (
                  <Badge className="bg-accent text-accent-foreground px-3 py-1 font-semibold">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Bestseller
                  </Badge>
                )}
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {staticMeta.students.toLocaleString()} students
                </span>
              </motion.div>

              <motion.div variants={fadeUp} className="flex items-center gap-4">
                <Avatar className="w-12 h-12 ring-2 ring-primary-foreground/20">
                  <AvatarFallback>{courseInstructor.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">Created by {courseInstructor}</p>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 text-sm text-primary-foreground/70">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {courseDuration}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4" /> {staticMeta.language}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" /> {courseLevel}
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={scaleIn}>
              <Card className="border-2 border-accent/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <Zap className="w-5 h-5 text-accent" />
                    What you'll learn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.div className="grid md:grid-cols-2 gap-3" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
                    {staticMeta.whatYouWillLearn.map((item, index) => (
                      <motion.div key={index} variants={fadeUp} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{item}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Course Content */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={scaleIn}>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Course Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="w-full">
                    {staticMeta.curriculum.map((section, index) => (
                      <AccordionItem key={index} value={`section-${index}`}>
                        <AccordionTrigger className="hover:no-underline hover:bg-muted/50 px-3 rounded-lg transition-colors">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span className="font-semibold text-left">{section.title}</span>
                            <span className="text-sm text-muted-foreground">
                              {section.lectures} lectures • {section.duration}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-1 px-2">
                            {section.items.map((item, itemIndex) => (
                              <div key={itemIndex} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3">
                                  {item.preview ? (
                                    <PlayCircle className="w-4 h-4 text-accent" />
                                  ) : (
                                    <Lock className="w-4 h-4 text-muted-foreground" />
                                  )}
                                  <span className="text-sm">{item.title}</span>
                                  {item.preview && (
                                    <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/20">Preview</Badge>
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
            </motion.div>

            {/* Requirements */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={scaleIn}>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {staticMeta.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Reviews */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={scaleIn}>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Student Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {staticMeta.reviews.map((review) => (
                      <div key={review.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                        <div className="flex items-start gap-4">
                          <Avatar className="ring-2 ring-muted">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">{review.avatar}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">{review.user}</h4>
                              <span className="text-sm text-muted-foreground">{review.date}</span>
                            </div>
                            <div className="flex items-center gap-1 my-1.5">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star key={i} className={`w-4 h-4 ${i <= review.rating ? "fill-accent text-accent" : "text-muted"}`} />
                              ))}
                            </div>
                            <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Sidebar - Sticky Card */}
          <div className="lg:col-span-1">
            <motion.div
              className="sticky top-24"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="shadow-2xl overflow-hidden border-2 border-border/50">
                {/* Video Preview */}
                <div className="relative aspect-video bg-muted group cursor-pointer overflow-hidden">
                  <img src={courseImage} alt={courseTitle} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 flex items-center justify-center bg-background/40 group-hover:bg-background/30 transition-colors">
                    <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }} className="w-16 h-16 rounded-full bg-accent flex items-center justify-center shadow-xl">
                      <Play className="w-6 h-6 text-accent-foreground ml-1" />
                    </motion.div>
                  </div>
                </div>

                <CardContent className="p-6 space-y-5">
                  {/* Price - uses actual course price */}
                  <div className="flex items-center gap-3">
                    {coursePrice === 0 ? (
                      <span className="text-4xl font-bold text-green-600">Free</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold">${coursePrice}</span>
                        {originalPrice > coursePrice && (
                          <>
                            <span className="text-lg text-muted-foreground line-through">${originalPrice}</span>
                            <Badge variant="destructive" className="text-sm px-2.5 py-0.5">
                              {Math.round((1 - coursePrice / originalPrice) * 100)}% off
                            </Badge>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  {coursePrice > 0 && (
                    <p className="text-sm text-destructive font-semibold flex items-center gap-1">
                      <Sparkles className="w-4 h-4" /> Limited time offer!
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {isEnrollmentLoading ? (
                      <Button variant="accent" size="lg" className="w-full h-12" disabled>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...
                      </Button>
                    ) : isEnrolled ? (
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button variant="accent" size="lg" className="w-full h-12 font-semibold" onClick={() => navigate(`/course/${id}/learn`)}>
                          <GraduationCap className="w-5 h-5 mr-2" /> Continue Learning
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button variant="accent" size="lg" className="w-full h-12 font-semibold text-base" onClick={handleEnroll} disabled={isProcessingPayment}>
                          {isProcessingPayment ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                          ) : coursePrice === 0 ? (
                            "Enroll Now — Free"
                          ) : (
                            `Enroll Now — $${coursePrice}`
                          )}
                        </Button>
                      </motion.div>
                    )}

                    <Button variant="outline" size="lg" className="w-full" onClick={handleWishlist}>
                      <Heart className={`w-4 h-4 mr-2 transition-all ${isWishlisted ? "fill-destructive text-destructive scale-110" : ""}`} />
                      {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                    </Button>
                  </div>

                  <p className="text-center text-sm text-muted-foreground">
                    <Shield className="w-3 h-3 inline mr-1" />
                    30-Day Money-Back Guarantee
                  </p>

                  {/* Course Includes */}
                  <div className="pt-4 border-t border-border space-y-3">
                    <h4 className="font-semibold">This course includes:</h4>
                    <div className="space-y-2.5 text-sm">
                      {[
                        { icon: Play, label: `${courseDuration} on-demand video` },
                        { icon: FileText, label: "Articles & resources" },
                        { icon: Download, label: "Downloadable resources" },
                        { icon: Globe, label: "Access on mobile and TV" },
                        { icon: Award, label: "Certificate of completion" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                          <item.icon className="w-4 h-4 text-accent" />
                          <span>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" className="w-full">
                    <Share2 className="w-4 h-4 mr-2" /> Share this course
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Enhanced Payment Flow Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{t('payment.selectMethod')}</DialogTitle>
            <DialogDescription>
              Complete your purchase for: {courseTitle}
            </DialogDescription>
          </DialogHeader>
          <EnhancedPaymentFlow
            amount={coursePrice}
            courseName={courseTitle}
            courseLevel={courseLevel}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowPaymentModal(false)}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default CourseDetailPage;
