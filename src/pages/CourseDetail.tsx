import { useState } from "react";
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

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

// Mock course data
const courseData = {
  id: "11111111-1111-1111-1111-111111111111",
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
      title: "Getting Started", lectures: 8, duration: "45 min",
      items: [
        { title: "Welcome to the Course", duration: "5:00", preview: true },
        { title: "How to Get the Most Out of This Course", duration: "8:00", preview: true },
        { title: "Setting Up Your Development Environment", duration: "12:00", preview: false },
        { title: "Understanding How the Web Works", duration: "10:00", preview: false },
      ],
    },
    {
      title: "HTML Fundamentals", lectures: 24, duration: "2.5 hours",
      items: [
        { title: "Introduction to HTML", duration: "8:00", preview: true },
        { title: "HTML Document Structure", duration: "12:00", preview: false },
        { title: "Working with Text Elements", duration: "15:00", preview: false },
        { title: "Lists and Tables", duration: "18:00", preview: false },
      ],
    },
    {
      title: "CSS Mastery", lectures: 36, duration: "4 hours",
      items: [
        { title: "Introduction to CSS", duration: "10:00", preview: true },
        { title: "Selectors and Specificity", duration: "15:00", preview: false },
        { title: "The Box Model", duration: "12:00", preview: false },
        { title: "Flexbox Layout", duration: "20:00", preview: false },
      ],
    },
    {
      title: "JavaScript Essentials", lectures: 48, duration: "6 hours",
      items: [
        { title: "Introduction to JavaScript", duration: "8:00", preview: true },
        { title: "Variables and Data Types", duration: "14:00", preview: false },
        { title: "Functions and Scope", duration: "18:00", preview: false },
        { title: "DOM Manipulation", duration: "22:00", preview: false },
      ],
    },
  ],
  reviews: [
    { id: 1, user: "John D.", avatar: "JD", rating: 5, date: "2 weeks ago", comment: "This is hands down the best web development course I've ever taken. Dr. Chen explains everything so clearly!" },
    { id: 2, user: "Maria S.", avatar: "MS", rating: 5, date: "1 month ago", comment: "I went from knowing nothing about coding to building my own full-stack applications. Highly recommended!" },
    { id: 3, user: "Alex K.", avatar: "AK", rating: 4, date: "1 month ago", comment: "Great content and well-structured curriculum. Would love to see more advanced topics added." },
  ],
};

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { isEnrolled, isLoading: isEnrollmentLoading } = useEnrollment(id);

  const handleEnroll = async () => setShowPaymentModal(true);
  
  const handlePaymentSuccess = (paymentMethod: string) => {
    setShowPaymentModal(false);
    toast.success("Payment successful! You can now start learning.");
    navigate(`/course/${id}/learn`);
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <Layout>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground relative overflow-hidden"
      >
        {/* Decorative elements */}
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
                <Link to={`/courses?category=${courseData.category.toLowerCase()}`} className="hover:text-accent transition-colors">
                  {courseData.category}
                </Link>
              </motion.div>

              <motion.h1 variants={fadeUp} className="font-display text-3xl md:text-5xl font-bold leading-tight">
                {courseData.title}
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg text-primary-foreground/80 max-w-2xl">
                {courseData.subtitle}
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
                {courseData.isBestseller && (
                  <Badge className="bg-accent text-accent-foreground px-3 py-1 font-semibold">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Bestseller
                  </Badge>
                )}
                <div className="flex items-center gap-1">
                  <span className="font-bold text-accent text-lg">{courseData.rating}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <span className="text-primary-foreground/70">
                    ({courseData.ratingsCount.toLocaleString()} ratings)
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {courseData.students.toLocaleString()} students
                </span>
              </motion.div>

              <motion.div variants={fadeUp} className="flex items-center gap-4">
                <Avatar className="w-12 h-12 ring-2 ring-primary-foreground/20">
                  <AvatarImage src={courseData.instructor.avatar} />
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">Created by {courseData.instructor.name}</p>
                  <p className="text-sm text-primary-foreground/70">{courseData.instructor.title}</p>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 text-sm text-primary-foreground/70">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> Last updated {courseData.lastUpdated}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4" /> {courseData.language}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" /> {courseData.lectures} lectures
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
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={scaleIn}
            >
              <Card className="border-2 border-accent/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <Zap className="w-5 h-5 text-accent" />
                    What you'll learn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.div
                    className="grid md:grid-cols-2 gap-3"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                  >
                    {courseData.whatYouWillLearn.map((item, index) => (
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
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={scaleIn}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Course Content
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {courseData.curriculum.length} sections • {courseData.lectures} lectures • {courseData.duration} total length
                  </p>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="w-full">
                    {courseData.curriculum.map((section, index) => (
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
                              <motion.div
                                key={itemIndex}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: itemIndex * 0.05 }}
                                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                              >
                                <div className="flex items-center gap-3">
                                  {item.preview ? (
                                    <PlayCircle className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                                  ) : (
                                    <Lock className="w-4 h-4 text-muted-foreground" />
                                  )}
                                  <span className="text-sm">{item.title}</span>
                                  {item.preview && (
                                    <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/20">Preview</Badge>
                                  )}
                                </div>
                                <span className="text-sm text-muted-foreground">{item.duration}</span>
                              </motion.div>
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
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={scaleIn}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {courseData.requirements.map((req, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0" />
                        <span>{req}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Instructor */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={scaleIn}
            >
              <Card className="shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent">
                  <CardTitle className="font-display">Your Instructor</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-5">
                    <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                      <Avatar className="w-24 h-24 ring-4 ring-accent/20">
                        <AvatarImage src={courseData.instructor.avatar} />
                        <AvatarFallback>SC</AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-xl">{courseData.instructor.name}</h3>
                      <p className="text-muted-foreground">{courseData.instructor.title}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-sm font-medium">
                          <Star className="w-4 h-4 fill-accent" />
                          {courseData.instructor.rating} Rating
                        </div>
                        <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full text-sm">
                          <Users className="w-4 h-4" />
                          {courseData.instructor.students.toLocaleString()} Students
                        </div>
                        <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full text-sm">
                          <BookOpen className="w-4 h-4" />
                          {courseData.instructor.courses} Courses
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Reviews */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={scaleIn}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Student Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.div className="space-y-6" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
                    {courseData.reviews.map((review) => (
                      <motion.div
                        key={review.id}
                        variants={fadeUp}
                        className="border-b border-border pb-6 last:border-0 last:pb-0"
                      >
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
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i <= review.rating ? "fill-accent text-accent" : "text-muted"}`}
                                />
                              ))}
                            </div>
                            <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
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
                  <img
                    src={courseData.image}
                    alt={courseData.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-background/40 group-hover:bg-background/30 transition-colors">
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-16 h-16 rounded-full bg-accent flex items-center justify-center shadow-xl"
                    >
                      <Play className="w-6 h-6 text-accent-foreground ml-1" />
                    </motion.div>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <Badge className="bg-background/80 text-foreground backdrop-blur-sm text-xs">Preview this course</Badge>
                  </div>
                </div>

                <CardContent className="p-6 space-y-5">
                  {/* Price */}
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-bold">${courseData.price}</span>
                    <span className="text-lg text-muted-foreground line-through">
                      ${courseData.originalPrice}
                    </span>
                    <Badge variant="destructive" className="text-sm px-2.5 py-0.5">
                      {Math.round((1 - courseData.price / courseData.originalPrice) * 100)}% off
                    </Badge>
                  </div>

                  <p className="text-sm text-destructive font-semibold flex items-center gap-1">
                    <Sparkles className="w-4 h-4" /> Sale ends in 2 days!
                  </p>

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
                          ) : (
                            "Enroll Now"
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
                        { icon: Play, label: `${courseData.duration} on-demand video` },
                        { icon: FileText, label: "45 articles" },
                        { icon: Download, label: "65 downloadable resources" },
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
              Complete your purchase for: {courseData.title}
            </DialogDescription>
          </DialogHeader>
          <EnhancedPaymentFlow
            amount={courseData.price}
            courseName={courseData.title}
            courseLevel={courseData.level}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowPaymentModal(false)}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default CourseDetailPage;
