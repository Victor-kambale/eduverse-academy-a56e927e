import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Search,
  Star,
  Clock,
  Grid,
  List,
  X,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
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
  short_description: string | null;
  is_published: boolean | null;
}

const categories = [
  "All Categories",
  "Technology",
  "Business",
  "Data Science",
  "Health",
  "Languages",
  "Personal Development",
];

const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];

const CoursesPage = () => {
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All Categories"
  );
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">("all");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.instructor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory =
      selectedCategory === "All Categories" ||
      course.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesLevel =
      selectedLevel === "All Levels" || 
      course.level?.toLowerCase() === selectedLevel.toLowerCase();
    const matchesPrice =
      priceFilter === "all" ||
      (priceFilter === "free" && course.price === 0) ||
      (priceFilter === "paid" && course.price > 0);

    return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.id.localeCompare(a.id);
      case "newest":
        return b.id.localeCompare(a.id);
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      default:
        return 0;
    }
  });

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
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Explore Courses
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl">
            Choose from our courses taught by industry experts. Learn at
            your own pace and earn certificates.
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Search and Filters Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search courses, instructors, topics..."
              className="pl-10 h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] h-12">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            <div className="hidden md:flex border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="rounded-none h-12"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="rounded-none h-12"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside
            className={`${
              showFilters ? "block" : "hidden"
            } lg:block w-full lg:w-64 shrink-0 space-y-6`}
          >
            <Card>
              <CardContent className="p-4 space-y-6">
                {/* Category Filter */}
                <div>
                  <h3 className="font-semibold mb-3">Category</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === category
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level Filter */}
                <div>
                  <h3 className="font-semibold mb-3">Level</h3>
                  <div className="space-y-2">
                    {levels.map((level) => (
                      <div key={level} className="flex items-center gap-2">
                        <Checkbox
                          id={level}
                          checked={selectedLevel === level}
                          onCheckedChange={() => setSelectedLevel(level)}
                        />
                        <Label htmlFor={level}>{level}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div>
                  <h3 className="font-semibold mb-3">Price</h3>
                  <div className="space-y-2">
                    {[
                      { value: "all", label: "All Prices" },
                      { value: "free", label: "Free" },
                      { value: "paid", label: "Paid" },
                    ].map((option) => (
                      <div key={option.value} className="flex items-center gap-2">
                        <Checkbox
                          id={option.value}
                          checked={priceFilter === option.value}
                          onCheckedChange={() =>
                            setPriceFilter(option.value as typeof priceFilter)
                          }
                        />
                        <Label htmlFor={option.value}>{option.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedCategory("All Categories");
                    setSelectedLevel("All Levels");
                    setPriceFilter("all");
                    setSearchQuery("");
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Course Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                Showing {sortedCourses.length} courses
              </p>
            </div>

            <div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "md:grid-cols-2 xl:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {sortedCourses.map((course) => (
                <Link key={course.id} to={`/course/${course.id}`}>
                  <Card
                    className={`h-full overflow-hidden hover-lift border-0 shadow-md hover:shadow-xl transition-all duration-300 ${
                      viewMode === "list" ? "flex" : ""
                    }`}
                  >
                    <div
                      className={`relative ${
                        viewMode === "list" ? "w-48 shrink-0" : ""
                      }`}
                    >
                      <img
                        src={course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"}
                        alt={course.title}
                        className={`w-full object-cover ${
                          viewMode === "list" ? "h-full" : "h-48"
                        }`}
                      />
                      {course.price === 0 && (
                        <Badge className="absolute top-3 left-3 bg-green-500 text-white">
                          Free
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-5 flex-1">
                      <Badge variant="secondary" className="mb-2">
                        {course.category || "General"}
                      </Badge>
                      <h3 className="font-semibold line-clamp-2 mb-2 hover:text-accent transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {course.instructor_name || "EduVerse Instructor"}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.duration_hours || 0} hours
                        </span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {course.level || "All Levels"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        {course.price === 0 ? (
                          <span className="text-xl font-bold text-green-600">
                            Free
                          </span>
                        ) : (
                          <span className="text-xl font-bold text-foreground">
                            ${course.price}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {sortedCourses.length === 0 && (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground mb-4">
                  No courses found matching your criteria
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategory("All Categories");
                    setSelectedLevel("All Levels");
                    setPriceFilter("all");
                    setSearchQuery("");
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CoursesPage;
