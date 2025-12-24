import { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  X, 
  Minus, 
  User, 
  Bot, 
  Paperclip,
  Smile,
  Loader2,
  Clock,
  CheckCircle,
  Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  sender: 'user' | 'bot' | 'admin';
  content: string;
  timestamp: Date;
  isOffline?: boolean;
}

interface OfflineForm {
  fullName: string;
  email: string;
  age: string;
  gender: string;
  country: string;
  profession: string;
  message: string;
}

interface DashboardChatbotProps {
  dashboardType: 'teacher' | 'university';
  userId?: string;
}

const DashboardChatbot = ({ dashboardType, userId }: DashboardChatbotProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [showOfflineForm, setShowOfflineForm] = useState(false);
  const [offlineForm, setOfflineForm] = useState<OfflineForm>({
    fullName: '',
    email: user?.email || '',
    age: '',
    gender: '',
    country: '',
    profession: '',
    message: ''
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check admin online status (simulated)
    const checkOnlineStatus = () => {
      const hour = new Date().getHours();
      // Admin is online during business hours (9 AM - 6 PM)
      setIsOnline(hour >= 9 && hour < 18);
    };
    
    checkOnlineStatus();
    const interval = setInterval(checkOnlineStatus, 60000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        sender: 'bot',
        content: isOnline 
          ? `Hello! Welcome to ${dashboardType === 'teacher' ? 'Teacher' : 'University'} Support. How can I help you today?`
          : `Hello! Our support team is currently offline. Please leave your contact details and we'll get back to you within 24 hours.`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      
      if (!isOnline) {
        setTimeout(() => setShowOfflineForm(true), 1000);
      }
    }
  }, [isOpen, isOnline, dashboardType]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const playNotificationSound = () => {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const getBotResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    const responses: { [key: string]: string } = {
      'course': `For ${dashboardType === 'teacher' ? 'creating courses' : 'managing courses'}, go to the Courses tab. You can add lessons, resources, and set pricing.`,
      'withdraw': 'To withdraw funds, navigate to the Withdrawals tab. Minimum withdrawal is $50. Available methods: PayPal, Stripe, Bank Transfer, WeChat Pay, Alipay.',
      'certificate': 'Certificates can be managed in the Certificates section. You can upload custom templates for your courses.',
      'payment': 'Payment issues? Please check your linked accounts in Settings. Contact support if problems persist.',
      'student': 'View enrolled students in your course analytics. You can see progress and engagement metrics.',
      'help': 'I can help with: courses, withdrawals, certificates, payments, students, and general questions. What do you need?',
      'revenue': 'View your revenue in the Analytics dashboard. Filter by day, week, month, or year.',
      'settings': 'Access Settings from the top menu to update notifications, payment methods, and profile information.'
    };

    for (const [key, response] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }

    return isOnline 
      ? 'I understand. Let me connect you with a support agent who can help you better.'
      : 'Thank you for your message. Please fill out the contact form so our team can reach you within 24 hours.';
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        content: getBotResponse(inputValue),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
      playNotificationSound();
    }, 1500);
  };

  const handleOfflineSubmit = async () => {
    if (!offlineForm.fullName || !offlineForm.email || !offlineForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Save offline message to database and notify admin
      const { error } = await supabase.from('notifications').insert({
        user_id: '00000000-0000-0000-0000-000000000000', // Admin placeholder
        title: `Offline Chat Message - ${dashboardType.charAt(0).toUpperCase() + dashboardType.slice(1)}`,
        message: `
          Name: ${offlineForm.fullName}
          Email: ${offlineForm.email}
          Age: ${offlineForm.age}
          Gender: ${offlineForm.gender}
          Country: ${offlineForm.country}
          Profession: ${offlineForm.profession}
          Message: ${offlineForm.message}
        `,
        type: 'info',
        category: 'chatbot',
        metadata: JSON.stringify({
          dashboardType,
          userId: user?.id,
          ...offlineForm
        })
      });

      if (error) throw error;

      const confirmMessage: Message = {
        id: Date.now().toString(),
        sender: 'bot',
        content: `Thank you, ${offlineForm.fullName}! Your message has been received. Our team will contact you at ${offlineForm.email} within 24 hours or same day.`,
        timestamp: new Date(),
        isOffline: true
      };
      
      setMessages(prev => [...prev, confirmMessage]);
      setShowOfflineForm(false);
      setOfflineForm({
        fullName: '',
        email: '',
        age: '',
        gender: '',
        country: '',
        profession: '',
        message: ''
      });
      
      toast.success('Message sent! We\'ll get back to you soon.');
      playNotificationSound();
    } catch (error) {
      console.error('Error submitting offline form:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const countries = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 
    'France', 'China', 'Japan', 'India', 'Brazil', 'Uganda', 'Nigeria',
    'South Africa', 'Kenya', 'Ghana', 'Egypt', 'Other'
  ];

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className={`rounded-full w-16 h-16 shadow-lg ${
            dashboardType === 'teacher' 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
              : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
          }`}
        >
          <MessageSquare className="w-7 h-7" />
        </Button>
        {!isOnline && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
        )}
      </motion.div>
    );
  }

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Card className="w-80 cursor-pointer" onClick={() => setIsMinimized(false)}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                dashboardType === 'teacher' ? 'bg-purple-500/20' : 'bg-blue-500/20'
              }`}>
                <MessageSquare className={`w-5 h-5 ${
                  dashboardType === 'teacher' ? 'text-purple-500' : 'text-blue-500'
                }`} />
              </div>
              <div>
                <p className="font-semibold">Support Chat</p>
                <p className="text-xs text-muted-foreground">Click to expand</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
              <X className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Card className="w-96 shadow-2xl border-2">
          <CardHeader className={`p-4 rounded-t-lg text-white ${
            dashboardType === 'teacher' 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600'
              : 'bg-gradient-to-r from-blue-600 to-cyan-600'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border-2 border-white/30">
                  <AvatarFallback className="bg-white/20">
                    <Bot className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{dashboardType === 'teacher' ? 'Teacher' : 'University'} Support</p>
                  <div className="flex items-center gap-1 text-xs">
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
                    {isOnline ? 'Online' : 'Offline - Back in 24h'}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setIsMinimized(true)}>
                  <Minus className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <ScrollArea className="h-80 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl p-3 ${
                    message.sender === 'user'
                      ? dashboardType === 'teacher'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <div className={`flex items-center gap-1 mt-1 text-xs ${
                      message.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'
                    }`}>
                      <Clock className="w-3 h-3" />
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {message.isOffline && <Badge variant="secondary" className="ml-2 text-[10px]">Offline</Badge>}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl p-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Typing...</span>
                  </div>
                </div>
              )}

              {showOfflineForm && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-muted rounded-xl p-4 space-y-3"
                >
                  <h4 className="font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Leave your details
                  </h4>
                  <div className="grid gap-2">
                    <Input
                      placeholder="Full Name *"
                      value={offlineForm.fullName}
                      onChange={(e) => setOfflineForm(prev => ({ ...prev, fullName: e.target.value }))}
                    />
                    <Input
                      placeholder="Email *"
                      type="email"
                      value={offlineForm.email}
                      onChange={(e) => setOfflineForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Age"
                        type="number"
                        value={offlineForm.age}
                        onChange={(e) => setOfflineForm(prev => ({ ...prev, age: e.target.value }))}
                      />
                      <Select value={offlineForm.gender} onValueChange={(v) => setOfflineForm(prev => ({ ...prev, gender: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Select value={offlineForm.country} onValueChange={(v) => setOfflineForm(prev => ({ ...prev, country: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Profession"
                      value={offlineForm.profession}
                      onChange={(e) => setOfflineForm(prev => ({ ...prev, profession: e.target.value }))}
                    />
                    <Textarea
                      placeholder="Your message *"
                      rows={2}
                      value={offlineForm.message}
                      onChange={(e) => setOfflineForm(prev => ({ ...prev, message: e.target.value }))}
                    />
                  </div>
                  <Button onClick={handleOfflineSubmit} className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Submit
                  </Button>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="shrink-0">
                <Smile className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Paperclip className="w-5 h-5" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1"
              />
              <Button onClick={handleSend} size="icon" className={
                dashboardType === 'teacher'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600'
              }>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default DashboardChatbot;
