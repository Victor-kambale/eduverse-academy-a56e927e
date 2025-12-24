import { useState, useEffect, useRef } from 'react';
import { 
  DollarSign, 
  Building, 
  CreditCard, 
  Wallet, 
  Smartphone,
  Phone,
  Upload,
  Check,
  AlertTriangle,
  FileText,
  Loader2,
  ChevronDown,
  QrCode,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { QRPaymentModal } from '@/components/payment/QRPaymentModal';

interface EnhancedWithdrawalSystemProps {
  userType: 'admin' | 'teacher' | 'university';
  onSuccess?: () => void;
}

const paymentMethods = [
  { id: 'paypal', name: 'PayPal', icon: Wallet, color: 'bg-blue-500', category: 'wallet' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: Building, color: 'bg-green-500', category: 'bank' },
  { id: 'stripe', name: 'Stripe', icon: CreditCard, color: 'bg-purple-500', category: 'card' },
  { id: 'visa', name: 'Visa', icon: CreditCard, color: 'bg-blue-600', category: 'card' },
  { id: 'google_pay', name: 'Google Pay', icon: Wallet, color: 'bg-red-500', category: 'wallet' },
  { id: 'apple_pay', name: 'Apple Pay', icon: Wallet, color: 'bg-gray-800', category: 'wallet' },
  { id: 'wechat', name: 'WeChat Pay', icon: Smartphone, color: 'bg-green-600', category: 'qr' },
  { id: 'alipay', name: 'Alipay', icon: Smartphone, color: 'bg-blue-600', category: 'qr' },
  { id: 'payoneer', name: 'Payoneer', icon: CreditCard, color: 'bg-orange-500', category: 'wallet' },
  { id: 'cashapp', name: 'Cash App', icon: DollarSign, color: 'bg-green-400', category: 'wallet' },
  { id: 'american_express', name: 'American Express', icon: CreditCard, color: 'bg-blue-700', category: 'card' },
  { id: 'mobile_money', name: 'Mobile Money', icon: Phone, color: 'bg-yellow-500', category: 'mobile' },
];

const adminCategories = [
  { id: 'course_sales', name: 'Course Sales', description: 'Total earnings from course purchases' },
  { id: 'certification_fees', name: 'Certification Fees', description: 'Fees from certificate issuance', subOptions: ['Executive', 'Advanced', 'Professional'] },
  { id: 'gift_card_fees', name: 'Gift Card Fees', description: 'Commission from gift card sales' },
  { id: 'commission', name: 'Commission %', description: 'Platform commission earnings' },
  { id: 'failed_payment_fees', name: 'Failed Payment Fees (20%)', description: 'Fees from failed transactions' },
  { id: 'maintenance_fees', name: 'Maintenance Fees', description: 'Platform maintenance funds' },
  { id: 'teacher_payouts', name: 'Teacher Payouts', description: 'Outgoing teacher payments' },
  { id: 'account_creation_fees', name: 'Account Creation Fees', description: 'Teacher registration fees' },
  { id: 'appointments', name: 'Appointments', description: 'Chat appointment fees', subOptions: ['Basic', 'Unlimited', 'Premium'] },
];

const teacherCategories = [
  { id: 'course_sales', name: 'Course Sales', description: 'Your course earnings', subOptions: ['Beginner Level', 'Intermediate', 'Advanced', 'Professional'] },
];

const universityCategories = [
  { id: 'course_sales', name: 'Course Sales', description: 'Program earnings', subOptions: ['Professional Vocational Training', 'Associate Degree (AA/AS)', 'Bachelor\'s Degree (BA/BS)', 'Master\'s Degree (MA/MS/MBA)', 'Doctorate (PhD/EdD/MD)'] },
  { id: 'certificates', name: 'Certificates', description: 'Certificate revenue', subOptions: ['Executive', 'Advanced', 'Professional', 'Academic'] },
];

const countries = [
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
];

export const EnhancedWithdrawalSystem = ({ userType, onSuccess }: EnhancedWithdrawalSystemProps) => {
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<Record<string, string>>({});
  
  // Verification state
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [signature, setSignature] = useState<File | null>(null);
  const [contract, setContract] = useState<File | null>(null);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  
  // QR Modal state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrPaymentMethod, setQrPaymentMethod] = useState<'wechat' | 'alipay'>('wechat');

  // Balance state
  const [balance, setBalance] = useState({
    available: 2500.00,
    pending: 350.00,
    total: 2850.00,
  });

  const [timeFilter, setTimeFilter] = useState('all');
  const [feeBreakdown, setFeeBreakdown] = useState({
    maintenance: 45.00,
    certifications: 125.00,
    giftCards: 89.50,
    commission: 450.00,
    failedPayments: 35.00,
    teacherPayouts: 1200.00,
    accountCreation: 25.00,
  });

  const categories = userType === 'admin' ? adminCategories : userType === 'teacher' ? teacherCategories : universityCategories;
  const minimumWithdrawal = userType === 'admin' ? 0 : 50;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [step]);

  const calculateFee = (amt: number, method: string): number => {
    const feeRates: Record<string, number> = {
      paypal: 0.029,
      stripe: 0.029,
      bank_transfer: 0.015,
      mobile_money: 0.10, // 10% for mobile money
      google_pay: 0.025,
      apple_pay: 0.025,
      wechat: 0.03,
      alipay: 0.03,
      payoneer: 0.02,
      visa: 0.029,
      american_express: 0.035,
      cashapp: 0.025,
    };
    const rate = feeRates[method] || 0.025;
    return amt * rate;
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setPaymentMethod(methodId);
    
    if (methodId === 'wechat' || methodId === 'alipay') {
      setQrPaymentMethod(methodId as 'wechat' | 'alipay');
    }
  };

  const handleQRPaymentComplete = () => {
    setQrModalOpen(false);
    toast.success('QR Payment verified!');
    setStep(3);
  };

  const proceedToPayment = () => {
    if (!amount || parseFloat(amount) < minimumWithdrawal) {
      toast.error(`Minimum withdrawal is $${minimumWithdrawal}`);
      return;
    }
    
    if (parseFloat(amount) > balance.available) {
      toast.error('Insufficient balance');
      return;
    }
    
    setStep(2);
  };

  const proceedWithMethod = () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    if (paymentMethod === 'wechat' || paymentMethod === 'alipay') {
      setQrModalOpen(true);
      return;
    }

    setStep(3);
  };

  const handleVerificationSubmit = async () => {
    if (!agreedToTerms) {
      toast.error('Please agree to terms and conditions');
      return;
    }

    if (userType !== 'admin' && (!idDocument || !signature)) {
      toast.error('Please upload required documents');
      return;
    }

    if (!phoneVerified && userType !== 'admin') {
      toast.error('Please verify your phone number');
      return;
    }

    setLoading(true);

    try {
      // Submit withdrawal
      const { error } = await supabase.from('withdrawals').insert({
        user_id: user?.id,
        user_type: userType,
        amount: parseFloat(amount),
        currency: 'USD',
        category,
        payment_method: paymentMethod,
        payment_details: paymentDetails,
        status: 'pending',
        phone_verified: phoneVerified,
      });

      if (error) throw error;

      // Play success sound
      const audio = new Audio('/sounds/success.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});

      toast.success('Withdrawal submitted successfully!');
      onSuccess?.();
      
      // Reset form
      setStep(1);
      setCategory('');
      setAmount('');
      setPaymentMethod('');
    } catch (error) {
      toast.error('Failed to submit withdrawal');
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationCode = async () => {
    if (!phoneNumber) {
      toast.error('Please enter phone number');
      return;
    }
    
    // Simulate sending code
    setCodeSent(true);
    toast.success('Verification code sent!');
  };

  const verifyCode = () => {
    if (verificationCode === '123456') {
      setPhoneVerified(true);
      toast.success('Phone verified!');
      const audio = new Audio('/sounds/success.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } else {
      toast.error('Invalid code. Try: 123456');
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div ref={scrollRef} className="space-y-6 p-1">
        {/* Balance Card */}
        <Card className="sticky top-0 z-10 bg-card/95 backdrop-blur">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-accent" />
                Available Balance
              </CardTitle>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary mb-2">
              ${balance.available.toFixed(2)}
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Pending: ${balance.pending.toFixed(2)}</span>
              <span>Total: ${balance.total.toFixed(2)}</span>
            </div>
            
            {userType === 'admin' && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                <Badge variant="outline" className="justify-between">
                  Maintenance: <span className="font-bold">${feeBreakdown.maintenance}</span>
                </Badge>
                <Badge variant="outline" className="justify-between">
                  Certs: <span className="font-bold">${feeBreakdown.certifications}</span>
                </Badge>
                <Badge variant="outline" className="justify-between">
                  Gift Cards: <span className="font-bold">${feeBreakdown.giftCards}</span>
                </Badge>
                <Badge variant="outline" className="justify-between">
                  Commission: <span className="font-bold">${feeBreakdown.commission}</span>
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Category & Amount */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Select Category & Amount</CardTitle>
              <CardDescription>
                {userType === 'admin' 
                  ? 'No minimum amount required for admin withdrawals'
                  : `Minimum withdrawal: $${minimumWithdrawal}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {category && categories.find(c => c.id === category)?.subOptions && (
                  <div>
                    <Label>Sub-Category</Label>
                    <Select value={subCategory} onValueChange={setSubCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub-category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.find(c => c.id === category)?.subOptions?.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label>Amount (USD) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  {parseFloat(amount) > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Estimated fee: ${calculateFee(parseFloat(amount), 'paypal').toFixed(2)}
                    </p>
                  )}
                </div>

                {userType !== 'admin' && parseFloat(amount) < minimumWithdrawal && parseFloat(amount) > 0 && (
                  <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Minimum withdrawal is ${minimumWithdrawal}. Your account must maintain at least $10.
                    </p>
                  </div>
                )}
              </div>

              <Button 
                onClick={proceedToPayment}
                className="w-full"
                disabled={!category || !amount || parseFloat(amount) <= 0}
              >
                Continue to Payment Method
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Payment Method */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Select Payment Method</CardTitle>
              <CardDescription>
                Choose how you want to receive your funds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ScrollArea className="h-[300px] pr-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {paymentMethods.map((method) => (
                    <Card
                      key={method.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        paymentMethod === method.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handlePaymentMethodSelect(method.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className={`w-10 h-10 rounded-full ${method.color} flex items-center justify-center mx-auto mb-2`}>
                          <method.icon className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-sm font-medium">{method.name}</p>
                        {(method.id === 'wechat' || method.id === 'alipay') && (
                          <Badge variant="secondary" className="mt-1">
                            <QrCode className="h-3 w-3 mr-1" />
                            QR Scan
                          </Badge>
                        )}
                        {method.id === 'mobile_money' && (
                          <Badge variant="destructive" className="mt-1">
                            10% Fee
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              {paymentMethod && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-semibold">Payment Details</h4>
                  
                  {paymentMethod === 'mobile_money' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm">
                          <AlertTriangle className="inline h-4 w-4 mr-1" />
                          Amount will be converted to USD. 10% processing fee applies.
                          Failed password attempts (2+) will result in a 20% fee.
                        </p>
                      </div>
                      
                      <div>
                        <Label>Select Country</Label>
                        <Select 
                          value={selectedCountry.code}
                          onValueChange={(code) => setSelectedCountry(countries.find(c => c.code === code) || countries[0])}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                {country.flag} {country.country} ({country.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Phone Number</Label>
                        <div className="flex gap-2">
                          <Input 
                            value={selectedCountry.code}
                            disabled
                            className="w-20"
                          />
                          <Input
                            placeholder="Phone number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {(paymentMethod === 'paypal' || paymentMethod === 'stripe') && (
                    <div>
                      <Label>Email Address</Label>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={paymentDetails.email || ''}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, email: e.target.value })}
                      />
                    </div>
                  )}

                  {paymentMethod === 'bank_transfer' && (
                    <div className="space-y-4">
                      <div>
                        <Label>Bank Name</Label>
                        <Input
                          placeholder="Bank of America"
                          value={paymentDetails.bankName || ''}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, bankName: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Account Number / IBAN</Label>
                          <Input
                            placeholder="XXXX XXXX XXXX"
                            value={paymentDetails.accountNumber || ''}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, accountNumber: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>SWIFT / Routing</Label>
                          <Input
                            placeholder="XXXXXX"
                            value={paymentDetails.swift || ''}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, swift: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={proceedWithMethod} className="flex-1" disabled={!paymentMethod}>
                  Continue to Verification
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Identity Verification */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Step 3: Identity Verification
              </CardTitle>
              <CardDescription>
                Complete verification to process your withdrawal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {userType !== 'admin' && (
                <>
                  {/* Document Upload */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>ID Document *</Label>
                      <div className="border-2 border-dashed rounded-lg p-4 text-center">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => setIdDocument(e.target.files?.[0] || null)}
                          className="hidden"
                          id="id-upload"
                        />
                        <label htmlFor="id-upload" className="cursor-pointer">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm">
                            {idDocument ? idDocument.name : 'Click to upload ID'}
                          </p>
                        </label>
                      </div>
                    </div>
                    <div>
                      <Label>Signature *</Label>
                      <div className="border-2 border-dashed rounded-lg p-4 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setSignature(e.target.files?.[0] || null)}
                          className="hidden"
                          id="sig-upload"
                        />
                        <label htmlFor="sig-upload" className="cursor-pointer">
                          <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm">
                            {signature ? signature.name : 'Click to upload signature'}
                          </p>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Phone Verification */}
                  <div className="space-y-4">
                    <Label>Phone Verification</Label>
                    <div className="flex gap-2">
                      <Select 
                        value={selectedCountry.code}
                        onValueChange={(code) => setSelectedCountry(countries.find(c => c.code === code) || countries[0])}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.flag} {country.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={sendVerificationCode} 
                        disabled={!phoneNumber || codeSent}
                        variant="secondary"
                      >
                        {codeSent ? 'Code Sent' : 'Send Code'}
                      </Button>
                    </div>
                    
                    {codeSent && !phoneVerified && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter 6-digit code"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          maxLength={6}
                        />
                        <Button onClick={verifyCode}>
                          Verify
                        </Button>
                      </div>
                    )}
                    
                    {phoneVerified && (
                      <Badge className="bg-success text-success-foreground">
                        <Check className="h-3 w-3 mr-1" />
                        Phone Verified
                      </Badge>
                    )}
                  </div>
                </>
              )}

              {/* Summary */}
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <h4 className="font-semibold">Withdrawal Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{categories.find(c => c.id === category)?.name}</span>
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">${parseFloat(amount).toFixed(2)}</span>
                  <span className="text-muted-foreground">Fee:</span>
                  <span className="font-medium text-destructive">-${calculateFee(parseFloat(amount), paymentMethod).toFixed(2)}</span>
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium">{paymentMethods.find(m => m.id === paymentMethod)?.name}</span>
                  <span className="text-muted-foreground font-bold">You'll Receive:</span>
                  <span className="font-bold text-success">
                    ${(parseFloat(amount) - calculateFee(parseFloat(amount), paymentMethod)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3">
                <Checkbox 
                  id="terms" 
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm">
                  I agree to the Terms & Conditions, Privacy Policy, and Eduverse withdrawal policies. 
                  I understand that processing times may vary and fees are non-refundable.
                </label>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleVerificationSubmit} 
                  className="flex-1"
                  disabled={loading || !agreedToTerms || (userType !== 'admin' && (!phoneVerified || !idDocument || !signature))}
                >
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Submit Withdrawal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* QR Payment Modal */}
      <QRPaymentModal
        open={qrModalOpen}
        onOpenChange={setQrModalOpen}
        paymentMethod={qrPaymentMethod}
        amount={parseFloat(amount) || 0}
        onPaymentComplete={handleQRPaymentComplete}
        onPaymentFailed={() => {
          setQrModalOpen(false);
          toast.error('Payment verification failed');
        }}
        isTest={false}
      />
    </ScrollArea>
  );
};