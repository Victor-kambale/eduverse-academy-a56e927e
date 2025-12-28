import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
import { ScrollArea } from "@/components/ui/scroll-area";
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
  FileCheck,
  Sparkles
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

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

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

      toast.success("Application submitted successfully! Redirecting to your teacher dashboard...");
      navigate("/teacher/dashboard");
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900">
        {/* Hero Header */}
        <motion.div 
          className="relative overflow-hidden bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAyIi8+PC9nPjwvc3ZnPg==')] opacity-40" />
          
          <div className="container py-12 relative z-10">
            <motion.div 
              className="flex items-center gap-4 mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg shadow-purple-500/30">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="font-display text-4xl font-bold text-white flex items-center gap-3">
                  Become an Eduverse Teacher
                  <Sparkles className="w-8 h-8 text-yellow-400" />
                </h1>
                <p className="text-purple-200/80 text-lg">Join our community of expert instructors and inspire learners worldwide</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="container py-8">
          {/* Progress Steps */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2">
              {steps.map((step, index) => (
                <motion.div 
                  key={step.id} 
                  className="flex items-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div className="flex flex-col items-center">
                    <motion.div 
                      className={`
                        w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all shadow-lg
                        ${currentStep > step.id 
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400 text-white shadow-emerald-500/30' 
                          : currentStep === step.id 
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500 border-purple-400 text-white shadow-purple-500/30' 
                            : 'bg-slate-800/50 border-slate-600 text-slate-400'}
                      `}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {currentStep > step.id ? (
                        <CheckCircle2 className="w-7 h-7" />
                      ) : (
                        <step.icon className="w-7 h-7" />
                      )}
                    </motion.div>
                    <span className={`text-xs mt-2 font-medium hidden md:block ${
                      currentStep >= step.id ? 'text-purple-300' : 'text-slate-500'
                    }`}>{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`hidden md:block w-16 lg:w-24 h-1 mx-2 rounded-full transition-all ${
                      currentStep > step.id ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-slate-700'
                    }`} />
                  )}
                </motion.div>
              ))}
            </div>
            <Progress value={progress} className="h-2 bg-slate-800" />
          </motion.div>

          {/* Form Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="max-w-4xl mx-auto bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-purple-500/20 backdrop-blur-xl shadow-2xl">
              <CardHeader className="border-b border-purple-500/20">
                <CardTitle className="flex items-center gap-3 text-white text-xl">
                  {(() => {
                    const StepIcon = steps[currentStep - 1].icon;
                    return (
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                        <StepIcon className="w-5 h-5 text-white" />
                      </div>
                    );
                  })()}
                  {steps[currentStep - 1].title}
                </CardTitle>
                <CardDescription className="text-purple-300/70">{steps[currentStep - 1].description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ScrollArea className="max-h-[60vh] pr-4 scroll-smooth">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Step 1: Personal Info */}
                      {currentStep === 1 && (
                        <motion.div 
                          className="grid md:grid-cols-2 gap-6"
                          variants={staggerContainer}
                          initial="initial"
                          animate="animate"
                        >
                          <motion.div className="space-y-2" variants={fadeInUp}>
                            <Label htmlFor="fullName" className="text-purple-200">Full Name *</Label>
                            <Input
                              id="fullName"
                              value={formData.fullName}
                              onChange={(e) => updateFormData('fullName', e.target.value)}
                              placeholder="Enter your full name"
                              className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-500 focus:border-purple-400"
                            />
                          </motion.div>
                          <motion.div className="space-y-2" variants={fadeInUp}>
                            <Label htmlFor="email" className="text-purple-200">Email Address *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => updateFormData('email', e.target.value)}
                              placeholder="your@email.com"
                              className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-500 focus:border-purple-400"
                            />
                          </motion.div>
                          <motion.div className="space-y-2" variants={fadeInUp}>
                            <Label htmlFor="phone" className="text-purple-200">Phone Number</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => updateFormData('phone', e.target.value)}
                              placeholder="+1 234 567 8900"
                              className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-500 focus:border-purple-400"
                            />
                          </motion.div>
                          <motion.div className="space-y-2" variants={fadeInUp}>
                            <Label htmlFor="country" className="text-purple-200">Country of Residence *</Label>
                            <Select value={formData.country} onValueChange={(v) => updateFormData('country', v)}>
                              <SelectTrigger className="bg-slate-800/50 border-purple-500/30 text-white">
                                <SelectValue placeholder="Select your country" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-purple-500/30">
                                {countries.map(country => (
                                  <SelectItem key={country} value={country} className="text-white hover:bg-purple-500/20">{country}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </motion.div>
                          <motion.div className="space-y-2" variants={fadeInUp}>
                            <Label htmlFor="dob" className="text-purple-200">Date of Birth *</Label>
                            <Input
                              id="dob"
                              type="date"
                              value={formData.dateOfBirth}
                              onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                              className="bg-slate-800/50 border-purple-500/30 text-white"
                            />
                          </motion.div>
                          <motion.div className="space-y-2" variants={fadeInUp}>
                            <Label htmlFor="linkedin" className="text-purple-200">LinkedIn Profile</Label>
                            <Input
                              id="linkedin"
                              value={formData.linkedinUrl}
                              onChange={(e) => updateFormData('linkedinUrl', e.target.value)}
                              placeholder="https://linkedin.com/in/yourprofile"
                              className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-500 focus:border-purple-400"
                            />
                          </motion.div>
                        </motion.div>
                      )}

                      {/* Step 2: Experience */}
                      {currentStep === 2 && (
                        <motion.div 
                          className="space-y-6"
                          variants={staggerContainer}
                          initial="initial"
                          animate="animate"
                        >
                          <motion.div className="space-y-2" variants={fadeInUp}>
                            <Label htmlFor="bio" className="text-purple-200">Professional Bio *</Label>
                            <Textarea
                              id="bio"
                              value={formData.bio}
                              onChange={(e) => updateFormData('bio', e.target.value)}
                              placeholder="Tell us about your professional background, expertise, and teaching experience..."
                              className="min-h-[150px] bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-500 focus:border-purple-400"
                            />
                          </motion.div>
                          
                          <motion.div className="grid md:grid-cols-2 gap-6" variants={fadeInUp}>
                            <div className="space-y-2">
                              <Label htmlFor="experience" className="text-purple-200">Years of Experience</Label>
                              <Input
                                id="experience"
                                type="number"
                                min={0}
                                value={formData.experienceYears}
                                onChange={(e) => updateFormData('experienceYears', parseInt(e.target.value))}
                                className="bg-slate-800/50 border-purple-500/30 text-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="website" className="text-purple-200">Personal Website</Label>
                              <Input
                                id="website"
                                value={formData.websiteUrl}
                                onChange={(e) => updateFormData('websiteUrl', e.target.value)}
                                placeholder="https://yourwebsite.com"
                                className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-500"
                              />
                            </div>
                          </motion.div>

                          <motion.div className="space-y-3" variants={fadeInUp}>
                            <Label className="text-purple-200">Areas of Expertise *</Label>
                            <div className="flex flex-wrap gap-2">
                              {specializations.map(spec => (
                                <motion.div key={spec} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Badge
                                    variant={formData.selectedSpecializations.includes(spec) ? "default" : "outline"}
                                    className={`cursor-pointer transition-all ${
                                      formData.selectedSpecializations.includes(spec)
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-0 text-white'
                                        : 'border-purple-500/30 text-purple-300 hover:bg-purple-500/20'
                                    }`}
                                    onClick={() => handleSpecializationToggle(spec)}
                                  >
                                    {spec}
                                  </Badge>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>

                          <motion.div className="border-t border-purple-500/20 pt-6" variants={fadeInUp}>
                            <h4 className="font-semibold mb-4 flex items-center gap-2 text-white">
                              <GraduationCap className="w-5 h-5 text-purple-400" />
                              Educational Background
                            </h4>
                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="university" className="text-purple-200">University Name *</Label>
                                <Input
                                  id="university"
                                  value={formData.universityName}
                                  onChange={(e) => updateFormData('universityName', e.target.value)}
                                  placeholder="Enter university name"
                                  className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-500"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="uniCountry" className="text-purple-200">University Country</Label>
                                <Select value={formData.universityCountry} onValueChange={(v) => updateFormData('universityCountry', v)}>
                                  <SelectTrigger className="bg-slate-800/50 border-purple-500/30 text-white">
                                    <SelectValue placeholder="Select country" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-slate-800 border-purple-500/30">
                                    {countries.map(country => (
                                      <SelectItem key={country} value={country} className="text-white hover:bg-purple-500/20">{country}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="gradYear" className="text-purple-200">Graduation Year</Label>
                                <Input
                                  id="gradYear"
                                  type="number"
                                  min={1950}
                                  max={new Date().getFullYear()}
                                  value={formData.graduationYear}
                                  onChange={(e) => updateFormData('graduationYear', e.target.value)}
                                  placeholder="2020"
                                  className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-500"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="degreeType" className="text-purple-200">Degree Type</Label>
                                <Select value={formData.degreeType} onValueChange={(v) => updateFormData('degreeType', v)}>
                                  <SelectTrigger className="bg-slate-800/50 border-purple-500/30 text-white">
                                    <SelectValue placeholder="Select degree" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-slate-800 border-purple-500/30">
                                    <SelectItem value="bachelor" className="text-white hover:bg-purple-500/20">Bachelor's Degree</SelectItem>
                                    <SelectItem value="master" className="text-white hover:bg-purple-500/20">Master's Degree</SelectItem>
                                    <SelectItem value="phd" className="text-white hover:bg-purple-500/20">Ph.D / Doctorate</SelectItem>
                                    <SelectItem value="diploma" className="text-white hover:bg-purple-500/20">Diploma</SelectItem>
                                    <SelectItem value="certificate" className="text-white hover:bg-purple-500/20">Professional Certificate</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="reference" className="text-purple-200">Academic Reference Contact</Label>
                                <Input
                                  id="reference"
                                  value={formData.academicReferenceContact}
                                  onChange={(e) => updateFormData('academicReferenceContact', e.target.value)}
                                  placeholder="Name, email or phone of academic reference"
                                  className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-500"
                                />
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}

                      {/* Step 3: Documents */}
                      {currentStep === 3 && (
                        <motion.div variants={fadeInUp} initial="initial" animate="animate">
                          <DocumentUpload
                            documents={formData.documents}
                            onUpdate={updateDocuments}
                          />
                        </motion.div>
                      )}

                      {/* Step 4: Bank Account */}
                      {currentStep === 4 && (
                        <motion.div variants={fadeInUp} initial="initial" animate="animate">
                          <BankAccountForm
                            formData={formData}
                            updateFormData={updateFormData}
                            countries={countries}
                          />
                        </motion.div>
                      )}

                      {/* Step 5: Payment */}
                      {currentStep === 5 && (
                        <motion.div variants={fadeInUp} initial="initial" animate="animate">
                          <PaymentStep
                            onPaymentComplete={() => setPaymentCompleted(true)}
                            paymentCompleted={paymentCompleted}
                          />
                        </motion.div>
                      )}

                      {/* Step 6: Contract */}
                      {currentStep === 6 && (
                        <motion.div variants={fadeInUp} initial="initial" animate="animate">
                          <TeacherContract
                            agreedToContract={formData.agreedToContract}
                            onAgreeChange={(agreed) => updateFormData('agreedToContract', agreed)}
                          />
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </ScrollArea>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-purple-500/20">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  {currentStep < 6 ? (
                    <Button 
                      onClick={handleNext} 
                      disabled={!validateStep(currentStep)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30"
                    >
                      Next Step
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubmit} 
                      disabled={!validateStep(6) || isSubmitting}
                      className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 shadow-lg shadow-emerald-500/30"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Application"}
                      <CheckCircle2 className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default TeacherRegistration;
