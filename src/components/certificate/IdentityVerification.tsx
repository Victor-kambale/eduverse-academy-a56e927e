import { useState, useRef, useCallback } from 'react';
import { 
  Camera, 
  Upload, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Info,
  Image,
  FileText,
  Loader2,
  Eye,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';

interface IdentityVerificationProps {
  onVerified: (verified: boolean, fullName?: string) => void;
  onClose: () => void;
}

interface DocumentRequirement {
  id: string;
  label: string;
  description: string;
}

const documentRequirements: DocumentRequirement[] = [
  { id: 'color', label: '1. Scan or photo must be in color', description: 'Black and white documents will be rejected' },
  { id: 'valid', label: '2. Must be Valid', description: 'Document must not be expired' },
  { id: 'clear', label: '3. Photo must be genuine, clear, unobstructed and unmodified', description: 'No blurry, cropped or edited images' },
  { id: 'info', label: '4. Information must be real, clear and complete', description: 'All text must be readable' }
];

export function IdentityVerification({ onVerified, onClose }: IdentityVerificationProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [step, setStep] = useState<'upload' | 'scanning' | 'error' | 'success'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [extractedName, setExtractedName] = useState('');
  const [showExample, setShowExample] = useState(false);
  const [documentType, setDocumentType] = useState<'passport' | 'id'>('passport');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFileUpload(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedPreview(e.target?.result as string);
      setUploadedFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const simulateDocumentScan = () => {
    setStep('scanning');
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Simulate validation (80% success rate for demo)
          const isValid = Math.random() > 0.2;
          
          if (isValid) {
            // Simulate extracted name
            setExtractedName('Verified User Name');
            setStep('success');
          } else {
            setErrorMessage('The image does not meet the requirements, please click on the image to see an example and re-upload.');
            setStep('error');
          }
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const handleConfirmUpload = () => {
    if (!uploadedFile) {
      toast.error('Please upload a document first');
      return;
    }
    simulateDocumentScan();
  };

  const handleVerificationComplete = () => {
    setIsOpen(false);
    onVerified(true, extractedName);
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const handleRetry = () => {
    setStep('upload');
    setUploadedFile(null);
    setUploadedPreview(null);
    setErrorMessage('');
    setScanProgress(0);
  };

  return (
    <>
      {/* Main Dialog */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {documentType === 'passport' ? 'Passport for international user' : 'National ID Verification'}
            </DialogTitle>
            <DialogDescription>
              Please submit an identification document showing the account holder's personal information.
            </DialogDescription>
          </DialogHeader>

          {/* Document Type Selector */}
          <Tabs value={documentType} onValueChange={(v) => setDocumentType(v as 'passport' | 'id')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="passport">Passport</TabsTrigger>
              <TabsTrigger value="id">National ID</TabsTrigger>
            </TabsList>
          </Tabs>

          {step === 'upload' && (
            <div className="space-y-6">
              {/* Example Section */}
              <Card className="border-dashed border-primary/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-primary" />
                      <span className="font-medium">Evidence Example:</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowExample(true)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Example
                    </Button>
                  </div>
                  
                  {/* Requirements List */}
                  <div className="space-y-2 text-sm">
                    {documentRequirements.map((req) => (
                      <div key={req.id} className="flex items-start gap-2 p-2 rounded bg-muted/30">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">{req.id === 'color' ? '1' : req.id === 'valid' ? '2' : req.id === 'clear' ? '3' : '4'}</span>
                        </div>
                        <div>
                          <p className="font-medium">{req.label}</p>
                          <p className="text-xs text-muted-foreground">{req.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upload Area */}
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                } ${uploadedPreview ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}`}
              >
                <input {...getInputProps()} />
                
                {uploadedPreview ? (
                  <div className="space-y-4">
                    <img 
                      src={uploadedPreview} 
                      alt="Uploaded document" 
                      className="max-h-48 mx-auto rounded-lg shadow-md"
                    />
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span>Document uploaded successfully</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRetry();
                      }}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remove & Upload Different
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Drop your document here or click to upload</p>
                      <p className="text-sm text-muted-foreground">
                        Supports: JPG, PNG, WEBP (Max 10MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tips */}
              <Alert>
                <Info className="w-4 h-4" />
                <AlertTitle>Tips:</AlertTitle>
                <AlertDescription>
                  Please submit an identification document showing the account holder's personal information.
                  Ensure the document is clear, well-lit, and all information is visible.
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleCameraCapture}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Camera
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleConfirmUpload}
                  disabled={!uploadedFile}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm & Verify
                </Button>
              </div>
            </div>
          )}

          {step === 'scanning' && (
            <div className="py-12 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Scanning Document...</h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while we verify your identification document.
                </p>
              </div>
              <div className="max-w-xs mx-auto space-y-2">
                <Progress value={scanProgress} className="h-2" />
                <p className="text-sm text-muted-foreground">{scanProgress}%</p>
              </div>
              <div className="text-xs text-muted-foreground">
                <p>• Checking document authenticity</p>
                <p>• Extracting personal information</p>
                <p>• Verifying image quality</p>
              </div>
            </div>
          )}

          {step === 'error' && (
            <div className="py-8 space-y-6">
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertTitle>Reminder</AlertTitle>
                <AlertDescription>
                  <p className="font-medium mb-2">
                    【{documentType === 'passport' ? 'Passport, Id for international user' : 'National ID'}】
                  </p>
                  <p>{errorMessage}</p>
                </AlertDescription>
              </Alert>

              <div 
                className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setShowExample(true)}
              >
                <div className="flex items-center gap-2 text-primary">
                  <Eye className="w-4 h-4" />
                  <span className="font-medium">Click here to see an example</span>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleRetry}>
                  Try Again
                </Button>
              </DialogFooter>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-green-600">Verification Successful!</h3>
                <p className="text-sm text-muted-foreground">
                  Your identity has been verified successfully.
                </p>
              </div>
              
              <Card className="max-w-sm mx-auto">
                <CardContent className="p-4">
                  <Label className="text-xs text-muted-foreground">Verified Name</Label>
                  <Input 
                    value={extractedName}
                    onChange={(e) => setExtractedName(e.target.value)}
                    placeholder="Enter your full name as it appears on your ID"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Please ensure this matches your passport or ID exactly.
                  </p>
                </CardContent>
              </Card>

              <DialogFooter className="justify-center">
                <Button onClick={handleVerificationComplete} className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Continue with Verification
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Example Dialog */}
      <Dialog open={showExample} onOpenChange={setShowExample}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {documentType === 'passport' ? 'Passport' : 'National ID'} Example
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-primary/30 rounded-lg p-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 space-y-4">
                {/* Passport Mock */}
                <div className="flex gap-4">
                  <div className="w-24 h-28 bg-muted rounded flex items-center justify-center">
                    <Image className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium">PA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Country Code</span>
                      <span className="font-medium">XXX</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Passport No.</span>
                      <span className="font-medium">K1234567H</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium">JOHN DOE</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nationality</span>
                      <span className="font-medium">XXXX CITIZEN</span>
                    </div>
                  </div>
                </div>

                {/* Requirement Labels */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">
                    1. Scan or photo must be in color
                  </div>
                  <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">
                    2. Must be Valid
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded col-span-2">
                    3. Photo must be genuine, clear, unobstructed and unmodified
                  </div>
                </div>
              </div>
            </div>

            <Alert>
              <Info className="w-4 h-4" />
              <AlertTitle>Tips:</AlertTitle>
              <AlertDescription>
                Please submit an identification document showing the account holder's personal information.
                Ensure the document is well-lit and all text is clearly readable.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExample(false)}>
              Close
            </Button>
            <Button onClick={() => setShowExample(false)}>
              <Download className="w-4 h-4 mr-2" />
              Got It
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default IdentityVerification;
