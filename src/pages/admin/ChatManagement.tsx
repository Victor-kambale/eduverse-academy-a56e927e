import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Send,
  Trash2,
  Edit2,
  Loader2,
  Crown,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  teacher_id: string;
  subject: string;
  description: string | null;
  status: string;
  appointment_type: string;
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
  is_edited: boolean | null;
}

const ChatManagement = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editedText, setEditedText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (selectedAppointment) {
      fetchMessages(selectedAppointment.id);
      
      const channel = supabase
        .channel(`admin-messages-${selectedAppointment.id}`)
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'chat_messages',
            filter: `appointment_id=eq.${selectedAppointment.id}`
          },
          () => fetchMessages(selectedAppointment.id)
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedAppointment]);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_appointments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
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
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleApprove = async (appointment: Appointment) => {
    try {
      const { error } = await supabase
        .from('chat_appointments')
        .update({ 
          status: 'approved', 
          approved_at: new Date().toISOString(),
          approved_by: user?.id 
        })
        .eq('id', appointment.id);

      if (error) throw error;

      // Create notification
      await supabase.from('notifications').insert({
        user_id: appointment.teacher_id,
        title: 'Appointment Approved',
        message: `Your appointment "${appointment.subject}" has been approved. You can now start chatting!`,
        type: 'success',
        category: 'chat',
        priority: 'high',
      });

      toast.success('Appointment approved');
      fetchAppointments();
    } catch (error) {
      console.error('Error approving:', error);
      toast.error('Failed to approve appointment');
    }
  };

  const handleReject = async () => {
    if (!selectedAppointment) return;

    try {
      const { error } = await supabase
        .from('chat_appointments')
        .update({ 
          status: 'rejected',
          rejection_reason: rejectReason 
        })
        .eq('id', selectedAppointment.id);

      if (error) throw error;

      // Create notification
      await supabase.from('notifications').insert({
        user_id: selectedAppointment.teacher_id,
        title: 'Appointment Rejected',
        message: `Your appointment "${selectedAppointment.subject}" was rejected. Reason: ${rejectReason}`,
        type: 'error',
        category: 'chat',
        priority: 'high',
      });

      toast.success('Appointment rejected');
      setRejectDialogOpen(false);
      setRejectReason('');
      fetchAppointments();
    } catch (error) {
      console.error('Error rejecting:', error);
      toast.error('Failed to reject appointment');
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

  const handleEditMessage = async () => {
    if (!editingMessage) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ 
          message: editedText, 
          is_edited: true,
          edited_at: new Date().toISOString()
        })
        .eq('id', editingMessage.id);

      if (error) throw error;
      toast.success('Message updated');
      setEditingMessage(null);
      fetchMessages(selectedAppointment!.id);
    } catch (error) {
      console.error('Error editing:', error);
      toast.error('Failed to edit message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ 
          is_deleted: true,
          deleted_by: user?.id 
        })
        .eq('id', messageId);

      if (error) throw error;
      toast.success('Message deleted');
      fetchMessages(selectedAppointment!.id);
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete message');
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

  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const approvedCount = appointments.filter(a => a.status === 'approved').length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Chat Management</h1>
          <p className="text-muted-foreground">
            Manage teacher appointments and conversations
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{approvedCount}</p>
                  <p className="text-sm text-muted-foreground">Active Chats</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{appointments.length}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appointments */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pending">
                <TabsList className="w-full">
                  <TabsTrigger value="pending" className="flex-1">Pending</TabsTrigger>
                  <TabsTrigger value="approved" className="flex-1">Active</TabsTrigger>
                  <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                </TabsList>
                <TabsContent value="pending">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2 mt-2">
                      {appointments.filter(a => a.status === 'pending').map((apt) => (
                        <AppointmentCard 
                          key={apt.id} 
                          appointment={apt} 
                          selected={selectedAppointment?.id === apt.id}
                          onSelect={() => setSelectedAppointment(apt)}
                          onApprove={() => handleApprove(apt)}
                          onReject={() => {
                            setSelectedAppointment(apt);
                            setRejectDialogOpen(true);
                          }}
                          showActions
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="approved">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2 mt-2">
                      {appointments.filter(a => a.status === 'approved').map((apt) => (
                        <AppointmentCard 
                          key={apt.id} 
                          appointment={apt} 
                          selected={selectedAppointment?.id === apt.id}
                          onSelect={() => setSelectedAppointment(apt)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="all">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2 mt-2">
                      {appointments.map((apt) => (
                        <AppointmentCard 
                          key={apt.id} 
                          appointment={apt} 
                          selected={selectedAppointment?.id === apt.id}
                          onSelect={() => setSelectedAppointment(apt)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Chat */}
          <Card className="lg:col-span-2">
            <CardHeader className="border-b">
              {selectedAppointment ? (
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{selectedAppointment.subject}</CardTitle>
                    {selectedAppointment.appointment_type === 'premium' && (
                      <Crown className="w-4 h-4 text-accent" />
                    )}
                  </div>
                  <CardDescription>{getStatusBadge(selectedAppointment.status)}</CardDescription>
                </div>
              ) : (
                <CardTitle className="text-lg text-muted-foreground">
                  Select an appointment
                </CardTitle>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {selectedAppointment ? (
                <>
                  <ScrollArea className="h-[350px] p-4">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className="group relative max-w-[70%]">
                            <div
                              className={`p-3 rounded-lg ${
                                msg.sender_id === user?.id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              {msg.is_deleted ? (
                                <p className="italic text-sm opacity-70">Message deleted by admin</p>
                              ) : (
                                <>
                                  <p className="text-sm">{msg.message}</p>
                                  {msg.is_edited && (
                                    <span className="text-xs opacity-70">(edited)</span>
                                  )}
                                </>
                              )}
                              <p className={`text-xs mt-1 ${
                                msg.sender_id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              }`}>
                                {new Date(msg.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                            {!msg.is_deleted && (
                              <div className="absolute -top-2 right-0 hidden group-hover:flex gap-1">
                                <Button
                                  size="icon"
                                  variant="secondary"
                                  className="w-6 h-6"
                                  onClick={() => {
                                    setEditingMessage(msg);
                                    setEditedText(msg.message || '');
                                  }}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  className="w-6 h-6"
                                  onClick={() => handleDeleteMessage(msg.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  
                  {selectedAppointment.status === 'approved' && (
                    <div className="p-4 border-t">
                      <div className="flex items-center gap-2">
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
                  )}
                </>
              ) : (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Select an appointment to manage</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Appointment</DialogTitle>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection..."
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Message Dialog */}
      <Dialog open={!!editingMessage} onOpenChange={() => setEditingMessage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Message</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMessage(null)}>Cancel</Button>
            <Button onClick={handleEditMessage}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

interface AppointmentCardProps {
  appointment: Appointment;
  selected: boolean;
  onSelect: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  showActions?: boolean;
}

const AppointmentCard = ({ 
  appointment, 
  selected, 
  onSelect, 
  onApprove, 
  onReject,
  showActions 
}: AppointmentCardProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div
      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
        selected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="font-medium text-sm truncate">{appointment.subject}</p>
        {appointment.appointment_type === 'premium' && (
          <Crown className="w-4 h-4 text-accent" />
        )}
      </div>
      <div className="flex items-center gap-2 mb-2">
        {getStatusBadge(appointment.status)}
        <span className="text-xs text-muted-foreground">
          {new Date(appointment.created_at).toLocaleDateString()}
        </span>
      </div>
      {showActions && appointment.status === 'pending' && (
        <div className="flex gap-2">
          <Button size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); onApprove?.(); }}>
            <CheckCircle className="w-3 h-3 mr-1" />
            Approve
          </Button>
          <Button size="sm" variant="destructive" className="flex-1" onClick={(e) => { e.stopPropagation(); onReject?.(); }}>
            <XCircle className="w-3 h-3 mr-1" />
            Reject
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatManagement;
