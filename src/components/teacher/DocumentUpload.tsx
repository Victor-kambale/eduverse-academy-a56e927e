import { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  Image, 
  CheckCircle2, 
  AlertCircle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentUploadProps {
  documents: {
    idDocument: File | null;
    passport: File | null;
    graduationDegree: File | null;
    cv: File | null;
    photo: File | null;
  };
  onUpdate: (docType: keyof DocumentUploadProps['documents'], file: File | null) => void;
}

const documentTypes = [
  { 
    key: 'idDocument' as const, 
    label: 'ID Card / National ID', 
    description: 'Scan of your national ID card',
    accept: 'image/*,.pdf',
    icon: FileText,
    required: false
  },
  { 
    key: 'passport' as const, 
    label: 'Passport', 
    description: 'Scan of your passport (main page)',
    accept: 'image/*,.pdf',
    icon: FileText,
    required: false
  },
  { 
    key: 'graduationDegree' as const, 
    label: 'Graduation Degree / Diploma', 
    description: 'Scan of your highest degree certificate',
    accept: 'image/*,.pdf',
    icon: FileText,
    required: true
  },
  { 
    key: 'cv' as const, 
    label: 'Curriculum Vitae (CV)', 
    description: 'Your professional CV/Resume',
    accept: '.pdf,.doc,.docx',
    icon: FileText,
    required: true
  },
  { 
    key: 'photo' as const, 
    label: 'Professional Photo', 
    description: 'A professional headshot for your profile',
    accept: 'image/*',
    icon: Image,
    required: true
  },
];

export const DocumentUpload = ({ documents, onUpdate }: DocumentUploadProps) => {
  const handleFileChange = useCallback((
    docType: keyof DocumentUploadProps['documents'], 
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;
    onUpdate(docType, file);
  }, [onUpdate]);

  const handleRemove = (docType: keyof DocumentUploadProps['documents']) => {
    onUpdate(docType, null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-1">Document Security Notice</p>
            <p className="text-muted-foreground">
              All documents are encrypted and stored securely. They will only be reviewed by authorized 
              Eduverse administrators for verification purposes. Required documents are marked with *.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {documentTypes.map((doc) => {
          const file = documents[doc.key];
          const hasFile = !!file;

          return (
            <Card key={doc.key} className={hasFile ? 'border-success' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${hasFile ? 'bg-success/20' : 'bg-muted'}`}>
                      <doc.icon className={`w-5 h-5 ${hasFile ? 'text-success' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Label className="font-medium">
                          {doc.label} {doc.required && <span className="text-destructive">*</span>}
                        </Label>
                        {hasFile && (
                          <Badge variant="default" className="text-xs bg-success">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Uploaded
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{doc.description}</p>
                      
                      {hasFile ? (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground truncate max-w-[200px]">
                            {file.name}
                          </span>
                          <span className="text-muted-foreground">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-destructive hover:text-destructive"
                            onClick={() => handleRemove(doc.key)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="relative">
                          <Input
                            type="file"
                            accept={doc.accept}
                            onChange={(e) => handleFileChange(doc.key, e)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="flex items-center gap-2 p-3 border-2 border-dashed rounded-lg text-muted-foreground hover:border-accent hover:text-accent transition-colors cursor-pointer">
                            <Upload className="w-4 h-4" />
                            <span className="text-sm">Click to upload or drag and drop</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-sm text-muted-foreground">
        <p><strong>Note:</strong> You must provide at least one of: ID Card OR Passport</p>
        <p className="mt-1">Accepted formats: PDF, JPG, PNG, DOC, DOCX (max 10MB per file)</p>
      </div>
    </div>
  );
};
