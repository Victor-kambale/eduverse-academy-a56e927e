import { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  Building2,
  Users,
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
  GraduationCap,
  Briefcase,
  Target,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropUpload } from './DragDropUpload';
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, title: 'Course Details', icon: BookOpen, description: 'Basic information' },
  { id: 2, title: 'Department & Faculty', icon: Building2, description: 'Academic assignment' },
  { id: 3, title: 'Course Media', icon: Image, description: 'Thumbnails & videos' },
  { id: 4, title: 'Chapters & Structure', icon: FileText, description: 'Content outline' },
  { id: 5, title: 'Lessons & Videos', icon: Video, description: 'Video content' },
  { id: 6, title: 'Assessments', icon: HelpCircle, description: 'Quiz & exams' },
  { id: 7, title: 'Requirements', icon: Target, description: 'Prerequisites' },
  { id: 8, title: 'Review & Submit', icon: Check, description: 'Final check' },
];

const departments = [
  'Computer Science',
  'Business Administration',
  'Engineering',
  'Medicine',
  'Law',
  'Arts & Humanities',
  'Natural Sciences',
  'Social Sciences',
  'Education',
  'Architecture',
  'Agriculture',
  'Health Sciences',
  'Other',
];

const faculties = [
  'Faculty of Science',
  'Faculty of Arts',
  'Faculty of Engineering',
  'Faculty of Medicine',
  'Faculty of Law',
  'Faculty of Business',
  'Faculty of Education',
  'Graduate School',
  'Continuing Education',
];

interface Chapter {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  isOpen: boolean;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number;
  is_free_preview: boolean;
  resources: string[];
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

interface UniversityCourseWizardProps {
  open: boolean;
  onClose: () => void;
}

export function UniversityCourseWizard({ open, onClose }: UniversityCourseWizardProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Form state
  const [courseData, setCourseData] = useState({
    title: '',
    code: '',
    short_description: '',
    description: '',
    category: '',
    level: '',
    price: 0,
    duration_hours: 0,
    credits: 0,
    semester: '',
    academic_year: '',
    max_enrollment: 0,
    is_mandatory: false,
    has_lab: false,
    lab_hours: 0,
  });

  const [departmentData, setDepartmentData] = useState({
    department: '',
    faculty: '',
    program: '',
    specialization: '',
    instructor_name: '',
    instructor_email: '',
    teaching_assistants: [] as string[],
    co_instructors: [] as string[],
  });

  const [media, setMedia] = useState({
    thumbnail: null as File | null,
    thumbnailPreview: '',
    promo_video: '',
    gallery: [] as File[],
    galleryPreviews: [] as string[],
  });

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const [requirements, setRequirements] = useState({
    prerequisites: [] as string[],
    objectives: [] as string[],
    skills_gained: [] as string[],
    materials_required: [] as string[],
    software_required: [] as string[],
  });

  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newMaterial, setNewMaterial] = useState('');
  const [newSoftware, setNewSoftware] = useState('');
  const [newTA, setNewTA] = useState('');
  const [newCoInstructor, setNewCoInstructor] = useState('');

  const progress = (currentStep / steps.length) * 100;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const addChapter = () => {
    setChapters(prev => [...prev, {
      id: crypto.randomUUID(),
      title: `Chapter ${prev.length + 1}`,
      description: '',
      lessons: [],
      isOpen: true,
    }]);
  };

  const toggleChapter = (chapterId: string) => {
    setChapters(prev => prev.map(ch => 
      ch.id === chapterId ? { ...ch, isOpen: !ch.isOpen } : ch
    ));
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
            resources: [],
          }],
        };
      }
      return ch;
    }));
  };

  const removeChapter = (chapterId: string) => {
    setChapters(prev => prev.filter(ch => ch.id !== chapterId));
  };

  const removeLesson = (chapterId: string, lessonId: string) => {
    setChapters(prev => prev.map(ch => {
      if (ch.id === chapterId) {
        return {
          ...ch,
          lessons: ch.lessons.filter(l => l.id !== lessonId),
        };
      }
      return ch;
    }));
  };

  const addQuiz = (isFinalExam: boolean = false) => {
    setQuizzes(prev => [...prev, {
      id: crypto.randomUUID(),
      title: isFinalExam ? 'Final Exam' : `Quiz ${prev.filter(q => !q.is_final_exam).length + 1}`,
      description: '',
      time_limit_minutes: isFinalExam ? 120 : 30,
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

  const handleThumbnailUpload = (file: File | null) => {
    if (file) {
      setMedia(prev => ({
        ...prev,
        thumbnail: file,
        thumbnailPreview: URL.createObjectURL(file),
      }));
    } else {
      setMedia(prev => ({ ...prev, thumbnail: null, thumbnailPreview: '' }));
    }
  };

  const handleGalleryUpload = (files: File[]) => {
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setMedia(prev => ({
      ...prev,
      gallery: [...prev.gallery, ...files],
      galleryPreviews: [...prev.galleryPreviews, ...newPreviews],
    }));
  };

  const removeGalleryImage = (index: number) => {
    setMedia(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
      galleryPreviews: prev.galleryPreviews.filter((_, i) => i !== index),
    }));
  };

  const calculateTotalDuration = () => {
    return chapters.reduce((total, ch) => 
      total + ch.lessons.reduce((lessonTotal, l) => lessonTotal + l.duration_minutes, 0)
    , 0);
  };

  const addItem = (
    setter: React.Dispatch<React.SetStateAction<typeof requirements>>,
    field: keyof typeof requirements,
    value: string,
    clearInput: () => void
  ) => {
    if (value.trim()) {
      setter(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
      clearInput();
    }
  };

  const removeItem = (
    setter: React.Dispatch<React.SetStateAction<typeof requirements>>,
    field: keyof typeof requirements,
    index: number
  ) => {
    setter(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
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
          category: departmentData.department || courseData.category,
          level: courseData.level,
          price: courseData.price,
          duration_hours: Math.ceil(calculateTotalDuration() / 60),
          thumbnail_url: thumbnailUrl,
          instructor_id: user.id,
          instructor_name: departmentData.instructor_name || 'University Instructor',
          is_published: false,
        })
        .select()
        .single();

      if (courseError) throw courseError;

      const courseId = courseResult.id;

      // Create lessons
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

      const audio = new Audio('/sounds/success.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});

      toast.success('Course created successfully! It will be reviewed by admin before publishing.');
      onClose();
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Failed to create course');
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return courseData.title && courseData.description && courseData.level;
      case 2:
        return departmentData.department && departmentData.faculty;
      case 3:
        return true;
      case 4:
        return chapters.length > 0;
      case 5:
        return chapters.some(ch => ch.lessons.length > 0);
      case 6:
        return true;
      case 7:
        return true;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Course Title *</Label>
                <Input
                  value={courseData.title}
                  onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Introduction to Computer Science"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Course Code</Label>
                <Input
                  value={courseData.code}
                  onChange={(e) => setCourseData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="e.g., CS101"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Level *</Label>
                <Select
                  value={courseData.level}
                  onValueChange={(v) => setCourseData(prev => ({ ...prev, level: v }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner / Freshman</SelectItem>
                    <SelectItem value="intermediate">Intermediate / Sophomore</SelectItem>
                    <SelectItem value="advanced">Advanced / Senior</SelectItem>
                    <SelectItem value="graduate">Graduate / Masters</SelectItem>
                    <SelectItem value="doctoral">Doctoral / PhD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Credits</Label>
                <Input
                  type="number"
                  value={courseData.credits}
                  onChange={(e) => setCourseData(prev => ({ ...prev, credits: parseInt(e.target.value) || 0 }))}
                  placeholder="3"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Semester</Label>
                <Select
                  value={courseData.semester}
                  onValueChange={(v) => setCourseData(prev => ({ ...prev, semester: v }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fall">Fall Semester</SelectItem>
                    <SelectItem value="spring">Spring Semester</SelectItem>
                    <SelectItem value="summer">Summer Session</SelectItem>
                    <SelectItem value="winter">Winter Session</SelectItem>
                    <SelectItem value="year-round">Year-Round</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Academic Year</Label>
                <Input
                  value={courseData.academic_year}
                  onChange={(e) => setCourseData(prev => ({ ...prev, academic_year: e.target.value }))}
                  placeholder="2024-2025"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Price (USD)</Label>
                <Input
                  type="number"
                  value={courseData.price}
                  onChange={(e) => setCourseData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0 for free"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Max Enrollment</Label>
                <Input
                  type="number"
                  value={courseData.max_enrollment}
                  onChange={(e) => setCourseData(prev => ({ ...prev, max_enrollment: parseInt(e.target.value) || 0 }))}
                  placeholder="0 for unlimited"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Short Description *</Label>
              <Input
                value={courseData.short_description}
                onChange={(e) => setCourseData(prev => ({ ...prev, short_description: e.target.value }))}
                placeholder="A brief one-liner about your course"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Full Description *</Label>
              <Textarea
                value={courseData.description}
                onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of what students will learn, course objectives, and outcomes..."
                rows={5}
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={courseData.is_mandatory}
                  onCheckedChange={(v) => setCourseData(prev => ({ ...prev, is_mandatory: v }))}
                />
                <Label>Mandatory Course</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={courseData.has_lab}
                  onCheckedChange={(v) => setCourseData(prev => ({ ...prev, has_lab: v }))}
                />
                <Label>Has Lab Component</Label>
              </div>
            </div>

            {courseData.has_lab && (
              <div>
                <Label>Lab Hours per Week</Label>
                <Input
                  type="number"
                  value={courseData.lab_hours}
                  onChange={(e) => setCourseData(prev => ({ ...prev, lab_hours: parseInt(e.target.value) || 0 }))}
                  placeholder="2"
                  className="mt-1 w-32"
                />
              </div>
            )}
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Department *</Label>
                <Select
                  value={departmentData.department}
                  onValueChange={(v) => setDepartmentData(prev => ({ ...prev, department: v }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Faculty *</Label>
                <Select
                  value={departmentData.faculty}
                  onValueChange={(v) => setDepartmentData(prev => ({ ...prev, faculty: v }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((fac) => (
                      <SelectItem key={fac} value={fac}>{fac}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Program</Label>
                <Input
                  value={departmentData.program}
                  onChange={(e) => setDepartmentData(prev => ({ ...prev, program: e.target.value }))}
                  placeholder="e.g., Bachelor of Science"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Specialization</Label>
                <Input
                  value={departmentData.specialization}
                  onChange={(e) => setDepartmentData(prev => ({ ...prev, specialization: e.target.value }))}
                  placeholder="e.g., Artificial Intelligence"
                  className="mt-1"
                />
              </div>
            </div>

            <Separator />

            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Instructor & Staff Assignment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Lead Instructor Name</Label>
                <Input
                  value={departmentData.instructor_name}
                  onChange={(e) => setDepartmentData(prev => ({ ...prev, instructor_name: e.target.value }))}
                  placeholder="Dr. John Smith"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Lead Instructor Email</Label>
                <Input
                  type="email"
                  value={departmentData.instructor_email}
                  onChange={(e) => setDepartmentData(prev => ({ ...prev, instructor_email: e.target.value }))}
                  placeholder="john.smith@university.edu"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Co-Instructors</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={newCoInstructor}
                  onChange={(e) => setNewCoInstructor(e.target.value)}
                  placeholder="Add co-instructor email"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newCoInstructor.trim()) {
                        setDepartmentData(prev => ({
                          ...prev,
                          co_instructors: [...prev.co_instructors, newCoInstructor.trim()],
                        }));
                        setNewCoInstructor('');
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (newCoInstructor.trim()) {
                      setDepartmentData(prev => ({
                        ...prev,
                        co_instructors: [...prev.co_instructors, newCoInstructor.trim()],
                      }));
                      setNewCoInstructor('');
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {departmentData.co_instructors.map((ci, idx) => (
                  <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                    {ci}
                    <button
                      onClick={() => setDepartmentData(prev => ({
                        ...prev,
                        co_instructors: prev.co_instructors.filter((_, i) => i !== idx),
                      }))}
                      className="ml-1 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Teaching Assistants</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={newTA}
                  onChange={(e) => setNewTA(e.target.value)}
                  placeholder="Add TA email"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newTA.trim()) {
                        setDepartmentData(prev => ({
                          ...prev,
                          teaching_assistants: [...prev.teaching_assistants, newTA.trim()],
                        }));
                        setNewTA('');
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (newTA.trim()) {
                      setDepartmentData(prev => ({
                        ...prev,
                        teaching_assistants: [...prev.teaching_assistants, newTA.trim()],
                      }));
                      setNewTA('');
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {departmentData.teaching_assistants.map((ta, idx) => (
                  <Badge key={idx} variant="outline" className="flex items-center gap-1">
                    {ta}
                    <button
                      onClick={() => setDepartmentData(prev => ({
                        ...prev,
                        teaching_assistants: prev.teaching_assistants.filter((_, i) => i !== idx),
                      }))}
                      className="ml-1 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <DragDropUpload
              label="Course Thumbnail"
              description="Recommended: 1280x720px (16:9 aspect ratio)"
              accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
              onFileSelect={handleThumbnailUpload}
              file={media.thumbnail}
              previewUrl={media.thumbnailPreview}
            />

            <div>
              <Label>Promotional Video URL</Label>
              <Input
                value={media.promo_video}
                onChange={(e) => setMedia(prev => ({ ...prev, promo_video: e.target.value }))}
                placeholder="https://youtube.com/watch?v=... or Vimeo link"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Add a short preview video to attract students
              </p>
            </div>

            <div>
              <Label>Course Gallery</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Add additional images showcasing your course content
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {media.galleryPreviews.map((preview, idx) => (
                  <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border">
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => removeGalleryImage(idx)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <label className="aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">Add Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleGalleryUpload(Array.from(e.target.files));
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
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
            
            <div className="space-y-3">
              {chapters.map((chapter, idx) => (
                <Collapsible
                  key={chapter.id}
                  open={chapter.isOpen}
                  onOpenChange={() => toggleChapter(chapter.id)}
                >
                  <Card className="border-primary/20">
                    <CardContent className="pt-4">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center gap-2 cursor-pointer">
                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                          <Badge variant="outline">Chapter {idx + 1}</Badge>
                          <Input
                            value={chapter.title}
                            onClick={(e) => e.stopPropagation()}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              removeChapter(chapter.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                          {chapter.isOpen ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mt-3 space-y-3">
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
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{chapter.lessons.length} lesson(s)</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addLesson(chapter.id)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Lesson
                            </Button>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </CardContent>
                  </Card>
                </Collapsible>
              ))}
            </div>

            {chapters.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No chapters yet. Click "Add Chapter" to create your course structure.</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h3 className="font-semibold">Add Lessons to Chapters</h3>
            
            <div className="space-y-6">
              {chapters.map((chapter, chIdx) => (
                <Card key={chapter.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Badge>{chIdx + 1}</Badge>
                      {chapter.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {chapter.lessons.map((lesson, lIdx) => (
                      <div key={lesson.id} className="p-4 border rounded-lg bg-muted/30 space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Lesson {lIdx + 1}</Badge>
                          <Input
                            value={lesson.title}
                            onChange={(e) => {
                              setChapters(prev => prev.map(ch => {
                                if (ch.id === chapter.id) {
                                  return {
                                    ...ch,
                                    lessons: ch.lessons.map(l => 
                                      l.id === lesson.id ? { ...l, title: e.target.value } : l
                                    ),
                                  };
                                }
                                return ch;
                              }));
                            }}
                            className="flex-1"
                            placeholder="Lesson title"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLesson(chapter.id, lesson.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <Textarea
                          value={lesson.description}
                          onChange={(e) => {
                            setChapters(prev => prev.map(ch => {
                              if (ch.id === chapter.id) {
                                return {
                                  ...ch,
                                  lessons: ch.lessons.map(l => 
                                    l.id === lesson.id ? { ...l, description: e.target.value } : l
                                  ),
                                };
                              }
                              return ch;
                            }));
                          }}
                          placeholder="Lesson description"
                          rows={2}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs">Video URL</Label>
                            <Input
                              value={lesson.video_url}
                              onChange={(e) => {
                                setChapters(prev => prev.map(ch => {
                                  if (ch.id === chapter.id) {
                                    return {
                                      ...ch,
                                      lessons: ch.lessons.map(l => 
                                        l.id === lesson.id ? { ...l, video_url: e.target.value } : l
                                      ),
                                    };
                                  }
                                  return ch;
                                }));
                              }}
                              placeholder="YouTube/Vimeo URL"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Duration (minutes)</Label>
                            <Input
                              type="number"
                              value={lesson.duration_minutes}
                              onChange={(e) => {
                                setChapters(prev => prev.map(ch => {
                                  if (ch.id === chapter.id) {
                                    return {
                                      ...ch,
                                      lessons: ch.lessons.map(l => 
                                        l.id === lesson.id ? { ...l, duration_minutes: parseInt(e.target.value) || 0 } : l
                                      ),
                                    };
                                  }
                                  return ch;
                                }));
                              }}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={lesson.is_free_preview}
                            onCheckedChange={(v) => {
                              setChapters(prev => prev.map(ch => {
                                if (ch.id === chapter.id) {
                                  return {
                                    ...ch,
                                    lessons: ch.lessons.map(l => 
                                      l.id === lesson.id ? { ...l, is_free_preview: v } : l
                                    ),
                                  };
                                }
                                return ch;
                              }));
                            }}
                          />
                          <Label className="text-sm">Free Preview</Label>
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => addLesson(chapter.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Lesson to {chapter.title}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Quizzes & Examinations</h3>
                <p className="text-sm text-muted-foreground">Create assessments for your course</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => addQuiz(false)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Quiz
                </Button>
                <Button onClick={() => addQuiz(true)}>
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Add Final Exam
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {quizzes.map((quiz, qIdx) => (
                <Card key={quiz.id} className={quiz.is_final_exam ? 'border-primary' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={quiz.is_final_exam ? 'default' : 'secondary'}>
                          {quiz.is_final_exam ? 'Final Exam' : `Quiz ${qIdx + 1}`}
                        </Badge>
                        <Input
                          value={quiz.title}
                          onChange={(e) => {
                            setQuizzes(prev => prev.map(q => 
                              q.id === quiz.id ? { ...q, title: e.target.value } : q
                            ));
                          }}
                          className="w-64"
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
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs">Time Limit (minutes)</Label>
                        <Input
                          type="number"
                          value={quiz.time_limit_minutes}
                          onChange={(e) => {
                            setQuizzes(prev => prev.map(q => 
                              q.id === quiz.id ? { ...q, time_limit_minutes: parseInt(e.target.value) || 0 } : q
                            ));
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Passing Score (%)</Label>
                        <Input
                          type="number"
                          value={quiz.passing_score}
                          onChange={(e) => {
                            setQuizzes(prev => prev.map(q => 
                              q.id === quiz.id ? { ...q, passing_score: parseInt(e.target.value) || 0 } : q
                            ));
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Questions</Label>
                        <div className="mt-1 h-9 flex items-center text-sm text-muted-foreground">
                          {quiz.questions.length} question(s)
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {quiz.questions.map((question, qnIdx) => (
                        <div key={question.id} className="p-3 border rounded-lg bg-muted/30">
                          <div className="flex items-start gap-2 mb-2">
                            <span className="text-xs font-medium text-muted-foreground mt-2">Q{qnIdx + 1}</span>
                            <Textarea
                              value={question.question}
                              onChange={(e) => {
                                setQuizzes(prev => prev.map(q => {
                                  if (q.id === quiz.id) {
                                    return {
                                      ...q,
                                      questions: q.questions.map(qn => 
                                        qn.id === question.id ? { ...qn, question: e.target.value } : qn
                                      ),
                                    };
                                  }
                                  return q;
                                }));
                              }}
                              placeholder="Enter question"
                              rows={2}
                              className="flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setQuizzes(prev => prev.map(q => {
                                  if (q.id === quiz.id) {
                                    return {
                                      ...q,
                                      questions: q.questions.filter(qn => qn.id !== question.id),
                                    };
                                  }
                                  return q;
                                }));
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 ml-6">
                            {question.options.map((opt, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-2">
                                <Checkbox
                                  checked={question.correct_answer === optIdx}
                                  onCheckedChange={() => {
                                    setQuizzes(prev => prev.map(q => {
                                      if (q.id === quiz.id) {
                                        return {
                                          ...q,
                                          questions: q.questions.map(qn => 
                                            qn.id === question.id ? { ...qn, correct_answer: optIdx } : qn
                                          ),
                                        };
                                      }
                                      return q;
                                    }));
                                  }}
                                />
                                <Input
                                  value={opt}
                                  onChange={(e) => {
                                    setQuizzes(prev => prev.map(q => {
                                      if (q.id === quiz.id) {
                                        return {
                                          ...q,
                                          questions: q.questions.map(qn => {
                                            if (qn.id === question.id) {
                                              const newOptions = [...qn.options];
                                              newOptions[optIdx] = e.target.value;
                                              return { ...qn, options: newOptions };
                                            }
                                            return qn;
                                          }),
                                        };
                                      }
                                      return q;
                                    }));
                                  }}
                                  placeholder={`Option ${optIdx + 1}`}
                                  className="flex-1"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => addQuestion(quiz.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {quizzes.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-muted-foreground">
                  <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No assessments yet. Add quizzes or a final exam to test student knowledge.</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        );

      case 7:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Target className="h-5 w-5" />
                Prerequisites
              </h3>
              <div className="flex gap-2">
                <Input
                  value={newPrerequisite}
                  onChange={(e) => setNewPrerequisite(e.target.value)}
                  placeholder="e.g., Basic knowledge of programming"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem(setRequirements, 'prerequisites', newPrerequisite, () => setNewPrerequisite(''));
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => addItem(setRequirements, 'prerequisites', newPrerequisite, () => setNewPrerequisite(''))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {requirements.prerequisites.map((item, idx) => (
                  <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                    {item}
                    <button
                      onClick={() => removeItem(setRequirements, 'prerequisites', idx)}
                      className="ml-1 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5" />
                Learning Objectives
              </h3>
              <div className="flex gap-2">
                <Input
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  placeholder="e.g., Build a full-stack web application"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem(setRequirements, 'objectives', newObjective, () => setNewObjective(''));
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => addItem(setRequirements, 'objectives', newObjective, () => setNewObjective(''))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {requirements.objectives.map((item, idx) => (
                  <Badge key={idx} variant="outline" className="flex items-center gap-1">
                    {item}
                    <button
                      onClick={() => removeItem(setRequirements, 'objectives', idx)}
                      className="ml-1 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <GraduationCap className="h-5 w-5" />
                Skills Students Will Gain
              </h3>
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="e.g., React, Node.js, Database Design"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem(setRequirements, 'skills_gained', newSkill, () => setNewSkill(''));
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => addItem(setRequirements, 'skills_gained', newSkill, () => setNewSkill(''))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {requirements.skills_gained.map((item, idx) => (
                  <Badge key={idx} className="bg-green-500/20 text-green-600 border-green-500/30 flex items-center gap-1">
                    {item}
                    <button
                      onClick={() => removeItem(setRequirements, 'skills_gained', idx)}
                      className="ml-1 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Briefcase className="h-5 w-5" />
                Required Materials
              </h3>
              <div className="flex gap-2">
                <Input
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                  placeholder="e.g., Textbook: Introduction to Algorithms"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem(setRequirements, 'materials_required', newMaterial, () => setNewMaterial(''));
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => addItem(setRequirements, 'materials_required', newMaterial, () => setNewMaterial(''))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {requirements.materials_required.map((item, idx) => (
                  <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                    {item}
                    <button
                      onClick={() => removeItem(setRequirements, 'materials_required', idx)}
                      className="ml-1 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Software Requirements</h3>
              <div className="flex gap-2">
                <Input
                  value={newSoftware}
                  onChange={(e) => setNewSoftware(e.target.value)}
                  placeholder="e.g., Visual Studio Code, Python 3.x"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem(setRequirements, 'software_required', newSoftware, () => setNewSoftware(''));
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => addItem(setRequirements, 'software_required', newSoftware, () => setNewSoftware(''))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {requirements.software_required.map((item, idx) => (
                  <Badge key={idx} variant="outline" className="flex items-center gap-1">
                    {item}
                    <button
                      onClick={() => removeItem(setRequirements, 'software_required', idx)}
                      className="ml-1 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 8:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Course Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-background/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{chapters.length}</p>
                    <p className="text-xs text-muted-foreground">Chapters</p>
                  </div>
                  <div className="text-center p-3 bg-background/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">
                      {chapters.reduce((sum, ch) => sum + ch.lessons.length, 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Lessons</p>
                  </div>
                  <div className="text-center p-3 bg-background/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{quizzes.length}</p>
                    <p className="text-xs text-muted-foreground">Assessments</p>
                  </div>
                  <div className="text-center p-3 bg-background/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">
                      {Math.ceil(calculateTotalDuration() / 60)}h
                    </p>
                    <p className="text-xs text-muted-foreground">Duration</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Title:</span>
                    <span className="font-medium">{courseData.title || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Course Code:</span>
                    <span className="font-medium">{courseData.code || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Department:</span>
                    <span className="font-medium">{departmentData.department || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Faculty:</span>
                    <span className="font-medium">{departmentData.faculty || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <Badge variant="outline">{courseData.level || 'Not set'}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium">${courseData.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Credits:</span>
                    <span className="font-medium">{courseData.credits}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-700 dark:text-yellow-400">Review Required</p>
                    <p className="text-sm text-muted-foreground">
                      Your course will be submitted for admin review before it can be published. 
                      You'll receive a notification once it's approved.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Create University Course
          </DialogTitle>
        </DialogHeader>

        {/* Progress bar */}
        <div className="px-6 py-3 border-b bg-muted/30">
          <Progress value={progress} className="h-2 mb-3" />
          <div className="flex justify-between overflow-x-auto pb-1">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={cn(
                  'flex flex-col items-center min-w-[80px] transition-all',
                  currentStep === step.id ? 'text-primary' : 'text-muted-foreground',
                  currentStep > step.id && 'text-green-500'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all',
                  currentStep === step.id && 'bg-primary text-primary-foreground',
                  currentStep > step.id && 'bg-green-500 text-white',
                  currentStep < step.id && 'bg-muted'
                )}>
                  {currentStep > step.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                </div>
                <span className="text-xs font-medium hidden sm:block">{step.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <ScrollArea ref={scrollRef} className="flex-1 px-6 py-6 max-h-[50vh]">
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/30 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Step {currentStep} of {steps.length}
          </div>

          {currentStep < steps.length ? (
            <Button
              onClick={() => setCurrentStep(prev => Math.min(steps.length, prev + 1))}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Submit for Review
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
