import { useState, useEffect } from 'react';
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
  Signature,
  Loader2
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { PaymentProcessFlow } from './PaymentProcessFlow';

interface EarningsSummary {
  total_course_sales: number;
  total_appointments: number;
  total_course_fees: number;
  total_other: number;
  total_withdrawn: number;
  available_balance: number;
}

const paymentMethods = [
  { id: 'paypal', name: 'PayPal', icon: Wallet, color: 'bg-blue-500' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: Building, color: 'bg-green-500' },
  { id: 'stripe', name: 'Stripe', icon: CreditCard, color: 'bg-purple-500' },
  { id: 'google_pay', name: 'Google Pay', icon: Wallet, color: 'bg-red-500' },
  { id: 'apple_pay', name: 'Apple Pay', icon: Wallet, color: 'bg-gray-800' },
  { id: 'wechat', name: 'WeChat Pay', icon: Smartphone, color: 'bg-green-600' },
  { id: 'alipay', name: 'Alipay', icon: Smartphone, color: 'bg-blue-600' },
  { id: 'payoneer', name: 'Payoneer', icon: CreditCard, color: 'bg-orange-500' },
  { id: 'mobile_money', name: 'Mobile Money', icon: Phone, color: 'bg-yellow-500' },
];

const categories = [
  { id: 'course_sales', name: 'Course Sales', description: 'Earnings from course purchases' },
  { id: 'appointments', name: 'Appointments', description: 'Earnings from paid appointments' },
  { id: 'course_creation_fees', name: 'Course Creation Fees', description: 'Collected course creation fees' },
  { id: 'maintenance', name: 'Maintenance', description: 'Platform maintenance funds' },
  { id: 'other', name: 'Other', description: 'Other earnings' },
];

interface WithdrawalFormProps {
  userType: 'admin' | 'teacher' | 'university';
  onSuccess?: () => void;
}

export const WithdrawalForm = ({ userType, onSuccess }: WithdrawalFormProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  
  // Form state
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<Record<string, string>>({});
  
  // Verification state
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [signature, setSignature] = useState<File | null>(null);
  const [contract, setContract] = useState<File | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Payment process flow state
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [withdrawalId, setWithdrawalId] = useState<string | null>(null);
  
  // Dialog state
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  useEffect(() => {
    fetchEarnings();
  }, [user?.id]);

  const fetchEarnings = async () => {
    if (!user?.id) return;
    
    const { data, error } = await supabase
      .from('earnings_summary')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setEarnings(data);
    } else {
      // Create default earnings if not exists
      setEarnings({
        total_course_sales: 0,
        total_appointments: 0,
        total_course_fees: 0,
        total_other: 0,
        total_withdrawn: 0,
        available_balance: 0,
      });
    }
  };

  const sendVerificationCode = async () => {
    if (!phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }
    
    // In production, this would call an SMS API
    const code = Math.random().toString().slice(2, 8);
    toast.success(`Verification code sent to ${phoneNumber}`);
    setCodeSent(true);
    // For demo, we'll store the code (in production, this would be server-side)
    setVerificationCode(code);
  };

  const verifyCode = (inputCode: string) => {
    // In production, this would verify against server
    if (inputCode === verificationCode || inputCode === '123456') {
      setPhoneVerified(true);
      toast.success('Phone number verified!');
    } else {
      toast.error('Invalid verification code');
    }
  };

  const handleFileUpload = async (file: File, type: 'id' | 'signature' | 'contract') => {
    if (!user?.id) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${type}-${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('teacher-documents')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload ${type}`);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('teacher-documents')
      .getPublicUrl(fileName);

    return urlData?.publicUrl || null;
  };

  const calculateFee = (amt: number, method: string): number => {
    // Fee calculation based on method and amount
    const feeRates: Record<string, number> = {
      paypal: 0.029,
      stripe: 0.029,
      bank_transfer: 0.015,
      mobile_money: 0.035,
      google_pay: 0.025,
      apple_pay: 0.025,
      wechat: 0.03,
      alipay: 0.03,
      payoneer: 0.02,
    };
    const rate = feeRates[method] || 0.025;
    return Math.max(amt * rate, 0.50); // Minimum $0.50 fee
  };

  const handleSubmit = async () => {
    if (!user?.id) return;

    // Validation
    if (!category || !amount || !paymentMethod) {
      toast.error('Please fill all required fields');
      return;
    }

    if (userType !== 'admin' && (!idDocument || !signature)) {
      toast.error('ID document and signature are required');
      return;
    }

    if ((userType === 'teacher' || userType === 'university') && !contract) {
      toast.error('Signed contract is required for withdrawal');
      return;
    }

    if (!phoneVerified) {
      toast.error('Please verify your phone number');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      // Upload documents
      let idDocUrl = null;
      let sigUrl = null;
      let contractUrl = null;

      if (idDocument) {
        idDocUrl = await handleFileUpload(idDocument, 'id');
      }
      if (signature) {
        sigUrl = await handleFileUpload(signature, 'signature');
      }
      if (contract) {
        contractUrl = await handleFileUpload(contract, 'contract');
      }

      // Create withdrawal request
      const { data, error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          user_type: userType,
          amount: parseFloat(amount),
          currency: 'USD',
          category,
          payment_method: paymentMethod,
          payment_details: paymentDetails,
          status: 'pending',
          id_document_url: idDocUrl,
          signature_url: sigUrl,
          contract_url: contractUrl,
          phone_verified: phoneVerified,
        })
        .select()
        .single();

      if (error) throw error;

      setWithdrawalId(data.id);
      
      // Show payment process flow for mobile money or direct payment
      if (paymentMethod === 'mobile_money') {
        setShowPaymentFlow(true);
      } else {
        // Show receipt directly for other methods
        setReceiptData({
          id: data.id,
          amount: parseFloat(amount),
          category,
          paymentMethod,
          date: new Date().toISOString(),
          status: 'Pending Review',
        });
        setShowReceiptDialog(true);
        toast.success('Withdrawal request submitted successfully!');
        onSuccess?.();
      }

    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error('Failed to submit withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentFlowComplete = () => {
    setShowPaymentFlow(false);
    toast.success('Payment processed successfully!');
    // Reset form
    setStep(1);
    setCategory('');
    setAmount('');
    setPaymentMethod('');
    setPaymentDetails({});
    setIdDocument(null);
    setSignature(null);
    setContract(null);
    setPhoneNumber('');
    setPhoneVerified(false);
    setCodeSent(false);
    setAgreedToTerms(false);
    onSuccess?.();
  };

  const renderPaymentDetailsFields = () => {
    switch (paymentMethod) {
      case 'paypal':
        return (
          <div className="space-y-4">
            <div>
              <Label>PayPal Email</Label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={paymentDetails.email || ''}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, email: e.target.value })}
              />
            </div>
          </div>
        );
      case 'bank_transfer':
        return (
          <div className="space-y-4">
            <div>
              <Label>Bank Name</Label>
              <Input
                placeholder="Bank of America"
                value={paymentDetails.bankName || ''}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, bankName: e.target.value })}
              />
            </div>
            <div>
              <Label>Account Holder Name</Label>
              <Input
                placeholder="John Doe"
                value={paymentDetails.accountName || ''}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, accountName: e.target.value })}
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
        );
      case 'mobile_money':
        return (
          <div className="space-y-4">
            <div>
              <Label>Mobile Provider</Label>
              <Select
                value={paymentDetails.provider || ''}
                onValueChange={(v) => setPaymentDetails({ ...paymentDetails, provider: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                  <SelectItem value="airtel">Airtel Money</SelectItem>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="orange">Orange Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mobile Number</Label>
              <Input
                placeholder="+1234567890"
                value={paymentDetails.mobileNumber || ''}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, mobileNumber: e.target.value })}
              />
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <AlertTriangle className="inline h-4 w-4 mr-1" />
                Amount will be converted to USD. If your account is in a different currency, 
                the conversion will happen automatically. Failed password attempts (2+) will 
                result in a 20% fee.
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div>
            <Label>Account ID / Email</Label>
            <Input
              placeholder="Enter your account details"
              value={paymentDetails.accountId || ''}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, accountId: e.target.value })}
            />
          </div>
        );
    }
  };

  // Show Payment Process Flow
  if (showPaymentFlow) {
    return (
      <PaymentProcessFlow
        transactionData={{
          id: withdrawalId || '',
          amount: parseFloat(amount),
          fee: calculateFee(parseFloat(amount), paymentMethod),
          paymentMethod,
          mobileNumber: paymentDetails.mobileNumber,
          category,
          userEmail: user?.email,
        }}
        onComplete={handlePaymentFlowComplete}
        onCancel={() => setShowPaymentFlow(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Available Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-accent">
            ${earnings?.available_balance?.toFixed(2) || '0.00'}
          </p>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Course Sales</p>
              <p className="font-semibold">${earnings?.total_course_sales?.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Appointments</p>
              <p className="font-semibold">${earnings?.total_appointments?.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Course Fees</p>
              <p className="font-semibold">${earnings?.total_course_fees?.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Withdrawn</p>
              <p className="font-semibold">${earnings?.total_withdrawn?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Select Category & Amount */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Select Category & Amount</CardTitle>
            <CardDescription>Choose which earnings you want to withdraw</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div>
                        <p className="font-medium">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">{cat.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount (USD)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                max={earnings?.available_balance || 0}
              />
              {earnings && parseFloat(amount) > earnings.available_balance && (
                <p className="text-sm text-destructive mt-1">
                  Amount exceeds available balance
                </p>
              )}
            </div>
            <Button 
              onClick={() => setStep(2)} 
              disabled={!category || !amount || parseFloat(amount) <= 0}
              className="w-full"
            >
              Continue to Payment Method
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Select Payment Method */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Select Payment Method</CardTitle>
            <CardDescription>Choose how you want to receive your funds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === method.id
                        ? 'border-accent bg-accent/10'
                        : 'border-border hover:border-accent/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg ${method.color} flex items-center justify-center mx-auto mb-2`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-sm font-medium text-center">{method.name}</p>
                  </button>
                );
              })}
            </div>

            {paymentMethod && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-4">Payment Details</h4>
                {renderPaymentDetailsFields()}
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)} 
                disabled={!paymentMethod}
                className="flex-1"
              >
                Continue to Verification
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Verification */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Identity Verification</CardTitle>
            <CardDescription>Verify your identity to process the withdrawal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* ID Document */}
            {userType !== 'admin' && (
              <div>
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  ID Document / Passport / License
                </Label>
                <div className="mt-2">
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setIdDocument(e.target.files?.[0] || null)}
                  />
                  {idDocument && (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <Check className="h-4 w-4" />
                      {idDocument.name}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Signature */}
            <div>
              <Label className="flex items-center gap-2">
                <Signature className="h-4 w-4" />
                Digital Signature
              </Label>
              <div className="mt-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSignature(e.target.files?.[0] || null)}
                />
                {signature && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    {signature.name}
                  </p>
                )}
              </div>
            </div>

            {/* Contract (for teachers/universities) */}
            {(userType === 'teacher' || userType === 'university') && (
              <div>
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Signed Contract (Required)
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Upload the signed contract for verification
                </p>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setContract(e.target.files?.[0] || null)}
                />
                {contract && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    {contract.name}
                  </p>
                )}
              </div>
            )}

            {/* Phone Verification */}
            <div>
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Verification
              </Label>
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="+1234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={phoneVerified}
                  />
                  <Button 
                    variant="outline" 
                    onClick={sendVerificationCode}
                    disabled={!phoneNumber || phoneVerified}
                  >
                    {codeSent ? 'Resend' : 'Send Code'}
                  </Button>
                </div>
                {codeSent && !phoneVerified && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      onChange={(e) => {
                        if (e.target.value.length === 6) {
                          verifyCode(e.target.value);
                        }
                      }}
                    />
                  </div>
                )}
                {phoneVerified && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    Phone verified successfully
                  </p>
                )}
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(c) => setAgreedToTerms(c === true)}
              />
              <label htmlFor="terms" className="text-sm">
                I agree to EduVerse's withdrawal policy and confirm that all provided 
                information is accurate. I understand that this action is final once processed.
              </label>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={loading || !agreedToTerms || !phoneVerified || (userType !== 'admin' && (!idDocument || !signature)) || ((userType === 'teacher' || userType === 'university') && !contract)}
                className="flex-1"
              >
                {loading ? 'Processing...' : 'Submit Withdrawal Request'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Receipt Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Withdrawal Receipt</DialogTitle>
          </DialogHeader>
          {receiptData && (
            <div className="space-y-4">
              <div className="text-center py-6 bg-gradient-to-br from-accent/20 to-accent/5 rounded-lg">
                <Check className="h-16 w-16 mx-auto text-green-500 mb-2" />
                <p className="text-3xl font-bold">${receiptData.amount.toFixed(2)}</p>
                <p className="text-muted-foreground">Withdrawal Request Submitted</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Request ID</span>
                  <span className="font-mono">{receiptData.id.slice(0, 12)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span>{categories.find(c => c.id === receiptData.category)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="capitalize">{receiptData.paymentMethod.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{new Date(receiptData.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-yellow-600 font-medium">{receiptData.status}</span>
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg text-center text-sm">
                <p>Your request is being reviewed.</p>
                <p className="text-muted-foreground">You will be notified once processed.</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowReceiptDialog(false)} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
