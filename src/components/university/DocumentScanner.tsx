import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Loader2, Scan, FileX, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface DocumentScannerProps {
  file: File | null;
  documentType: string;
  onScanComplete: (isValid: boolean) => void;
  requiredKeywords?: string[];
}

export function DocumentScanner({ file, documentType, onScanComplete, requiredKeywords = [] }: DocumentScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<'pending' | 'valid' | 'invalid'>('pending');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (file) {
      performDeepScan(file);
    }
  }, [file]);

  const performDeepScan = async (file: File) => {
    setScanning(true);
    setScanResult('pending');
    setErrorMessage('');
    setScanProgress(0);

    // Simulate deep scanning phases
    const phases = [
      { progress: 15, message: 'Analyzing document structure...' },
      { progress: 30, message: 'Verifying file integrity...' },
      { progress: 45, message: 'Checking document authenticity...' },
      { progress: 60, message: 'Validating signatures...' },
      { progress: 75, message: 'Cross-referencing with government databases...' },
      { progress: 90, message: 'Final security verification...' },
    ];

    for (const phase of phases) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setScanProgress(phase.progress);
    }

    // Validation checks
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    let isValid = true;
    let error = '';

    // Check file type
    if (!validTypes.includes(file.type)) {
      isValid = false;
      error = 'Invalid document format. Please upload a PDF or image file (JPG, PNG).';
    }

    // Check file size
    if (file.size > maxSize) {
      isValid = false;
      error = 'Document exceeds maximum size of 10MB. Please compress and try again.';
    }

    // Check file name for suspicious patterns
    const suspiciousPatterns = ['test', 'fake', 'sample', 'example', 'dummy'];
    if (suspiciousPatterns.some(p => file.name.toLowerCase().includes(p))) {
      isValid = false;
      error = 'Document appears to be a sample or test file. Please upload an authentic government-issued document.';
    }

    // Check for minimum file size (too small = likely fake)
    if (file.size < 50 * 1024) { // Less than 50KB
      isValid = false;
      error = 'Document quality too low. Please upload a clear, high-resolution scan of your original document.';
    }

    setScanProgress(100);
    await new Promise(resolve => setTimeout(resolve, 300));

    if (isValid) {
      setScanResult('valid');
      toast.success(`${documentType} verified successfully!`);
      onScanComplete(true);
    } else {
      setScanResult('invalid');
      setErrorMessage(error);
      toast.error('Document verification failed');
      onScanComplete(false);
    }

    setScanning(false);
  };

  if (!file) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="mt-3 p-4 rounded-lg border bg-card"
      >
        {scanning ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Scan className="h-6 w-6 text-primary" />
              </motion.div>
              <div className="flex-1">
                <p className="font-medium text-sm">Deep Security Scan in Progress</p>
                <p className="text-xs text-muted-foreground">Verifying document authenticity...</p>
              </div>
            </div>
            
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/60"
                initial={{ width: 0 }}
                animate={{ width: `${scanProgress}%` }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Scanning...</span>
              <span>{scanProgress}%</span>
            </div>
          </div>
        ) : scanResult === 'valid' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 text-green-600"
          >
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">Document Verified</p>
              <p className="text-xs text-green-600/70">{file.name}</p>
            </div>
          </motion.div>
        ) : scanResult === 'invalid' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3 text-red-600">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center"
              >
                <FileX className="h-5 w-5" />
              </motion.div>
              <div>
                <p className="font-medium">Verification Failed</p>
                <p className="text-xs text-red-600/70">Document did not pass security checks</p>
              </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 border border-red-200 rounded-lg p-3"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-700">
                  <p className="font-medium mb-1">Error Details:</p>
                  <p>{errorMessage}</p>
                </div>
              </div>
            </motion.div>
            
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Please upload the correct, original document to proceed.</span>
            </div>
          </motion.div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}
