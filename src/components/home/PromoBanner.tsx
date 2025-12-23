import { useState, useEffect } from 'react';
import { X, Gift, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface PromoBannerProps {
  isVisible?: boolean; // Admin controlled
  message?: string;
  discountPercent?: number;
  endDate?: Date;
  linkUrl?: string;
  linkText?: string;
}

export function PromoBanner({
  isVisible = true,
  message = "20% off all Gift Cards for December! 💌 Treat yourself or a loved one this month!",
  discountPercent = 20,
  endDate = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
  linkUrl = "/gift-cards",
  linkText = "Get Your Discount!",
}: PromoBannerProps) {
  const [show, setShow] = useState(isVisible);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setShow(isVisible);
  }, [isVisible]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="relative bg-gradient-to-r from-primary via-purple-600 to-accent text-white py-3 px-4 z-50"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-4 text-sm md:text-base">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 animate-bounce" />
            <span className="font-medium">{message}</span>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center gap-1 text-xs md:text-sm bg-white/20 rounded-full px-3 py-1">
            <Timer className="h-4 w-4" />
            <span>Ends in</span>
            <span className="font-mono font-bold">
              {timeLeft.days}d : {timeLeft.hours.toString().padStart(2, '0')}h : {timeLeft.minutes.toString().padStart(2, '0')}m : {timeLeft.seconds.toString().padStart(2, '0')}s
            </span>
          </div>

          {/* Animated Button */}
          <Link to={linkUrl}>
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 0 0 0 rgba(255,255,255,0.4)',
                  '0 0 0 10px rgba(255,255,255,0)',
                  '0 0 0 0 rgba(255,255,255,0)',
                ]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: 'loop'
              }}
            >
              <Button 
                size="sm" 
                className="bg-white text-primary hover:bg-white/90 font-bold shadow-lg"
              >
                <Gift className="h-4 w-4 mr-1" />
                {linkText}
              </Button>
            </motion.div>
          </Link>

          {/* Close Button */}
          <button 
            onClick={() => setShow(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close promotion banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
