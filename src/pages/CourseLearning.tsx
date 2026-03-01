import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize,
  CheckCircle2, Circle, ChevronLeft, ChevronDown, ChevronUp, Clock,
  BookOpen, Award, Menu, X, ThumbsUp, ThumbsDown, Share2,
  MessageSquare, MoreHorizontal, User, Calendar, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { CopyProtection } from '@/components/security/CopyProtection';
import { LessonCarousel } from '@/components/course/LessonCarousel';
import { InfiniteCarousel } from '@/components/ui/infinite-carousel';
import { CourseResources } from '@/components/course/CourseResources';
import { CodeSnippets } from '@/components/course/CodeSnippets';

// Mock course data with instructor info and dates
const courseData = {
  id: '11111111-1111-1111-1111-111111111111',
  title: 'Complete Web Development Bootcamp 2025',
  instructor: {
    name: 'Dr. Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    title: 'Senior Software Engineer',
  },
  sections: [
    {
      id: 's1', title: 'Getting Started',
      lessons: [
        { id: 'l1', title: 'Welcome to the Course', duration: '5:30', completed: true, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', postedBy: 'Dr. Sarah Chen', postedAt: '2024-12-15T10:30:00Z', likes: 245, dislikes: 3 },
        { id: 'l2', title: 'Setting Up Your Environment', duration: '12:45', completed: true, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', postedBy: 'Dr. Sarah Chen', postedAt: '2024-12-16T14:00:00Z', likes: 189, dislikes: 5 },
        { id: 'l3', title: 'VS Code Tips and Tricks', duration: '8:20', completed: false, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', postedBy: 'Dr. Sarah Chen', postedAt: '2024-12-17T09:15:00Z', likes: 156, dislikes: 2 },
      ],
    },
    {
      id: 's2', title: 'HTML Fundamentals',
      lessons: [
        { id: 'l4', title: 'Introduction to HTML', duration: '15:00', completed: false, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', postedBy: 'Dr. Sarah Chen', postedAt: '2024-12-18T11:00:00Z', likes: 134, dislikes: 1 },
        { id: 'l5', title: 'HTML Document Structure', duration: '10:30', completed: false, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', postedBy: 'Dr. Sarah Chen', postedAt: '2024-12-19T15:30:00Z', likes: 98, dislikes: 0 },
        { id: 'l6', title: 'Working with Text', duration: '12:15', completed: false, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', postedBy: 'Dr. Sarah Chen', postedAt: '2024-12-20T08:45:00Z', likes: 87, dislikes: 1 },
        { id: 'l7', title: 'Links and Images', duration: '14:00', completed: false, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', postedBy: 'Dr. Sarah Chen', postedAt: '2024-12-21T10:00:00Z', likes: 76, dislikes: 2 },
      ],
    },
    {
      id: 's3', title: 'CSS Styling',
      lessons: [
        { id: 'l8', title: 'Introduction to CSS', duration: '18:00', completed: false, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', postedBy: 'Dr. Sarah Chen', postedAt: '2024-12-22T12:00:00Z', likes: 65, dislikes: 0 },
        { id: 'l9', title: 'Selectors and Properties', duration: '20:30', completed: false, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', postedBy: 'Dr. Sarah Chen', postedAt: '2024-12-23T09:30:00Z', likes: 54, dislikes: 1 },
        { id: 'l10', title: 'Box Model Deep Dive', duration: '16:45', completed: false, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', postedBy: 'Dr. Sarah Chen', postedAt: '2024-12-24T14:00:00Z', likes: 43, dislikes: 0 },
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
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set(['l1', 'l2']));
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);

  const allLessons = courseData.sections.flatMap((s) => s.lessons);
  const currentLesson = allLessons.find((l) => l.id === currentLessonId);
  const currentLessonIndex = allLessons.findIndex((l) => l.id === currentLessonId);
  const totalLessons = allLessons.length;
  const completedCount = completedLessons.size;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => { setIsPlaying(false); markAsCompleted(currentLessonId); };
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
      if (isPlaying) videoRef.current.pause(); else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) { videoRef.current.muted = !isMuted; setIsMuted(!isMuted); }
  };

  const handleVolumeChange = (value: number[]) => {
    const v = value[0]; setVolume(v);
    if (videoRef.current) { videoRef.current.volume = v; setIsMuted(v === 0); }
  };

  const handleSeek = (value: number[]) => {
    const t = value[0]; setCurrentTime(t);
    if (videoRef.current) videoRef.current.currentTime = t;
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) document.exitFullscreen();
      else videoRef.current.requestFullscreen();
    }
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) { setCurrentLessonId(allLessons[currentLessonIndex - 1].id); setIsPlaying(false); setUserReaction(null); }
  };

  const goToNextLesson = () => {
    if (currentLessonIndex < allLessons.length - 1) { setCurrentLessonId(allLessons[currentLessonIndex + 1].id); setIsPlaying(false); setUserReaction(null); }
  };

  const markAsCompleted = (lessonId: string) => {
    setCompletedLessons((prev) => { const s = new Set(prev); s.add(lessonId); return s; });
    toast.success('Lesson completed! 🎉');
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleLike = () => { setUserReaction(userReaction === 'like' ? null : 'like'); toast.success(userReaction === 'like' ? 'Removed like' : 'Marked as helpful!'); };
  const handleDislike = () => { setUserReaction(userReaction === 'dislike' ? null : 'dislike'); toast.success(userReaction === 'dislike' ? 'Removed dislike' : 'Marked as not helpful'); };
  const handleShare = () => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied to clipboard!'); };

  return (
    <CopyProtection>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-80 bg-card border-r border-border lg:relative"
            >
              <div className="flex flex-col h-full">
                {/* Sidebar Header */}
                <div className="p-4 border-b border-border bg-gradient-to-b from-muted/50 to-transparent">
                  <div className="flex items-center justify-between mb-4">
                    <Link to={`/course/${courseId}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                      <span className="text-sm">Back to Course</span>
                    </Link>
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <h2 className="font-semibold line-clamp-2">{courseData.title}</h2>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <Avatar className="w-8 h-8 ring-2 ring-accent/20">
                      <AvatarImage src={courseData.instructor.avatar} />
                      <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{courseData.instructor.name}</p>
                      <p className="text-xs text-muted-foreground">{courseData.instructor.title}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-bold text-accent">{progressPercent}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-2.5" />
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {completedCount} of {totalLessons} lessons completed
                    </p>
                  </div>
                </div>

                {/* Lessons List */}
                <ScrollArea className="flex-1">
                  <div className="p-2">
                    {courseData.sections.map((section, sIdx) => (
                      <motion.div
                        key={section.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: sIdx * 0.08 }}
                      >
                        <Collapsible open={expandedSections.includes(section.id)} onOpenChange={() => toggleSection(section.id)}>
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted text-left transition-colors">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{section.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {section.lessons.filter((l) => completedLessons.has(l.id)).length}/{section.lessons.length} completed
                              </p>
                            </div>
                            {expandedSections.includes(section.id) ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="ml-2 space-y-1">
                              {section.lessons.map((lesson, lIdx) => (
                                <motion.button
                                  key={lesson.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: lIdx * 0.04 }}
                                  onClick={() => { setCurrentLessonId(lesson.id); setIsPlaying(false); setUserReaction(null); }}
                                  className={cn(
                                    'flex items-center gap-3 w-full p-3 rounded-lg text-left transition-all duration-200',
                                    currentLessonId === lesson.id
                                      ? 'bg-accent/10 text-accent border-l-2 border-accent shadow-sm'
                                      : 'hover:bg-muted'
                                  )}
                                >
                                  {completedLessons.has(lesson.id) ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                  ) : currentLessonId === lesson.id ? (
                                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                                      <Play className="w-5 h-5 text-accent flex-shrink-0" />
                                    </motion.div>
                                  ) : (
                                    <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{lesson.title}</p>
                                    <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                                  </div>
                                </motion.button>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-auto">
          {/* Top Bar */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40"
          >
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-semibold truncate">{currentLesson?.title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-3 h-3" />
                  <span>{currentLesson?.postedBy}</span>
                  <span>•</span>
                  <Calendar className="w-3 h-3" />
                  <span>{currentLesson?.postedAt ? formatDate(currentLesson.postedAt) : ''}</span>
                </div>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant={completedLessons.has(currentLessonId) ? "outline" : "accent"}
                size="sm"
                onClick={() => markAsCompleted(currentLessonId)}
                disabled={completedLessons.has(currentLessonId)}
                className="gap-2"
              >
                {completedLessons.has(currentLessonId) ? (
                  <><CheckCircle2 className="w-4 h-4 text-green-500" /> Completed</>
                ) : (
                  <><Circle className="w-4 h-4" /> Mark Complete</>
                )}
              </Button>
            </motion.div>
          </motion.header>

          {/* Video Player */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-black flex items-center justify-center"
          >
            <div className="relative w-full max-w-5xl aspect-video">
              <video
                ref={videoRef}
                src={currentLesson?.videoUrl}
                className="w-full h-full"
                poster="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1280&h=720&fit=crop"
                onClick={togglePlay}
                controlsList="nodownload nofullscreen noremoteplayback"
                disablePictureInPicture
                onContextMenu={(e) => e.preventDefault()}
              />
              
              <AnimatePresence>
                {!isPlaying && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-20 h-20 rounded-full bg-accent/90 flex items-center justify-center shadow-2xl"
                    >
                      <Play className="w-8 h-8 text-accent-foreground ml-1" />
                    </motion.div>
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-12">
                <div className="mb-3">
                  <Slider value={[currentTime]} max={duration || 100} step={0.1} onValueChange={handleSeek} className="cursor-pointer" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={goToPreviousLesson} disabled={currentLessonIndex === 0}>
                      <SkipBack className="w-5 h-5 text-white" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={togglePlay}>
                      {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={goToNextLesson} disabled={currentLessonIndex === allLessons.length - 1}>
                      <SkipForward className="w-5 h-5 text-white" />
                    </Button>
                    <div className="flex items-center gap-2 ml-2">
                      <Button variant="ghost" size="icon" onClick={toggleMute}>
                        {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                      </Button>
                      <div className="w-24"><Slider value={[isMuted ? 0 : volume]} max={1} step={0.01} onValueChange={handleVolumeChange} /></div>
                    </div>
                    <span className="text-white text-sm ml-4">{formatTime(currentTime)} / {formatTime(duration)}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                    <Maximize className="w-5 h-5 text-white" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Video Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 bg-card border-b border-border"
          >
            <div className="flex items-center justify-between max-w-5xl mx-auto flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant={userReaction === 'like' ? 'accent' : 'outline'} size="sm" onClick={handleLike} className="gap-2">
                    <ThumbsUp className="w-4 h-4" />
                    <span>Helpful ({(currentLesson?.likes || 0) + (userReaction === 'like' ? 1 : 0)})</span>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant={userReaction === 'dislike' ? 'destructive' : 'outline'} size="sm" onClick={handleDislike} className="gap-2">
                    <ThumbsDown className="w-4 h-4" />
                    <span>Not Helpful ({(currentLesson?.dislikes || 0) + (userReaction === 'dislike' ? 1 : 0)})</span>
                  </Button>
                </motion.div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
                  <Share2 className="w-4 h-4" /> Share
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <MessageSquare className="w-4 h-4" /> Comments
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Report issue</DropdownMenuItem>
                    <DropdownMenuItem>Download resources</DropdownMenuItem>
                    <DropdownMenuItem>Add to favorites</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </motion.div>

          {/* Lesson Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 bg-muted/30"
          >
            <div className="max-w-5xl mx-auto">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" /> Up Next
              </h3>
              <LessonCarousel
                lessons={allLessons.map(l => ({ id: l.id, title: l.title, duration: l.duration, completed: completedLessons.has(l.id) }))}
                currentLessonId={currentLessonId}
                onSelectLesson={(id) => { setCurrentLessonId(id); setIsPlaying(false); setUserReaction(null); }}
                completedLessons={completedLessons}
              />
            </div>
          </motion.div>

          {/* Code Snippets & Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-background border-t border-border"
          >
            <div className="max-w-5xl mx-auto space-y-6">
              <CodeSnippets courseId={courseId || ''} lessonId={currentLessonId} />
              <CourseResources courseId={courseId || ''} lessonId={currentLessonId} />
            </div>
          </motion.div>

          {/* Related Courses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 bg-background"
          >
            <div className="max-w-5xl mx-auto">
              <h3 className="font-semibold mb-4">Related Courses</h3>
              <InfiniteCarousel speed="slow" pauseOnHover>
                {[
                  { title: 'React Masterclass', instructor: 'John Doe', image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=170&fit=crop' },
                  { title: 'Node.js Complete Guide', instructor: 'Jane Smith', image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=300&h=170&fit=crop' },
                  { title: 'TypeScript Fundamentals', instructor: 'Mike Johnson', image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=300&h=170&fit=crop' },
                  { title: 'CSS Grid & Flexbox', instructor: 'Sarah Lee', image: 'https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?w=300&h=170&fit=crop' },
                  { title: 'MongoDB Essentials', instructor: 'Chris Brown', image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=300&h=170&fit=crop' },
                ].map((course, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.03, y: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="flex-shrink-0 w-72 rounded-xl overflow-hidden shadow-md hover:shadow-xl cursor-pointer bg-card border border-border/50"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-sm">{course.title}</h4>
                      <p className="text-xs text-muted-foreground">by {course.instructor}</p>
                    </div>
                  </motion.div>
                ))}
              </InfiniteCarousel>
            </div>
          </motion.div>

          {/* Lesson Navigation Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="p-4 border-t border-border bg-card flex items-center justify-between mt-auto sticky bottom-0 z-30 backdrop-blur-sm"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" onClick={goToPreviousLesson} disabled={currentLessonIndex === 0}>
                <ChevronLeft className="w-4 h-4 mr-2" /> Previous Lesson
              </Button>
            </motion.div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" /> Lesson {currentLessonIndex + 1} of {totalLessons}
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-4 h-4 text-accent" /> {progressPercent}% Complete
              </span>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="accent" onClick={goToNextLesson} disabled={currentLessonIndex === allLessons.length - 1}>
                Next Lesson <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
              </Button>
            </motion.div>
          </motion.footer>
        </main>
      </div>
    </CopyProtection>
  );
};

export default CourseLearning;
