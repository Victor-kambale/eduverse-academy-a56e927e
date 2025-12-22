import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, User, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface SearchResult {
  type: 'course' | 'instructor';
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
}

export const SearchAutocomplete = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchDebounce = setTimeout(() => {
      if (query.length >= 2) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchDebounce);
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const searchTerm = `%${query}%`;

      // Search courses
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, instructor_name, thumbnail_url, category')
        .eq('is_published', true)
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},instructor_name.ilike.${searchTerm}`)
        .limit(5);

      const courseResults: SearchResult[] = (courses || []).map((course) => ({
        type: 'course' as const,
        id: course.id,
        title: course.title,
        subtitle: course.instructor_name || course.category,
        image: course.thumbnail_url,
      }));

      // Get unique instructors from courses
      const { data: instructors } = await supabase
        .from('courses')
        .select('instructor_id, instructor_name')
        .eq('is_published', true)
        .ilike('instructor_name', searchTerm)
        .limit(3);

      const uniqueInstructors = new Map<string, SearchResult>();
      (instructors || []).forEach((i) => {
        if (i.instructor_name && !uniqueInstructors.has(i.instructor_name)) {
          uniqueInstructors.set(i.instructor_name, {
            type: 'instructor',
            id: i.instructor_id || i.instructor_name,
            title: i.instructor_name,
            subtitle: 'Instructor',
          });
        }
      });

      setResults([...courseResults, ...Array.from(uniqueInstructors.values())]);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    if (result.type === 'course') {
      navigate(`/course/${result.id}`);
    } else {
      navigate(`/courses?instructor=${encodeURIComponent(result.title)}`);
    }
    setQuery('');
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/courses?search=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search courses, topics, instructors..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="pl-10 pr-10 bg-background/50 border-border/50 focus:bg-background"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Dropdown */}
      {isOpen && (query.length >= 2 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {loading ? (
            <div className="p-4 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-80 overflow-y-auto">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}-${index}`}
                  onClick={() => handleSelect(result)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left',
                    index !== results.length - 1 && 'border-b border-border/50'
                  )}
                >
                  {result.image ? (
                    <img
                      src={result.image}
                      alt={result.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : (
                    <div className={cn(
                      'w-10 h-10 rounded flex items-center justify-center',
                      result.type === 'course' ? 'bg-accent/20' : 'bg-primary/20'
                    )}>
                      {result.type === 'course' ? (
                        <BookOpen className="h-5 w-5 text-accent" />
                      ) : (
                        <User className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{result.title}</p>
                    {result.subtitle && (
                      <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground capitalize px-2 py-1 bg-muted rounded">
                    {result.type}
                  </span>
                </button>
              ))}
              
              {/* View all results */}
              <button
                onClick={handleSubmit}
                className="w-full p-3 text-center text-sm text-accent hover:bg-muted transition-colors border-t border-border"
              >
                View all results for "{query}"
              </button>
            </div>
          ) : query.length >= 2 ? (
            <div className="p-6 text-center">
              <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">No results found</p>
              <p className="text-sm text-muted-foreground">
                Try different keywords or browse our courses
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => {
                  navigate('/courses');
                  setIsOpen(false);
                }}
              >
                Browse All Courses
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
