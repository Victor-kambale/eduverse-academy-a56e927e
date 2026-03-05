import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Play, Star, Clock, Loader2 } from "lucide-react";
import { useSmartTranslation } from "@/hooks/useSmartTranslation";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface Course {
  id: string;
  title: string;
  instructor_name: string | null;
  thumbnail_url: string | null;
  category: string | null;
  level: string | null;
  duration_hours: number | null;
  price: number;
}

export function FeaturedCoursesSection() {
  const { tSmart } = useSmartTranslation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await supabase
          .from('courses')
          .select('id, title, instructor_name, thumbnail_url, category, level, duration_hours, price')
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(4);
        setCourses(data || []);
      } catch (err) {
        console.error('Error fetching featured courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-secondary/30" />
      {/* Decorative lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

      <div className="container relative">
        <motion.div
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <motion.span 
              className="inline-block text-sm font-semibold text-accent uppercase tracking-widest mb-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Top Picks
            </motion.span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-3">
              {tSmart(["courses.featured", "home.featured"], { defaultValue: "Featured Courses" })}
            </h2>
            <p className="text-muted-foreground text-lg max-w-md">
              {tSmart(["home.popular"], { defaultValue: "Start learning from our most popular courses" })}
            </p>
          </div>
          <Link to="/courses">
            <Button variant="outline" className="group">
              {tSmart(["common.viewAll", "courses.all"], { defaultValue: "View All Courses" })}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No courses available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link to={`/course/${course.id}`} className="group block">
                  <Card className="h-full overflow-hidden card-3d border-0 shadow-elevated bg-card">
                    <div className="relative overflow-hidden">
                      <img
                        src={course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"}
                        alt={course.title}
                        className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      {course.price === 0 && (
                        <Badge className="absolute top-3 left-3 bg-success text-success-foreground shadow-lg">Free</Badge>
                      )}
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-5">
                        <Button variant="accent" size="sm" className="w-full shadow-glow">
                          <Play className="w-4 h-4 mr-2" />
                          {tSmart(["courses.preview", "courses.viewCourse"], { defaultValue: "Preview" })}
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <Badge variant="secondary" className="mb-2 font-medium">{course.category || "General"}</Badge>
                      <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-accent transition-colors duration-300">
                        {course.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">{course.instructor_name || "EduVerse Instructor"}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.duration_hours || 0}h
                        </span>
                        <Badge variant="outline" className="text-xs capitalize">{course.level || "All Levels"}</Badge>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                        {course.price === 0 ? (
                          <span className="text-xl font-bold text-success">Free</span>
                        ) : (
                          <span className="text-xl font-bold text-foreground">${course.price}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
