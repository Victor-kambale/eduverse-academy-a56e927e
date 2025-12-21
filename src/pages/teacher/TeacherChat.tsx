import { useState, useEffect, useRef } from 'react';
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
  Crown
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
import { Layout } from '@/components/layout/Layout';
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
  const [appointmentForm, setAppointmentForm] = useState({
    subject: '',
    description: '',
    type: 'free',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedAppointment) {
      fetchMessages(selectedAppointment.id);
      
      // Subscribe to new messages
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
      // Fetch appointments
      const { data: appointmentsData } = await supabase
        .from('chat_appointments')
        .select('*')
        .eq('teacher_id', user?.id)
        .order('created_at', { ascending: false });

      setAppointments(appointmentsData || []);

      // Fetch credits
      const { data: creditsData } = await supabase
        .from('teacher_credits')
        .select('*')
        .eq('teacher_id', user?.id)
        .maybeSingle();

      setCredits(creditsData);
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

    // Check credits for free appointments
    if (appointmentForm.type === 'free' && credits && credits.free_messages_remaining <= 0) {
      toast.error('No free messages remaining. Please upgrade to premium.');
      return;
    }

    try {
      const { error } = await supabase.from('chat_appointments').insert({
        teacher_id: user?.id,
        subject: appointmentForm.subject,
        description: appointmentForm.description,
        appointment_type: appointmentForm.type,
      });

      if (error) throw error;

      // Deduct free message if applicable
      if (appointmentForm.type === 'free' && credits) {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'completed':
        return <Badge variant="secondary"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Chat with Admin</h1>
          <p className="text-muted-foreground">Request appointments and communicate with the platform team</p>
        </div>

        {/* Credits Card */}
        <Card className="mb-6 border-accent/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  {credits?.is_premium ? (
                    <Crown className="w-6 h-6 text-accent" />
                  ) : (
                    <CreditCard className="w-6 h-6 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">
                      {credits?.is_premium ? 'Premium Member' : 'Free Tier'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {credits?.is_premium 
                        ? 'Unlimited priority messages'
                        : `${credits?.free_messages_remaining || 0}/5 free messages remaining`
                      }
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!credits?.is_premium && (
                  <Button variant="accent">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade - $10/month
                  </Button>
                )}
                <Dialog open={appointmentDialogOpen} onOpenChange={setAppointmentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      New Appointment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Appointment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Appointment Type</Label>
                        <Select 
                          value={appointmentForm.type} 
                          onValueChange={(value) => setAppointmentForm({ ...appointmentForm, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">
                              Free ({credits?.free_messages_remaining || 0} remaining)
                            </SelectItem>
                            <SelectItem value="premium">
                              Premium (Priority - 99% approval rate)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Subject</Label>
                        <Input
                          value={appointmentForm.subject}
                          onChange={(e) => setAppointmentForm({ ...appointmentForm, subject: e.target.value })}
                          placeholder="What would you like to discuss?"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={appointmentForm.description}
                          onChange={(e) => setAppointmentForm({ ...appointmentForm, description: e.target.value })}
                          placeholder="Provide more details..."
                          rows={4}
                        />
                      </div>
                      <Button onClick={handleCreateAppointment} className="w-full">
                        Submit Request
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appointments List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Your Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {appointments.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No appointments yet</p>
                    </div>
                  ) : (
                    appointments.map((apt) => (
                      <button
                        key={apt.id}
                        onClick={() => setSelectedAppointment(apt)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedAppointment?.id === apt.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm truncate">{apt.subject}</p>
                          {apt.appointment_type === 'premium' && (
                            <Crown className="w-4 h-4 text-accent" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(apt.status)}
                          <span className="text-xs text-muted-foreground">
                            {new Date(apt.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            <CardHeader className="border-b">
              {selectedAppointment ? (
                <div>
                  <CardTitle className="text-lg">{selectedAppointment.subject}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    {getStatusBadge(selectedAppointment.status)}
                    {selectedAppointment.rejection_reason && (
                      <span className="text-destructive text-xs">
                        Reason: {selectedAppointment.rejection_reason}
                      </span>
                    )}
                  </CardDescription>
                </div>
              ) : (
                <CardTitle className="text-lg text-muted-foreground">
                  Select an appointment to start chatting
                </CardTitle>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {selectedAppointment ? (
                <>
                  <ScrollArea className="h-[400px] p-4">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              msg.sender_id === user?.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            {msg.is_deleted ? (
                              <p className="italic text-sm opacity-70">Message deleted</p>
                            ) : (
                              <p className="text-sm">{msg.message}</p>
                            )}
                            <p className={`text-xs mt-1 ${
                              msg.sender_id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              {new Date(msg.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  
                  {selectedAppointment.status === 'approved' ? (
                    <div className="p-4 border-t">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Paperclip className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Smile className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Gift className="w-4 h-4" />
                        </Button>
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1"
                        />
                        <Button onClick={handleSendMessage} disabled={sending}>
                          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border-t text-center text-muted-foreground">
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
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Select an appointment to view messages</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default TeacherChat;
