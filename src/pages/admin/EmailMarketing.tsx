import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Mail, 
  Send, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  Trash2,
  Eye,
  Calendar
} from 'lucide-react';
import { StatsCard } from '@/components/admin/StatsCard';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  recipients: number;
  openRate: number;
  sentAt?: string;
  scheduledAt?: string;
}

// Mock data for campaigns
const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Welcome Series',
    subject: 'Welcome to EduVerse - Start Your Learning Journey!',
    status: 'sent',
    recipients: 1250,
    openRate: 45.2,
    sentAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'New Course Announcement',
    subject: 'New Course: Advanced React Patterns',
    status: 'scheduled',
    recipients: 3400,
    openRate: 0,
    scheduledAt: '2024-01-20T09:00:00Z'
  },
  {
    id: '3',
    name: 'Black Friday Sale',
    subject: '50% Off All Courses - Limited Time!',
    status: 'draft',
    recipients: 0,
    openRate: 0
  }
];

export default function EmailMarketing() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [selectedTemplate, setSelectedTemplate] = useState('welcome');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [isSending, setIsSending] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');

  const emailTemplates = {
    welcome: {
      subject: 'Welcome to EduVerse - Start Your Learning Journey!',
      content: `<h1>Welcome to EduVerse!</h1>
<p>We're thrilled to have you join our community of learners.</p>
<p>Start exploring our courses and begin your journey to mastering new skills.</p>
<a href="{{courses_link}}">Browse Courses</a>`
    },
    courseReminder: {
      subject: "Don't forget to continue your course!",
      content: `<h1>Keep Learning!</h1>
<p>You're making great progress on your course. Don't stop now!</p>
<p>Continue where you left off and achieve your learning goals.</p>
<a href="{{course_link}}">Continue Learning</a>`
    },
    promotion: {
      subject: 'Special Offer Just For You!',
      content: `<h1>Exclusive Offer!</h1>
<p>We have a special promotion just for you.</p>
<p>Get {{discount}}% off on all courses this week only!</p>
<a href="{{promo_link}}">Claim Your Discount</a>`
    },
    newsletter: {
      subject: 'EduVerse Weekly Newsletter',
      content: `<h1>This Week at EduVerse</h1>
<p>Here's what's new and exciting:</p>
<ul>
  <li>New courses added</li>
  <li>Top trending topics</li>
  <li>Student success stories</li>
</ul>
<a href="{{newsletter_link}}">Read More</a>`
    }
  };

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    const templateData = emailTemplates[template as keyof typeof emailTemplates];
    if (templateData) {
      setEmailSubject(templateData.subject);
      setEmailContent(templateData.content);
    }
  };

  const handleSendCampaign = async () => {
    if (!emailSubject || !emailContent) {
      toast.error('Please fill in subject and content');
      return;
    }

    setIsSending(true);
    
    try {
      // Fetch target users based on audience
      let users: { email: string }[] = [];
      
      if (targetAudience === 'all') {
        const { data } = await supabase.from('profiles').select('email').not('email', 'is', null);
        users = data || [];
      } else if (targetAudience === 'subscribers') {
        const { data } = await supabase.from('newsletter_subscribers').select('email').eq('is_active', true);
        users = data || [];
      } else if (targetAudience === 'enrolled') {
        const { data } = await supabase
          .from('enrollments')
          .select('user_id')
          .limit(100);
        
        if (data && data.length > 0) {
          const userIds = data.map(e => e.user_id);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('email')
            .in('user_id', userIds);
          users = profiles || [];
        }
      }

      if (users.length === 0) {
        toast.warning('No recipients found for the selected audience');
        setIsSending(false);
        return;
      }

      // Send emails in batches
      const emails = users.map(u => u.email).filter(Boolean);
      const batchSize = 50;
      
      for (let i = 0; i < emails.length; i += batchSize) {
        const batch = emails.slice(i, i + batchSize);
        
        await supabase.functions.invoke('send-email', {
          body: {
            to: batch,
            subject: emailSubject,
            html: emailContent
          }
        });
      }

      toast.success(`Campaign sent to ${emails.length} recipients`);
      
      // Add to campaigns list
      const newCampaign: Campaign = {
        id: Date.now().toString(),
        name: emailSubject.slice(0, 30),
        subject: emailSubject,
        status: 'sent',
        recipients: emails.length,
        openRate: 0,
        sentAt: new Date().toISOString()
      };
      
      setCampaigns([newCampaign, ...campaigns]);
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast.error('Failed to send campaign');
    } finally {
      setIsSending(false);
    }
  };

  const getStatusBadge = (status: Campaign['status']) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" /> Sent</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><Clock className="w-3 h-3 mr-1" /> Scheduled</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Draft</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Email Marketing</h1>
          <p className="text-muted-foreground">Create and manage email campaigns</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Campaigns"
          value={campaigns.length}
          change="+3 this month"
          changeType="positive"
          icon={Mail}
        />
        <StatsCard
          title="Emails Sent"
          value="4,650"
          change="+12%"
          changeType="positive"
          icon={Send}
        />
        <StatsCard
          title="Subscribers"
          value="3,420"
          change="+8%"
          changeType="positive"
          icon={Users}
        />
        <StatsCard
          title="Avg. Open Rate"
          value="42.5%"
          change="+2.3%"
          changeType="positive"
          icon={Eye}
        />
      </div>

      <Tabs defaultValue="compose" className="space-y-4">
        <TabsList>
          <TabsTrigger value="compose">Compose Email</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compose New Email</CardTitle>
                <CardDescription>Create and send marketing emails</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template">Email Template</Label>
                  <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="welcome">Welcome Email</SelectItem>
                      <SelectItem value="courseReminder">Course Reminder</SelectItem>
                      <SelectItem value="promotion">Promotion</SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience</Label>
                  <Select value={targetAudience} onValueChange={setTargetAudience}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="subscribers">Newsletter Subscribers</SelectItem>
                      <SelectItem value="enrolled">Enrolled Students</SelectItem>
                      <SelectItem value="inactive">Inactive Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject Line</Label>
                  <Input 
                    id="subject" 
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Enter email subject"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Email Content (HTML)</Label>
                  <Textarea 
                    id="content" 
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    placeholder="Enter email content"
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleSendCampaign} 
                    disabled={isSending || !emailSubject || !emailContent}
                    className="flex-1"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSending ? 'Sending...' : 'Send Campaign'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setIsScheduleDialogOpen(true)}
                    disabled={!emailSubject || !emailContent}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>See how your email will look</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-white text-gray-900 min-h-[400px]">
                  <div className="border-b pb-2 mb-4">
                    <p className="text-sm text-gray-500">Subject:</p>
                    <p className="font-medium">{emailSubject || 'No subject'}</p>
                  </div>
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: emailContent || '<p class="text-gray-400">Email preview will appear here...</p>' }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Campaign History</CardTitle>
                  <CardDescription>View and manage your email campaigns</CardDescription>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Campaign
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Open Rate</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell>{campaign.recipients.toLocaleString()}</TableCell>
                      <TableCell>{campaign.openRate > 0 ? `${campaign.openRate}%` : '-'}</TableCell>
                      <TableCell>
                        {campaign.sentAt 
                          ? new Date(campaign.sentAt).toLocaleDateString() 
                          : campaign.scheduledAt 
                            ? `Scheduled: ${new Date(campaign.scheduledAt).toLocaleDateString()}`
                            : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(emailTemplates).map(([key, template]) => (
              <Card key={key} className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleTemplateChange(key)}>
                <CardHeader>
                  <CardTitle className="text-lg capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</CardTitle>
                  <CardDescription>{template.subject}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div 
                    className="text-sm text-muted-foreground line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: template.content.slice(0, 150) + '...' }}
                  />
                  <Button variant="outline" size="sm" className="mt-4 w-full">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
            <Card className="border-dashed cursor-pointer hover:border-primary transition-colors flex items-center justify-center min-h-[200px]">
              <div className="text-center text-muted-foreground">
                <Plus className="w-8 h-8 mx-auto mb-2" />
                <p>Create New Template</p>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Schedule Campaign
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input 
                type="date" 
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input 
                type="time" 
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Subject:</strong> {emailSubject}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Audience:</strong> {targetAudience}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (!scheduleDate) {
                  toast.error('Please select a date');
                  return;
                }
                const scheduledAt = `${scheduleDate}T${scheduleTime}:00Z`;
                const newCampaign: Campaign = {
                  id: Date.now().toString(),
                  name: emailSubject.slice(0, 30),
                  subject: emailSubject,
                  status: 'scheduled',
                  recipients: 0,
                  openRate: 0,
                  scheduledAt
                };
                setCampaigns([newCampaign, ...campaigns]);
                toast.success(`Campaign scheduled for ${new Date(scheduledAt).toLocaleString()}`);
                setIsScheduleDialogOpen(false);
                setEmailSubject('');
                setEmailContent('');
              }}
              disabled={!scheduleDate}
            >
              <Clock className="w-4 h-4 mr-2" />
              Schedule Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
