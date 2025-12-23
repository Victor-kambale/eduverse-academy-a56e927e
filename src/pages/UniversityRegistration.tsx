import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  BookOpen,
  Upload,
  Check,
  ArrowRight,
  ArrowLeft,
  Globe,
  Mail,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Shield,
  Award,
  Scale,
  Briefcase,
  GraduationCap,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector';

const steps = [
  { id: 1, title: 'Organization Info', icon: Building2, description: 'Basic details' },
  { id: 2, title: 'Contact Details', icon: Mail, description: 'Communication info' },
  { id: 3, title: 'Legal Information', icon: Scale, description: 'Registration & tax' },
  { id: 4, title: 'Government Documents', icon: FileText, description: 'Official docs' },
  { id: 5, title: 'Academic Credentials', icon: GraduationCap, description: 'Accreditations' },
  { id: 6, title: 'Banking Details', icon: Briefcase, description: 'Payment info' },
  { id: 7, title: 'Partnership Contract', icon: Shield, description: 'Agreement' },
  { id: 8, title: 'Payment', icon: CreditCard, description: 'Registration fee' },
];

const organizationTypes = [
  { value: 'university', label: 'University' },
  { value: 'college', label: 'College' },
  { value: 'polytechnic', label: 'Polytechnic' },
  { value: 'vocational', label: 'Vocational Institute' },
  { value: 'training_center', label: 'Training Center' },
  { value: 'corporate', label: 'Corporate Training' },
  { value: 'nonprofit', label: 'Non-Profit Organization' },
  { value: 'government', label: 'Government Institution' },
];

export default function UniversityRegistration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    // Organization Info
    organization_name: '',
    organization_type: '',
    organization_acronym: '',
    year_established: '',
    registration_number: '',
    country: '',
    state_province: '',
    city: '',
    postal_code: '',
    street_address: '',
    website: '',
    
    // Contact Details
    primary_email: '',
    secondary_email: '',
    primary_phone: '',
    secondary_phone: '',
    fax_number: '',
    contact_person_name: '',
    contact_person_title: '',
    contact_person_email: '',
    contact_person_phone: '',
    
    // Legal Information
    legal_entity_name: '',
    legal_entity_type: '',
    tax_id: '',
    vat_number: '',
    business_license_number: '',
    incorporation_date: '',
    jurisdiction: '',
    
    // Academic Details
    accreditation_body: '',
    accreditation_number: '',
    accreditation_date: '',
    accreditation_expiry: '',
    student_enrollment: '',
    faculty_count: '',
    campus_count: '',
    programs_offered: '',
    
    // Banking
    bank_country: '',
    bank_name: '',
    bank_branch: '',
    account_holder_name: '',
    account_number: '',
    routing_number: '',
    swift_code: '',
    iban: '',
    
    // Description
    description: '',
    mission_statement: '',
    specializations: [] as string[],
  });

  const [documents, setDocuments] = useState({
    // Government Documents
    certificate_of_incorporation: null as File | null,
    business_registration: null as File | null,
    tax_clearance_certificate: null as File | null,
    operating_license: null as File | null,
    government_approval_letter: null as File | null,
    ministry_of_education_certificate: null as File | null,
    
    // Academic Documents
    accreditation_certificate: null as File | null,
    quality_assurance_certificate: null as File | null,
    academic_charter: null as File | null,
    program_approval_documents: null as File | null,
    
    // Identity Documents
    authorized_signatory_id: null as File | null,
    board_resolution: null as File | null,
    power_of_attorney: null as File | null,
    
    // Other
    organization_logo: null as File | null,
    organization_brochure: null as File | null,
  });

  const [contractAgreed, setContractAgreed] = useState({
    terms: false,
    privacy: false,
    partnership: false,
    revenue_share: false,
    quality_standards: false,
    content_guidelines: false,
    dispute_resolution: false,
    data_protection: false,
  });

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

    const allContractAgreed = Object.values(contractAgreed).every(v => v);
    if (!allContractAgreed) {
      toast.error('Please accept all contract terms');
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

      // Create university application
      const { error } = await supabase.from('teacher_applications').insert({
        user_id: user.id,
        full_name: formData.organization_name,
        email: formData.primary_email,
        phone: formData.primary_phone,
        country: formData.country,
        bio: formData.description,
        specializations: formData.specializations.length > 0 ? formData.specializations : ['Education'],
        website_url: formData.website,
        university_name: formData.organization_name,
        university_country: formData.country,
        id_document_url: documentUrls.certificate_of_incorporation || null,
        passport_url: documentUrls.tax_clearance_certificate || null,
        graduation_degree_url: documentUrls.accreditation_certificate || null,
        photo_url: documentUrls.organization_logo || null,
        bank_country: formData.bank_country,
        bank_name: formData.bank_name,
        account_holder_name: formData.account_holder_name,
        account_number: formData.account_number,
        routing_number: formData.routing_number,
        swift_code: formData.swift_code,
        iban: formData.iban,
        contract_signed: true,
        contract_signed_at: new Date().toISOString(),
        registration_fee_paid: true,
        registration_payment_date: new Date().toISOString(),
        status: 'pending',
      });

      if (error) throw error;

      // Play success sound
      const audio = new Audio('/sounds/success.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});

      toast.success('University registration submitted successfully!');
      navigate('/university/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to submit registration');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.organization_name && formData.organization_type && formData.country;
      case 2:
        return formData.primary_email && formData.primary_phone && formData.contact_person_name;
      case 3:
        return formData.legal_entity_name && formData.tax_id;
      case 4:
        return documents.certificate_of_incorporation || documents.business_registration;
      case 5:
        return formData.accreditation_body || formData.student_enrollment;
      case 6:
        return formData.bank_name && formData.account_number;
      case 7:
        return Object.values(contractAgreed).every(v => v);
      case 8:
        return true;
      default:
        return true;
    }
  };

  const progress = (currentStep / steps.length) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
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
                    {organizationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Acronym / Short Name</Label>
                <Input
                  placeholder="UoE"
                  value={formData.organization_acronym}
                  onChange={(e) => updateFormData('organization_acronym', e.target.value)}
                />
              </div>
              <div>
                <Label>Year Established</Label>
                <Input
                  type="number"
                  placeholder="1990"
                  value={formData.year_established}
                  onChange={(e) => updateFormData('year_established', e.target.value)}
                />
              </div>
              <div>
                <Label>Registration Number</Label>
                <Input
                  placeholder="REG-12345-2023"
                  value={formData.registration_number}
                  onChange={(e) => updateFormData('registration_number', e.target.value)}
                />
              </div>
              <div>
                <Label>Country *</Label>
                <Input
                  placeholder="United States"
                  value={formData.country}
                  onChange={(e) => updateFormData('country', e.target.value)}
                />
              </div>
              <div>
                <Label>State / Province</Label>
                <Input
                  placeholder="California"
                  value={formData.state_province}
                  onChange={(e) => updateFormData('state_province', e.target.value)}
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  placeholder="Los Angeles"
                  value={formData.city}
                  onChange={(e) => updateFormData('city', e.target.value)}
                />
              </div>
              <div>
                <Label>Postal Code</Label>
                <Input
                  placeholder="90001"
                  value={formData.postal_code}
                  onChange={(e) => updateFormData('postal_code', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Street Address</Label>
                <Input
                  placeholder="123 Education Boulevard"
                  value={formData.street_address}
                  onChange={(e) => updateFormData('street_address', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Website</Label>
                <Input
                  placeholder="https://university.edu"
                  value={formData.website}
                  onChange={(e) => updateFormData('website', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Tell us about your organization, its history, achievements, and educational focus..."
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  rows={4}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Mission Statement</Label>
                <Textarea
                  placeholder="Your organization's mission and vision..."
                  value={formData.mission_statement}
                  onChange={(e) => updateFormData('mission_statement', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Primary Email *</Label>
                <Input
                  type="email"
                  placeholder="admissions@university.edu"
                  value={formData.primary_email}
                  onChange={(e) => updateFormData('primary_email', e.target.value)}
                />
              </div>
              <div>
                <Label>Secondary Email</Label>
                <Input
                  type="email"
                  placeholder="info@university.edu"
                  value={formData.secondary_email}
                  onChange={(e) => updateFormData('secondary_email', e.target.value)}
                />
              </div>
              <div>
                <Label>Primary Phone *</Label>
                <Input
                  placeholder="+1 234 567 8900"
                  value={formData.primary_phone}
                  onChange={(e) => updateFormData('primary_phone', e.target.value)}
                />
              </div>
              <div>
                <Label>Secondary Phone</Label>
                <Input
                  placeholder="+1 234 567 8901"
                  value={formData.secondary_phone}
                  onChange={(e) => updateFormData('secondary_phone', e.target.value)}
                />
              </div>
              <div>
                <Label>Fax Number</Label>
                <Input
                  placeholder="+1 234 567 8902"
                  value={formData.fax_number}
                  onChange={(e) => updateFormData('fax_number', e.target.value)}
                />
              </div>
            </div>

            <Separator />

            <h3 className="font-semibold text-lg">Authorized Contact Person</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  placeholder="Dr. John Smith"
                  value={formData.contact_person_name}
                  onChange={(e) => updateFormData('contact_person_name', e.target.value)}
                />
              </div>
              <div>
                <Label>Title / Position</Label>
                <Input
                  placeholder="Vice Chancellor"
                  value={formData.contact_person_title}
                  onChange={(e) => updateFormData('contact_person_title', e.target.value)}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="john.smith@university.edu"
                  value={formData.contact_person_email}
                  onChange={(e) => updateFormData('contact_person_email', e.target.value)}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  placeholder="+1 234 567 8903"
                  value={formData.contact_person_phone}
                  onChange={(e) => updateFormData('contact_person_phone', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Legal Entity Name *</Label>
                <Input
                  placeholder="University of Excellence Inc."
                  value={formData.legal_entity_name}
                  onChange={(e) => updateFormData('legal_entity_name', e.target.value)}
                />
              </div>
              <div>
                <Label>Legal Entity Type</Label>
                <Select 
                  value={formData.legal_entity_type}
                  onValueChange={(v) => updateFormData('legal_entity_type', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corporation">Corporation</SelectItem>
                    <SelectItem value="nonprofit">Non-Profit</SelectItem>
                    <SelectItem value="government">Government Entity</SelectItem>
                    <SelectItem value="trust">Educational Trust</SelectItem>
                    <SelectItem value="llc">LLC</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tax Identification Number (TIN) *</Label>
                <Input
                  placeholder="XX-XXXXXXX"
                  value={formData.tax_id}
                  onChange={(e) => updateFormData('tax_id', e.target.value)}
                />
              </div>
              <div>
                <Label>VAT / GST Number</Label>
                <Input
                  placeholder="VAT123456789"
                  value={formData.vat_number}
                  onChange={(e) => updateFormData('vat_number', e.target.value)}
                />
              </div>
              <div>
                <Label>Business License Number</Label>
                <Input
                  placeholder="BL-2023-12345"
                  value={formData.business_license_number}
                  onChange={(e) => updateFormData('business_license_number', e.target.value)}
                />
              </div>
              <div>
                <Label>Date of Incorporation</Label>
                <Input
                  type="date"
                  value={formData.incorporation_date}
                  onChange={(e) => updateFormData('incorporation_date', e.target.value)}
                />
              </div>
              <div>
                <Label>Jurisdiction</Label>
                <Input
                  placeholder="State of California, USA"
                  value={formData.jurisdiction}
                  onChange={(e) => updateFormData('jurisdiction', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-6">
              <p className="text-sm text-amber-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Please upload clear, legible copies of all required documents. Accepted formats: PDF, JPG, PNG (max 10MB each)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Certificate of Incorporation *
                </Label>
                <p className="text-xs text-muted-foreground mb-2">Official document of company registration</p>
                <Input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileChange('certificate_of_incorporation', e.target.files?.[0] || null)}
                />
                {documents.certificate_of_incorporation && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    {documents.certificate_of_incorporation.name}
                  </p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Business Registration Certificate
                </Label>
                <p className="text-xs text-muted-foreground mb-2">Local business registration document</p>
                <Input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileChange('business_registration', e.target.files?.[0] || null)}
                />
                {documents.business_registration && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    {documents.business_registration.name}
                  </p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Tax Clearance Certificate
                </Label>
                <p className="text-xs text-muted-foreground mb-2">Proof of tax compliance</p>
                <Input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileChange('tax_clearance_certificate', e.target.files?.[0] || null)}
                />
                {documents.tax_clearance_certificate && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    {documents.tax_clearance_certificate.name}
                  </p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Operating License
                </Label>
                <p className="text-xs text-muted-foreground mb-2">License to operate educational institution</p>
                <Input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileChange('operating_license', e.target.files?.[0] || null)}
                />
                {documents.operating_license && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    {documents.operating_license.name}
                  </p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Government Approval Letter
                </Label>
                <p className="text-xs text-muted-foreground mb-2">Approval from relevant government ministry</p>
                <Input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileChange('government_approval_letter', e.target.files?.[0] || null)}
                />
                {documents.government_approval_letter && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    {documents.government_approval_letter.name}
                  </p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Ministry of Education Certificate
                </Label>
                <p className="text-xs text-muted-foreground mb-2">Recognition from education ministry</p>
                <Input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileChange('ministry_of_education_certificate', e.target.files?.[0] || null)}
                />
                {documents.ministry_of_education_certificate && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    {documents.ministry_of_education_certificate.name}
                  </p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Authorized Signatory ID
                </Label>
                <p className="text-xs text-muted-foreground mb-2">ID of person authorized to sign contracts</p>
                <Input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileChange('authorized_signatory_id', e.target.files?.[0] || null)}
                />
                {documents.authorized_signatory_id && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    {documents.authorized_signatory_id.name}
                  </p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Board Resolution
                </Label>
                <p className="text-xs text-muted-foreground mb-2">Board approval for this partnership</p>
                <Input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileChange('board_resolution', e.target.files?.[0] || null)}
                />
                {documents.board_resolution && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    {documents.board_resolution.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Accreditation Body</Label>
                <Input
                  placeholder="e.g., AACSB, ABET, WASC"
                  value={formData.accreditation_body}
                  onChange={(e) => updateFormData('accreditation_body', e.target.value)}
                />
              </div>
              <div>
                <Label>Accreditation Number</Label>
                <Input
                  placeholder="ACC-2023-12345"
                  value={formData.accreditation_number}
                  onChange={(e) => updateFormData('accreditation_number', e.target.value)}
                />
              </div>
              <div>
                <Label>Accreditation Date</Label>
                <Input
                  type="date"
                  value={formData.accreditation_date}
                  onChange={(e) => updateFormData('accreditation_date', e.target.value)}
                />
              </div>
              <div>
                <Label>Accreditation Expiry</Label>
                <Input
                  type="date"
                  value={formData.accreditation_expiry}
                  onChange={(e) => updateFormData('accreditation_expiry', e.target.value)}
                />
              </div>
              <div>
                <Label>Current Student Enrollment</Label>
                <Select 
                  value={formData.student_enrollment}
                  onValueChange={(v) => updateFormData('student_enrollment', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-500">1 - 500 students</SelectItem>
                    <SelectItem value="501-2000">501 - 2,000 students</SelectItem>
                    <SelectItem value="2001-5000">2,001 - 5,000 students</SelectItem>
                    <SelectItem value="5001-10000">5,001 - 10,000 students</SelectItem>
                    <SelectItem value="10001-25000">10,001 - 25,000 students</SelectItem>
                    <SelectItem value="25001+">25,001+ students</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Faculty Count</Label>
                <Select 
                  value={formData.faculty_count}
                  onValueChange={(v) => updateFormData('faculty_count', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-50">1 - 50 faculty</SelectItem>
                    <SelectItem value="51-200">51 - 200 faculty</SelectItem>
                    <SelectItem value="201-500">201 - 500 faculty</SelectItem>
                    <SelectItem value="501-1000">501 - 1,000 faculty</SelectItem>
                    <SelectItem value="1001+">1,001+ faculty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Number of Campuses</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={formData.campus_count}
                  onChange={(e) => updateFormData('campus_count', e.target.value)}
                />
              </div>
              <div>
                <Label>Programs Offered</Label>
                <Input
                  placeholder="e.g., Undergraduate, Graduate, PhD"
                  value={formData.programs_offered}
                  onChange={(e) => updateFormData('programs_offered', e.target.value)}
                />
              </div>
            </div>

            <Separator />

            <h3 className="font-semibold text-lg">Academic Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Accreditation Certificate
                </Label>
                <Input
                  type="file"
                  accept=".pdf,image/*"
                  className="mt-2"
                  onChange={(e) => handleFileChange('accreditation_certificate', e.target.files?.[0] || null)}
                />
                {documents.accreditation_certificate && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    {documents.accreditation_certificate.name}
                  </p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Quality Assurance Certificate
                </Label>
                <Input
                  type="file"
                  accept=".pdf,image/*"
                  className="mt-2"
                  onChange={(e) => handleFileChange('quality_assurance_certificate', e.target.files?.[0] || null)}
                />
                {documents.quality_assurance_certificate && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    {documents.quality_assurance_certificate.name}
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
                  onChange={(e) => handleFileChange('organization_logo', e.target.files?.[0] || null)}
                />
                {documents.organization_logo && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    {documents.organization_logo.name}
                  </p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Organization Brochure
                </Label>
                <Input
                  type="file"
                  accept=".pdf"
                  className="mt-2"
                  onChange={(e) => handleFileChange('organization_brochure', e.target.files?.[0] || null)}
                />
                {documents.organization_brochure && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    {documents.organization_brochure.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-6">
              <p className="text-sm text-blue-600">
                Banking information is required for revenue sharing. Your organization will receive 80% of all course sales.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Bank Country *</Label>
                <Input
                  placeholder="United States"
                  value={formData.bank_country}
                  onChange={(e) => updateFormData('bank_country', e.target.value)}
                />
              </div>
              <div>
                <Label>Bank Name *</Label>
                <Input
                  placeholder="Bank of America"
                  value={formData.bank_name}
                  onChange={(e) => updateFormData('bank_name', e.target.value)}
                />
              </div>
              <div>
                <Label>Bank Branch</Label>
                <Input
                  placeholder="Main Street Branch"
                  value={formData.bank_branch}
                  onChange={(e) => updateFormData('bank_branch', e.target.value)}
                />
              </div>
              <div>
                <Label>Account Holder Name *</Label>
                <Input
                  placeholder="University of Excellence Inc."
                  value={formData.account_holder_name}
                  onChange={(e) => updateFormData('account_holder_name', e.target.value)}
                />
              </div>
              <div>
                <Label>Account Number *</Label>
                <Input
                  placeholder="XXXXXXXXX"
                  value={formData.account_number}
                  onChange={(e) => updateFormData('account_number', e.target.value)}
                />
              </div>
              <div>
                <Label>Routing Number (US)</Label>
                <Input
                  placeholder="XXXXXXXXX"
                  value={formData.routing_number}
                  onChange={(e) => updateFormData('routing_number', e.target.value)}
                />
              </div>
              <div>
                <Label>SWIFT/BIC Code</Label>
                <Input
                  placeholder="XXXXXXXX"
                  value={formData.swift_code}
                  onChange={(e) => updateFormData('swift_code', e.target.value)}
                />
              </div>
              <div>
                <Label>IBAN (International)</Label>
                <Input
                  placeholder="XXXXXXXXXXXXXXXXXXXX"
                  value={formData.iban}
                  onChange={(e) => updateFormData('iban', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  EDUVERSE ACADEMY Partnership Agreement
                </CardTitle>
                <CardDescription>
                  Please review and accept all terms of the partnership agreement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64 pr-4">
                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-semibold">1. PARTNERSHIP TERMS</h4>
                      <p className="text-muted-foreground mt-1">
                        This Partnership Agreement ("Agreement") is entered into between EDUVERSE ACADEMY ("Platform") 
                        and the educational institution identified in this registration ("Partner"). By accepting this 
                        agreement, Partner agrees to provide quality educational content and maintain high standards 
                        of instruction.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold">2. REVENUE SHARING</h4>
                      <p className="text-muted-foreground mt-1">
                        Partner shall receive 80% of gross revenue from all course sales. Platform retains 20% as 
                        service fee. Payments are processed monthly for transactions above $100. Partner is responsible 
                        for all applicable taxes in their jurisdiction.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold">3. QUALITY STANDARDS</h4>
                      <p className="text-muted-foreground mt-1">
                        Partner commits to maintaining high educational standards, responding to student inquiries 
                        within 48 hours, updating course content regularly, and ensuring all materials are accurate 
                        and free from errors. Courses must meet minimum quality requirements set by Platform.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold">4. CONTENT GUIDELINES</h4>
                      <p className="text-muted-foreground mt-1">
                        All content must be original or properly licensed. Partner warrants they have all necessary 
                        rights to the content. Content must not infringe on third-party intellectual property rights. 
                        Prohibited content includes but is not limited to: hate speech, discrimination, violence, 
                        or any illegal material.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold">5. DATA PROTECTION</h4>
                      <p className="text-muted-foreground mt-1">
                        Partner agrees to comply with all applicable data protection laws including GDPR. Partner 
                        shall not collect, store, or process student personal data outside the Platform without 
                        explicit consent. Partner shall maintain confidentiality of all student information.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold">6. CERTIFICATE ISSUANCE</h4>
                      <p className="text-muted-foreground mt-1">
                        Partner may issue professional certificates verified by EDUVERSE ACADEMY. All certificates 
                        must accurately represent the course content and completion requirements. Partner is 
                        responsible for maintaining certificate authenticity and verification systems.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold">7. DISPUTE RESOLUTION</h4>
                      <p className="text-muted-foreground mt-1">
                        Any disputes shall be resolved through good faith negotiation. If unresolved within 30 days, 
                        disputes shall be submitted to binding arbitration. The arbitration shall be conducted in 
                        accordance with the rules of the International Chamber of Commerce.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold">8. TERMINATION</h4>
                      <p className="text-muted-foreground mt-1">
                        Either party may terminate this agreement with 30 days written notice. Upon termination, 
                        Partner's courses will be removed from the Platform. Outstanding payments will be processed 
                        within 60 days of termination. Student access to purchased courses will continue.
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={contractAgreed.terms}
                  onCheckedChange={(c) => setContractAgreed(prev => ({ ...prev, terms: c === true }))}
                />
                <label htmlFor="terms" className="text-sm">
                  I have read and agree to the <strong>Terms of Service</strong>
                </label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="privacy"
                  checked={contractAgreed.privacy}
                  onCheckedChange={(c) => setContractAgreed(prev => ({ ...prev, privacy: c === true }))}
                />
                <label htmlFor="privacy" className="text-sm">
                  I have read and agree to the <strong>Privacy Policy</strong>
                </label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="partnership"
                  checked={contractAgreed.partnership}
                  onCheckedChange={(c) => setContractAgreed(prev => ({ ...prev, partnership: c === true }))}
                />
                <label htmlFor="partnership" className="text-sm">
                  I accept the <strong>Partnership Agreement</strong> terms above
                </label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="revenue"
                  checked={contractAgreed.revenue_share}
                  onCheckedChange={(c) => setContractAgreed(prev => ({ ...prev, revenue_share: c === true }))}
                />
                <label htmlFor="revenue" className="text-sm">
                  I agree to the <strong>80/20 Revenue Sharing</strong> arrangement
                </label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="quality"
                  checked={contractAgreed.quality_standards}
                  onCheckedChange={(c) => setContractAgreed(prev => ({ ...prev, quality_standards: c === true }))}
                />
                <label htmlFor="quality" className="text-sm">
                  I commit to maintaining <strong>Quality Standards</strong>
                </label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="content"
                  checked={contractAgreed.content_guidelines}
                  onCheckedChange={(c) => setContractAgreed(prev => ({ ...prev, content_guidelines: c === true }))}
                />
                <label htmlFor="content" className="text-sm">
                  I agree to follow <strong>Content Guidelines</strong>
                </label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="dispute"
                  checked={contractAgreed.dispute_resolution}
                  onCheckedChange={(c) => setContractAgreed(prev => ({ ...prev, dispute_resolution: c === true }))}
                />
                <label htmlFor="dispute" className="text-sm">
                  I accept the <strong>Dispute Resolution</strong> process
                </label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="data"
                  checked={contractAgreed.data_protection}
                  onCheckedChange={(c) => setContractAgreed(prev => ({ ...prev, data_protection: c === true }))}
                />
                <label htmlFor="data" className="text-sm">
                  I agree to comply with <strong>Data Protection</strong> requirements
                </label>
              </div>
            </div>

            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-600 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Your signature and agreement are legally binding. This contract is protected and cannot be copied, screenshotted, or reproduced.
              </p>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="p-6 bg-muted rounded-lg text-center">
              <h3 className="font-semibold mb-2">Registration Fee</h3>
              <p className="text-4xl font-bold text-accent">$299.00 USD</p>
              <p className="text-sm text-muted-foreground mt-2">
                One-time registration fee for university partnership setup
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">What's Included:</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  'Multi-instructor management dashboard',
                  'Unlimited course creation',
                  'Bulk course import tools',
                  'Organization branding on certificates',
                  'Professional certificate verification',
                  'Priority support (24/7)',
                  'Custom analytics and reporting',
                  'Revenue sharing (80% to organization)',
                  'Dedicated account manager',
                  'API access for integration',
                  'Custom landing page',
                  'Student management tools',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <PaymentMethodSelector
              amount={299}
              onPaymentComplete={(method) => {
                toast.success(`Payment successful via ${method}`);
                handleSubmit();
              }}
              userType="university"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="container max-w-5xl py-8 px-4">
          <div className="text-center mb-8">
            <Building2 className="h-16 w-16 mx-auto text-accent mb-4" />
            <h1 className="text-3xl font-bold">University & Institution Registration</h1>
            <p className="text-muted-foreground mt-2">
              Partner with EDUVERSE ACADEMY to offer accredited online courses
            </p>
            <Badge variant="secondary" className="mt-2">
              Estimated time: 1 hour
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Registration Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => isCompleted && setCurrentStep(step.id)}
                    disabled={!isCompleted}
                    className={`flex flex-col items-center min-w-[80px] ${
                      isCompleted ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                        isActive
                          ? 'bg-accent text-accent-foreground'
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <span className={`text-xs mt-1 text-center ${isActive ? 'font-semibold' : ''}`}>
                      {step.title}
                    </span>
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-8 h-1 mx-1 rounded ${
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
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const StepIcon = steps[currentStep - 1].icon;
                  return <StepIcon className="h-5 w-5" />;
                })()}
                {steps[currentStep - 1].title}
              </CardTitle>
              <CardDescription>
                Step {currentStep} of {steps.length} - {steps[currentStep - 1].description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderStep()}

              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                
                {currentStep < steps.length ? (
                  <Button
                    onClick={() => setCurrentStep((prev) => Math.min(steps.length, prev + 1))}
                    disabled={!canProceed()}
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !Object.values(contractAgreed).every(v => v)}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Complete Registration'
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </Layout>
  );
}
