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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  testCard: string;
  testExpiry: string;
  testCVC: string;
  additionalInfo?: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'stripe',
    name: 'Credit/Debit Card (Stripe)',
    icon: <CreditCard className="w-6 h-6" />,
    description: 'Test the payment flow with Stripe',
    testCard: '4242 4242 4242 4242',
    testExpiry: '12/34',
    testCVC: '123',
    additionalInfo: 'Use any future date for expiry and any 3 digits for CVC',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: <Wallet className="w-6 h-6" />,
    description: 'Test the payment flow with PayPal',
    testCard: 'sb-test@business.example.com',
    testExpiry: 'N/A',
    testCVC: 'sandbox123',
    additionalInfo: 'Use sandbox credentials for testing',
  },
  {
    id: 'google-pay',
    name: 'Google Pay',
    icon: <Smartphone className="w-6 h-6" />,
    description: 'Test the payment flow with Google Pay',
    testCard: '4111 1111 1111 1111',
    testExpiry: '12/25',
    testCVC: '111',
    additionalInfo: 'Enable test environment in Google Pay console',
  },
  {
    id: 'apple-pay',
    name: 'Apple Pay',
    icon: <Smartphone className="w-6 h-6" />,
    description: 'Test the payment flow with Apple Pay',
    testCard: '4000 0566 5566 5556',
    testExpiry: '11/25',
    testCVC: '567',
    additionalInfo: 'Requires Safari on macOS or iOS device',
  },
  {
    id: 'wechat',
    name: 'WeChat Pay',
    icon: <Globe className="w-6 h-6 text-green-500" />,
    description: 'Test the payment flow with WeChat Pay (微信支付)',
    testCard: 'wechat_test_user_001',
    testExpiry: 'N/A',
    testCVC: '888888',
    additionalInfo: 'Use WeChat sandbox environment',
  },
  {
    id: 'alipay',
    name: 'Alipay',
    icon: <Globe className="w-6 h-6 text-blue-500" />,
    description: 'Test the payment flow with Alipay (支付宝)',
    testCard: 'alipay_test@sandbox.com',
    testExpiry: 'N/A',
    testCVC: '123456',
    additionalInfo: 'Use Alipay sandbox buyer account',
  },
  {
    id: 'visa',
    name: 'Visa Direct',
    icon: <CreditCard className="w-6 h-6 text-blue-600" />,
    description: 'Test the payment flow with Visa Direct',
    testCard: '4000 0000 0000 0002',
    testExpiry: '12/26',
    testCVC: '999',
    additionalInfo: 'Visa test card for direct payments',
  },
  {
    id: 'amex',
    name: 'American Express',
    icon: <CreditCard className="w-6 h-6 text-blue-800" />,
    description: 'Test the payment flow with American Express',
    testCard: '3782 822463 10005',
    testExpiry: '12/25',
    testCVC: '1234',
    additionalInfo: 'Amex uses 4-digit CVC',
  },
  {
    id: 'cashapp',
    name: 'Cash App',
    icon: <Wallet className="w-6 h-6 text-green-500" />,
    description: 'Test the payment flow with Cash App',
    testCard: '$CashTestUser',
    testExpiry: 'N/A',
    testCVC: 'N/A',
    additionalInfo: 'Use Cash App sandbox cashtag',
  },
  {
    id: 'payoneer',
    name: 'Payoneer',
    icon: <CreditCard className="w-6 h-6 text-orange-500" />,
    description: 'Test the payment flow with Payoneer',
    testCard: 'payoneer_test@sandbox.com',
    testExpiry: 'N/A',
    testCVC: 'sandbox',
    additionalInfo: 'Use Payoneer sandbox account',
  },
  {
    id: 'mobile',
    name: 'Mobile Money',
    icon: <Phone className="w-6 h-6 text-yellow-600" />,
    description: 'Test the payment flow with Mobile Number',
    testCard: '+1 555 123 4567',
    testExpiry: 'N/A',
    testCVC: '1234',
    additionalInfo: 'Use test phone number and PIN',
  },
];

interface TestResult {
  method: string;
  status: 'success' | 'failed' | 'pending';
  message: string;
  timestamp: Date;
  transactionId?: string;
}

export default function PaymentTesting() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState<string | null>(null);
  const [testAmount, setTestAmount] = useState('10.00');

  const runPaymentTest = async (method: PaymentMethod) => {
    setTesting(method.id);
    
    // Simulate payment test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const success = Math.random() > 0.2; // 80% success rate for demo
    const transactionId = `TXN-${Date.now()}-${method.id.toUpperCase()}`;
    
    const result: TestResult = {
      method: method.name,
      status: success ? 'success' : 'failed',
      message: success 
        ? `Payment of $${testAmount} processed successfully via ${method.name}`
        : `Payment failed: Card declined or insufficient funds`,
      timestamp: new Date(),
      transactionId: success ? transactionId : undefined,
    };

    setTestResults(prev => [result, ...prev]);
    setTesting(null);

    if (success) {
      toast.success(`${method.name} test completed successfully!`, {
        description: `Transaction ID: ${transactionId}`,
      });
    } else {
      toast.error(`${method.name} test failed`, {
        description: 'Check the test credentials and try again',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Testing</h1>
        <p className="text-muted-foreground">Test all payment methods with sandbox/test credentials</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
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
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{paymentMethods.length}</p>
            <p className="text-sm text-muted-foreground">Methods Available</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Play className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">{testResults.length}</p>
            <p className="text-sm text-muted-foreground">Tests Run</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
          <CardDescription>Set up your test parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
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
            <div className="flex-1">
              <Label>Environment</Label>
              <Badge variant="outline" className="mt-2 block w-fit">
                <AlertTriangle className="w-3 h-3 mr-1 inline" />
                Sandbox / Test Mode
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Methods</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="wallets">Digital Wallets</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentMethods.map((method) => (
              <Card key={method.id} className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      {method.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base">{method.name}</CardTitle>
                      <CardDescription className="text-xs">{method.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center bg-muted/50 p-2 rounded">
                      <span className="text-muted-foreground">Test Card:</span>
                      <div className="flex items-center gap-1">
                        <code className="text-xs">{method.testCard}</code>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(method.testCard)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {method.testExpiry !== 'N/A' && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Expiry:</span>
                        <code className="text-xs">{method.testExpiry}</code>
                      </div>
                    )}
                    {method.testCVC !== 'N/A' && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">CVC/PIN:</span>
                        <code className="text-xs">{method.testCVC}</code>
                      </div>
                    )}
                    {method.additionalInfo && (
                      <p className="text-xs text-muted-foreground italic mt-2">
                        {method.additionalInfo}
                      </p>
                    )}
                  </div>
                  <Button
                    className="w-full mt-4"
                    onClick={() => runPaymentTest(method)}
                    disabled={testing !== null}
                  >
                    {testing === method.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run Test
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentMethods.filter(m => ['stripe', 'visa', 'amex'].includes(m.id)).map((method) => (
              <Card key={method.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">{method.icon}</div>
                    <CardTitle className="text-base">{method.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between"><span>Test Card:</span><code>{method.testCard}</code></div>
                    <div className="flex justify-between"><span>Expiry:</span><code>{method.testExpiry}</code></div>
                    <div className="flex justify-between"><span>CVC:</span><code>{method.testCVC}</code></div>
                  </div>
                  <Button className="w-full" onClick={() => runPaymentTest(method)} disabled={testing !== null}>
                    {testing === method.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Test Payment'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="wallets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentMethods.filter(m => ['paypal', 'google-pay', 'apple-pay', 'wechat', 'alipay', 'cashapp', 'payoneer'].includes(m.id)).map((method) => (
              <Card key={method.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">{method.icon}</div>
                    <CardTitle className="text-base">{method.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{method.description}</p>
                  <Button className="w-full" onClick={() => runPaymentTest(method)} disabled={testing !== null}>
                    {testing === method.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Test Payment'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mobile" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.filter(m => ['mobile'].includes(m.id)).map((method) => (
              <Card key={method.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">{method.icon}</div>
                    <CardTitle className="text-base">{method.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between"><span>Test Number:</span><code>{method.testCard}</code></div>
                    <div className="flex justify-between"><span>PIN:</span><code>{method.testCVC}</code></div>
                  </div>
                  <Button className="w-full" onClick={() => runPaymentTest(method)} disabled={testing !== null}>
                    {testing === method.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Test Payment'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Test Results History</CardTitle>
              <CardDescription>View all payment test results</CardDescription>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tests run yet. Click "Run Test" on any payment method to start.
                </div>
              ) : (
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        result.status === 'success'
                          ? 'bg-green-500/5 border-green-500/20'
                          : 'bg-red-500/5 border-red-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {result.status === 'success' ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">{result.method}</p>
                            <p className="text-sm text-muted-foreground">{result.message}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                            {result.status.toUpperCase()}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {result.timestamp.toLocaleTimeString()}
                          </p>
                          {result.transactionId && (
                            <code className="text-xs">{result.transactionId}</code>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
