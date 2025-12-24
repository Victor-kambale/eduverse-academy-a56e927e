import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, 
  PartyPopper, 
  Sparkles, 
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { toast } from 'sonner';

interface GiftCardPaymentSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  recipientName: string;
  cardDesign?: string;
}

const confettiColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];

const Confetti = () => {
  const [particles, setParticles] = useState<Array<{id: number; x: number; y: number; color: string; rotation: number; size: number}>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 150 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      rotation: Math.random() * 360,
      size: 8 + Math.random() * 8
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ 
            x: `${particle.x}vw`, 
            y: `${particle.y}vh`,
            rotate: 0,
            opacity: 1 
          }}
          animate={{ 
            y: '110vh',
            rotate: particle.rotation,
            opacity: [1, 1, 0]
          }}
          transition={{ 
            duration: 3 + Math.random() * 2,
            ease: 'linear'
          }}
          style={{
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%'
          }}
        />
      ))}
    </div>
  );
};

export function GiftCardPaymentSuccess({ 
  isOpen, 
  onClose, 
  amount, 
  recipientName,
  cardDesign = 'from-purple-500 to-pink-500'
}: GiftCardPaymentSuccessProps) {
  const [step, setStep] = useState<'select' | 'processing' | 'success'>('select');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setSelectedMethod('');
      setShowConfetti(false);
    }
  }, [isOpen]);

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setStep('processing');

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Play success sound
    try {
      const audio = new Audio('/sounds/success.mp3');
      audio.volume = 0.5;
      audio.play();
    } catch (e) {
      console.log('Could not play sound');
    }

    setStep('success');
    setShowConfetti(true);

    toast.success(`Gift card payment of $${amount.toFixed(2)} successful!`, {
      description: `Sent to ${recipientName} using ${selectedMethod}`
    });

    // Hide confetti after animation
    setTimeout(() => setShowConfetti(false), 5000);
  };

  const paymentMethods = [
    { id: 'stripe', name: 'Credit/Debit Card', icon: CreditCard },
    { id: 'paypal', name: 'PayPal', icon: CreditCard },
    { id: 'google_pay', name: 'Google Pay', icon: Smartphone },
    { id: 'apple_pay', name: 'Apple Pay', icon: Smartphone },
    { id: 'bank', name: 'Bank Transfer', icon: Building2 },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <AnimatePresence mode="wait">
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  Complete Gift Card Purchase
                </DialogTitle>
              </DialogHeader>

              <div className="mt-4 space-y-6">
                {/* Gift Card Preview */}
                <Card className="overflow-hidden">
                  <div className={`h-24 bg-gradient-to-br ${cardDesign} flex items-center justify-center`}>
                    <Gift className="h-12 w-12 text-white/80" />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Gift for</p>
                        <p className="font-semibold">{recipientName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="text-xl font-bold text-primary">${amount.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Methods */}
                <div className="space-y-3">
                  <p className="font-medium">Select Payment Method</p>
                  <div className="grid grid-cols-2 gap-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.name)}
                        className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                          selectedMethod === method.name
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <method.icon className="h-6 w-6" />
                        <span className="text-sm font-medium">{method.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={handlePayment} className="w-full" size="lg">
                  Pay ${amount.toFixed(2)}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-12 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                className="w-16 h-16 mx-auto mb-6 border-4 border-primary border-t-transparent rounded-full"
              />
              <h3 className="text-xl font-semibold mb-2">Processing Payment...</h3>
              <p className="text-muted-foreground">Please wait while we process your gift card</p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="w-20 h-20 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="h-12 w-12 text-white" />
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <PartyPopper className="h-6 w-6 text-accent" />
                  <h3 className="text-2xl font-bold text-green-600">Payment Successful!</h3>
                  <PartyPopper className="h-6 w-6 text-accent" />
                </div>

                <p className="text-muted-foreground mb-4">
                  Your gift card has been sent to {recipientName}
                </p>

                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center gap-3">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    <span className="font-semibold text-lg">${amount.toFixed(2)}</span>
                    <span className="text-muted-foreground">via {selectedMethod}</span>
                  </div>
                </div>

                <div className="flex gap-2 justify-center">
                  {[1,2,3,4,5].map(i => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    >
                      <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <Button onClick={onClose} className="mt-6" size="lg">
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {showConfetti && <Confetti />}
      </DialogContent>
    </Dialog>
  );
}
