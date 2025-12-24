import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  CreditCard,
  Smartphone,
  Building2,
  Globe,
  Lock,
  CheckCircle,
  Loader2,
  QrCode,
  Wallet,
  Shield,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface EnhancedPaymentFlowProps {
  amount: number;
  courseName: string;
  courseLevel?: string;
  onSuccess: (paymentMethod: string) => void;
  onCancel?: () => void;
}

interface Bank {
  id: string;
  name: string;
  logo: string;
  country: string;
}

const paymentMethods = [
  { id: "card", name: "Credit/Debit Card", icon: CreditCard, description: "Visa, Mastercard, Amex" },
  { id: "google-pay", name: "Google Pay", icon: Smartphone, description: "Fast checkout" },
  { id: "bank", name: "Bank Account", icon: Building2, description: "Direct bank transfer" },
  { id: "wechat", name: "WeChat Pay", icon: QrCode, description: "微信支付 - Scan QR" },
  { id: "alipay", name: "Alipay", icon: QrCode, description: "支付宝 - Scan QR" },
  { id: "paypal", name: "PayPal", icon: Wallet, description: "Pay with PayPal" },
  { id: "payoneer", name: "Payoneer", icon: Globe, description: "Global payments" },
];

const countries = [
  "United States", "China", "United Kingdom", "Canada", "Germany", "France", 
  "Japan", "Australia", "India", "Brazil", "South Korea", "Singapore",
  "Netherlands", "Switzerland", "Mexico", "Indonesia", "Philippines",
  "Nigeria", "South Africa", "Kenya", "Uganda", "Tanzania", "Rwanda"
];

const banksByCountry: Record<string, Bank[]> = {
  "United States": [
    { id: "bofa", name: "Bank of America", logo: "🏦", country: "United States" },
    { id: "chase", name: "Chase", logo: "🏦", country: "United States" },
    { id: "wells", name: "Wells Fargo", logo: "🏦", country: "United States" },
    { id: "citi", name: "Citibank", logo: "🏦", country: "United States" },
    { id: "usbank", name: "US Bank", logo: "🏦", country: "United States" },
    { id: "pnc", name: "PNC Bank", logo: "🏦", country: "United States" },
    { id: "capital", name: "Capital One", logo: "🏦", country: "United States" },
    { id: "mercury", name: "Mercury", logo: "🏦", country: "United States" },
    { id: "usaa", name: "USAA Bank", logo: "🏦", country: "United States" },
    { id: "navy", name: "Navy Federal", logo: "🏦", country: "United States" },
  ],
  "China": [
    { id: "icbc", name: "ICBC", logo: "🏦", country: "China" },
    { id: "ccb", name: "China Construction Bank", logo: "🏦", country: "China" },
    { id: "abc", name: "Agricultural Bank of China", logo: "🏦", country: "China" },
    { id: "boc", name: "Bank of China", logo: "🏦", country: "China" },
    { id: "cmb", name: "China Merchants Bank", logo: "🏦", country: "China" },
  ],
  "United Kingdom": [
    { id: "barclays", name: "Barclays", logo: "🏦", country: "United Kingdom" },
    { id: "hsbc", name: "HSBC", logo: "🏦", country: "United Kingdom" },
    { id: "lloyds", name: "Lloyds", logo: "🏦", country: "United Kingdom" },
    { id: "natwest", name: "NatWest", logo: "🏦", country: "United Kingdom" },
  ],
};

export const EnhancedPaymentFlow = ({
  amount,
  courseName,
  courseLevel = "Beginner",
  onSuccess,
  onCancel,
}: EnhancedPaymentFlowProps) => {
  const [selectedMethod, setSelectedMethod] = useState("");
  const [step, setStep] = useState<"method" | "details" | "processing" | "success">("method");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  
  // Card details
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardCountry, setCardCountry] = useState("");
  
  // Bank details
  const [bankCountry, setBankCountry] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Prevent copy/paste and screenshots
  useEffect(() => {
    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.error("Copying is not allowed for security reasons");
    };
    
    const preventContextMenu = (e: MouseEvent) => {
      if (step === "details") {
        e.preventDefault();
      }
    };

    document.addEventListener('copy', preventCopy);
    document.addEventListener('paste', preventCopy);
    document.addEventListener('contextmenu', preventContextMenu);

    return () => {
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('paste', preventCopy);
      document.removeEventListener('contextmenu', preventContextMenu);
    };
  }, [step]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    
    if (methodId === "wechat" || methodId === "alipay") {
      setShowQrModal(true);
    } else {
      setStep("details");
    }
  };

  const processPayment = async () => {
    if (!agreedToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    setIsProcessing(true);
    setStep("processing");

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    setStep("success");
    setIsProcessing(false);

    // Play success sound
    const audio = new Audio('/sounds/success.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {});

    // Trigger confetti
    setTimeout(() => {
      onSuccess(selectedMethod);
    }, 2000);
  };

  const handleQrPaymentComplete = () => {
    setShowQrModal(false);
    setStep("processing");
    setIsProcessing(true);

    setTimeout(() => {
      setStep("success");
      setIsProcessing(false);
      
      const audio = new Audio('/sounds/success.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});

      setTimeout(() => {
        onSuccess(selectedMethod);
      }, 2000);
    }, 3000);
  };

  const availableBanks = bankCountry ? (banksByCountry[bankCountry] || []) : [];

  return (
    <ScrollArea className="h-full max-h-[80vh]">
      <div className="space-y-6 p-1">
        {/* Payment Method Selection */}
        {step === "method" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Details
              </CardTitle>
              <CardDescription>
                Complete your purchase to get instant access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4 text-success" />
                Secure, fast checkout with Link
              </div>

              <div className="grid grid-cols-3 gap-3">
                {paymentMethods.slice(0, 3).map((method) => (
                  <Card
                    key={method.id}
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary",
                      selectedMethod === method.id && "border-primary ring-2 ring-primary/20"
                    )}
                    onClick={() => handleMethodSelect(method.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <method.icon className="w-6 h-6 mx-auto mb-2" />
                      <p className="font-medium text-sm">{method.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Separator />

              <div className="grid grid-cols-4 gap-3">
                {paymentMethods.slice(3).map((method) => (
                  <Card
                    key={method.id}
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary",
                      selectedMethod === method.id && "border-primary ring-2 ring-primary/20"
                    )}
                    onClick={() => handleMethodSelect(method.id)}
                  >
                    <CardContent className="p-3 text-center">
                      <method.icon className="w-5 h-5 mx-auto mb-1" />
                      <p className="font-medium text-xs">{method.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Your payment information is secure and encrypted
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card Payment Details */}
        {step === "details" && selectedMethod === "card" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Card Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number *</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 1234 1234 1234"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardName">Name on Card *</Label>
                <Input
                  id="cardName"
                  placeholder="As appears on your card"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiration Date *</Label>
                  <Input
                    id="expiry"
                    placeholder="MM / YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    maxLength={7}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">Security Code *</Label>
                  <Input
                    id="cvc"
                    placeholder="CVC"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    maxLength={4}
                    type="password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Country *</Label>
                <Select value={cardCountry} onValueChange={setCardCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm">
                  I agree to the <span className="text-primary">license terms</span> and{" "}
                  <span className="text-primary">terms of service</span>
                </label>
              </div>

              <Button
                onClick={processPayment}
                disabled={!cardNumber || !cardName || !expiryDate || !cvc || !cardCountry || !agreedToTerms}
                className="w-full"
                size="lg"
              >
                <Lock className="w-4 h-4 mr-2" />
                Pay • ${amount.toFixed(2)}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Bank Account Details */}
        {step === "details" && selectedMethod === "bank" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Bank Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input placeholder="you@example.com" type="email" />
              </div>

              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  placeholder="First and last name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Country *</Label>
                <Select value={bankCountry} onValueChange={setBankCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {bankCountry && (
                <>
                  <div className="space-y-2">
                    <Label>Select Your Bank *</Label>
                    <div className="grid grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                      {availableBanks.map((bank) => (
                        <Card
                          key={bank.id}
                          className={cn(
                            "cursor-pointer transition-all hover:border-primary",
                            selectedBank === bank.id && "border-primary ring-2 ring-primary/20"
                          )}
                          onClick={() => setSelectedBank(bank.id)}
                        >
                          <CardContent className="p-3 text-center">
                            <span className="text-2xl">{bank.logo}</span>
                            <p className="text-xs font-medium mt-1 truncate">{bank.name}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Enter bank details manually (may take 1-2 business days)
                  </p>

                  <div className="space-y-2">
                    <Label>Account Number *</Label>
                    <Input
                      placeholder="Enter account number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      type="password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Routing Number *</Label>
                    <Input
                      placeholder="Enter routing number"
                      value={routingNumber}
                      onChange={(e) => setRoutingNumber(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bankTerms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                />
                <label htmlFor="bankTerms" className="text-sm">
                  I agree to the <span className="text-primary">license terms</span> and{" "}
                  <span className="text-primary">terms of service</span>
                </label>
              </div>

              <Button
                onClick={processPayment}
                disabled={!bankCountry || !selectedBank || !accountNumber || !agreedToTerms}
                className="w-full"
                size="lg"
              >
                <Lock className="w-4 h-4 mr-2" />
                Pay • ${amount.toFixed(2)}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Other Payment Methods */}
        {step === "details" && !["card", "bank", "wechat", "alipay"].includes(selectedMethod) && (
          <Card>
            <CardHeader>
              <CardTitle>Complete Payment</CardTitle>
              <CardDescription>
                You'll be redirected to {paymentMethods.find(m => m.id === selectedMethod)?.name} to complete your payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="otherTerms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                />
                <label htmlFor="otherTerms" className="text-sm">
                  I agree to the <span className="text-primary">license terms</span> and{" "}
                  <span className="text-primary">terms of service</span>
                </label>
              </div>

              <Button
                onClick={processPayment}
                disabled={!agreedToTerms}
                className="w-full"
                size="lg"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Continue to {paymentMethods.find(m => m.id === selectedMethod)?.name}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Processing */}
        {step === "processing" && (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
              <h3 className="text-xl font-semibold mb-2">Processing Payment...</h3>
              <p className="text-muted-foreground">
                Checking for secure payment environment...
              </p>
              <div className="flex justify-center gap-2 mt-4">
                <Shield className="w-5 h-5 text-success" />
                <Lock className="w-5 h-5 text-success" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success */}
        {step === "success" && (
          <Card className="border-success">
            <CardContent className="py-12 text-center">
              <div className="relative">
                <CheckCircle className="w-20 h-20 mx-auto mb-4 text-success" />
                <Sparkles className="w-8 h-8 absolute top-0 right-1/3 text-warning animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-success">Payment Successful!</h3>
              <p className="text-muted-foreground mb-4">
                You've successfully enrolled in {courseName}
              </p>
              <Badge variant="outline" className="text-success border-success">
                Paid ${amount.toFixed(2)} via {paymentMethods.find(m => m.id === selectedMethod)?.name}
              </Badge>
              <div className="mt-6 space-x-2">
                <Button onClick={() => onSuccess(selectedMethod)}>
                  Start Learning
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline">
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* QR Code Modal for WeChat/Alipay */}
        <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                {selectedMethod === "wechat" ? "WeChat Pay" : "Alipay"}
              </DialogTitle>
            </DialogHeader>
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Scan the QR code with your {selectedMethod === "wechat" ? "WeChat" : "Alipay"} app to complete payment
              </p>
              <div className="bg-white p-4 rounded-lg inline-block">
                <img
                  src={selectedMethod === "wechat" ? "/images/wechat-pay-qr.png" : "/images/alipay-qr.jpg"}
                  alt="Payment QR Code"
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="font-semibold">Amount: ${amount.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">For: {courseName}</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" />
                Secure payment environment
              </div>
              <Button onClick={handleQrPaymentComplete} className="w-full">
                I've Completed the Payment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ScrollArea>
  );
};
