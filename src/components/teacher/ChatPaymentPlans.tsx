import { useState } from 'react';
import { 
  Crown, 
  MessageSquare, 
  Zap, 
  Check, 
  CreditCard,
  Wallet,
  Smartphone,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { QRPaymentModal } from '@/components/payment/QRPaymentModal';

interface ChatPaymentPlansProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlanSelected?: (plan: string) => void;
  currentPlan?: string;
}

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 5,
    period: 'month',
    description: '5 free messages per month',
    features: [
      '5 messages per month',
      'Standard response time',
      'Email support',
      'Basic appointment scheduling',
    ],
    icon: MessageSquare,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    popular: false,
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: 10,
    period: 'month',
    description: 'Unlimited messages per month',
    features: [
      'Unlimited messages',
      'Priority response time',
      'Email & chat support',
      'Priority appointment scheduling',
      'Message attachments',
    ],
    icon: Zap,
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 20,
    period: 'month',
    description: 'Premium features with priority',
    features: [
      'Unlimited messages',
      'Instant response time',
      '24/7 priority support',
      'Instant appointment approval',
      'File attachments up to 100MB',
      'Video call support',
      'Analytics dashboard',
    ],
    icon: Crown,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    popular: false,
  },
];

const paymentMethods = [
  { id: 'stripe', name: 'Credit/Debit Card', icon: CreditCard },
  { id: 'paypal', name: 'PayPal', icon: Wallet },
  { id: 'google_pay', name: 'Google Pay', icon: Wallet },
  { id: 'apple_pay', name: 'Apple Pay', icon: Wallet },
  { id: 'wechat', name: 'WeChat Pay', icon: Smartphone },
  { id: 'alipay', name: 'Alipay', icon: Smartphone },
  { id: 'payoneer', name: 'Payoneer', icon: CreditCard },
  { id: 'visa', name: 'Visa Direct', icon: CreditCard },
  { id: 'amex', name: 'American Express', icon: CreditCard },
  { id: 'cashapp', name: 'Cash App', icon: Smartphone },
  { id: 'mobile', name: 'Mobile Money', icon: Smartphone },
];

export function ChatPaymentPlans({ 
  open, 
  onOpenChange, 
  onPlanSelected,
  currentPlan 
}: ChatPaymentPlansProps) {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('stripe');
  const [step, setStep] = useState<'plan' | 'payment'>('plan');
  const [processing, setProcessing] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrPaymentMethod, setQrPaymentMethod] = useState<'wechat' | 'alipay'>('wechat');

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleContinueToPayment = () => {
    if (!selectedPlan) {
      toast.error('Please select a plan');
      return;
    }
    setStep('payment');
  };

  const handlePayment = async () => {
    if (!selectedPlan || !user) return;

    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return;

    // Handle QR code payments
    if (selectedPaymentMethod === 'wechat' || selectedPaymentMethod === 'alipay') {
      setQrPaymentMethod(selectedPaymentMethod as 'wechat' | 'alipay');
      setQrModalOpen(true);
      return;
    }

    setProcessing(true);
    try {
      // For Stripe, create checkout session
      if (selectedPaymentMethod === 'stripe') {
        const { data, error } = await supabase.functions.invoke('create-teacher-payment', {
          body: {
            amount: plan.price,
            description: `${plan.name} Chat Plan - $${plan.price}/month`,
            planId: plan.id,
          },
        });

        if (error) throw error;
        if (data?.url) {
          window.open(data.url, '_blank');
        }
      } else {
        // Simulate other payment methods
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update teacher credits
        await supabase.from('teacher_credits').upsert({
          teacher_id: user.id,
          is_premium: plan.id !== 'basic',
          free_messages_remaining: plan.id === 'basic' ? 5 : 999999,
          premium_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });

        // Create notification
        await supabase.from('notifications').insert({
          user_id: user.id,
          title: 'Subscription Activated!',
          message: `Your ${plan.name} plan is now active. Enjoy your new features!`,
          type: 'success',
        });

        toast.success(`${plan.name} plan activated successfully!`);
        onPlanSelected?.(plan.id);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleQRPaymentComplete = async () => {
    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan || !user) return;

    try {
      // Update teacher credits
      await supabase.from('teacher_credits').upsert({
        teacher_id: user.id,
        is_premium: plan.id !== 'basic',
        free_messages_remaining: plan.id === 'basic' ? 5 : 999999,
        premium_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      // Create notification for admin about payment
      const { data: admins } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (admins) {
        for (const admin of admins) {
          await supabase.from('notifications').insert({
            user_id: admin.user_id,
            title: 'New Payment Received',
            message: `Teacher paid $${plan.price} for ${plan.name} plan via ${qrPaymentMethod === 'wechat' ? 'WeChat Pay' : 'Alipay'}`,
            type: 'success',
            priority: 'high',
          });
        }
      }

      toast.success(`${plan.name} plan activated successfully!`);
      setQrModalOpen(false);
      onPlanSelected?.(plan.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating credits:', error);
      toast.error('Failed to activate plan');
    }
  };

  const selectedPlanDetails = plans.find(p => p.id === selectedPlan);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {step === 'plan' ? 'Choose Your Chat Plan' : 'Select Payment Method'}
            </DialogTitle>
          </DialogHeader>

          {step === 'plan' ? (
            <div className="space-y-6">
              <p className="text-muted-foreground">
                Select a plan to start chatting with the admin team. Upgrade anytime for more features.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => {
                  const Icon = plan.icon;
                  const isSelected = selectedPlan === plan.id;
                  const isCurrent = currentPlan === plan.id;

                  return (
                    <Card 
                      key={plan.id}
                      className={`relative cursor-pointer transition-all hover:shadow-lg ${
                        isSelected 
                          ? 'ring-2 ring-primary shadow-lg' 
                          : 'hover:border-primary/50'
                      } ${isCurrent ? 'opacity-50' : ''}`}
                      onClick={() => !isCurrent && handlePlanSelect(plan.id)}
                    >
                      {plan.popular && (
                        <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-accent">
                          Most Popular
                        </Badge>
                      )}
                      {isCurrent && (
                        <Badge className="absolute -top-2 right-2 bg-green-500">
                          Current Plan
                        </Badge>
                      )}
                      <CardHeader className="text-center pb-2">
                        <div className={`w-12 h-12 mx-auto rounded-full ${plan.bgColor} flex items-center justify-center mb-2`}>
                          <Icon className={`h-6 w-6 ${plan.color}`} />
                        </div>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="mb-4">
                          <span className="text-4xl font-bold">${plan.price}</span>
                          <span className="text-muted-foreground">/{plan.period}</span>
                        </div>
                        <ul className="space-y-2 text-sm text-left">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleContinueToPayment} disabled={!selectedPlan}>
                  Continue to Payment
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selected Plan Summary */}
              {selectedPlanDetails && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <selectedPlanDetails.icon className={`h-8 w-8 ${selectedPlanDetails.color}`} />
                      <div>
                        <p className="font-semibold">{selectedPlanDetails.name} Plan</p>
                        <p className="text-sm text-muted-foreground">{selectedPlanDetails.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">${selectedPlanDetails.price}</p>
                      <p className="text-sm text-muted-foreground">per month</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Methods */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Select Payment Method</Label>
                <RadioGroup
                  value={selectedPaymentMethod}
                  onValueChange={setSelectedPaymentMethod}
                  className="grid grid-cols-2 md:grid-cols-3 gap-3"
                >
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <div key={method.id}>
                        <RadioGroupItem
                          value={method.id}
                          id={method.id}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={method.id}
                          className="flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted"
                        >
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm font-medium">{method.name}</span>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>

              {/* WeChat/Alipay Notice */}
              {(selectedPaymentMethod === 'wechat' || selectedPaymentMethod === 'alipay') && (
                <div className="p-4 bg-accent/10 rounded-lg">
                  <p className="text-sm">
                    <strong>Note:</strong> You will be shown a QR code to scan with your{' '}
                    {selectedPaymentMethod === 'wechat' ? 'WeChat' : 'Alipay'} app to complete the payment.
                  </p>
                </div>
              )}

              <div className="flex justify-between gap-2">
                <Button variant="outline" onClick={() => setStep('plan')}>
                  Back to Plans
                </Button>
                <Button onClick={handlePayment} disabled={processing}>
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay $${selectedPlanDetails?.price || 0}`
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Payment Modal */}
      <QRPaymentModal
        open={qrModalOpen}
        onOpenChange={setQrModalOpen}
        paymentMethod={qrPaymentMethod}
        amount={selectedPlanDetails?.price || 0}
        onPaymentComplete={handleQRPaymentComplete}
      />
    </>
  );
}
