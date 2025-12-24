import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Volume2, 
  VolumeX,
  RefreshCw,
  Trash2
} from 'lucide-react';

interface PaymentNotification {
  id: string;
  amount: number;
  currency: string;
  status: string;
  course_id: string;
  user_id: string;
  created_at: string;
  course_title?: string;
}

interface RealtimePaymentNotificationsProps {
  maxNotifications?: number;
}

const RealtimePaymentNotifications = ({ maxNotifications = 10 }: RealtimePaymentNotificationsProps) => {
  const [notifications, setNotifications] = useState<PaymentNotification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Fetch recent payments
    const fetchRecentPayments = async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          currency,
          status,
          course_id,
          user_id,
          created_at,
          courses(title)
        `)
        .order('created_at', { ascending: false })
        .limit(maxNotifications);

      if (error) {
        console.error('Error fetching payments:', error);
        return;
      }

      const formattedData = data?.map(payment => ({
        ...payment,
        course_title: (payment.courses as any)?.title || 'Unknown Course'
      })) || [];

      setNotifications(formattedData);
    };

    fetchRecentPayments();

    // Set up real-time subscription
    channelRef.current = supabase
      .channel('payments-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments'
        },
        async (payload) => {
          console.log('Payment change received:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newPayment = payload.new as any;
            
            // Fetch course title
            const { data: courseData } = await supabase
              .from('courses')
              .select('title')
              .eq('id', newPayment.course_id)
              .single();

            const notification: PaymentNotification = {
              ...newPayment,
              course_title: courseData?.title || 'Unknown Course'
            };

            setNotifications(prev => {
              const filtered = prev.filter(n => n.id !== notification.id);
              return [notification, ...filtered].slice(0, maxNotifications);
            });

            // Show toast and play sound
            if (soundEnabled && newPayment.status === 'completed') {
              playPaymentSound();
              announcePayment(notification);
            }

            toast.success(`Payment ${payload.eventType === 'INSERT' ? 'received' : 'updated'}: $${newPayment.amount}`, {
              description: courseData?.title || 'Course payment',
            });
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [maxNotifications, soundEnabled]);

  const playPaymentSound = () => {
    const audio = new Audio('/sounds/success.mp3');
    audio.volume = 0.6;
    audio.play().catch(console.error);
  };

  const announcePayment = (payment: PaymentNotification) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        `New payment received! ${payment.amount} ${payment.currency} for ${payment.course_title}`
      );
      utterance.rate = 1;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    toast.info('Notifications cleared');
  };

  const refreshPayments = async () => {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        currency,
        status,
        course_id,
        user_id,
        created_at,
        courses(title)
      `)
      .order('created_at', { ascending: false })
      .limit(maxNotifications);

    if (!error && data) {
      const formattedData = data.map(payment => ({
        ...payment,
        course_title: (payment.courses as any)?.title || 'Unknown Course'
      }));
      setNotifications(formattedData);
      toast.success('Payments refreshed');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Live Payment Notifications
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "secondary"} className={isConnected ? "bg-green-500" : ""}>
              {isConnected ? "Live" : "Connecting..."}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Mute notifications" : "Enable sounds"}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshPayments}
              title="Refresh payments"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearNotifications}
              title="Clear notifications"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <AnimatePresence mode="popLayout">
            {notifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-32 text-muted-foreground"
              >
                <DollarSign className="w-12 h-12 mb-2 opacity-20" />
                <p>No payments yet</p>
                <p className="text-xs">Payments will appear here in real-time</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {getStatusIcon(notification.status || 'pending')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">
                          {notification.course_title}
                        </p>
                        {getStatusBadge(notification.status || 'pending')}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        ${notification.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase">
                        {notification.currency || 'USD'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RealtimePaymentNotifications;
