import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Upload,
  Eye,
  RefreshCw,
  Shield,
  Award,
  Building2,
  CreditCard,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface DocumentStatus {
  id: string;
  name: string;
  category: 'government' | 'academic' | 'identity' | 'other';
  status: 'pending' | 'uploaded' | 'under_review' | 'approved' | 'rejected';
  file?: File | null;
  rejectionReason?: string;
  uploadedAt?: Date;
  reviewedAt?: Date;
  required: boolean;
}

interface DocumentStatusDashboardProps {
  documents: Record<string, File | null>;
  documentValidation?: Record<string, boolean>;
  onReupload?: (documentId: string) => void;
}

const documentConfig: Omit<DocumentStatus, 'file' | 'status'>[] = [
  // Government Documents
  { id: 'certificate_of_incorporation', name: 'Certificate of Incorporation', category: 'government', required: true },
  { id: 'business_registration', name: 'Business Registration', category: 'government', required: true },
  { id: 'tax_clearance_certificate', name: 'Tax Clearance Certificate', category: 'government', required: true },
  { id: 'operating_license', name: 'Operating License', category: 'government', required: false },
  { id: 'government_approval_letter', name: 'Government Approval Letter', category: 'government', required: false },
  { id: 'ministry_of_education_certificate', name: 'Ministry of Education Certificate', category: 'government', required: true },
  
  // Academic Documents
  { id: 'accreditation_certificate', name: 'Accreditation Certificate', category: 'academic', required: true },
  { id: 'quality_assurance_certificate', name: 'Quality Assurance Certificate', category: 'academic', required: false },
  { id: 'academic_charter', name: 'Academic Charter', category: 'academic', required: false },
  { id: 'program_approval_documents', name: 'Program Approval Documents', category: 'academic', required: false },
  
  // Identity Documents
  { id: 'authorized_signatory_id', name: 'Authorized Signatory ID', category: 'identity', required: true },
  { id: 'board_resolution', name: 'Board Resolution', category: 'identity', required: true },
  { id: 'power_of_attorney', name: 'Power of Attorney', category: 'identity', required: false },
  
  // Other Documents
  { id: 'organization_logo', name: 'Organization Logo', category: 'other', required: false },
  { id: 'organization_brochure', name: 'Organization Brochure', category: 'other', required: false },
];

const categoryInfo = {
  government: { icon: Building2, label: 'Government Documents', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
  academic: { icon: Award, label: 'Academic Documents', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
  identity: { icon: Users, label: 'Identity Documents', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  other: { icon: FileText, label: 'Other Documents', color: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30' },
};

const statusConfig = {
  pending: { icon: Clock, label: 'Not Uploaded', color: 'text-muted-foreground bg-muted' },
  uploaded: { icon: Upload, label: 'Uploaded', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
  under_review: { icon: Eye, label: 'Under Review', color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
  approved: { icon: CheckCircle2, label: 'Approved', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  rejected: { icon: XCircle, label: 'Rejected', color: 'text-destructive bg-destructive/10' },
};

export function DocumentStatusDashboard({
  documents,
  documentValidation = {},
  onReupload,
}: DocumentStatusDashboardProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['government', 'academic', 'identity']);

  const documentStatuses = useMemo(() => {
    return documentConfig.map((doc) => {
      const file = documents[doc.id];
      const isValidated = documentValidation[doc.id];
      
      let status: DocumentStatus['status'] = 'pending';
      if (file) {
        if (isValidated === true) {
          status = 'approved';
        } else if (isValidated === false) {
          status = 'rejected';
        } else {
          status = 'uploaded';
        }
      }
      
      return {
        ...doc,
        file,
        status,
        uploadedAt: file ? new Date() : undefined,
      } as DocumentStatus;
    });
  }, [documents, documentValidation]);

  const groupedDocuments = useMemo(() => {
    const groups: Record<string, DocumentStatus[]> = {
      government: [],
      academic: [],
      identity: [],
      other: [],
    };
    
    documentStatuses.forEach((doc) => {
      groups[doc.category].push(doc);
    });
    
    return groups;
  }, [documentStatuses]);

  const stats = useMemo(() => {
    const total = documentStatuses.length;
    const required = documentStatuses.filter(d => d.required).length;
    const uploaded = documentStatuses.filter(d => d.status !== 'pending').length;
    const approved = documentStatuses.filter(d => d.status === 'approved').length;
    const rejected = documentStatuses.filter(d => d.status === 'rejected').length;
    const requiredUploaded = documentStatuses.filter(d => d.required && d.status !== 'pending').length;
    
    return {
      total,
      required,
      uploaded,
      approved,
      rejected,
      requiredUploaded,
      uploadProgress: (uploaded / total) * 100,
      requiredProgress: (requiredUploaded / required) * 100,
    };
  }, [documentStatuses]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Document Verification Status</CardTitle>
                <CardDescription>Track the status of all required documents</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {stats.uploaded}/{stats.total} Uploaded
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{stats.uploaded}</p>
                <p className="text-xs text-muted-foreground">Uploaded</p>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
              <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                <p className="text-2xl font-bold text-amber-600">{stats.uploaded - stats.approved - stats.rejected}</p>
                <p className="text-xs text-muted-foreground">Pending Review</p>
              </div>
              <div className="text-center p-3 bg-destructive/10 rounded-lg">
                <p className="text-2xl font-bold text-destructive">{stats.rejected}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{Math.round(stats.uploadProgress)}%</span>
              </div>
              <Progress value={stats.uploadProgress} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Required Documents</span>
                <span className="font-medium">{stats.requiredUploaded}/{stats.required}</span>
              </div>
              <Progress 
                value={stats.requiredProgress} 
                className="h-2"
              />
            </div>
          </div>
          
          <Separator />
          
          {/* Document Categories */}
          <div className="space-y-4">
            {Object.entries(groupedDocuments).map(([category, docs]) => {
              const categoryConfig = categoryInfo[category as keyof typeof categoryInfo];
              const CategoryIcon = categoryConfig.icon;
              const isExpanded = expandedCategories.includes(category);
              const categoryUploaded = docs.filter(d => d.status !== 'pending').length;
              const categoryApproved = docs.filter(d => d.status === 'approved').length;
              
              return (
                <Collapsible
                  key={category}
                  open={isExpanded}
                  onOpenChange={() => toggleCategory(category)}
                >
                  <Card className="overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={cn('p-2 rounded-lg', categoryConfig.color)}>
                            <CategoryIcon className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium">{categoryConfig.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {categoryUploaded}/{docs.length} uploaded • {categoryApproved} verified
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={categoryUploaded === docs.length ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {Math.round((categoryUploaded / docs.length) * 100)}%
                          </Badge>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="border-t">
                        {docs.map((doc, index) => {
                          const StatusIcon = statusConfig[doc.status].icon;
                          
                          return (
                            <motion.div
                              key={doc.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className={cn(
                                'flex items-center justify-between p-3 sm:p-4',
                                index !== docs.length - 1 && 'border-b'
                              )}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={cn(
                                  'p-1.5 rounded-full',
                                  statusConfig[doc.status].color
                                )}>
                                  <StatusIcon className="h-3.5 w-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm truncate">{doc.name}</p>
                                    {doc.required && (
                                      <Badge variant="outline" className="text-[10px] shrink-0">
                                        Required
                                      </Badge>
                                    )}
                                  </div>
                                  {doc.file && (
                                    <p className="text-xs text-muted-foreground">
                                      {doc.file.name} • {formatFileSize(doc.file.size)}
                                    </p>
                                  )}
                                  {doc.status === 'rejected' && doc.rejectionReason && (
                                    <p className="text-xs text-destructive mt-1">
                                      {doc.rejectionReason}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 shrink-0">
                                <Badge 
                                  variant="secondary"
                                  className={cn('text-xs', statusConfig[doc.status].color)}
                                >
                                  {statusConfig[doc.status].label}
                                </Badge>
                                {(doc.status === 'rejected' || doc.status === 'pending') && onReupload && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onReupload(doc.id)}
                                    className="h-7 text-xs"
                                  >
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    {doc.status === 'pending' ? 'Upload' : 'Reupload'}
                                  </Button>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 pt-2">
            {Object.entries(statusConfig).map(([status, config]) => {
              const Icon = config.icon;
              return (
                <div key={status} className="flex items-center gap-1.5 text-xs">
                  <div className={cn('p-1 rounded', config.color)}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <span className="text-muted-foreground">{config.label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
