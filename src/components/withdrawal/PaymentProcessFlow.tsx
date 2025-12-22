import { useState, useEffect } from 'react';
import { 
  Check, 
  Phone, 
  DollarSign, 
  Clock,
  AlertTriangle,
  ChevronRight,
  Mail,
  ExternalLink,
  Shield,
  Receipt,
  Loader2,
  CheckCircle2,
  Circle,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentProcessFlowProps {
  transactionData: {
    id: string;
    amount: number;
    fee: number;
    paymentMethod: string;
    mobileNumber?: string;
    category: string;
    userEmail?: string;
  };
  onComplete: () => void;
  onCancel: () => void;
}

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  timestamp?: string;
}

export const PaymentProcessFlow = ({ 
  transactionData, 
  onComplete, 
  onCancel 
}: PaymentProcessFlowProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [pinCode, setPinCode] = useState('');
  const [pinAttempts, setPinAttempts] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId] = useState(`MP${format(new Date(), 'yyMMdd')}.${format(new Date(), 'HHmm')}.${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
  const [batchId] = useState(`DEP${Math.random().toString(36).substring(2, 15).toUpperCase()}`);
  
  const [timeline, setTimeline] = useState<TimelineStep[]>([
    { id: '1', title: 'Transaction Initiated', description: 'Your payment request has been received', status: 'completed', timestamp: format(new Date(), 'HH:mm') },
    { id: '2', title: 'Submitted for processing', description: 'Verifying account details', status: 'pending' },
    { id: '3', title: `Listening for payment`, description: `Waiting for USD ${transactionData.amount.toFixed(2)} confirmation`, status: 'pending' },
    { id: '4', title: 'Payment sent to Provider', description: 'Connecting to payment gateway', status: 'pending' },
    { id: '5', title: 'Transaction successful', description: 'Your payment has been processed', status: 'pending' },
  ]);

  const debitedAmount = transactionData.amount + transactionData.fee;
  const creditedAmount = transactionData.amount;

  const updateTimeline = (stepIndex: number, status: TimelineStep['status']) => {
    setTimeline(prev => prev.map((step, idx) => 
      idx === stepIndex 
        ? { ...step, status, timestamp: status === 'completed' ? format(new Date(), 'HH:mm') : step.timestamp }
        : step
    ));
  };

  const handlePinSubmit = async () => {
    if (pinCode.length !== 4) {
      toast.error('Please enter your 4-digit PIN');
      return;
    }

    setIsProcessing(true);
    
    // Simulate PIN verification
    await new Promise(resolve => setTimeout(resolve, 1500));

    // For demo, PIN "1234" is correct
    if (pinCode === '1234') {
      setCurrentStep(2);
      startPaymentProcessing();
    } else {
      const newAttempts = pinAttempts + 1;
      setPinAttempts(newAttempts);
      setPinCode('');

      if (newAttempts >= 2) {
        toast.error('Too many failed attempts! 20% fee will be applied.');
        // In production, this would trigger the 20% fee deduction
      } else {
        toast.error(`Invalid PIN. ${2 - newAttempts} attempts remaining.`);
      }
    }
    
    setIsProcessing(false);
  };

  const startPaymentProcessing = async () => {
    // Step by step processing animation
    for (let i = 1; i < timeline.length; i++) {
      updateTimeline(i, 'processing');
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateTimeline(i, 'completed');
    }
    
    // Show success step
    setCurrentStep(3);
  };

  const getStatusIcon = (status: TimelineStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground/30" />;
    }
  };

  // Step 1: PIN Confirmation
  if (currentStep === 1) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        <Card className="border-2 border-accent/20">
          <CardHeader className="text-center bg-gradient-to-br from-accent/10 to-accent/5">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
              <Shield className="h-8 w-8 text-accent" />
            </div>
            <CardTitle>Confirm Payment</CardTitle>
            <CardDescription>
              Enter your PIN to confirm the payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-lg">${transactionData.amount.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fee</span>
                <span>${transactionData.fee.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2 mt-2">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold">${debitedAmount.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">To</span>
                <span className="font-medium">EDUVERSE COMPANY</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Enter your PIN to confirm</label>
              <Input
                type="password"
                maxLength={4}
                placeholder="••••"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest"
              />
              {pinAttempts > 0 && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  {2 - pinAttempts} attempt{2 - pinAttempts !== 1 ? 's' : ''} remaining
                </p>
              )}
            </div>

            {transactionData.paymentMethod === 'mobile_money' && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                <AlertTriangle className="inline h-4 w-4 mr-1" />
                Amount will be converted to USD automatically. Failed attempts (2+) result in 20% fee.
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handlePinSubmit}
                disabled={pinCode.length !== 4 || isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Confirm Payment'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Step 2: Processing with Timeline
  if (currentStep === 2) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto"
      >
        <Card className="border-2 border-blue-500/20">
          <CardHeader className="text-center bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <Loader2 className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-spin" />
            <CardTitle>Processing Payment</CardTitle>
            <CardDescription>Please wait while we process your transaction</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-1">
              {timeline.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                    step.status === 'processing' ? 'bg-blue-50 border border-blue-200' :
                    step.status === 'completed' ? 'bg-green-50/50' : ''
                  }`}
                >
                  <div className="mt-0.5">
                    {getStatusIcon(step.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`font-medium ${
                        step.status === 'completed' ? 'text-green-700' :
                        step.status === 'processing' ? 'text-blue-700' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </p>
                      {step.timestamp && (
                        <span className="text-xs text-muted-foreground">{step.timestamp}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Step 3: Success & Receipt
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-lg mx-auto"
    >
      <Card className="border-2 border-green-500/20 overflow-hidden">
        <CardHeader className="text-center bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="h-10 w-10 text-white" />
            </div>
          </motion.div>
          <CardTitle className="text-2xl text-green-700">Transaction Successful!</CardTitle>
          <CardDescription>Your payment has been processed successfully</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          {/* Amount Display */}
          <div className="text-center py-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl">
            <p className="text-4xl font-bold">${creditedAmount.toFixed(2)}</p>
            <p className="text-muted-foreground">Credited Amount</p>
          </div>

          {/* Transaction Details */}
          <div className="space-y-3 p-4 bg-muted/50 rounded-xl">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Transaction
              </span>
              <span className="font-mono text-sm font-medium">{batchId}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground">Transaction Reference</span>
              <span className="font-mono text-sm font-medium">{transactionId}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground">Transaction Status</span>
              <Badge className="bg-green-500 text-white">Completed</Badge>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground">Account Name</span>
              <span className="font-medium">
                {transactionData.paymentMethod === 'mobile_money' ? 'Mobile Money' : 
                 transactionData.paymentMethod.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            
            {transactionData.mobileNumber && (
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">Account Number</span>
                <span className="font-mono">{transactionData.mobileNumber}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground">Transaction Type</span>
              <span className="font-medium uppercase">{transactionData.category.replace('_', ' ')}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground">Charges</span>
              <span className="font-medium">${transactionData.fee.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground">Debited Amount</span>
              <span className="font-medium">${debitedAmount.toFixed(2)} USD</span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground font-medium">Credited Amount</span>
              <span className="font-bold text-green-600 text-lg">${creditedAmount.toFixed(2)} USD</span>
            </div>
          </div>

          {/* Transaction Timeline */}
          <div className="p-4 border rounded-xl">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Transaction Timeline
            </h4>
            <div className="space-y-3">
              {timeline.filter(s => s.status === 'completed').map((step, index) => (
                <div key={step.id} className="flex items-center gap-3 text-sm">
                  <div className="w-12 text-muted-foreground">{step.timestamp}</div>
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <div className="flex-1 text-green-700">{step.title}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Important Disclosures */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Important Disclosures
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• You will receive a confirmation email at {transactionData.userEmail}</li>
              <li>• Check your phone for the SMS receipt</li>
              <li>• Transaction reference: {transactionId}</li>
            </ul>
          </div>

          {/* Message Preview */}
          <div className="p-4 bg-muted rounded-xl border">
            <p className="text-sm font-mono text-muted-foreground">
              <span className="text-green-600 font-medium">SMS NOTIFICATION:</span><br />
              TID: {transactionId}. Dear customer, you have successfully transferred {creditedAmount.toFixed(4)} USD to EDUVERSE. Your new balance: **.** USD. 
              <br /><br />
              View your receipt at: eduverse.com/receipt/{batchId}
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onComplete} className="flex-1">
              <Mail className="h-4 w-4 mr-2" />
              View in Email
            </Button>
            <Button onClick={onComplete} className="flex-1">
              <Check className="h-4 w-4 mr-2" />
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
