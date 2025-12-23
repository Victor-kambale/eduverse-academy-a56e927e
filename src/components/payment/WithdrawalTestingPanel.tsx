import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Building, 
  CheckCircle, 
  Clock, 
  GraduationCap, 
  Loader2, 
  Play, 
  RefreshCw, 
  Shield, 
  Users, 
  XCircle,
  Wallet,
  CreditCard,
  Phone,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';
import { QRPaymentModal } from './QRPaymentModal';

interface TestResult {
  id: string;
  userType: 'admin' | 'teacher' | 'university';
  paymentMethod: string;
  status: 'pending' | 'success' | 'failed';
  steps: { name: string; status: 'pending' | 'running' | 'success' | 'failed' }[];
  timestamp: Date;
  amount: number;
  error?: string;
}

const paymentMethods = [
  { id: 'paypal', name: 'PayPal', icon: Wallet, color: 'bg-blue-500' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: Building, color: 'bg-green-500' },
  { id: 'stripe', name: 'Stripe', icon: CreditCard, color: 'bg-purple-500' },
  { id: 'google_pay', name: 'Google Pay', icon: Wallet, color: 'bg-red-500' },
  { id: 'apple_pay', name: 'Apple Pay', icon: Wallet, color: 'bg-gray-800' },
  { id: 'wechat', name: 'WeChat Pay', icon: Smartphone, color: 'bg-green-600' },
  { id: 'alipay', name: 'Alipay', icon: Smartphone, color: 'bg-blue-600' },
  { id: 'mobile_money', name: 'Mobile Money', icon: Phone, color: 'bg-yellow-500' },
];

const withdrawalSteps = {
  admin: ['Select Category', 'Enter Amount', 'Payment Details', 'SMS Verification', 'Process Payment'],
  teacher: ['Select Category', 'Enter Amount', 'Payment Details', 'Upload ID', 'Upload Contract', 'SMS Verification', 'Submit Request'],
  university: ['Select Category', 'Enter Amount', 'Payment Details', 'Upload Institution Docs', 'Upload Contract', 'Signatory Verification', 'SMS Verification', 'Submit Request'],
};

export function WithdrawalTestingPanel() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<TestResult | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrPaymentMethod, setQrPaymentMethod] = useState<'wechat' | 'alipay'>('wechat');

  const runWithdrawalTest = async (userType: 'admin' | 'teacher' | 'university', paymentMethod: string) => {
    const testId = `test-${Date.now()}`;
    const steps = withdrawalSteps[userType].map(name => ({ name, status: 'pending' as const }));
    
    const newTest: TestResult = {
      id: testId,
      userType,
      paymentMethod,
      status: 'pending',
      steps,
      timestamp: new Date(),
      amount: Math.floor(Math.random() * 500) + 50,
    };

    setCurrentTest(newTest);
    setIsRunning(true);

    // Open QR modal for WeChat/Alipay
    if (paymentMethod === 'wechat' || paymentMethod === 'alipay') {
      setQrPaymentMethod(paymentMethod);
      setQrModalOpen(true);
    }

    // Simulate step-by-step progress
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setCurrentTest(prev => {
        if (!prev) return null;
        const newSteps = [...prev.steps];
        newSteps[i] = { ...newSteps[i], status: 'running' };
        return { ...prev, steps: newSteps };
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      // Randomly fail some steps for testing
      const shouldFail = Math.random() < 0.1;
      
      setCurrentTest(prev => {
        if (!prev) return null;
        const newSteps = [...prev.steps];
        newSteps[i] = { ...newSteps[i], status: shouldFail ? 'failed' : 'success' };
        
        if (shouldFail) {
          return { 
            ...prev, 
            steps: newSteps, 
            status: 'failed',
            error: `Failed at step: ${newSteps[i].name}`
          };
        }
        return { ...prev, steps: newSteps };
      });

      if (shouldFail) {
        setIsRunning(false);
        toast.error(`Test failed at: ${steps[i].name}`);
        setTestResults(prev => [...prev, { ...newTest, steps, status: 'failed', error: `Failed at: ${steps[i].name}` }]);
        return;
      }
    }

    setCurrentTest(prev => prev ? { ...prev, status: 'success' } : null);
    setTestResults(prev => [...prev, { ...newTest, steps: steps.map(s => ({ ...s, status: 'success' as const })), status: 'success' }]);
    setIsRunning(false);
    toast.success('Withdrawal test completed successfully!');
    
    // Play success sound
    const audio = new Audio('/sounds/success.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setCurrentTest(null);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="admin" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="admin" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Admin Tests
          </TabsTrigger>
          <TabsTrigger value="teacher" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Teacher Tests
          </TabsTrigger>
          <TabsTrigger value="university" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            University Tests
          </TabsTrigger>
        </TabsList>

        {(['admin', 'teacher', 'university'] as const).map(userType => (
          <TabsContent key={userType} value={userType} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {paymentMethods.map(method => {
                const Icon = method.icon;
                return (
                  <Button
                    key={method.id}
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => runWithdrawalTest(userType, method.id)}
                    disabled={isRunning}
                  >
                    <div className={`w-10 h-10 rounded-lg ${method.color} flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs font-medium">{method.name}</span>
                    <Badge variant="secondary" className="text-xs">Test</Badge>
                  </Button>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Current Test Progress */}
      {currentTest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Test in Progress
              </span>
              <Badge variant={currentTest.status === 'success' ? 'default' : currentTest.status === 'failed' ? 'destructive' : 'secondary'}>
                {currentTest.status}
              </Badge>
            </CardTitle>
            <CardDescription>
              {currentTest.userType.charAt(0).toUpperCase() + currentTest.userType.slice(1)} withdrawal via {currentTest.paymentMethod} - ${currentTest.amount}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentTest.steps.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  {getStatusIcon(step.status)}
                  <span className={step.status === 'running' ? 'font-medium text-blue-600' : ''}>{step.name}</span>
                  {step.status === 'running' && <Progress value={50} className="flex-1 max-w-xs" />}
                </div>
              ))}
            </div>
            {currentTest.error && (
              <p className="text-sm text-destructive mt-4 p-2 bg-destructive/10 rounded">{currentTest.error}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>{testResults.length} tests completed</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={clearResults}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-auto">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <p className="font-medium text-sm">
                        {result.userType.charAt(0).toUpperCase() + result.userType.slice(1)} - {result.paymentMethod}
                      </p>
                      <p className="text-xs text-muted-foreground">${result.amount}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                      {result.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {result.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Payment Modal for Testing */}
      <QRPaymentModal
        open={qrModalOpen}
        onOpenChange={setQrModalOpen}
        paymentMethod={qrPaymentMethod}
        amount={currentTest?.amount || 100}
        isTest={true}
        onPaymentComplete={() => {
          setQrModalOpen(false);
          toast.success('QR payment test completed!');
        }}
        onPaymentFailed={() => {
          setQrModalOpen(false);
          toast.error('QR payment test failed');
        }}
      />
    </div>
  );
}
