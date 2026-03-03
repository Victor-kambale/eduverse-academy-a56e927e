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
    <section className="py-20 bg-secondary/30">
      <div className="container">
        <motion.div
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
              {tSmart(["courses.featured", "home.featured"], { defaultValue: "Featured Courses" })}
            </h2>
            <p className="text-muted-foreground">
              {tSmart(["home.popular"], { defaultValue: "Start learning from our most popular courses" })}
            </p>
          </div>
          <Link to="/courses">
            <Button variant="outline">
              {tSmart(["common.viewAll", "courses.all"], { defaultValue: "View All Courses" })}
              <ArrowRight className="w-4 h-4 ml-2" />
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
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={`/course/${course.id}`} className="group">
                  <Card className="h-full overflow-hidden hover-lift border-0 shadow-md hover:shadow-xl transition-all duration-300">
                    <div className="relative">
                      <img
                        src={course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"}
                        alt={course.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {course.price === 0 && (
                        <Badge className="absolute top-3 left-3 bg-green-500 text-white">Free</Badge>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <Button variant="accent" size="sm" className="w-full">
                          <Play className="w-4 h-4 mr-2" />
                          {tSmart(["courses.preview", "courses.viewCourse"], { defaultValue: "Preview" })}
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <Badge variant="secondary" className="mb-2">{course.category || "General"}</Badge>
                      <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-accent transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">{course.instructor_name || "EduVerse Instructor"}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.duration_hours || 0} hours
                        </span>
                        <Badge variant="outline" className="text-xs capitalize">{course.level || "All Levels"}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {course.price === 0 ? (
                          <span className="text-xl font-bold text-green-600">Free</span>
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
