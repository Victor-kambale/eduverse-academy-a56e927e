import { useState } from "react";
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
  Filter,
  Star,
  Clock,
  Users,
  Play,
  Grid,
  List,
  X,
  SlidersHorizontal,
} from "lucide-react";

const allCourses = [
  {
    id: "11111111-1111-1111-1111-111111111111",
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
    isFree: false,
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
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
    isFree: false,
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
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
    isFree: false,
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
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
    isFree: false,
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    title: "Python for Beginners - Free Course",
    instructor: "Alex Johnson",
    image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop",
    category: "Technology",
    level: "Beginner",
    duration: "12 hours",
    rating: 4.6,
    students: 230000,
    price: 0,
    originalPrice: 0,
    isBestseller: false,
    isFree: true,
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    title: "Digital Marketing Fundamentals",
    instructor: "Maria Garcia",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
    category: "Business",
    level: "Beginner",
    duration: "18 hours",
    rating: 4.5,
    students: 78000,
    price: 49.99,
    originalPrice: 99.99,
    isBestseller: false,
    isFree: false,
  },
  {
    id: "77777777-7777-7777-7777-777777777777",
    title: "English for Career Development",
    instructor: "Prof. Robert Smith",
    image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=250&fit=crop",
    category: "Languages",
    level: "Intermediate",
    duration: "24 hours",
    rating: 4.7,
    students: 156000,
    price: 0,
    originalPrice: 0,
    isBestseller: false,
    isFree: true,
  },
  {
    id: "88888888-8888-8888-8888-888888888888",
    title: "Personal Development Masterclass",
    instructor: "Lisa Anderson",
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=250&fit=crop",
    category: "Personal Development",
    level: "Beginner",
    duration: "15 hours",
    rating: 4.8,
    students: 98000,
    price: 59.99,
    originalPrice: 129.99,
    isBestseller: true,
    isFree: false,
  },
];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All Categories"
  );
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">("all");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const filteredCourses = allCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All Categories" ||
      course.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesLevel =
      selectedLevel === "All Levels" || course.level === selectedLevel;
    const matchesPrice =
      priceFilter === "all" ||
      (priceFilter === "free" && course.isFree) ||
      (priceFilter === "paid" && !course.isFree);

    return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.students - a.students;
      case "rating":
        return b.rating - a.rating;
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

  return (
    <Layout>
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Explore Courses
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl">
            Choose from over 6,000+ courses taught by industry experts. Learn at
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
                <SelectItem value="rating">Highest Rated</SelectItem>
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
                        src={course.image}
                        alt={course.title}
                        className={`w-full object-cover ${
                          viewMode === "list" ? "h-full" : "h-48"
                        }`}
                      />
                      {course.isBestseller && (
                        <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
                          Bestseller
                        </Badge>
                      )}
                      {course.isFree && (
                        <Badge className="absolute top-3 left-3 bg-success text-success-foreground">
                          Free
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-5 flex-1">
                      <Badge variant="secondary" className="mb-2">
                        {course.category}
                      </Badge>
                      <h3 className="font-semibold line-clamp-2 mb-2 hover:text-accent transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {course.instructor}
                      </p>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1 text-accent">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="font-semibold">{course.rating}</span>
                        </div>
                        <span className="text-muted-foreground text-sm">
                          ({course.students.toLocaleString()})
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.duration}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {course.level}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        {course.isFree ? (
                          <span className="text-xl font-bold text-success">
                            Free
                          </span>
                        ) : (
                          <>
                            <span className="text-xl font-bold text-foreground">
                              ${course.price}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              ${course.originalPrice}
                            </span>
                          </>
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
