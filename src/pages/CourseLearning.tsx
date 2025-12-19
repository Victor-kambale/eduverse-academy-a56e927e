import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Clock,
  BookOpen,
  Award,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Mock course data
const courseData = {
  id: '1',
  title: 'Complete Web Development Bootcamp 2025',
  instructor: 'Dr. Sarah Chen',
  sections: [
    {
      id: 's1',
      title: 'Getting Started',
      lessons: [
        { id: 'l1', title: 'Welcome to the Course', duration: '5:30', completed: true, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' },
        { id: 'l2', title: 'Setting Up Your Environment', duration: '12:45', completed: true, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' },
        { id: 'l3', title: 'VS Code Tips and Tricks', duration: '8:20', completed: false, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' },
      ],
    },
    {
      id: 's2',
      title: 'HTML Fundamentals',
      lessons: [
        { id: 'l4', title: 'Introduction to HTML', duration: '15:00', completed: false, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' },
        { id: 'l5', title: 'HTML Document Structure', duration: '10:30', completed: false, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' },
        { id: 'l6', title: 'Working with Text', duration: '12:15', completed: false, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' },
        { id: 'l7', title: 'Links and Images', duration: '14:00', completed: false, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' },
      ],
    },
    {
      id: 's3',
      title: 'CSS Styling',
      lessons: [
        { id: 'l8', title: 'Introduction to CSS', duration: '18:00', completed: false, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' },
        { id: 'l9', title: 'Selectors and Properties', duration: '20:30', completed: false, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' },
        { id: 'l10', title: 'Box Model Deep Dive', duration: '16:45', completed: false, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' },
      ],
    },
    {
      id: 's4',
      title: 'JavaScript Basics',
      lessons: [
        { id: 'l11', title: 'Introduction to JavaScript', duration: '22:00', completed: false, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' },
        { id: 'l12', title: 'Variables and Data Types', duration: '18:30', completed: false, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' },
        { id: 'l13', title: 'Functions and Scope', duration: '25:00', completed: false, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' },
        { id: 'l14', title: 'DOM Manipulation', duration: '30:00', completed: false, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' },
      ],
    },
  ],
};

const CourseLearning = () => {
  const { courseId } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>(['s1', 's2']);
  const [currentLessonId, setCurrentLessonId] = useState('l3');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set(['l1', 'l2'])
  );

  // Get all lessons flattened
  const allLessons = courseData.sections.flatMap((s) => s.lessons);
  const currentLesson = allLessons.find((l) => l.id === currentLessonId);
  const currentLessonIndex = allLessons.findIndex((l) => l.id === currentLessonId);
  
  // Calculate progress
  const totalLessons = allLessons.length;
  const completedCount = completedLessons.size;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      markAsCompleted(currentLessonId);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentLessonId]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonId(allLessons[currentLessonIndex - 1].id);
      setIsPlaying(false);
    }
  };

  const goToNextLesson = () => {
    if (currentLessonIndex < allLessons.length - 1) {
      setCurrentLessonId(allLessons[currentLessonIndex + 1].id);
      setIsPlaying(false);
    }
  };

  const markAsCompleted = (lessonId: string) => {
    setCompletedLessons((prev) => {
      const newSet = new Set(prev);
      newSet.add(lessonId);
      return newSet;
    });
    toast.success('Lesson completed!');
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-80 bg-card border-r border-border transform transition-transform duration-300 lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <Link to={`/course/${courseId}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm">Back to Course</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <h2 className="font-semibold line-clamp-2">{courseData.title}</h2>
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {completedCount} of {totalLessons} lessons completed
              </p>
            </div>
          </div>

          {/* Lessons List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {courseData.sections.map((section) => (
                <Collapsible
                  key={section.id}
                  open={expandedSections.includes(section.id)}
                  onOpenChange={() => toggleSection(section.id)}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted text-left">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{section.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {section.lessons.filter((l) => completedLessons.has(l.id)).length}/
                        {section.lessons.length} completed
                      </p>
                    </div>
                    {expandedSections.includes(section.id) ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="ml-2 space-y-1">
                      {section.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            setCurrentLessonId(lesson.id);
                            setIsPlaying(false);
                          }}
                          className={cn(
                            'flex items-center gap-3 w-full p-3 rounded-lg text-left transition-colors',
                            currentLessonId === lesson.id
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-muted'
                          )}
                        >
                          {completedLessons.has(lesson.id) ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                          ) : currentLessonId === lesson.id ? (
                            <Play className="w-5 h-5 text-primary flex-shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{lesson.title}</p>
                            <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold truncate">{currentLesson?.title}</h1>
              <p className="text-sm text-muted-foreground">{courseData.instructor}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAsCompleted(currentLessonId)}
              disabled={completedLessons.has(currentLessonId)}
            >
              {completedLessons.has(currentLessonId) ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                  Completed
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4 mr-2" />
                  Mark Complete
                </>
              )}
            </Button>
          </div>
        </header>

        {/* Video Player */}
        <div className="flex-1 bg-black flex items-center justify-center">
          <div className="relative w-full max-w-5xl aspect-video">
            <video
              ref={videoRef}
              src={currentLesson?.videoUrl}
              className="w-full h-full"
              poster="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1280&h=720&fit=crop"
              onClick={togglePlay}
            />
            
            {/* Play/Pause Overlay */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity hover:bg-black/40"
              >
                <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center">
                  <Play className="w-8 h-8 text-primary-foreground ml-1" />
                </div>
              </button>
            )}

            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress Bar */}
              <div className="mb-3">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={goToPreviousLesson} disabled={currentLessonIndex === 0}>
                    <SkipBack className="w-5 h-5 text-white" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={togglePlay}>
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-white" />
                    ) : (
                      <Play className="w-6 h-6 text-white" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={goToNextLesson} disabled={currentLessonIndex === allLessons.length - 1}>
                    <SkipForward className="w-5 h-5 text-white" />
                  </Button>
                  
                  <div className="flex items-center gap-2 ml-2">
                    <Button variant="ghost" size="icon" onClick={toggleMute}>
                      {isMuted ? (
                        <VolumeX className="w-5 h-5 text-white" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-white" />
                      )}
                    </Button>
                    <div className="w-24">
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        max={1}
                        step={0.01}
                        onValueChange={handleVolumeChange}
                      />
                    </div>
                  </div>

                  <span className="text-white text-sm ml-4">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                  <Maximize className="w-5 h-5 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Navigation Footer */}
        <footer className="p-4 border-t border-border bg-card flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousLesson}
            disabled={currentLessonIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous Lesson
          </Button>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              Lesson {currentLessonIndex + 1} of {totalLessons}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {currentLesson?.duration}
            </span>
          </div>

          <Button
            onClick={goToNextLesson}
            disabled={currentLessonIndex === allLessons.length - 1}
          >
            Next Lesson
            <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
          </Button>
        </footer>
      </main>
    </div>
  );
};

export default CourseLearning;
