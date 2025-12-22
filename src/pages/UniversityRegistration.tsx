import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  BookOpen,
  Upload,
  Check,
  ArrowRight,
  Globe,
  Mail,
  Phone,
  MapPin,
  FileText,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';

const steps = [
  { id: 1, title: 'Organization Info', icon: Building2 },
  { id: 2, title: 'Contact Details', icon: Mail },
  { id: 3, title: 'Documents', icon: FileText },
  { id: 4, title: 'Payment', icon: CreditCard },
];

export default function UniversityRegistration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    organization_name: '',
    organization_type: '',
    registration_number: '',
    country: '',
    city: '',
    address: '',
    website: '',
    email: '',
    phone: '',
    description: '',
    specializations: [] as string[],
    num_instructors: '',
  });

  const [documents, setDocuments] = useState({
    registration_certificate: null as File | null,
    tax_document: null as File | null,
    authorization_letter: null as File | null,
    logo: null as File | null,
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: keyof typeof documents, file: File | null) => {
    setDocuments((prev) => ({ ...prev, [field]: file }));
  };

  const uploadDocument = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('teacher-documents')
      .upload(path, file);
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from('teacher-documents')
      .getPublicUrl(path);
    
    return urlData.publicUrl;
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error('Please log in to register');
      return;
    }

    setLoading(true);
    try {
      // Upload documents
      const documentUrls: Record<string, string> = {};
      
      for (const [key, file] of Object.entries(documents)) {
        if (file) {
          const path = `universities/${user.id}/${key}-${Date.now()}.${file.name.split('.').pop()}`;
          documentUrls[key] = await uploadDocument(file, path);
        }
      }

      // Create university application in teacher_applications with special type
      const { error } = await supabase.from('teacher_applications').insert({
        user_id: user.id,
        full_name: formData.organization_name,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        bio: formData.description,
        specializations: formData.specializations.length > 0 ? formData.specializations : ['Education'],
        website_url: formData.website,
        id_document_url: documentUrls.registration_certificate || null,
        passport_url: documentUrls.tax_document || null,
        graduation_degree_url: documentUrls.authorization_letter || null,
        photo_url: documentUrls.logo || null,
        status: 'pending',
      });

      if (error) throw error;

      toast.success('University registration submitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to submit registration');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Organization Name *</Label>
                <Input
                  placeholder="University of Excellence"
                  value={formData.organization_name}
                  onChange={(e) => updateFormData('organization_name', e.target.value)}
                />
              </div>
              <div>
                <Label>Organization Type *</Label>
                <Select 
                  value={formData.organization_type}
                  onValueChange={(v) => updateFormData('organization_type', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="university">University</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                    <SelectItem value="training_center">Training Center</SelectItem>
                    <SelectItem value="corporate">Corporate Training</SelectItem>
                    <SelectItem value="nonprofit">Non-Profit Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Registration Number</Label>
                <Input
                  placeholder="REG-12345"
                  value={formData.registration_number}
                  onChange={(e) => updateFormData('registration_number', e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Tell us about your organization..."
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  rows={4}
                />
              </div>
              <div>
                <Label>Expected Number of Instructors</Label>
                <Select
                  value={formData.num_instructors}
                  onValueChange={(v) => updateFormData('num_instructors', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-5">1-5 Instructors</SelectItem>
                    <SelectItem value="6-20">6-20 Instructors</SelectItem>
                    <SelectItem value="21-50">21-50 Instructors</SelectItem>
                    <SelectItem value="50+">50+ Instructors</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Country *</Label>
                <Input
                  placeholder="United States"
                  value={formData.country}
                  onChange={(e) => updateFormData('country', e.target.value)}
                />
              </div>
              <div>
                <Label>City *</Label>
                <Input
                  placeholder="New York"
                  value={formData.city}
                  onChange={(e) => updateFormData('city', e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label>Full Address</Label>
                <Input
                  placeholder="123 Education Street"
                  value={formData.address}
                  onChange={(e) => updateFormData('address', e.target.value)}
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="contact@university.edu"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                />
              </div>
              <div>
                <Label>Phone Number *</Label>
                <Input
                  placeholder="+1 234 567 8900"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label>Website</Label>
                <Input
                  placeholder="https://university.edu"
                  value={formData.website}
                  onChange={(e) => updateFormData('website', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Registration Certificate *
                </Label>
                <Input
                  type="file"
                  accept=".pdf,image/*"
                  className="mt-2"
                  onChange={(e) => handleFileChange('registration_certificate', e.target.files?.[0] || null)}
                />
                {documents.registration_certificate && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    {documents.registration_certificate.name}
                  </p>
                )}
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Tax Registration Document
                </Label>
                <Input
                  type="file"
                  accept=".pdf,image/*"
                  className="mt-2"
                  onChange={(e) => handleFileChange('tax_document', e.target.files?.[0] || null)}
                />
                {documents.tax_document && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    {documents.tax_document.name}
                  </p>
                )}
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Authorization Letter
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Letter authorizing you to act on behalf of the organization
                </p>
                <Input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileChange('authorization_letter', e.target.files?.[0] || null)}
                />
                {documents.authorization_letter && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    {documents.authorization_letter.name}
                  </p>
                )}
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Organization Logo
                </Label>
                <Input
                  type="file"
                  accept="image/*"
                  className="mt-2"
                  onChange={(e) => handleFileChange('logo', e.target.files?.[0] || null)}
                />
                {documents.logo && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    {documents.logo.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="p-6 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Registration Fee</h3>
              <p className="text-3xl font-bold text-accent">$99.00 USD</p>
              <p className="text-sm text-muted-foreground mt-2">
                One-time registration fee for organization account setup
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">What's Included:</h4>
              <ul className="space-y-2">
                {[
                  'Multi-instructor management dashboard',
                  'Bulk course creation tools',
                  'Organization branding on certificates',
                  'Priority support',
                  'Analytics and reporting',
                  'Revenue sharing (80% to organization)',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-start gap-2 pt-4">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(c) => setAgreedToTerms(c === true)}
              />
              <label htmlFor="terms" className="text-sm">
                I agree to EduVerse's terms of service and organization agreement. 
                I confirm that I am authorized to act on behalf of this organization.
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="container max-w-4xl py-12">
        <div className="text-center mb-8">
          <Building2 className="h-16 w-16 mx-auto text-accent mb-4" />
          <h1 className="text-3xl font-bold">University & Company Registration</h1>
          <p className="text-muted-foreground mt-2">
            Register your organization to offer courses and manage multiple instructors
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      isCompleted ? 'bg-green-500' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>
              Step {currentStep} of {steps.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStep()}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < steps.length ? (
                <Button
                  onClick={() => setCurrentStep((prev) => Math.min(steps.length, prev + 1))}
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !agreedToTerms}
                >
                  {loading ? 'Submitting...' : 'Complete Registration'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
