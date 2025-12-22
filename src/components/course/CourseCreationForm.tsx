import { useState, useCallback } from 'react';
import { 
  Plus, 
  Upload, 
  Video, 
  Image, 
  FileCode, 
  Save, 
  Send,
  X,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Trash2,
  Link as LinkIcon,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  videoFile?: File;
  duration: number;
  isFreePreview: boolean;
  codeSnippets: CodeSnippet[];
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  isOpen: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  answers: { id: string; text: string; isCorrect: boolean }[];
  points: number;
}

interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
}

interface CourseData {
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  level: string;
  price: number;
  thumbnailUrl: string;
  thumbnailFile?: File;
  images: { url: string; file?: File }[];
  chapters: Chapter[];
  quiz: QuizQuestion[];
  semester1Exam: QuizQuestion[];
  semester2Exam: QuizQuestion[];
  isDraft: boolean;
}

const categories = ['Technology', 'Business', 'Design', 'Marketing', 'Science', 'Language', 'Health', 'Arts'];
const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
const languages = ['javascript', 'typescript', 'python', 'java', 'cpp', 'html', 'css', 'sql', 'bash'];

export function CourseCreationForm() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  const [courseData, setCourseData] = useState<CourseData>({
    title: '',
    shortDescription: '',
    description: '',
    category: '',
    level: 'beginner',
    price: 0,
    thumbnailUrl: '',
    images: [],
    chapters: [],
    quiz: [],
    semester1Exam: [],
    semester2Exam: [],
    isDraft: true,
  });

  // Thumbnail dropzone
  const onThumbnailDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setCourseData(prev => ({
        ...prev,
        thumbnailFile: file,
        thumbnailUrl: URL.createObjectURL(file)
      }));
    }
  }, []);

  const { getRootProps: getThumbnailProps, getInputProps: getThumbnailInputProps } = useDropzone({
    onDrop: onThumbnailDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
  });

  // Multiple images dropzone
  const onImagesDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map(file => ({
      url: URL.createObjectURL(file),
      file
    }));
    setCourseData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  }, []);

  const { getRootProps: getImagesProps, getInputProps: getImagesInputProps } = useDropzone({
    onDrop: onImagesDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
  });

  const addChapter = () => {
    const newChapter: Chapter = {
      id: crypto.randomUUID(),
      title: `Chapter ${courseData.chapters.length + 1}`,
      description: '',
      lessons: [],
      isOpen: true,
    };
    setCourseData(prev => ({
      ...prev,
      chapters: [...prev.chapters, newChapter]
    }));
  };

  const addLesson = (chapterId: string) => {
    const newLesson: Lesson = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      videoUrl: '',
      duration: 0,
      isFreePreview: false,
      codeSnippets: [],
    };
    setCourseData(prev => ({
      ...prev,
      chapters: prev.chapters.map(ch =>
        ch.id === chapterId
          ? { ...ch, lessons: [...ch.lessons, newLesson] }
          : ch
      )
    }));
  };

  const addCodeSnippet = (chapterId: string, lessonId: string) => {
    const newSnippet: CodeSnippet = {
      id: crypto.randomUUID(),
      title: 'Code Example',
      language: 'javascript',
      code: '// Your code here\n',
    };
    setCourseData(prev => ({
      ...prev,
      chapters: prev.chapters.map(ch =>
        ch.id === chapterId
          ? {
              ...ch,
              lessons: ch.lessons.map(l =>
                l.id === lessonId
                  ? { ...l, codeSnippets: [...l.codeSnippets, newSnippet] }
                  : l
              )
            }
          : ch
      )
    }));
  };

  const addQuizQuestion = (type: 'quiz' | 'semester1Exam' | 'semester2Exam') => {
    const newQuestion: QuizQuestion = {
      id: crypto.randomUUID(),
      question: '',
      answers: [
        { id: crypto.randomUUID(), text: '', isCorrect: true },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
      ],
      points: 1,
    };
    setCourseData(prev => ({
      ...prev,
      [type]: [...prev[type], newQuestion]
    }));
  };

  const copyCode = (code: string, snippetId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(snippetId);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success('Code copied to clipboard!');
  };

  const removeImage = (index: number) => {
    setCourseData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const saveCourse = async (publish: boolean = false) => {
    if (!user?.id) {
      toast.error('Please login to create a course');
      return;
    }

    if (!courseData.title) {
      toast.error('Please enter a course title');
      return;
    }

    setSaving(true);
    try {
      let thumbnailUrl = courseData.thumbnailUrl;

      // Upload thumbnail if it's a file
      if (courseData.thumbnailFile) {
        const filePath = `${user.id}/${Date.now()}_thumbnail.${courseData.thumbnailFile.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage
          .from('course-media')
          .upload(filePath, courseData.thumbnailFile);
        
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('course-media').getPublicUrl(filePath);
          thumbnailUrl = urlData.publicUrl;
        }
      }

      // Create the course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: courseData.title,
          short_description: courseData.shortDescription,
          description: courseData.description,
          category: courseData.category,
          level: courseData.level,
          price: courseData.price,
          thumbnail_url: thumbnailUrl,
          instructor_id: user.id,
          is_published: publish,
          duration_hours: courseData.chapters.reduce((acc, ch) => 
            acc + ch.lessons.reduce((a, l) => a + (l.duration / 60), 0), 0
          ),
        })
        .select()
        .single();

      if (courseError) throw courseError;

      // Create lessons
      for (let i = 0; i < courseData.chapters.length; i++) {
        const chapter = courseData.chapters[i];
        for (let j = 0; j < chapter.lessons.length; j++) {
          const lesson = chapter.lessons[j];
          const { data: lessonData } = await supabase
            .from('lessons')
            .insert({
              course_id: course.id,
              title: `${chapter.title}: ${lesson.title}`,
              description: lesson.description,
              video_url: lesson.videoUrl,
              duration_minutes: lesson.duration,
              is_free_preview: lesson.isFreePreview,
              sort_order: i * 100 + j,
            })
            .select()
            .single();

          // Create code snippets for this lesson
          if (lessonData) {
            for (const snippet of lesson.codeSnippets) {
              await supabase.from('code_snippets').insert({
                course_id: course.id,
                lesson_id: lessonData.id,
                teacher_id: user.id,
                title: snippet.title,
                language: snippet.language,
                code: snippet.code,
              });
            }
          }
        }
      }

      // Create quiz if exists
      if (courseData.quiz.length > 0 || courseData.semester1Exam.length > 0 || courseData.semester2Exam.length > 0) {
        // Create main quiz
        if (courseData.quiz.length > 0) {
          const { data: quiz } = await supabase
            .from('quizzes')
            .insert({
              course_id: course.id,
              title: 'Course Quiz',
              description: 'Test your knowledge',
              is_final_exam: false,
              passing_score: 70,
            })
            .select()
            .single();

          if (quiz) {
            for (const q of courseData.quiz) {
              const { data: question } = await supabase
                .from('quiz_questions')
                .insert({
                  quiz_id: quiz.id,
                  question_text: q.question,
                  points: q.points,
                })
                .select()
                .single();

              if (question) {
                for (const a of q.answers) {
                  await supabase.from('quiz_answers').insert({
                    question_id: question.id,
                    answer_text: a.text,
                    is_correct: a.isCorrect,
                  });
                }
              }
            }
          }
        }

        // Create semester 1 exam
        if (courseData.semester1Exam.length > 0) {
          const { data: exam1 } = await supabase
            .from('quizzes')
            .insert({
              course_id: course.id,
              title: 'Semester 1 Examination',
              description: 'Mid-course examination',
              is_final_exam: false,
              passing_score: 60,
              time_limit_minutes: 60,
            })
            .select()
            .single();

          if (exam1) {
            for (const q of courseData.semester1Exam) {
              const { data: question } = await supabase
                .from('quiz_questions')
                .insert({
                  quiz_id: exam1.id,
                  question_text: q.question,
                  points: q.points,
                })
                .select()
                .single();

              if (question) {
                for (const a of q.answers) {
                  await supabase.from('quiz_answers').insert({
                    question_id: question.id,
                    answer_text: a.text,
                    is_correct: a.isCorrect,
                  });
                }
              }
            }
          }
        }

        // Create semester 2 final exam
        if (courseData.semester2Exam.length > 0) {
          const { data: exam2 } = await supabase
            .from('quizzes')
            .insert({
              course_id: course.id,
              title: 'Semester 2 Final Examination',
              description: 'Final examination - Certificate will be issued upon passing',
              is_final_exam: true,
              passing_score: 70,
              time_limit_minutes: 90,
            })
            .select()
            .single();

          if (exam2) {
            for (const q of courseData.semester2Exam) {
              const { data: question } = await supabase
                .from('quiz_questions')
                .insert({
                  quiz_id: exam2.id,
                  question_text: q.question,
                  points: q.points,
                })
                .select()
                .single();

              if (question) {
                for (const a of q.answers) {
                  await supabase.from('quiz_answers').insert({
                    question_id: question.id,
                    answer_text: a.text,
                    is_correct: a.isCorrect,
                  });
                }
              }
            }
          }
        }
      }

      toast.success(publish ? 'Course published successfully!' : 'Course saved as draft!');
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Create New Course</h2>
          <p className="text-muted-foreground">Fill in the details to create your course</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => saveCourse(false)} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>
          <Button onClick={() => saveCourse(true)} disabled={saving}>
            <Send className="h-4 w-4 mr-2" />
            Publish Course
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="quiz">Quizzes</TabsTrigger>
          <TabsTrigger value="exams">Examinations</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={courseData.title}
                    onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter course title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={courseData.price}
                    onChange={(e) => setCourseData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDesc">Short Description</Label>
                <Input
                  id="shortDesc"
                  value={courseData.shortDescription}
                  onChange={(e) => setCourseData(prev => ({ ...prev, shortDescription: e.target.value }))}
                  placeholder="Brief description (shown in course cards)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={courseData.description}
                  onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed course description"
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={courseData.category}
                    onValueChange={(value) => setCourseData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Level</Label>
                  <Select
                    value={courseData.level}
                    onValueChange={(value) => setCourseData(prev => ({ ...prev, level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map(level => (
                        <SelectItem key={level} value={level} className="capitalize">{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Thumbnail</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                {...getThumbnailProps()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <input {...getThumbnailInputProps()} />
                {courseData.thumbnailUrl ? (
                  <div className="relative inline-block">
                    <img src={courseData.thumbnailUrl} alt="Thumbnail" className="max-h-48 rounded-lg" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCourseData(prev => ({ ...prev, thumbnailUrl: '', thumbnailFile: undefined }));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Drag & drop an image or click to browse</p>
                  </div>
                )}
              </div>

              {/* URL Input */}
              <div className="mt-4 flex gap-2">
                <Input
                  placeholder="Or paste image URL..."
                  value={courseData.thumbnailFile ? '' : courseData.thumbnailUrl}
                  onChange={(e) => setCourseData(prev => ({ ...prev, thumbnailUrl: e.target.value, thumbnailFile: undefined }))}
                />
                <Button variant="outline" size="icon">
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                {...getImagesProps()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <input {...getImagesInputProps()} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Drag & drop multiple images</p>
              </div>

              {courseData.images.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {courseData.images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img src={img.url} alt={`Course image ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Curriculum Tab */}
        <TabsContent value="curriculum" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Chapters & Lessons</h3>
            <Button onClick={addChapter}>
              <Plus className="h-4 w-4 mr-2" />
              Add Chapter
            </Button>
          </div>

          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {courseData.chapters.map((chapter, chapterIndex) => (
                <Card key={chapter.id}>
                  <Collapsible open={chapter.isOpen} onOpenChange={(open) => {
                    setCourseData(prev => ({
                      ...prev,
                      chapters: prev.chapters.map(ch =>
                        ch.id === chapter.id ? { ...ch, isOpen: open } : ch
                      )
                    }));
                  }}>
                    <CardHeader className="py-3">
                      <CollapsibleTrigger className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                          <Badge variant="outline">Chapter {chapterIndex + 1}</Badge>
                          <Input
                            value={chapter.title}
                            onChange={(e) => {
                              setCourseData(prev => ({
                                ...prev,
                                chapters: prev.chapters.map(ch =>
                                  ch.id === chapter.id ? { ...ch, title: e.target.value } : ch
                                )
                              }));
                            }}
                            className="w-64"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{chapter.lessons.length} lessons</span>
                          {chapter.isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </div>
                      </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        {chapter.lessons.map((lesson, lessonIndex) => (
                          <div key={lesson.id} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                            <div className="flex items-center gap-3">
                              <Badge>Lesson {lessonIndex + 1}</Badge>
                              <Input
                                value={lesson.title}
                                onChange={(e) => {
                                  setCourseData(prev => ({
                                    ...prev,
                                    chapters: prev.chapters.map(ch =>
                                      ch.id === chapter.id
                                        ? {
                                            ...ch,
                                            lessons: ch.lessons.map(l =>
                                              l.id === lesson.id ? { ...l, title: e.target.value } : l
                                            )
                                          }
                                        : ch
                                    )
                                  }));
                                }}
                                placeholder="Lesson title"
                                className="flex-1"
                              />
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={lesson.isFreePreview}
                                  onCheckedChange={(checked) => {
                                    setCourseData(prev => ({
                                      ...prev,
                                      chapters: prev.chapters.map(ch =>
                                        ch.id === chapter.id
                                          ? {
                                              ...ch,
                                              lessons: ch.lessons.map(l =>
                                                l.id === lesson.id ? { ...l, isFreePreview: checked } : l
                                              )
                                            }
                                          : ch
                                      )
                                    }));
                                  }}
                                />
                                <Label className="text-sm">Free Preview</Label>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">Video URL</Label>
                                <Input
                                  value={lesson.videoUrl}
                                  onChange={(e) => {
                                    setCourseData(prev => ({
                                      ...prev,
                                      chapters: prev.chapters.map(ch =>
                                        ch.id === chapter.id
                                          ? {
                                              ...ch,
                                              lessons: ch.lessons.map(l =>
                                                l.id === lesson.id ? { ...l, videoUrl: e.target.value } : l
                                              )
                                            }
                                          : ch
                                      )
                                    }));
                                  }}
                                  placeholder="YouTube or Vimeo URL"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Duration (minutes)</Label>
                                <Input
                                  type="number"
                                  value={lesson.duration}
                                  onChange={(e) => {
                                    setCourseData(prev => ({
                                      ...prev,
                                      chapters: prev.chapters.map(ch =>
                                        ch.id === chapter.id
                                          ? {
                                              ...ch,
                                              lessons: ch.lessons.map(l =>
                                                l.id === lesson.id ? { ...l, duration: parseInt(e.target.value) || 0 } : l
                                              )
                                            }
                                          : ch
                                      )
                                    }));
                                  }}
                                />
                              </div>
                            </div>

                            <Textarea
                              value={lesson.description}
                              onChange={(e) => {
                                setCourseData(prev => ({
                                  ...prev,
                                  chapters: prev.chapters.map(ch =>
                                    ch.id === chapter.id
                                      ? {
                                          ...ch,
                                          lessons: ch.lessons.map(l =>
                                            l.id === lesson.id ? { ...l, description: e.target.value } : l
                                          )
                                        }
                                      : ch
                                  )
                                }));
                              }}
                              placeholder="Lesson description"
                              rows={2}
                            />

                            {/* Code Snippets */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Code Snippets</Label>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addCodeSnippet(chapter.id, lesson.id)}
                                >
                                  <FileCode className="h-4 w-4 mr-1" />
                                  Add Code
                                </Button>
                              </div>
                              {lesson.codeSnippets.map((snippet) => (
                                <div key={snippet.id} className="border rounded-lg p-3 bg-background">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Input
                                      value={snippet.title}
                                      onChange={(e) => {
                                        setCourseData(prev => ({
                                          ...prev,
                                          chapters: prev.chapters.map(ch =>
                                            ch.id === chapter.id
                                              ? {
                                                  ...ch,
                                                  lessons: ch.lessons.map(l =>
                                                    l.id === lesson.id
                                                      ? {
                                                          ...l,
                                                          codeSnippets: l.codeSnippets.map(s =>
                                                            s.id === snippet.id ? { ...s, title: e.target.value } : s
                                                          )
                                                        }
                                                      : l
                                                  )
                                                }
                                              : ch
                                          )
                                        }));
                                      }}
                                      placeholder="Code title"
                                      className="flex-1"
                                    />
                                    <Select
                                      value={snippet.language}
                                      onValueChange={(value) => {
                                        setCourseData(prev => ({
                                          ...prev,
                                          chapters: prev.chapters.map(ch =>
                                            ch.id === chapter.id
                                              ? {
                                                  ...ch,
                                                  lessons: ch.lessons.map(l =>
                                                    l.id === lesson.id
                                                      ? {
                                                          ...l,
                                                          codeSnippets: l.codeSnippets.map(s =>
                                                            s.id === snippet.id ? { ...s, language: value } : s
                                                          )
                                                        }
                                                      : l
                                                  )
                                                }
                                              : ch
                                          )
                                        }));
                                      }}
                                    >
                                      <SelectTrigger className="w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {languages.map(lang => (
                                          <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => copyCode(snippet.code, snippet.id)}
                                    >
                                      {copiedCode === snippet.id ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                  <Textarea
                                    value={snippet.code}
                                    onChange={(e) => {
                                      setCourseData(prev => ({
                                        ...prev,
                                        chapters: prev.chapters.map(ch =>
                                          ch.id === chapter.id
                                            ? {
                                                ...ch,
                                                lessons: ch.lessons.map(l =>
                                                  l.id === lesson.id
                                                    ? {
                                                        ...l,
                                                        codeSnippets: l.codeSnippets.map(s =>
                                                          s.id === snippet.id ? { ...s, code: e.target.value } : s
                                                        )
                                                      }
                                                    : l
                                                )
                                              }
                                            : ch
                                        )
                                      }));
                                    }}
                                    className="font-mono text-sm"
                                    rows={4}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                        <Button variant="outline" onClick={() => addLesson(chapter.id)} className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Lesson
                        </Button>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}

              {courseData.chapters.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No chapters yet. Click "Add Chapter" to start building your curriculum.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Quiz Tab */}
        <TabsContent value="quiz" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Chapter Quizzes</h3>
            <Button onClick={() => addQuizQuestion('quiz')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <ScrollArea className="h-[500px]">
                {courseData.quiz.map((q, index) => (
                  <div key={q.id} className="border rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge>Q{index + 1}</Badge>
                      <Input
                        value={q.question}
                        onChange={(e) => {
                          setCourseData(prev => ({
                            ...prev,
                            quiz: prev.quiz.map(quiz =>
                              quiz.id === q.id ? { ...quiz, question: e.target.value } : quiz
                            )
                          }));
                        }}
                        placeholder="Enter question"
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={q.points}
                        onChange={(e) => {
                          setCourseData(prev => ({
                            ...prev,
                            quiz: prev.quiz.map(quiz =>
                              quiz.id === q.id ? { ...quiz, points: parseInt(e.target.value) || 1 } : quiz
                            )
                          }));
                        }}
                        className="w-20"
                        placeholder="Points"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {q.answers.map((a, aIndex) => (
                        <div key={a.id} className="flex items-center gap-2">
                          <Switch
                            checked={a.isCorrect}
                            onCheckedChange={(checked) => {
                              setCourseData(prev => ({
                                ...prev,
                                quiz: prev.quiz.map(quiz =>
                                  quiz.id === q.id
                                    ? {
                                        ...quiz,
                                        answers: quiz.answers.map(ans =>
                                          ans.id === a.id ? { ...ans, isCorrect: checked } : ans
                                        )
                                      }
                                    : quiz
                                )
                              }));
                            }}
                          />
                          <Input
                            value={a.text}
                            onChange={(e) => {
                              setCourseData(prev => ({
                                ...prev,
                                quiz: prev.quiz.map(quiz =>
                                  quiz.id === q.id
                                    ? {
                                        ...quiz,
                                        answers: quiz.answers.map(ans =>
                                          ans.id === a.id ? { ...ans, text: e.target.value } : ans
                                        )
                                      }
                                    : quiz
                                )
                              }));
                            }}
                            placeholder={`Answer ${aIndex + 1}`}
                            className={a.isCorrect ? 'border-green-500' : ''}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {courseData.quiz.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No quiz questions yet. Add questions to test student knowledge.</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exams Tab */}
        <TabsContent value="exams" className="space-y-6">
          {/* Semester 1 Exam */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Semester 1 Examination</CardTitle>
                <Button onClick={() => addQuizQuestion('semester1Exam')} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {courseData.semester1Exam.map((q, index) => (
                  <div key={q.id} className="border rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge variant="secondary">Q{index + 1}</Badge>
                      <Input
                        value={q.question}
                        onChange={(e) => {
                          setCourseData(prev => ({
                            ...prev,
                            semester1Exam: prev.semester1Exam.map(exam =>
                              exam.id === q.id ? { ...exam, question: e.target.value } : exam
                            )
                          }));
                        }}
                        placeholder="Enter question"
                        className="flex-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {q.answers.map((a, aIndex) => (
                        <div key={a.id} className="flex items-center gap-2">
                          <Switch
                            checked={a.isCorrect}
                            onCheckedChange={(checked) => {
                              setCourseData(prev => ({
                                ...prev,
                                semester1Exam: prev.semester1Exam.map(exam =>
                                  exam.id === q.id
                                    ? {
                                        ...exam,
                                        answers: exam.answers.map(ans =>
                                          ans.id === a.id ? { ...ans, isCorrect: checked } : ans
                                        )
                                      }
                                    : exam
                                )
                              }));
                            }}
                          />
                          <Input
                            value={a.text}
                            onChange={(e) => {
                              setCourseData(prev => ({
                                ...prev,
                                semester1Exam: prev.semester1Exam.map(exam =>
                                  exam.id === q.id
                                    ? {
                                        ...exam,
                                        answers: exam.answers.map(ans =>
                                          ans.id === a.id ? { ...ans, text: e.target.value } : ans
                                        )
                                      }
                                    : exam
                                )
                              }));
                            }}
                            placeholder={`Answer ${aIndex + 1}`}
                            className={a.isCorrect ? 'border-green-500' : ''}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {courseData.semester1Exam.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No questions for Semester 1 exam yet.</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Semester 2 Final Exam */}
          <Card className="border-amber-500/50">
            <CardHeader className="bg-amber-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Semester 2 Final Examination
                    <Badge className="bg-amber-500">Certificate Required</Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Students must pass this exam to receive their certificate
                  </p>
                </div>
                <Button onClick={() => addQuizQuestion('semester2Exam')} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ScrollArea className="h-[300px]">
                {courseData.semester2Exam.map((q, index) => (
                  <div key={q.id} className="border rounded-lg p-4 mb-4 border-amber-500/30">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className="bg-amber-500">Q{index + 1}</Badge>
                      <Input
                        value={q.question}
                        onChange={(e) => {
                          setCourseData(prev => ({
                            ...prev,
                            semester2Exam: prev.semester2Exam.map(exam =>
                              exam.id === q.id ? { ...exam, question: e.target.value } : exam
                            )
                          }));
                        }}
                        placeholder="Enter question"
                        className="flex-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {q.answers.map((a, aIndex) => (
                        <div key={a.id} className="flex items-center gap-2">
                          <Switch
                            checked={a.isCorrect}
                            onCheckedChange={(checked) => {
                              setCourseData(prev => ({
                                ...prev,
                                semester2Exam: prev.semester2Exam.map(exam =>
                                  exam.id === q.id
                                    ? {
                                        ...exam,
                                        answers: exam.answers.map(ans =>
                                          ans.id === a.id ? { ...ans, isCorrect: checked } : ans
                                        )
                                      }
                                    : exam
                                )
                              }));
                            }}
                          />
                          <Input
                            value={a.text}
                            onChange={(e) => {
                              setCourseData(prev => ({
                                ...prev,
                                semester2Exam: prev.semester2Exam.map(exam =>
                                  exam.id === q.id
                                    ? {
                                        ...exam,
                                        answers: exam.answers.map(ans =>
                                          ans.id === a.id ? { ...ans, text: e.target.value } : ans
                                        )
                                      }
                                    : exam
                                )
                              }));
                            }}
                            placeholder={`Answer ${aIndex + 1}`}
                            className={a.isCorrect ? 'border-green-500' : ''}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {courseData.semester2Exam.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No questions for Final exam yet. This is required for certificate issuance.</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
