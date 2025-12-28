import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Sparkles,
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

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

export function EnhancedCourseCreation({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);

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
          <motion.div className="space-y-4" {...fadeInUp}>
            <div>
              <Label className="text-purple-200">Course Title *</Label>
              <Input
                value={courseData.title}
                onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Complete Web Development Bootcamp"
                className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <Label className="text-purple-200">Short Description *</Label>
              <Input
                value={courseData.short_description}
                onChange={(e) => setCourseData(prev => ({ ...prev, short_description: e.target.value }))}
                placeholder="A brief one-liner about your course"
                className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <Label className="text-purple-200">Full Description *</Label>
              <Textarea
                value={courseData.description}
                onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of what students will learn..."
                rows={5}
                className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-purple-200">Category *</Label>
                <Select
                  value={courseData.category}
                  onValueChange={(v) => setCourseData(prev => ({ ...prev, category: v }))}
                >
                  <SelectTrigger className="bg-slate-800/50 border-purple-500/30 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-purple-500/30">
                    <SelectItem value="programming" className="text-white">Programming</SelectItem>
                    <SelectItem value="design" className="text-white">Design</SelectItem>
                    <SelectItem value="business" className="text-white">Business</SelectItem>
                    <SelectItem value="marketing" className="text-white">Marketing</SelectItem>
                    <SelectItem value="data-science" className="text-white">Data Science</SelectItem>
                    <SelectItem value="other" className="text-white">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-purple-200">Level *</Label>
                <Select
                  value={courseData.level}
                  onValueChange={(v) => setCourseData(prev => ({ ...prev, level: v }))}
                >
                  <SelectTrigger className="bg-slate-800/50 border-purple-500/30 text-white">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-purple-500/30">
                    <SelectItem value="beginner" className="text-white">Beginner</SelectItem>
                    <SelectItem value="intermediate" className="text-white">Intermediate</SelectItem>
                    <SelectItem value="advanced" className="text-white">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-purple-200">Price (USD) *</Label>
              <Input
                type="number"
                value={courseData.price}
                onChange={(e) => setCourseData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="29.99"
                className="bg-slate-800/50 border-purple-500/30 text-white"
              />
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div className="space-y-6" {...fadeInUp}>
            <div>
              <Label className="text-purple-200">Course Thumbnail *</Label>
              <div className="mt-2 border-2 border-dashed border-purple-500/30 rounded-xl p-6 text-center hover:border-purple-500/50 transition-colors">
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
                    <Upload className="h-12 w-12 mx-auto text-purple-400 mb-2" />
                    <p className="text-sm text-purple-300/70">Click to upload thumbnail (16:9 recommended)</p>
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
              <Label className="text-purple-200">Promo Video URL (Optional)</Label>
              <Input
                value={media.promo_video}
                onChange={(e) => setMedia(prev => ({ ...prev, promo_video: e.target.value }))}
                placeholder="https://youtube.com/watch?v=..."
                className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-500"
              />
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div className="space-y-4" {...fadeInUp}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Course Chapters</h3>
                <p className="text-sm text-purple-300/70">Organize your course content into chapters</p>
              </div>
              <Button onClick={addChapter} className="bg-gradient-to-r from-purple-600 to-pink-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Chapter
              </Button>
            </div>
            
            <ScrollArea className="h-[400px] scroll-smooth">
              <div className="space-y-4 pr-4">
                {chapters.map((chapter, idx) => (
                  <motion.div
                    key={chapter.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="bg-slate-800/50 border-purple-500/20">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <GripVertical className="h-5 w-5 text-purple-400 cursor-grab" />
                          <Badge className="bg-purple-500/20 text-purple-300">Chapter {idx + 1}</Badge>
                          <Input
                            value={chapter.title}
                            onChange={(e) => {
                              setChapters(prev => prev.map(c => 
                                c.id === chapter.id ? { ...c, title: e.target.value } : c
                              ));
                            }}
                            className="flex-1 bg-slate-700/50 border-purple-500/30 text-white"
                            placeholder="Chapter title"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setChapters(prev => prev.filter(c => c.id !== chapter.id))}
                            className="text-red-400 hover:bg-red-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
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
                          className="bg-slate-700/50 border-purple-500/30 text-white placeholder:text-slate-500"
                        />
                        <div className="mt-3 text-sm text-purple-300/70">
                          {chapter.lessons.length} lesson(s)
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        );

      case 4:
        return (
          <motion.div className="space-y-4" {...fadeInUp}>
            <h3 className="font-semibold text-white">Add Lessons to Chapters</h3>
            
            <ScrollArea className="h-[400px] scroll-smooth">
              <div className="space-y-6 pr-4">
                {chapters.map((chapter, chIdx) => (
                  <div key={chapter.id}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-purple-200">{chapter.title}</h4>
                      <Button variant="outline" size="sm" onClick={() => addLesson(chapter.id)} className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Lesson
                      </Button>
                    </div>
                    
                    <div className="space-y-3 ml-4">
                      {chapter.lessons.map((lesson, lIdx) => (
                        <motion.div
                          key={lesson.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: lIdx * 0.03 }}
                        >
                          <Card className="bg-slate-800/30 border-purple-500/20">
                            <CardContent className="pt-4 space-y-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">{chIdx + 1}.{lIdx + 1}</Badge>
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
                                  className="flex-1 bg-slate-700/50 border-purple-500/30 text-white"
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
                                  className="text-red-400 hover:bg-red-500/20"
                                >
                                  <Trash2 className="h-4 w-4" />
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
                                  className="bg-slate-700/50 border-purple-500/30 text-white placeholder:text-slate-500"
                                />
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-purple-400" />
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
                                    className="w-24 bg-slate-700/50 border-purple-500/30 text-white"
                                  />
                                  <span className="text-sm text-purple-300/70">min</span>
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
                                <Label className="text-purple-300">Free Preview</Label>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                    
                    <Separator className="mt-4 bg-purple-500/20" />
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="flex items-center gap-2 text-sm text-purple-300/70">
              <Clock className="h-4 w-4" />
              Total Duration: {calculateTotalDuration()} minutes ({Math.ceil(calculateTotalDuration() / 60)} hours)
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div className="space-y-4" {...fadeInUp}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Quizzes & Exams</h3>
                <p className="text-sm text-purple-300/70">Add assessments to test student knowledge</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => addQuiz(false)} className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Quiz
                </Button>
                <Button onClick={() => addQuiz(true)} className="bg-gradient-to-r from-amber-500 to-orange-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Final Exam
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[400px] scroll-smooth">
              <div className="space-y-4 pr-4">
                {quizzes.map((quiz, qIdx) => (
                  <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: qIdx * 0.05 }}
                  >
                    <Card className={`bg-slate-800/50 ${quiz.is_final_exam ? 'border-amber-500/50' : 'border-purple-500/20'}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {quiz.is_final_exam && <Badge className="bg-amber-500 text-white">Final Exam</Badge>}
                            <Input
                              value={quiz.title}
                              onChange={(e) => {
                                setQuizzes(prev => prev.map(q => 
                                  q.id === quiz.id ? { ...q, title: e.target.value } : q
                                ));
                              }}
                              className="font-semibold bg-slate-700/50 border-purple-500/30 text-white"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setQuizzes(prev => prev.filter(q => q.id !== quiz.id))}
                            className="text-red-400 hover:bg-red-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-purple-300">Time Limit (minutes)</Label>
                            <Input
                              type="number"
                              value={quiz.time_limit_minutes}
                              onChange={(e) => {
                                setQuizzes(prev => prev.map(q => 
                                  q.id === quiz.id ? { ...q, time_limit_minutes: parseInt(e.target.value) || 0 } : q
                                ));
                              }}
                              className="bg-slate-700/50 border-purple-500/30 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-purple-300">Passing Score (%)</Label>
                            <Input
                              type="number"
                              value={quiz.passing_score}
                              onChange={(e) => {
                                setQuizzes(prev => prev.map(q => 
                                  q.id === quiz.id ? { ...q, passing_score: parseInt(e.target.value) || 0 } : q
                                ));
                              }}
                              className="bg-slate-700/50 border-purple-500/30 text-white"
                            />
                          </div>
                        </div>

                        <Button variant="outline" size="sm" onClick={() => addQuestion(quiz.id)} className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Question
                        </Button>

                        {quiz.questions.map((q, qIdx) => (
                          <Card key={q.id} className="bg-slate-700/30 border-purple-500/20">
                            <CardContent className="pt-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="border-purple-500/30 text-purple-300">Q{qIdx + 1}</Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setQuizzes(prev => prev.map(quiz => ({
                                      ...quiz,
                                      questions: quiz.questions.filter(que => que.id !== q.id),
                                    })));
                                  }}
                                  className="text-red-400 hover:bg-red-500/20"
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
                                className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-500"
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
                                      className="accent-purple-500"
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
                                      className={`bg-slate-800/50 border-purple-500/30 text-white ${q.correct_answer === optIdx ? 'border-emerald-500' : ''}`}
                                    />
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        );

      case 6:
        return (
          <motion.div className="space-y-6" {...fadeInUp}>
            <h3 className="font-semibold text-lg text-white flex items-center gap-2">
              Review Your Course
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </h3>
            
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-purple-300/70">Title</Label>
                    <p className="font-medium text-white">{courseData.title || 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-purple-300/70">Category</Label>
                    <p className="font-medium text-white capitalize">{courseData.category || 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-purple-300/70">Level</Label>
                    <p className="font-medium text-white capitalize">{courseData.level || 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-purple-300/70">Price</Label>
                    <p className="font-medium text-emerald-400">${courseData.price}</p>
                  </div>
                </div>

                <Separator className="bg-purple-500/20" />

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <p className="text-3xl font-bold text-purple-400">{chapters.length}</p>
                    <p className="text-sm text-purple-300/70">Chapters</p>
                  </div>
                  <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20">
                    <p className="text-3xl font-bold text-pink-400">
                      {chapters.reduce((sum, ch) => sum + ch.lessons.length, 0)}
                    </p>
                    <p className="text-sm text-pink-300/70">Lessons</p>
                  </div>
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <p className="text-3xl font-bold text-cyan-400">{quizzes.length}</p>
                    <p className="text-sm text-cyan-300/70">Quizzes</p>
                  </div>
                </div>

                <Separator className="bg-purple-500/20" />

                <div className="flex items-center gap-2 text-sm text-purple-300">
                  <Clock className="h-4 w-4" />
                  <span>Total Duration: {calculateTotalDuration()} minutes</span>
                </div>

                {media.thumbnailPreview && (
                  <div>
                    <Label className="text-purple-300/70">Thumbnail</Label>
                    <img src={media.thumbnailPreview} alt="Thumbnail" className="h-32 rounded-lg mt-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <p className="text-sm text-amber-200">
                Your course will be submitted for review. Once approved by admin, it will be published and visible to students.
              </p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border-purple-500/30">
      <DialogHeader>
        <DialogTitle className="text-white flex items-center gap-2">
          Create New Course
          <Sparkles className="w-5 h-5 text-yellow-400" />
        </DialogTitle>
      </DialogHeader>

      {/* Progress */}
      <div className="space-y-4">
        <Progress value={progress} className="h-2 bg-slate-800" />
        
        <div className="flex justify-between gap-2 overflow-x-auto pb-2">
          {steps.map((step) => (
            <motion.button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`flex flex-col items-center gap-1 min-w-[80px] p-2 rounded-xl transition-all ${
                currentStep === step.id
                  ? 'bg-purple-500/20 text-purple-300'
                  : currentStep > step.id
                  ? 'text-emerald-400'
                  : 'text-slate-500'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <step.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{step.title}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 max-h-[50vh] scroll-smooth">
        <div className="p-1">
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-purple-500/20">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {currentStep < steps.length ? (
          <Button onClick={() => setCurrentStep(prev => Math.min(steps.length, prev + 1))} className="bg-gradient-to-r from-purple-600 to-pink-600">
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={saving} className="bg-gradient-to-r from-emerald-600 to-cyan-600">
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
