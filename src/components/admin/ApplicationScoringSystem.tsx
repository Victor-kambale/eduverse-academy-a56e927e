import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Calculator, RefreshCw, Star, FileCheck, AlertCircle } from 'lucide-react';

interface Application {
  id: string;
  institution_name: string;
  completeness_score?: number;
  document_quality_score?: number;
  overall_score?: number;
  last_scored_at?: string;
  scoring_notes?: string;
  // Document fields
  accreditation_certificate_url?: string | null;
  business_registration_url?: string | null;
  government_approval_url?: string | null;
  ministry_certificate_url?: string | null;
  operating_license_url?: string | null;
  tax_clearance_url?: string | null;
  academic_charter_url?: string | null;
  authorization_letter_url?: string | null;
  quality_assurance_url?: string | null;
  leadership_cv_url?: string | null;
  institutional_profile_url?: string | null;
  certificate_of_incorporation_url?: string | null;
  // Profile fields
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string | null;
  website_url?: string | null;
  founding_year?: number | null;
  student_count?: string | null;
  faculty_count?: string | null;
  programs_offered?: string[] | null;
}

interface ApplicationScoringSystemProps {
  application: Application;
  onScoreUpdate?: () => void;
}

const DOCUMENT_FIELDS = [
  'accreditation_certificate_url',
  'business_registration_url',
  'government_approval_url',
  'ministry_certificate_url',
  'operating_license_url',
  'tax_clearance_url',
  'academic_charter_url',
  'authorization_letter_url',
  'quality_assurance_url',
  'leadership_cv_url',
  'institutional_profile_url',
  'certificate_of_incorporation_url',
];

const PROFILE_FIELDS = [
  'contact_name',
  'contact_email',
  'contact_phone',
  'website_url',
  'founding_year',
  'student_count',
  'faculty_count',
  'programs_offered',
];

export function ApplicationScoringSystem({ application, onScoreUpdate }: ApplicationScoringSystemProps) {
  const queryClient = useQueryClient();
  const [scoringNotes, setScoringNotes] = useState(application.scoring_notes || '');
  const [manualDocScore, setManualDocScore] = useState<number | null>(null);

  const calculateScores = () => {
    // Calculate completeness score based on filled fields
    const documentsFilled = DOCUMENT_FIELDS.filter(
      (field) => application[field as keyof Application]
    ).length;
    const profileFilled = PROFILE_FIELDS.filter(
      (field) => {
        const value = application[field as keyof Application];
        if (Array.isArray(value)) return value.length > 0;
        return value !== null && value !== undefined && value !== '';
      }
    ).length;

    const documentCompleteness = (documentsFilled / DOCUMENT_FIELDS.length) * 50;
    const profileCompleteness = (profileFilled / PROFILE_FIELDS.length) * 50;
    const completenessScore = Math.round(documentCompleteness + profileCompleteness);

    // Document quality score (manual or default based on completeness)
    const documentQualityScore = manualDocScore ?? Math.min(completenessScore, 80);

    // Overall score is weighted average
    const overallScore = Math.round(completenessScore * 0.4 + documentQualityScore * 0.6);

    return { completenessScore, documentQualityScore, overallScore };
  };

  const scoreMutation = useMutation({
    mutationFn: async () => {
      const scores = calculateScores();
      const { error } = await supabase
        .from('university_applications')
        .update({
          completeness_score: scores.completenessScore,
          document_quality_score: scores.documentQualityScore,
          overall_score: scores.overallScore,
          scoring_notes: scoringNotes || null,
          last_scored_at: new Date().toISOString(),
        })
        .eq('id', application.id);

      if (error) throw error;

      // Log to audit
      await supabase.from('audit_logs').insert({
        action: 'application_scored',
        entity_type: 'university_application',
        entity_id: application.id,
        new_value: scores,
        metadata: { scoring_notes: scoringNotes },
      });

      return scores;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-applications'] });
      toast.success('Application scored successfully');
      onScoreUpdate?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const currentScores = calculateScores();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'Excellent', variant: 'default' as const };
    if (score >= 60) return { label: 'Good', variant: 'secondary' as const };
    if (score >= 40) return { label: 'Fair', variant: 'outline' as const };
    return { label: 'Poor', variant: 'destructive' as const };
  };

  const documentsFilled = DOCUMENT_FIELDS.filter(
    (field) => application[field as keyof Application]
  ).length;
  const profileFilled = PROFILE_FIELDS.filter(
    (field) => {
      const value = application[field as keyof Application];
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== '';
    }
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5" />
          Application Scoring
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className={`text-3xl font-bold ${getScoreColor(currentScores.completenessScore)}`}>
              {currentScores.completenessScore}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">Completeness</div>
            <Progress value={currentScores.completenessScore} className="mt-2 h-2" />
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className={`text-3xl font-bold ${getScoreColor(currentScores.documentQualityScore)}`}>
              {currentScores.documentQualityScore}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">Doc Quality</div>
            <Progress value={currentScores.documentQualityScore} className="mt-2 h-2" />
          </div>
          <div className="text-center p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
            <div className={`text-3xl font-bold ${getScoreColor(currentScores.overallScore)}`}>
              {currentScores.overallScore}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">Overall</div>
            <Badge className="mt-2" variant={getScoreBadge(currentScores.overallScore).variant}>
              {getScoreBadge(currentScores.overallScore).label}
            </Badge>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Score Breakdown
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <span>Documents Uploaded</span>
              <span className="font-medium">{documentsFilled}/{DOCUMENT_FIELDS.length}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <span>Profile Fields</span>
              <span className="font-medium">{profileFilled}/{PROFILE_FIELDS.length}</span>
            </div>
          </div>
        </div>

        {/* Manual Quality Score */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Star className="h-4 w-4" />
            Manual Document Quality Score (Optional)
          </label>
          <div className="flex gap-2">
            {[20, 40, 60, 80, 100].map((score) => (
              <Button
                key={score}
                variant={manualDocScore === score ? 'default' : 'outline'}
                size="sm"
                onClick={() => setManualDocScore(manualDocScore === score ? null : score)}
              >
                {score}%
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Override the automatic quality score based on manual review
          </p>
        </div>

        {/* Scoring Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Scoring Notes</label>
          <Textarea
            placeholder="Add notes about this scoring (e.g., document quality observations, missing items...)"
            value={scoringNotes}
            onChange={(e) => setScoringNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Last Scored */}
        {application.last_scored_at && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            Last scored: {new Date(application.last_scored_at).toLocaleString()}
          </div>
        )}

        {/* Action Button */}
        <Button
          className="w-full"
          onClick={() => scoreMutation.mutate()}
          disabled={scoreMutation.isPending}
        >
          {scoreMutation.isPending ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Calculator className="h-4 w-4 mr-2" />
              Calculate & Save Score
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
