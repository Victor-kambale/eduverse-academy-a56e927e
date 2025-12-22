import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { 
  Search, 
  Menu, 
  X, 
  GraduationCap, 
  BookOpen, 
  Award, 
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageSelector } from "./LanguageSelector";

const categories = [
  { name: "Technology", icon: "💻", courses: 450 },
  { name: "Business", icon: "📊", courses: 320 },
  { name: "Data Science", icon: "📈", courses: 280 },
  { name: "Health", icon: "🏥", courses: 190 },
  { name: "Languages", icon: "🌍", courses: 150 },
  { name: "Personal Development", icon: "🎯", courses: 210 },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top banner */}
      <div className="bg-accent text-accent-foreground text-center py-2 px-4 text-sm font-medium">
        <span className="animate-pulse">🎓</span> 20% off all courses this December! 
        <Link to="/pricing" className="underline ml-2 font-bold hover:no-underline">
          Get Your Discount →
        </Link>
      </div>

      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground hidden sm:block">
            EduVerse
          </span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent">
                <BookOpen className="w-4 h-4 mr-2" />
                Courses
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid w-[500px] gap-3 p-4 md:grid-cols-2">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      to={`/courses?category=${category.name.toLowerCase()}`}
                      className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted transition-colors"
                    >
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <div className="font-semibold text-foreground">{category.name}</div>
                        <div className="text-sm text-muted-foreground">{category.courses} courses</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link to="/degrees">
                <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/10 hover:text-accent-foreground focus:bg-accent/10 focus:text-accent-foreground focus:outline-none">
                  <Award className="w-4 h-4 mr-2" />
                  Degrees
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link to="/careers">
                <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/10 hover:text-accent-foreground focus:bg-accent/10 focus:text-accent-foreground focus:outline-none">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Careers
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                window.location.href = `/courses?search=${encodeURIComponent(searchQuery.trim())}`;
              }
            }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search courses, topics, instructors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-accent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    window.location.href = `/courses?search=${encodeURIComponent(searchQuery.trim())}`;
                  }
                }}
              />
            </div>
          </form>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <LanguageSelector />

          <Link to="/auth">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              Log In
            </Button>
          </Link>
          <Link to="/auth?mode=signup">
            <Button variant="accent" size="sm" className="hidden sm:flex">
              Sign Up Free
            </Button>
          </Link>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background animate-fade-in">
          <div className="container py-4 space-y-4">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search courses..."
                className="pl-10"
              />
            </div>

            {/* Mobile Nav Links */}
            <nav className="space-y-2">
              <Link
                to="/courses"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <BookOpen className="w-5 h-5" />
                Browse Courses
              </Link>
              <Link
                to="/degrees"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Award className="w-5 h-5" />
                Degrees
              </Link>
              <Link
                to="/careers"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Briefcase className="w-5 h-5" />
                Careers
              </Link>
            </nav>

            {/* Mobile Auth Buttons */}
            <div className="flex gap-2 pt-2 border-t border-border">
              <Link to="/auth" className="flex-1">
                <Button variant="outline" className="w-full">Log In</Button>
              </Link>
              <Link to="/auth?mode=signup" className="flex-1">
                <Button variant="accent" className="w-full">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
