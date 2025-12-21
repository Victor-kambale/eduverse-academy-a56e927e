import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  GraduationCap, 
  Upload, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Shield,
  Building2,
  User,
  Briefcase,
  FileCheck
} from "lucide-react";
import { DocumentUpload } from "@/components/teacher/DocumentUpload";
import { BankAccountForm } from "@/components/teacher/BankAccountForm";
import { TeacherContract } from "@/components/teacher/TeacherContract";
import { PaymentStep } from "@/components/teacher/PaymentStep";

const steps = [
  { id: 1, title: "Personal Info", icon: User, description: "Basic information" },
  { id: 2, title: "Experience", icon: Briefcase, description: "Skills & background" },
  { id: 3, title: "Documents", icon: FileCheck, description: "Upload credentials" },
  { id: 4, title: "Bank Account", icon: Building2, description: "Payment details" },
  { id: 5, title: "Payment", icon: CreditCard, description: "$99 registration" },
  { id: 6, title: "Contract", icon: FileText, description: "Review & sign" },
];

const countries = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", 
  "India", "China", "Japan", "Brazil", "Mexico", "South Korea", "Singapore",
  "Netherlands", "Sweden", "Switzerland", "Spain", "Italy", "Poland", "Nigeria",
  "South Africa", "Kenya", "Egypt", "Rwanda", "Uganda", "Tanzania", "Ghana"
];

const specializations = [
  "Web Development", "Mobile Development", "Data Science", "Machine Learning",
  "Cloud Computing", "Cybersecurity", "DevOps", "UI/UX Design", "Digital Marketing",
  "Business Management", "Finance", "Photography", "Video Production", "Music",
  "Language Teaching", "Mathematics", "Physics", "Chemistry", "Biology"
];

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  dateOfBirth: string;
  bio: string;
  experienceYears: number;
  selectedSpecializations: string[];
  linkedinUrl: string;
  websiteUrl: string;
  universityName: string;
  universityCountry: string;
  graduationYear: string;
  degreeType: string;
  academicReferenceContact: string;
  documents: {
    idDocument: File | null;
    passport: File | null;
    graduationDegree: File | null;
    cv: File | null;
    photo: File | null;
  };
  bankCountry: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode: string;
  iban: string;
  hasExternalCardLink: boolean;
  agreedToTerms: boolean;
  agreedToContract: boolean;
}

const TeacherRegistration = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    fullName: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    phone: "",
    country: "",
    dateOfBirth: "",
    bio: "",
    experienceYears: 0,
    selectedSpecializations: [],
    linkedinUrl: "",
    websiteUrl: "",
    universityName: "",
    universityCountry: "",
    graduationYear: "",
    degreeType: "",
    academicReferenceContact: "",
    documents: {
      idDocument: null,
      passport: null,
      graduationDegree: null,
      cv: null,
      photo: null,
    },
    bankCountry: "",
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    routingNumber: "",
    swiftCode: "",
    iban: "",
    hasExternalCardLink: false,
    agreedToTerms: false,
    agreedToContract: false,
  });

  const updateFormData = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateDocuments = useCallback((docType: keyof FormData['documents'], file: File | null) => {
    setFormData(prev => ({
      ...prev,
      documents: { ...prev.documents, [docType]: file }
    }));
  }, []);

  const handleSpecializationToggle = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSpecializations: prev.selectedSpecializations.includes(spec)
        ? prev.selectedSpecializations.filter(s => s !== spec)
        : [...prev.selectedSpecializations, spec]
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.fullName && formData.email && formData.country && formData.dateOfBirth);
      case 2:
        return !!(formData.bio && formData.selectedSpecializations.length > 0 && formData.universityName);
      case 3:
        return !!(formData.documents.graduationDegree && formData.documents.cv && formData.documents.photo);
      case 4:
        return formData.hasExternalCardLink || !!(formData.bankCountry && formData.bankName && formData.accountNumber);
      case 5:
        return paymentCompleted;
      case 6:
        return formData.agreedToContract;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    } else {
      toast.error("Please complete all required fields before proceeding");
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const uploadDocument = async (file: File, folder: string): Promise<string | null> => {
    if (!user) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${folder}/${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('teacher-documents')
      .upload(fileName, file);
    
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    
    return fileName;
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to continue");
      return;
    }

    if (!validateStep(6)) {
      toast.error("Please agree to the contract terms");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload documents
      const documentUrls: Record<string, string | null> = {};
      
      if (formData.documents.idDocument) {
        documentUrls.id_document_url = await uploadDocument(formData.documents.idDocument, 'id');
      }
      if (formData.documents.passport) {
        documentUrls.passport_url = await uploadDocument(formData.documents.passport, 'passport');
      }
      if (formData.documents.graduationDegree) {
        documentUrls.graduation_degree_url = await uploadDocument(formData.documents.graduationDegree, 'degree');
      }
      if (formData.documents.cv) {
        documentUrls.cv_url = await uploadDocument(formData.documents.cv, 'cv');
      }
      if (formData.documents.photo) {
        documentUrls.photo_url = await uploadDocument(formData.documents.photo, 'photo');
      }

      // Create teacher application
      const { error } = await supabase
        .from('teacher_applications')
        .insert({
          user_id: user.id,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          date_of_birth: formData.dateOfBirth,
          bio: formData.bio,
          experience_years: formData.experienceYears,
          specializations: formData.selectedSpecializations,
          linkedin_url: formData.linkedinUrl,
          website_url: formData.websiteUrl,
          university_name: formData.universityName,
          university_country: formData.universityCountry,
          graduation_year: parseInt(formData.graduationYear),
          degree_type: formData.degreeType,
          academic_reference_contact: formData.academicReferenceContact,
          bank_country: formData.bankCountry,
          bank_name: formData.bankName,
          account_holder_name: formData.accountHolderName,
          account_number: formData.accountNumber,
          routing_number: formData.routingNumber,
          swift_code: formData.swiftCode,
          iban: formData.iban,
          has_external_card_link: formData.hasExternalCardLink,
          registration_fee_paid: paymentCompleted,
          registration_payment_date: new Date().toISOString(),
          contract_signed: true,
          contract_signed_at: new Date().toISOString(),
          ...documentUrls,
        });

      if (error) throw error;

      toast.success("Application submitted successfully! We'll review your application within 3 business days.");
      navigate("/dashboard");
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / 6) * 100;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
        {/* Header */}
        <div className="bg-primary text-primary-foreground py-12">
          <div className="container">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-accent rounded-xl">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold">Become an Eduverse Teacher</h1>
                <p className="text-primary-foreground/80">Join our community of expert instructors</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
                      ${currentStep > step.id 
                        ? 'bg-success border-success text-success-foreground' 
                        : currentStep === step.id 
                          ? 'bg-accent border-accent text-accent-foreground' 
                          : 'bg-muted border-border text-muted-foreground'}
                    `}>
                      {currentStep > step.id ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <step.icon className="w-6 h-6" />
                      )}
                    </div>
                    <span className="text-xs mt-2 font-medium hidden md:block">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`hidden md:block w-24 h-0.5 mx-2 ${
                      currentStep > step.id ? 'bg-success' : 'bg-border'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Form Content */}
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const StepIcon = steps[currentStep - 1].icon;
                  return <StepIcon className="w-5 h-5 text-accent" />;
                })()}
                {steps[currentStep - 1].title}
              </CardTitle>
              <CardDescription>{steps[currentStep - 1].description}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => updateFormData('fullName', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country of Residence *</Label>
                    <Select value={formData.country} onValueChange={(v) => updateFormData('country', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth *</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn Profile</Label>
                    <Input
                      id="linkedin"
                      value={formData.linkedinUrl}
                      onChange={(e) => updateFormData('linkedinUrl', e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Experience */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="bio">Professional Bio *</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => updateFormData('bio', e.target.value)}
                      placeholder="Tell us about your professional background, expertise, and teaching experience..."
                      className="min-h-[150px]"
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input
                        id="experience"
                        type="number"
                        min={0}
                        value={formData.experienceYears}
                        onChange={(e) => updateFormData('experienceYears', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Personal Website</Label>
                      <Input
                        id="website"
                        value={formData.websiteUrl}
                        onChange={(e) => updateFormData('websiteUrl', e.target.value)}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Areas of Expertise *</Label>
                    <div className="flex flex-wrap gap-2">
                      {specializations.map(spec => (
                        <Badge
                          key={spec}
                          variant={formData.selectedSpecializations.includes(spec) ? "default" : "outline"}
                          className="cursor-pointer transition-all hover:scale-105"
                          onClick={() => handleSpecializationToggle(spec)}
                        >
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      Educational Background
                    </h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="university">University Name *</Label>
                        <Input
                          id="university"
                          value={formData.universityName}
                          onChange={(e) => updateFormData('universityName', e.target.value)}
                          placeholder="Enter university name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="uniCountry">University Country</Label>
                        <Select value={formData.universityCountry} onValueChange={(v) => updateFormData('universityCountry', v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map(country => (
                              <SelectItem key={country} value={country}>{country}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gradYear">Graduation Year</Label>
                        <Input
                          id="gradYear"
                          type="number"
                          min={1950}
                          max={new Date().getFullYear()}
                          value={formData.graduationYear}
                          onChange={(e) => updateFormData('graduationYear', e.target.value)}
                          placeholder="2020"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="degreeType">Degree Type</Label>
                        <Select value={formData.degreeType} onValueChange={(v) => updateFormData('degreeType', v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select degree" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                            <SelectItem value="master">Master's Degree</SelectItem>
                            <SelectItem value="phd">Ph.D / Doctorate</SelectItem>
                            <SelectItem value="diploma">Diploma</SelectItem>
                            <SelectItem value="certificate">Professional Certificate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="reference">Academic Reference Contact</Label>
                        <Input
                          id="reference"
                          value={formData.academicReferenceContact}
                          onChange={(e) => updateFormData('academicReferenceContact', e.target.value)}
                          placeholder="Name, email or phone of academic reference"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Documents */}
              {currentStep === 3 && (
                <DocumentUpload
                  documents={formData.documents}
                  onUpdate={updateDocuments}
                />
              )}

              {/* Step 4: Bank Account */}
              {currentStep === 4 && (
                <BankAccountForm
                  formData={formData}
                  updateFormData={updateFormData}
                  countries={countries}
                />
              )}

              {/* Step 5: Payment */}
              {currentStep === 5 && (
                <PaymentStep
                  onPaymentComplete={() => setPaymentCompleted(true)}
                  paymentCompleted={paymentCompleted}
                />
              )}

              {/* Step 6: Contract */}
              {currentStep === 6 && (
                <TeacherContract
                  agreedToContract={formData.agreedToContract}
                  onAgreeChange={(agreed) => updateFormData('agreedToContract', agreed)}
                />
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                {currentStep < 6 ? (
                  <Button onClick={handleNext} disabled={!validateStep(currentStep)}>
                    Next Step
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit} 
                    disabled={!validateStep(6) || isSubmitting}
                    className="bg-success hover:bg-success/90"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default TeacherRegistration;
