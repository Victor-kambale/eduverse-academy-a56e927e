import { useState } from 'react';
import {
  BookOpen,
  Image,
  Video,
  FileText,
  HelpCircle,
  Clock,
  Check,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  Loader2,
  GripVertical,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const steps = [
  { id: 1, title: 'Basic Info', icon: BookOpen, description: 'Course details' },
  { id: 2, title: 'Media', icon: Image, description: 'Thumbnail & promo' },
  { id: 3, title: 'Chapters', icon: FileText, description: 'Content structure' },
  { id: 4, title: 'Lessons', icon: Video, description: 'Video content' },
  { id: 5, title: 'Quiz & Exam', icon: HelpCircle, description: 'Assessments' },
  { id: 6, title: 'Review', icon: Check, description: 'Final check' },
];

interface Chapter {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number;
  is_free_preview: boolean;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  time_limit_minutes: number;
  passing_score: number;
  is_final_exam: boolean;
  questions: QuizQuestion[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  points: number;
}

export function EnhancedCourseCreation({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form state
  const [courseData, setCourseData] = useState({
    title: '',
    short_description: '',
    description: '',
    category: '',
    level: '',
    price: 0,
    duration_hours: 0,
  });

  const [media, setMedia] = useState({
    thumbnail: null as File | null,
    thumbnailPreview: '',
    promo_video: '',
    gallery: [] as string[],
  });

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const progress = (currentStep / steps.length) * 100;

  const addChapter = () => {
    setChapters(prev => [...prev, {
      id: crypto.randomUUID(),
      title: `Chapter ${prev.length + 1}`,
      description: '',
      lessons: [],
    }]);
  };

  const addLesson = (chapterId: string) => {
    setChapters(prev => prev.map(ch => {
      if (ch.id === chapterId) {
        return {
          ...ch,
          lessons: [...ch.lessons, {
            id: crypto.randomUUID(),
            title: `Lesson ${ch.lessons.length + 1}`,
            description: '',
            video_url: '',
            duration_minutes: 0,
            is_free_preview: false,
          }],
        };
      }
      return ch;
    }));
  };

  const addQuiz = (isFinalExam: boolean = false) => {
    setQuizzes(prev => [...prev, {
      id: crypto.randomUUID(),
      title: isFinalExam ? 'Final Exam' : `Quiz ${prev.length + 1}`,
      description: '',
      time_limit_minutes: 30,
      passing_score: 70,
      is_final_exam: isFinalExam,
      questions: [],
    }]);
  };

  const addQuestion = (quizId: string) => {
    setQuizzes(prev => prev.map(q => {
      if (q.id === quizId) {
        return {
          ...q,
          questions: [...q.questions, {
            id: crypto.randomUUID(),
            question: '',
            options: ['', '', '', ''],
            correct_answer: 0,
            points: 1,
          }],
        };
      }
      return q;
    }));
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(prev => ({
        ...prev,
        thumbnail: file,
        thumbnailPreview: URL.createObjectURL(file),
      }));
    }
  };

  const calculateTotalDuration = () => {
    return chapters.reduce((total, ch) => 
      total + ch.lessons.reduce((lessonTotal, l) => lessonTotal + l.duration_minutes, 0)
    , 0);
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error('Please log in to create a course');
      return;
    }

    setSaving(true);
    try {
      // Upload thumbnail
      let thumbnailUrl = '';
      if (media.thumbnail) {
        const path = `courses/${user.id}/${Date.now()}-thumbnail.${media.thumbnail.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage
          .from('course-resources')
          .upload(path, media.thumbnail);
        
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('course-resources').getPublicUrl(path);
          thumbnailUrl = urlData.publicUrl;
        }
      }

      // Create course
      const { data: courseResult, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: courseData.title,
          short_description: courseData.short_description,
          description: courseData.description,
          category: courseData.category,
          level: courseData.level,
          price: courseData.price,
          duration_hours: Math.ceil(calculateTotalDuration() / 60),
          thumbnail_url: thumbnailUrl,
          instructor_id: user.id,
          is_published: false,
        })
        .select()
        .single();

      if (courseError) throw courseError;

      const courseId = courseResult.id;

      // Create lessons with sort order
      let lessonOrder = 0;
      for (const chapter of chapters) {
        for (const lesson of chapter.lessons) {
          lessonOrder++;
          await supabase.from('lessons').insert({
            course_id: courseId,
            title: `${chapter.title}: ${lesson.title}`,
            description: lesson.description,
            video_url: lesson.video_url,
            duration_minutes: lesson.duration_minutes,
            sort_order: lessonOrder,
            is_free_preview: lesson.is_free_preview,
          });
        }
      }

      // Create quizzes
      for (const quiz of quizzes) {
        const { data: quizResult } = await supabase
          .from('quizzes')
          .insert({
            course_id: courseId,
            title: quiz.title,
            description: quiz.description,
            time_limit_minutes: quiz.time_limit_minutes,
            passing_score: quiz.passing_score,
            is_final_exam: quiz.is_final_exam,
          })
          .select()
          .single();

        if (quizResult) {
          for (let i = 0; i < quiz.questions.length; i++) {
            const q = quiz.questions[i];
            const { data: questionResult } = await supabase
              .from('quiz_questions')
              .insert({
                quiz_id: quizResult.id,
                question_text: q.question,
                points: q.points,
                sort_order: i,
              })
              .select()
              .single();

            if (questionResult) {
              for (let j = 0; j < q.options.length; j++) {
                await supabase.from('quiz_answers').insert({
                  question_id: questionResult.id,
                  answer_text: q.options[j],
                  is_correct: j === q.correct_answer,
                  sort_order: j,
                });
              }
            }
          }
        }
      }

      toast.success('Course created successfully! It will be reviewed before publishing.');
      onClose();
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Failed to create course');
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label>Course Title *</Label>
              <Input
                value={courseData.title}
                onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Complete Web Development Bootcamp"
              />
            </div>
            <div>
              <Label>Short Description *</Label>
              <Input
                value={courseData.short_description}
                onChange={(e) => setCourseData(prev => ({ ...prev, short_description: e.target.value }))}
                placeholder="A brief one-liner about your course"
              />
            </div>
            <div>
              <Label>Full Description *</Label>
              <Textarea
                value={courseData.description}
                onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of what students will learn..."
                rows={5}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <Select
                  value={courseData.category}
                  onValueChange={(v) => setCourseData(prev => ({ ...prev, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="programming">Programming</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="data-science">Data Science</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Level *</Label>
                <Select
                  value={courseData.level}
                  onValueChange={(v) => setCourseData(prev => ({ ...prev, level: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Price (USD) *</Label>
              <Input
                type="number"
                value={courseData.price}
                onChange={(e) => setCourseData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="29.99"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label>Course Thumbnail *</Label>
              <div className="mt-2 border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center">
                {media.thumbnailPreview ? (
                  <div className="relative">
                    <img
                      src={media.thumbnailPreview}
                      alt="Thumbnail preview"
                      className="max-h-48 mx-auto rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setMedia(prev => ({ ...prev, thumbnail: null, thumbnailPreview: '' }))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload thumbnail (16:9 recommended)</p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleThumbnailUpload}
                    />
                  </label>
                )}
              </div>
            </div>
            <div>
              <Label>Promo Video URL (Optional)</Label>
              <Input
                value={media.promo_video}
                onChange={(e) => setMedia(prev => ({ ...prev, promo_video: e.target.value }))}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Course Chapters</h3>
                <p className="text-sm text-muted-foreground">Organize your course content into chapters</p>
              </div>
              <Button onClick={addChapter}>
                <Plus className="h-4 w-4 mr-2" />
                Add Chapter
              </Button>
            </div>
            
            <ScrollArea className="h-[400px] scroll-smooth">
              <div className="space-y-4 pr-4">
                {chapters.map((chapter, idx) => (
                  <Card key={chapter.id} className="border-primary/20">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                        <Badge variant="outline">Chapter {idx + 1}</Badge>
                        <Input
                          value={chapter.title}
                          onChange={(e) => {
                            setChapters(prev => prev.map(c => 
                              c.id === chapter.id ? { ...c, title: e.target.value } : c
                            ));
                          }}
                          className="flex-1"
                          placeholder="Chapter title"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setChapters(prev => prev.filter(c => c.id !== chapter.id))}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <Textarea
                        value={chapter.description}
                        onChange={(e) => {
                          setChapters(prev => prev.map(c => 
                            c.id === chapter.id ? { ...c, description: e.target.value } : c
                          ));
                        }}
                        placeholder="Chapter description (optional)"
                        rows={2}
                      />
                      <div className="mt-3 text-sm text-muted-foreground">
                        {chapter.lessons.length} lesson(s)
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Add Lessons to Chapters</h3>
            
            <ScrollArea className="h-[400px] scroll-smooth">
              <div className="space-y-6 pr-4">
                {chapters.map((chapter, chIdx) => (
                  <div key={chapter.id}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{chapter.title}</h4>
                      <Button variant="outline" size="sm" onClick={() => addLesson(chapter.id)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Lesson
                      </Button>
                    </div>
                    
                    <div className="space-y-3 ml-4">
                      {chapter.lessons.map((lesson, lIdx) => (
                        <Card key={lesson.id} className="border-muted">
                          <CardContent className="pt-4 space-y-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{chIdx + 1}.{lIdx + 1}</Badge>
                              <Input
                                value={lesson.title}
                                onChange={(e) => {
                                  setChapters(prev => prev.map(c => 
                                    c.id === chapter.id ? {
                                      ...c,
                                      lessons: c.lessons.map(l => 
                                        l.id === lesson.id ? { ...l, title: e.target.value } : l
                                      ),
                                    } : c
                                  ));
                                }}
                                placeholder="Lesson title"
                                className="flex-1"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setChapters(prev => prev.map(c => 
                                    c.id === chapter.id ? {
                                      ...c,
                                      lessons: c.lessons.filter(l => l.id !== lesson.id),
                                    } : c
                                  ));
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <Input
                                value={lesson.video_url}
                                onChange={(e) => {
                                  setChapters(prev => prev.map(c => 
                                    c.id === chapter.id ? {
                                      ...c,
                                      lessons: c.lessons.map(l => 
                                        l.id === lesson.id ? { ...l, video_url: e.target.value } : l
                                      ),
                                    } : c
                                  ));
                                }}
                                placeholder="Video URL"
                              />
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="number"
                                  value={lesson.duration_minutes}
                                  onChange={(e) => {
                                    setChapters(prev => prev.map(c => 
                                      c.id === chapter.id ? {
                                        ...c,
                                        lessons: c.lessons.map(l => 
                                          l.id === lesson.id ? { ...l, duration_minutes: parseInt(e.target.value) || 0 } : l
                                        ),
                                      } : c
                                    ));
                                  }}
                                  placeholder="Duration (min)"
                                  className="w-24"
                                />
                                <span className="text-sm text-muted-foreground">min</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={lesson.is_free_preview}
                                onCheckedChange={(checked) => {
                                  setChapters(prev => prev.map(c => 
                                    c.id === chapter.id ? {
                                      ...c,
                                      lessons: c.lessons.map(l => 
                                        l.id === lesson.id ? { ...l, is_free_preview: checked } : l
                                      ),
                                    } : c
                                  ));
                                }}
                              />
                              <Label>Free Preview</Label>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <Separator className="mt-4" />
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Total Duration: {calculateTotalDuration()} minutes ({Math.ceil(calculateTotalDuration() / 60)} hours)
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Quizzes & Exams</h3>
                <p className="text-sm text-muted-foreground">Add assessments to test student knowledge</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => addQuiz(false)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Quiz
                </Button>
                <Button onClick={() => addQuiz(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Final Exam
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[400px] scroll-smooth">
              <div className="space-y-4 pr-4">
                {quizzes.map((quiz) => (
                  <Card key={quiz.id} className={quiz.is_final_exam ? 'border-amber-500/50' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {quiz.is_final_exam && <Badge className="bg-amber-500">Final Exam</Badge>}
                          <Input
                            value={quiz.title}
                            onChange={(e) => {
                              setQuizzes(prev => prev.map(q => 
                                q.id === quiz.id ? { ...q, title: e.target.value } : q
                              ));
                            }}
                            className="font-semibold"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setQuizzes(prev => prev.filter(q => q.id !== quiz.id))}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Time Limit (minutes)</Label>
                          <Input
                            type="number"
                            value={quiz.time_limit_minutes}
                            onChange={(e) => {
                              setQuizzes(prev => prev.map(q => 
                                q.id === quiz.id ? { ...q, time_limit_minutes: parseInt(e.target.value) || 0 } : q
                              ));
                            }}
                          />
                        </div>
                        <div>
                          <Label>Passing Score (%)</Label>
                          <Input
                            type="number"
                            value={quiz.passing_score}
                            onChange={(e) => {
                              setQuizzes(prev => prev.map(q => 
                                q.id === quiz.id ? { ...q, passing_score: parseInt(e.target.value) || 0 } : q
                              ));
                            }}
                          />
                        </div>
                      </div>

                      <Button variant="outline" size="sm" onClick={() => addQuestion(quiz.id)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Question
                      </Button>

                      {quiz.questions.map((q, qIdx) => (
                        <Card key={q.id} className="bg-muted/50">
                          <CardContent className="pt-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">Q{qIdx + 1}</Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setQuizzes(prev => prev.map(quiz => ({
                                    ...quiz,
                                    questions: quiz.questions.filter(que => que.id !== q.id),
                                  })));
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <Textarea
                              value={q.question}
                              onChange={(e) => {
                                setQuizzes(prev => prev.map(quiz => ({
                                  ...quiz,
                                  questions: quiz.questions.map(que =>
                                    que.id === q.id ? { ...que, question: e.target.value } : que
                                  ),
                                })));
                              }}
                              placeholder="Enter your question..."
                              rows={2}
                            />
                            <div className="grid grid-cols-2 gap-2">
                              {q.options.map((opt, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`correct-${q.id}`}
                                    checked={q.correct_answer === optIdx}
                                    onChange={() => {
                                      setQuizzes(prev => prev.map(quiz => ({
                                        ...quiz,
                                        questions: quiz.questions.map(que =>
                                          que.id === q.id ? { ...que, correct_answer: optIdx } : que
                                        ),
                                      })));
                                    }}
                                    className="accent-primary"
                                  />
                                  <Input
                                    value={opt}
                                    onChange={(e) => {
                                      setQuizzes(prev => prev.map(quiz => ({
                                        ...quiz,
                                        questions: quiz.questions.map(que =>
                                          que.id === q.id ? {
                                            ...que,
                                            options: que.options.map((o, i) =>
                                              i === optIdx ? e.target.value : o
                                            ),
                                          } : que
                                        ),
                                      })));
                                    }}
                                    placeholder={`Option ${optIdx + 1}`}
                                    className={q.correct_answer === optIdx ? 'border-green-500' : ''}
                                  />
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Review Your Course</h3>
            
            <Card>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Title</Label>
                    <p className="font-medium">{courseData.title || 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Category</Label>
                    <p className="font-medium capitalize">{courseData.category || 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Level</Label>
                    <p className="font-medium capitalize">{courseData.level || 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Price</Label>
                    <p className="font-medium">${courseData.price}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold text-primary">{chapters.length}</p>
                    <p className="text-sm text-muted-foreground">Chapters</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary">
                      {chapters.reduce((sum, ch) => sum + ch.lessons.length, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Lessons</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary">{quizzes.length}</p>
                    <p className="text-sm text-muted-foreground">Quizzes</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>Total Duration: {calculateTotalDuration()} minutes</span>
                </div>

                {media.thumbnailPreview && (
                  <div>
                    <Label className="text-muted-foreground">Thumbnail</Label>
                    <img src={media.thumbnailPreview} alt="Thumbnail" className="h-32 rounded-lg mt-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-sm text-amber-600">
                Your course will be submitted for review. Once approved by admin, it will be published and visible to students.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
      <DialogHeader>
        <DialogTitle>Create New Course</DialogTitle>
      </DialogHeader>

      {/* Progress */}
      <div className="space-y-4">
        <Progress value={progress} className="h-2" />
        
        <div className="flex justify-between gap-2 overflow-x-auto pb-2">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`flex flex-col items-center gap-1 min-w-[80px] p-2 rounded-lg transition-colors ${
                currentStep === step.id
                  ? 'bg-primary/10 text-primary'
                  : currentStep > step.id
                  ? 'text-green-500'
                  : 'text-muted-foreground'
              }`}
            >
              <step.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{step.title}</span>
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 max-h-[50vh] scroll-smooth">
        <div className="p-1">
          {renderStepContent()}
        </div>
      </ScrollArea>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {currentStep < steps.length ? (
          <Button onClick={() => setCurrentStep(prev => Math.min(steps.length, prev + 1))}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Course
              </>
            )}
          </Button>
        )}
      </div>
    </DialogContent>
  );
}
