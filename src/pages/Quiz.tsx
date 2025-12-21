import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Trophy,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  time_limit_minutes: number | null;
  passing_score: number | null;
  is_final_exam: boolean | null;
  course_id: string;
}

interface Question {
  id: string;
  question_text: string;
  question_type: string | null;
  points: number | null;
  sort_order: number | null;
}

interface Answer {
  id: string;
  answer_text: string;
  is_correct: boolean | null;
  question_id: string;
}

interface UserAnswer {
  questionId: string;
  answerId: string;
}

export default function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer[]>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (quizId) {
      fetchQuizData();
    }
  }, [quizId]);

  // Timer effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  const fetchQuizData = async () => {
    try {
      // Fetch quiz
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (quizError) throw quizError;
      setQuiz(quizData);

      // Set timer if quiz has time limit
      if (quizData.time_limit_minutes) {
        setTimeLeft(quizData.time_limit_minutes * 60);
      }

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('sort_order', { ascending: true });

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);

      // Calculate total points
      const total = (questionsData || []).reduce((sum, q) => sum + (q.points || 1), 0);
      setTotalPoints(total);

      // Fetch answers for all questions
      const questionIds = (questionsData || []).map(q => q.id);
      if (questionIds.length > 0) {
        const { data: answersData, error: answersError } = await supabase
          .from('quiz_answers')
          .select('*')
          .in('question_id', questionIds)
          .order('sort_order', { ascending: true });

        if (answersError) throw answersError;

        // Group answers by question
        const groupedAnswers: Record<string, Answer[]> = {};
        (answersData || []).forEach(answer => {
          if (!groupedAnswers[answer.question_id]) {
            groupedAnswers[answer.question_id] = [];
          }
          groupedAnswers[answer.question_id].push(answer);
        });
        setAnswers(groupedAnswers);
      }

      // Create quiz attempt
      if (user) {
        const { data: attemptData, error: attemptError } = await supabase
          .from('quiz_attempts')
          .insert({
            quiz_id: quizId,
            user_id: user.id,
          })
          .select()
          .single();

        if (attemptError) throw attemptError;
        setAttemptId(attemptData.id);
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setUserAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionId !== questionId);
      return [...filtered, { questionId, answerId }];
    });
  };

  const getSelectedAnswer = (questionId: string) => {
    return userAnswers.find((a) => a.questionId === questionId)?.answerId;
  };

  const handleSubmit = useCallback(async () => {
    if (isSubmitted || !attemptId || !user) return;
    setIsSubmitted(true);

    try {
      // Calculate score
      let earnedPoints = 0;
      const answersToInsert = [];

      for (const userAnswer of userAnswers) {
        const questionAnswers = answers[userAnswer.questionId] || [];
        const selectedAnswer = questionAnswers.find((a) => a.id === userAnswer.answerId);
        const question = questions.find((q) => q.id === userAnswer.questionId);
        const isCorrect = selectedAnswer?.is_correct || false;

        if (isCorrect && question) {
          earnedPoints += question.points || 1;
        }

        answersToInsert.push({
          attempt_id: attemptId,
          question_id: userAnswer.questionId,
          selected_answer_id: userAnswer.answerId,
          is_correct: isCorrect,
        });
      }

      // Insert user answers
      if (answersToInsert.length > 0) {
        await supabase.from('user_quiz_answers').insert(answersToInsert);
      }

      const passed = quiz?.passing_score
        ? (earnedPoints / totalPoints) * 100 >= quiz.passing_score
        : earnedPoints >= totalPoints * 0.7;

      // Update attempt
      await supabase
        .from('quiz_attempts')
        .update({
          score: earnedPoints,
          total_points: totalPoints,
          passed,
          completed_at: new Date().toISOString(),
        })
        .eq('id', attemptId);

      setScore(earnedPoints);
      setShowResults(true);
      toast.success('Quiz submitted successfully!');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
      setIsSubmitted(false);
    }
  }, [isSubmitted, attemptId, user, userAnswers, answers, questions, quiz, totalPoints]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswers = currentQuestion ? answers[currentQuestion.id] || [] : [];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const scorePercentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
  const passed = quiz?.passing_score
    ? scorePercentage >= quiz.passing_score
    : scorePercentage >= 70;

  if (loading) {
    return (
      <Layout>
        <div className="container py-12 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!quiz) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Quiz Not Found</h1>
          <p className="text-muted-foreground mb-4">The quiz you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </Layout>
    );
  }

  if (showResults) {
    return (
      <Layout>
        <div className="container py-12 max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${
                passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {passed ? (
                  <Trophy className="h-12 w-12" />
                ) : (
                  <XCircle className="h-12 w-12" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {passed ? 'Congratulations!' : 'Keep Practicing!'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-4xl font-bold text-primary mb-2">
                  {score} / {totalPoints}
                </p>
                <p className="text-lg text-muted-foreground">
                  {scorePercentage.toFixed(1)}% Score
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Your Score</span>
                  <span>{scorePercentage.toFixed(1)}%</span>
                </div>
                <Progress value={scorePercentage} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Passing Score: {quiz.passing_score || 70}%</span>
                  <Badge variant={passed ? 'default' : 'destructive'}>
                    {passed ? 'PASSED' : 'FAILED'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {userAnswers.filter((ua) => {
                      const questionAnswers = answers[ua.questionId] || [];
                      return questionAnswers.find((a) => a.id === ua.answerId)?.is_correct;
                    }).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {userAnswers.filter((ua) => {
                      const questionAnswers = answers[ua.questionId] || [];
                      return !questionAnswers.find((a) => a.id === ua.answerId)?.is_correct;
                    }).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Incorrect</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-muted-foreground">
                    {questions.length - userAnswers.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Skipped</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(`/course/${quiz.course_id}/learn`)}
                >
                  Back to Course
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => window.location.reload()}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retry Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            {quiz.is_final_exam && (
              <Badge variant="secondary" className="mt-1">Final Exam</Badge>
            )}
          </div>
          {timeLeft !== null && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              timeLeft < 60 ? 'bg-destructive text-destructive-foreground' : 'bg-muted'
            }`}>
              <Clock className="h-5 w-5" />
              <span className="font-mono text-lg font-bold">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{userAnswers.length} answered</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {questions.map((q, index) => {
            const isAnswered = userAnswers.some((a) => a.questionId === q.id);
            const isCurrent = index === currentQuestionIndex;
            return (
              <Button
                key={q.id}
                variant={isCurrent ? 'default' : isAnswered ? 'secondary' : 'outline'}
                size="sm"
                className="w-10 h-10"
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </Button>
            );
          })}
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg leading-relaxed">
                  {currentQuestion.question_text}
                </CardTitle>
                <Badge variant="outline">
                  {currentQuestion.points || 1} {(currentQuestion.points || 1) === 1 ? 'point' : 'points'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={getSelectedAnswer(currentQuestion.id) || ''}
                onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
              >
                <div className="space-y-3">
                  {currentAnswers.map((answer, index) => (
                    <div
                      key={answer.id}
                      className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleAnswerSelect(currentQuestion.id, answer.id)}
                    >
                      <RadioGroupItem value={answer.id} id={answer.id} />
                      <Label htmlFor={answer.id} className="flex-1 cursor-pointer">
                        <span className="font-medium mr-2">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        {answer.answer_text}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentQuestionIndex < questions.length - 1 ? (
              <Button
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={handleSubmit}
                disabled={isSubmitted}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Submit Quiz
              </Button>
            )}
          </div>
        </div>

        {/* Submit anytime */}
        {currentQuestionIndex < questions.length - 1 && userAnswers.length > 0 && (
          <div className="text-center mt-6">
            <Button variant="outline" onClick={handleSubmit} disabled={isSubmitted}>
              Submit Quiz Early ({userAnswers.length}/{questions.length} answered)
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
