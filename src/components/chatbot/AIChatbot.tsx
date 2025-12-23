import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Paperclip,
  Smile,
  Bot,
  User,
  Loader2,
  Minimize2,
  Maximize2,
  Settings,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  links?: { text: string; url: string }[];
}

interface ChatbotConfig {
  enabled: boolean;
  allowAttachments: boolean;
  allowEmoji: boolean;
  botName: string;
  botAvatar: string;
  welcomeMessage: string;
}

const defaultConfig: ChatbotConfig = {
  enabled: true,
  allowAttachments: false,
  allowEmoji: true,
  botName: 'Eduverse AI',
  botAvatar: '/placeholder.svg',
  welcomeMessage: 'Hello! I\'m your Eduverse AI assistant. How can I help you today?',
};

const quickReplies = [
  'How do I enroll in a course?',
  'Where can I find my certificates?',
  'How do I contact support?',
  'What payment methods are accepted?',
  'How do I become a teacher?',
];

const platformLinks: Record<string, { text: string; url: string }[]> = {
  'enroll': [
    { text: 'Browse Courses', url: '/courses' },
    { text: 'Pricing Plans', url: '/pricing' },
  ],
  'certificate': [
    { text: 'My Certificates', url: '/dashboard' },
    { text: 'Verify Certificate', url: '/verify-certificate' },
  ],
  'payment': [
    { text: 'Pricing', url: '/pricing' },
    { text: 'Gift Cards', url: '/gift-cards' },
  ],
  'teacher': [
    { text: 'Become a Teacher', url: '/teacher-registration' },
    { text: 'Teacher Dashboard', url: '/teacher/dashboard' },
  ],
  'support': [
    { text: 'Help Center', url: '/help' },
    { text: 'Contact Us', url: '/contact' },
  ],
};

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [config] = useState<ChatbotConfig>(defaultConfig);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: config.welcomeMessage,
        timestamp: new Date(),
      }]);
    }
  }, [isOpen, config.welcomeMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getAIResponse = async (userMessage: string): Promise<{ content: string; links?: { text: string; url: string }[] }> => {
    // Simulate AI response with smart context-aware replies
    const lowerMessage = userMessage.toLowerCase();
    
    let response = '';
    let links: { text: string; url: string }[] = [];

    if (lowerMessage.includes('enroll') || lowerMessage.includes('course') || lowerMessage.includes('sign up')) {
      response = `To enroll in a course on Eduverse Academy:\n\n1. Browse our catalog of courses\n2. Click on a course to view details\n3. Click "Enroll Now" and complete payment\n4. Start learning immediately!\n\nHere are some helpful links:`;
      links = platformLinks['enroll'];
    } else if (lowerMessage.includes('certificate') || lowerMessage.includes('credential')) {
      response = `You can access your certificates from your dashboard after completing a course. Each certificate has a unique verification ID that can be verified by employers.\n\nHere are some helpful links:`;
      links = platformLinks['certificate'];
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('pay') || lowerMessage.includes('price')) {
      response = `Eduverse Academy accepts multiple payment methods:\n\n• Credit/Debit Cards (Visa, Mastercard, Amex)\n• PayPal\n• Google Pay & Apple Pay\n• WeChat Pay & Alipay\n• Mobile Money\n\nAll payments are secure and encrypted.`;
      links = platformLinks['payment'];
    } else if (lowerMessage.includes('teacher') || lowerMessage.includes('instructor') || lowerMessage.includes('teach')) {
      response = `To become a teacher on Eduverse:\n\n1. Complete the teacher registration form\n2. Upload required documents\n3. Pay the registration fee\n4. Sign the contract\n5. Get approved and start teaching!\n\nTeachers earn 70% of course sales.`;
      links = platformLinks['teacher'];
    } else if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('contact')) {
      response = `I'm here to help! You can:\n\n• Ask me any question about Eduverse\n• Visit our Help Center for detailed guides\n• Contact our support team directly\n\nWhat would you like help with?`;
      links = platformLinks['support'];
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      response = `Hello! 👋 Welcome to Eduverse Academy. I'm here to help you with:\n\n• Course enrollment\n• Certificate questions\n• Payment support\n• Teacher registration\n• General inquiries\n\nHow can I assist you today?`;
    } else {
      response = `Thank you for your question! I'll do my best to help.\n\nFor more specific assistance, you might want to:\n• Browse our Help Center\n• Contact our support team\n• Check our FAQ section\n\nIs there anything specific I can help you with?`;
      links = platformLinks['support'];
    }

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    return { content: response, links };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await getAIResponse(input.trim());
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        links: response.links,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Failed to get response');
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    setInput(reply);
    setTimeout(() => handleSend(), 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!config.enabled) return null;

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="lg"
              className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90"
              onClick={() => setIsOpen(true)}
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 'auto' : '500px',
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] bg-background border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border-2 border-primary-foreground/20">
                  <AvatarImage src={config.botAvatar} />
                  <AvatarFallback><Bot className="w-5 h-5" /></AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{config.botName}</h3>
                  <p className="text-xs text-primary-foreground/70">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            {message.role === 'assistant' ? (
                              <>
                                <AvatarImage src={config.botAvatar} />
                                <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
                              </>
                            ) : (
                              <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <div className={`rounded-2xl px-4 py-2 ${
                              message.role === 'user' 
                                ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                                : 'bg-muted rounded-tl-sm'
                            }`}>
                              <p className="text-sm whitespace-pre-line">{message.content}</p>
                            </div>
                            {message.links && message.links.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {message.links.map((link, i) => (
                                  <a
                                    key={i}
                                    href={link.url}
                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    {link.text}
                                  </a>
                                ))}
                              </div>
                            )}
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={config.botAvatar} />
                          <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Quick Replies */}
                {messages.length <= 1 && (
                  <div className="px-4 py-2 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickReplies.slice(0, 3).map((reply) => (
                        <Badge
                          key={reply}
                          variant="outline"
                          className="cursor-pointer hover:bg-muted"
                          onClick={() => handleQuickReply(reply)}
                        >
                          {reply}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t bg-background">
                  <div className="flex items-center gap-2">
                    {config.allowAttachments && (
                      <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
                        <Paperclip className="w-4 h-4" />
                      </Button>
                    )}
                    {config.allowEmoji && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9">
                            <Smile className="w-4 h-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-2" align="start">
                          <div className="grid grid-cols-8 gap-1">
                            {['😊', '👍', '❤️', '🎉', '🤔', '👋', '🙏', '✨', '💡', '📚', '🎓', '💪', '🌟', '🔥', '💯', '👀'].map((emoji) => (
                              <button
                                key={emoji}
                                className="p-2 hover:bg-muted rounded text-lg"
                                onClick={() => setInput(prev => prev + emoji)}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                    <Input
                      ref={inputRef}
                      placeholder="Type a message..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1"
                    />
                    <Button 
                      size="icon" 
                      onClick={handleSend}
                      disabled={!input.trim() || isTyping}
                    >
                      {isTyping ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
