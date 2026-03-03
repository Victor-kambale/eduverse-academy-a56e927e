import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Play, Star, Clock } from "lucide-react";
import { useSmartTranslation } from "@/hooks/useSmartTranslation";
import { motion } from "framer-motion";

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

export function FeaturedCoursesSection() {
  const { tSmart } = useSmartTranslation();

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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCourses.map((course, index) => (
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
                      src={course.image}
                      alt={course.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {course.isBestseller && (
                      <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
                        {tSmart(["courses.bestseller", "courses.bestsellerLabel"], { defaultValue: "Bestseller" })}
                      </Badge>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <Button variant="accent" size="sm" className="w-full">
                        <Play className="w-4 h-4 mr-2" />
                        {tSmart(["courses.preview", "courses.viewCourse"], { defaultValue: "Preview" })}
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
