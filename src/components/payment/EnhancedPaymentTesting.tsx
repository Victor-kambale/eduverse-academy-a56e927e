import { useState } from 'react';
import {
  CreditCard,
  Wallet,
  Smartphone,
  Globe,
  CheckCircle,
  XCircle,
  Loader2,
  Play,
  AlertTriangle,
  Copy,
  Phone,
  QrCode,
  Settings,
  ToggleLeft,
  ToggleRight,
  Edit,
  Trash2,
  Plus,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { QRPaymentModal } from './QRPaymentModal';
import { MobileMoneyPayment } from './MobileMoneyPayment';

interface PaymentMethodConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  testCredentials: {
    primary: string;
    secondary?: string;
    pin?: string;
  };
  additionalInfo?: string;
  enabled: boolean;
  requiresQR?: boolean;
  requiresSMS?: boolean;
  category: 'card' | 'wallet' | 'mobile' | 'qr';
}

const defaultPaymentMethods: PaymentMethodConfig[] = [
  {
    id: 'stripe',
    name: 'Credit/Debit Card (Stripe)',
    icon: <CreditCard className="w-6 h-6" />,
    description: 'Test Stripe payment flow',
    testCredentials: { primary: '4242 4242 4242 4242', secondary: '12/34', pin: '123' },
    additionalInfo: 'Use any future date for expiry',
    enabled: true,
    category: 'card',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: <Wallet className="w-6 h-6 text-blue-600" />,
    description: 'Test PayPal sandbox',
    testCredentials: { primary: 'sb-test@business.example.com', pin: 'sandbox123' },
    enabled: true,
    category: 'wallet',
  },
  {
    id: 'google-pay',
    name: 'Google Pay',
    icon: <Smartphone className="w-6 h-6" />,
    description: 'Test Google Pay flow',
    testCredentials: { primary: '4111 1111 1111 1111', secondary: '12/25', pin: '111' },
    enabled: true,
    category: 'wallet',
  },
  {
    id: 'apple-pay',
    name: 'Apple Pay',
    icon: <Smartphone className="w-6 h-6" />,
    description: 'Test Apple Pay flow (Safari required)',
    testCredentials: { primary: '4000 0566 5566 5556', secondary: '11/25', pin: '567' },
    enabled: true,
    category: 'wallet',
  },
  {
    id: 'wechat',
    name: 'WeChat Pay (微信支付)',
    icon: <Globe className="w-6 h-6 text-green-500" />,
    description: 'Scan QR code with WeChat',
    testCredentials: { primary: 'wechat_sandbox_001', pin: '888888' },
    enabled: true,
    requiresQR: true,
    category: 'qr',
  },
  {
    id: 'alipay',
    name: 'Alipay (支付宝)',
    icon: <Globe className="w-6 h-6 text-blue-500" />,
    description: 'Scan QR code with Alipay',
    testCredentials: { primary: 'alipay_sandbox@test.com', pin: '123456' },
    enabled: true,
    requiresQR: true,
    category: 'qr',
  },
  {
    id: 'visa',
    name: 'Visa Direct',
    icon: <CreditCard className="w-6 h-6 text-blue-600" />,
    description: 'Direct Visa payment',
    testCredentials: { primary: '4000 0000 0000 0002', secondary: '12/26', pin: '999' },
    enabled: true,
    category: 'card',
  },
  {
    id: 'amex',
    name: 'American Express',
    icon: <CreditCard className="w-6 h-6 text-blue-800" />,
    description: 'Amex card payment',
    testCredentials: { primary: '3782 822463 10005', secondary: '12/25', pin: '1234' },
    additionalInfo: 'Amex uses 4-digit CVC',
    enabled: true,
    category: 'card',
  },
  {
    id: 'cashapp',
    name: 'Cash App',
    icon: <Wallet className="w-6 h-6 text-green-500" />,
    description: 'Cash App payment',
    testCredentials: { primary: '$CashTestUser' },
    enabled: true,
    category: 'wallet',
  },
  {
    id: 'payoneer',
    name: 'Payoneer',
    icon: <CreditCard className="w-6 h-6 text-orange-500" />,
    description: 'Payoneer sandbox',
    testCredentials: { primary: 'payoneer_test@sandbox.com', pin: 'sandbox' },
    enabled: true,
    category: 'wallet',
  },
  {
    id: 'mobile_money',
    name: 'Mobile Money',
    icon: <Phone className="w-6 h-6 text-yellow-600" />,
    description: 'Mobile money with SMS verification',
    testCredentials: { primary: '+1 555 123 4567', pin: '1234' },
    enabled: true,
    requiresSMS: true,
    category: 'mobile',
  },
];

const countryCodes = [
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬' },
  { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
  { code: '+243', country: 'DR Congo', flag: '🇨🇩' },
  { code: '+237', country: 'Cameroon', flag: '🇨🇲' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
];

interface TestResult {
  id: string;
  method: string;
  status: 'success' | 'failed' | 'pending' | 'insufficient_funds';
  message: string;
  timestamp: Date;
  transactionId?: string;
  amount: number;
}

export function EnhancedPaymentTesting() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>(defaultPaymentMethods);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState<string | null>(null);
  const [testAmount, setTestAmount] = useState('10.00');
  
  // QR Payment modal
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrPaymentMethod, setQrPaymentMethod] = useState<'wechat' | 'alipay'>('wechat');
  
  // Mobile Money modal
  const [mobileMoneyOpen, setMobileMoneyOpen] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState('+1');
  const [mobileNumber, setMobileNumber] = useState('');
  
  // Admin settings
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethodConfig | null>(null);

  const runPaymentTest = async (method: PaymentMethodConfig) => {
    // Handle QR code payments
    if (method.requiresQR) {
      setQrPaymentMethod(method.id as 'wechat' | 'alipay');
      setQrModalOpen(true);
      return;
    }

    // Handle mobile money
    if (method.requiresSMS) {
      setMobileMoneyOpen(true);
      return;
    }

    setTesting(method.id);
    
    // Simulate payment test with various outcomes
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const random = Math.random();
    let status: TestResult['status'];
    let message: string;
    
    if (random > 0.8) {
      status = 'insufficient_funds';
      message = `Payment failed: Insufficient funds in test account`;
    } else if (random > 0.2) {
      status = 'success';
      message = `Payment of $${testAmount} processed successfully via ${method.name}`;
    } else {
      status = 'failed';
      message = `Payment failed: Card declined or network error`;
    }
    
    const transactionId = status === 'success' ? `TXN-${Date.now()}-${method.id.toUpperCase()}` : undefined;
    
    const result: TestResult = {
      id: `result-${Date.now()}`,
      method: method.name,
      status,
      message,
      timestamp: new Date(),
      transactionId,
      amount: parseFloat(testAmount),
    };

    setTestResults(prev => [result, ...prev]);
    setTesting(null);

    if (status === 'success') {
      toast.success(`${method.name} test completed!`, { description: `Transaction: ${transactionId}` });
      // Play success sound
      const audio = new Audio('/sounds/success.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } else if (status === 'insufficient_funds') {
      toast.error(`${method.name}: Insufficient funds`, { description: 'Test account has insufficient balance' });
      const audio = new Audio('/sounds/error.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } else {
      toast.error(`${method.name} test failed`);
    }
  };

  const toggleMethod = (methodId: string) => {
    setPaymentMethods(prev => 
      prev.map(m => m.id === methodId ? { ...m, enabled: !m.enabled } : m)
    );
    toast.success('Payment method updated');
  };

  const handleQRPaymentComplete = () => {
    const result: TestResult = {
      id: `result-${Date.now()}`,
      method: qrPaymentMethod === 'wechat' ? 'WeChat Pay' : 'Alipay',
      status: 'success',
      message: `QR payment of $${testAmount} verified successfully`,
      timestamp: new Date(),
      transactionId: `QR-${Date.now()}`,
      amount: parseFloat(testAmount),
    };
    setTestResults(prev => [result, ...prev]);
    setQrModalOpen(false);
  };

  const handleMobileMoneyComplete = (transactionId: string) => {
    const result: TestResult = {
      id: `result-${Date.now()}`,
      method: 'Mobile Money',
      status: 'success',
      message: `Mobile money payment of $${testAmount} verified with SMS`,
      timestamp: new Date(),
      transactionId,
      amount: parseFloat(testAmount),
    };
    setTestResults(prev => [result, ...prev]);
    setMobileMoneyOpen(false);
    toast.success('Mobile money payment verified!');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const exportResults = () => {
    const csv = testResults.map(r => 
      `${r.timestamp.toISOString()},${r.method},${r.status},${r.amount},${r.transactionId || 'N/A'}`
    ).join('\n');
    const blob = new Blob([`Timestamp,Method,Status,Amount,TransactionID\n${csv}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-tests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Results exported');
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'insufficient_funds':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <Loader2 className="w-5 h-5 animate-spin" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/5 border-green-500/20';
      case 'failed':
        return 'bg-red-500/5 border-red-500/20';
      case 'insufficient_funds':
        return 'bg-amber-500/5 border-amber-500/20';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{testResults.filter(r => r.status === 'success').length}</p>
            <p className="text-sm text-muted-foreground">Successful</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/20">
          <CardContent className="p-4 text-center">
            <XCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <p className="text-2xl font-bold">{testResults.filter(r => r.status === 'failed').length}</p>
            <p className="text-sm text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/20">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
            <p className="text-2xl font-bold">{testResults.filter(r => r.status === 'insufficient_funds').length}</p>
            <p className="text-sm text-muted-foreground">Insufficient</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{paymentMethods.filter(m => m.enabled).length}</p>
            <p className="text-sm text-muted-foreground">Enabled</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Play className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">{testResults.length}</p>
            <p className="text-sm text-muted-foreground">Total Tests</p>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Test Configuration</CardTitle>
              <CardDescription>Configure test parameters and manage payment methods</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setSettingsOpen(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Admin Settings
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-48">
              <Label>Test Amount (USD)</Label>
              <Input
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
                step="0.01"
                min="0.50"
              />
            </div>
            <div>
              <Label>Environment</Label>
              <Badge variant="outline" className="mt-2 block w-fit">
                <AlertTriangle className="w-3 h-3 mr-1 inline" />
                Sandbox / Test Mode
              </Badge>
            </div>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" onClick={() => setTestResults([])}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear Results
              </Button>
              <Button variant="outline" onClick={exportResults} disabled={testResults.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="all">All Methods</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
          <TabsTrigger value="qr">QR Payments</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentMethods.map((method) => (
              <Card key={method.id} className={`relative ${!method.enabled ? 'opacity-50' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">{method.icon}</div>
                      <div>
                        <CardTitle className="text-base">{method.name}</CardTitle>
                        <CardDescription className="text-xs">{method.description}</CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={method.enabled}
                      onCheckedChange={() => toggleMethod(method.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center bg-muted/50 p-2 rounded">
                      <span className="text-muted-foreground">Test ID:</span>
                      <div className="flex items-center gap-1">
                        <code className="text-xs truncate max-w-[120px]">{method.testCredentials.primary}</code>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(method.testCredentials.primary)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {method.requiresQR && (
                      <Badge variant="secondary" className="w-full justify-center">
                        <QrCode className="w-3 h-3 mr-1" />
                        QR Code Required
                      </Badge>
                    )}
                    {method.requiresSMS && (
                      <Badge variant="secondary" className="w-full justify-center">
                        <Phone className="w-3 h-3 mr-1" />
                        SMS Verification
                      </Badge>
                    )}
                  </div>
                  <Button
                    className="w-full mt-4"
                    onClick={() => runPaymentTest(method)}
                    disabled={testing !== null || !method.enabled}
                  >
                    {testing === method.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run Test (${testAmount})
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cards" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentMethods.filter(m => m.category === 'card').map((method) => (
              <Card key={method.id} className={!method.enabled ? 'opacity-50' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">{method.icon}</div>
                    <CardTitle className="text-base">{method.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between"><span>Card:</span><code>{method.testCredentials.primary}</code></div>
                    {method.testCredentials.secondary && (
                      <div className="flex justify-between"><span>Expiry:</span><code>{method.testCredentials.secondary}</code></div>
                    )}
                    {method.testCredentials.pin && (
                      <div className="flex justify-between"><span>CVC:</span><code>{method.testCredentials.pin}</code></div>
                    )}
                  </div>
                  <Button className="w-full" onClick={() => runPaymentTest(method)} disabled={testing !== null || !method.enabled}>
                    {testing === method.id ? <Loader2 className="w-4 h-4 animate-spin" /> : `Test (${testAmount})`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="wallets" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentMethods.filter(m => m.category === 'wallet' || m.category === 'mobile').map((method) => (
              <Card key={method.id} className={!method.enabled ? 'opacity-50' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">{method.icon}</div>
                    <CardTitle className="text-base">{method.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{method.description}</p>
                  <Button className="w-full" onClick={() => runPaymentTest(method)} disabled={testing !== null || !method.enabled}>
                    {testing === method.id ? <Loader2 className="w-4 h-4 animate-spin" /> : `Test (${testAmount})`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="qr" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paymentMethods.filter(m => m.category === 'qr').map((method) => (
              <Card key={method.id} className={`${!method.enabled ? 'opacity-50' : ''}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-muted rounded-lg">{method.icon}</div>
                    <div>
                      <CardTitle>{method.name}</CardTitle>
                      <CardDescription>{method.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center mb-4">
                    <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center border">
                      <QrCode className="w-20 h-20 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-sm text-center text-muted-foreground mb-4">
                    Click to open QR code scanner and complete test payment
                  </p>
                  <Button className="w-full" onClick={() => runPaymentTest(method)} disabled={!method.enabled}>
                    <QrCode className="w-4 h-4 mr-2" />
                    Open QR Scanner (${testAmount})
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Test Results History</CardTitle>
                  <CardDescription>View all payment test results</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setTestResults([])}>
                    Clear All
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportResults} disabled={testResults.length === 0}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No tests run yet. Click "Run Test" on any payment method to start.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {testResults.map((result) => (
                    <div
                      key={result.id}
                      className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result.status)}
                          <div>
                            <p className="font-medium">{result.method}</p>
                            <p className="text-sm text-muted-foreground">{result.message}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={result.status === 'success' ? 'default' : result.status === 'insufficient_funds' ? 'secondary' : 'destructive'}>
                            {result.status === 'insufficient_funds' ? 'Insufficient Funds' : result.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {result.timestamp.toLocaleTimeString()}
                          </p>
                          <p className="text-sm font-medium">${result.amount.toFixed(2)}</p>
                        </div>
                      </div>
                      {result.transactionId && (
                        <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">TXN:</span>
                          <code className="text-xs">{result.transactionId}</code>
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copyToClipboard(result.transactionId!)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Admin Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Methods Administration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">{method.icon}</div>
                  <div>
                    <p className="font-medium">{method.name}</p>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setEditingMethod(method)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Switch
                    checked={method.enabled}
                    onCheckedChange={() => toggleMethod(method.id)}
                  />
                  <span className="text-sm w-12 text-right">
                    {method.enabled ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setSettingsOpen(false);
              toast.success('Settings saved successfully');
            }}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Payment Modal */}
      <QRPaymentModal
        open={qrModalOpen}
        onOpenChange={setQrModalOpen}
        paymentMethod={qrPaymentMethod}
        amount={parseFloat(testAmount)}
        onPaymentComplete={handleQRPaymentComplete}
      />

      {/* Mobile Money Payment */}
      <MobileMoneyPayment
        open={mobileMoneyOpen}
        onOpenChange={setMobileMoneyOpen}
        amount={parseFloat(testAmount)}
        countryCodes={countryCodes}
        onComplete={handleMobileMoneyComplete}
      />
    </div>
  );
}
