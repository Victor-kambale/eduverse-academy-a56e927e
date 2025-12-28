import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Gift, 
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  MessageSquare,
  CreditCard,
  Crown,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Layout } from '@/components/layout/Layout';
import { ChatPaymentPlans } from '@/components/teacher/ChatPaymentPlans';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  subject: string;
  description: string | null;
  status: string;
  appointment_type: string;
  scheduled_at: string | null;
  created_at: string;
  rejection_reason: string | null;
}

interface Message {
  id: string;
  message: string | null;
  message_type: string;
  sender_id: string;
  created_at: string;
  is_deleted: boolean | null;
  attachment_url: string | null;
}

interface TeacherCredits {
  free_messages_remaining: number;
  is_premium: boolean;
  premium_expires_at: string | null;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

const TeacherChat = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [credits, setCredits] = useState<TeacherCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [paymentPlansOpen, setPaymentPlansOpen] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    subject: '',
    description: '',
    type: 'free',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const canCreateAppointment = credits && (credits.is_premium || credits.free_messages_remaining > 0);
  const messagesRemaining = credits?.free_messages_remaining || 0;
  const isPremium = credits?.is_premium || false;

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedAppointment) {
      fetchMessages(selectedAppointment.id);
      
      const channel = supabase
        .channel(`messages-${selectedAppointment.id}`)
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'chat_messages',
            filter: `appointment_id=eq.${selectedAppointment.id}`
          },
          (payload) => {
            setMessages(prev => [...prev, payload.new as Message]);
            scrollToBottom();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedAppointment]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchData = async () => {
    try {
      const { data: appointmentsData } = await supabase
        .from('chat_appointments')
        .select('*')
        .eq('teacher_id', user?.id)
        .order('created_at', { ascending: false });

      setAppointments(appointmentsData || []);

      const { data: creditsData } = await supabase
        .from('teacher_credits')
        .select('*')
        .eq('teacher_id', user?.id)
        .maybeSingle();

      setCredits(creditsData);
      
      if (creditsData && !creditsData.is_premium && creditsData.free_messages_remaining <= 0) {
        const existingNotification = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', user?.id)
          .eq('title', 'Upgrade Required')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .maybeSingle();
        
        if (!existingNotification.data) {
          await supabase.from('notifications').insert({
            user_id: user?.id,
            title: 'Upgrade Required',
            message: 'You have used all your free messages. Upgrade to continue chatting with the admin team. Choose from $10/unlimited or $20/premium plans!',
            type: 'warning',
            priority: 'high',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (appointmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('appointment_id', appointmentId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleCreateAppointment = async () => {
    if (!appointmentForm.subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    if (!canCreateAppointment) {
      toast.error('No messages remaining. Please upgrade your plan.');
      setPaymentPlansOpen(true);
      return;
    }

    try {
      const { error } = await supabase.from('chat_appointments').insert({
        teacher_id: user?.id,
        subject: appointmentForm.subject,
        description: appointmentForm.description,
        appointment_type: isPremium ? 'premium' : 'free',
      });

      if (error) throw error;

      if (!isPremium && credits) {
        await supabase
          .from('teacher_credits')
          .update({ free_messages_remaining: credits.free_messages_remaining - 1 })
          .eq('teacher_id', user?.id);
      }

      toast.success('Appointment request submitted! Awaiting admin approval.');
      setAppointmentDialogOpen(false);
      setAppointmentForm({ subject: '', description: '', type: 'free' });
      fetchData();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to create appointment');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedAppointment) return;

    setSending(true);
    try {
      const { error } = await supabase.from('chat_messages').insert({
        appointment_id: selectedAppointment.id,
        sender_id: user?.id,
        message: newMessage,
        message_type: 'text',
      });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handlePlanSelected = (plan: string) => {
    fetchData();
    toast.success(`${plan} plan activated! You can now create appointments.`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'completed':
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const getPlanLabel = () => {
    if (isPremium) {
      const expiresAt = credits?.premium_expires_at;
      if (expiresAt) {
        const daysLeft = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return `Premium (${daysLeft} days left)`;
      }
      return 'Premium Member';
    }
    return 'Free Tier';
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
            <p className="text-purple-200">Loading chat...</p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container max-w-7xl mx-auto py-8 px-4">
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              Chat with Admin
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </h1>
            <p className="text-purple-300/70">Request appointments and communicate with the platform team</p>
          </motion.div>

          {/* Upgrade Alert for exhausted free messages */}
          <AnimatePresence>
            {!isPremium && messagesRemaining <= 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert className="mb-6 border-amber-500/30 bg-amber-500/10">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  <AlertDescription className="flex items-center justify-between text-amber-200">
                    <span>
                      You've used all 5 free messages. Upgrade to continue chatting!
                    </span>
                    <Button size="sm" onClick={() => setPaymentPlansOpen(true)} className="bg-amber-500 hover:bg-amber-600">
                      View Plans
                    </Button>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Credits Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="mb-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      {isPremium ? (
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ repeat: Infinity, duration: 3 }}
                        >
                          <Crown className="w-8 h-8 text-amber-400" />
                        </motion.div>
                      ) : (
                        <CreditCard className="w-8 h-8 text-purple-400" />
                      )}
                      <div>
                        <p className="font-semibold text-white text-lg">{getPlanLabel()}</p>
                        <p className="text-sm text-purple-300/70">
                          {isPremium 
                            ? 'Unlimited priority messages'
                            : `${messagesRemaining}/5 free messages remaining`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setPaymentPlansOpen(true)} className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
                      <Crown className="w-4 h-4 mr-2" />
                      {isPremium ? 'Manage Plan' : 'Upgrade Plan'}
                    </Button>
                    
                    <Dialog open={appointmentDialogOpen} onOpenChange={setAppointmentDialogOpen}>
                      <DialogTrigger asChild>
                        <Button disabled={!canCreateAppointment} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30">
                          <Plus className="w-4 h-4 mr-2" />
                          New Appointment
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border-purple-500/30">
                        <DialogHeader>
                          <DialogTitle className="text-white">Request Appointment</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {!isPremium && (
                            <div className="p-3 bg-purple-500/10 rounded-lg text-sm border border-purple-500/20">
                              <p className="text-purple-200">
                                This will use 1 of your {messagesRemaining} remaining free messages.
                              </p>
                            </div>
                          )}
                          <div>
                            <Label className="text-purple-200">Subject</Label>
                            <Input
                              value={appointmentForm.subject}
                              onChange={(e) => setAppointmentForm({ ...appointmentForm, subject: e.target.value })}
                              placeholder="What would you like to discuss?"
                              className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-500"
                            />
                          </div>
                          <div>
                            <Label className="text-purple-200">Description</Label>
                            <Textarea
                              value={appointmentForm.description}
                              onChange={(e) => setAppointmentForm({ ...appointmentForm, description: e.target.value })}
                              placeholder="Provide more details..."
                              rows={4}
                              className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-500"
                            />
                          </div>
                          <Button onClick={handleCreateAppointment} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                            Submit Request
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Appointments List */}
            <Card className="lg:col-span-1 bg-slate-800/50 border-purple-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-white">Your Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] scroll-smooth">
                  <div className="space-y-2">
                    {appointments.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="w-10 h-10 mx-auto text-purple-500/50 mb-2" />
                        <p className="text-sm text-purple-300/70">No appointments yet</p>
                        {canCreateAppointment && (
                          <Button 
                            variant="link" 
                            className="mt-2 text-purple-400"
                            onClick={() => setAppointmentDialogOpen(true)}
                          >
                            Create your first appointment
                          </Button>
                        )}
                      </div>
                    ) : (
                      appointments.map((apt, index) => (
                        <motion.button
                          key={apt.id}
                          onClick={() => setSelectedAppointment(apt)}
                          className={`w-full text-left p-4 rounded-xl border transition-all ${
                            selectedAppointment?.id === apt.id
                              ? 'border-purple-500 bg-purple-500/10'
                              : 'border-purple-500/20 hover:bg-purple-500/5 hover:border-purple-500/40'
                          }`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-sm text-white truncate">{apt.subject}</p>
                            {apt.appointment_type === 'premium' && (
                              <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(apt.status)}
                            <span className="text-xs text-purple-300/50">
                              {new Date(apt.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </motion.button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="lg:col-span-2 bg-slate-800/50 border-purple-500/20 backdrop-blur-sm">
              <CardHeader className="border-b border-purple-500/20">
                {selectedAppointment ? (
                  <div>
                    <CardTitle className="text-lg text-white">{selectedAppointment.subject}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      {getStatusBadge(selectedAppointment.status)}
                      {selectedAppointment.rejection_reason && (
                        <span className="text-red-400 text-xs">
                          Reason: {selectedAppointment.rejection_reason}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                ) : (
                  <CardTitle className="text-lg text-purple-300/50">
                    Select an appointment to start chatting
                  </CardTitle>
                )}
              </CardHeader>
              <CardContent className="p-0">
                {selectedAppointment ? (
                  <>
                    <ScrollArea className="h-[400px] p-4 scroll-smooth">
                      <div className="space-y-4">
                        <AnimatePresence>
                          {messages.map((msg, index) => (
                            <motion.div
                              key={msg.id}
                              className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.02 }}
                            >
                              <div
                                className={`max-w-[70%] p-3 rounded-2xl ${
                                  msg.sender_id === user?.id
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                    : 'bg-slate-700/50 text-white border border-purple-500/20'
                                }`}
                              >
                                {msg.is_deleted ? (
                                  <p className="italic text-sm opacity-70">Message deleted</p>
                                ) : (
                                  <p className="text-sm">{msg.message}</p>
                                )}
                                <p className={`text-xs mt-1 ${
                                  msg.sender_id === user?.id ? 'text-white/70' : 'text-purple-300/50'
                                }`}>
                                  {new Date(msg.created_at).toLocaleTimeString()}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                    
                    {selectedAppointment.status === 'approved' ? (
                      <div className="p-4 border-t border-purple-500/20">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="text-purple-400 hover:bg-purple-500/20">
                            <Paperclip className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-purple-400 hover:bg-purple-500/20">
                            <Smile className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-purple-400 hover:bg-purple-500/20">
                            <Gift className="w-4 h-4" />
                          </Button>
                          <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-1 bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-500"
                          />
                          <Button onClick={handleSendMessage} disabled={sending} className="bg-gradient-to-r from-purple-600 to-pink-600">
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 border-t border-purple-500/20 text-center text-purple-300/70">
                        {selectedAppointment.status === 'pending' 
                          ? 'Waiting for admin approval to start chatting...'
                          : 'This appointment has been closed.'
                        }
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-[450px] flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 mx-auto text-purple-500/30 mb-3" />
                      <p className="text-purple-300/50">Select an appointment to view messages</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Payment Plans Modal */}
        <ChatPaymentPlans
          open={paymentPlansOpen}
          onOpenChange={setPaymentPlansOpen}
          onPlanSelected={handlePlanSelected}
          currentPlan={isPremium ? 'premium' : undefined}
        />
      </div>
    </Layout>
  );
};

export default TeacherChat;
