import { useState, useEffect } from 'react';
import { 
  Gift, 
  Timer, 
  Send, 
  Save, 
  Trash2, 
  Edit, 
  Plus, 
  Eye, 
  EyeOff,
  Globe,
  Mail,
  Calendar,
  Clock,
  Percent,
  TestTube,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// Timezone data
const timezones = [
  { code: 'UTC', name: 'UTC (Coordinated Universal Time)', offset: 0 },
  { code: 'America/New_York', name: 'Eastern Time (US)', offset: -5 },
  { code: 'America/Chicago', name: 'Central Time (US)', offset: -6 },
  { code: 'America/Denver', name: 'Mountain Time (US)', offset: -7 },
  { code: 'America/Los_Angeles', name: 'Pacific Time (US)', offset: -8 },
  { code: 'Europe/London', name: 'London (GMT)', offset: 0 },
  { code: 'Europe/Paris', name: 'Paris (CET)', offset: 1 },
  { code: 'Europe/Berlin', name: 'Berlin (CET)', offset: 1 },
  { code: 'Asia/Tokyo', name: 'Tokyo (JST)', offset: 9 },
  { code: 'Asia/Shanghai', name: 'Shanghai (CST)', offset: 8 },
  { code: 'Asia/Dubai', name: 'Dubai (GST)', offset: 4 },
  { code: 'Asia/Singapore', name: 'Singapore (SGT)', offset: 8 },
  { code: 'Australia/Sydney', name: 'Sydney (AEST)', offset: 10 },
  { code: 'Africa/Lagos', name: 'Lagos (WAT)', offset: 1 },
  { code: 'Africa/Johannesburg', name: 'Johannesburg (SAST)', offset: 2 },
  { code: 'Africa/Cairo', name: 'Cairo (EET)', offset: 2 },
  { code: 'Africa/Nairobi', name: 'Nairobi (EAT)', offset: 3 },
];

interface PromoBanner {
  id: string;
  message: string;
  discountPercent: number;
  linkUrl: string;
  linkText: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  timezone: string;
  isActive: boolean;
  sendEmails: boolean;
  emailSubject: string;
  emailBody: string;
  promoType: 'daily' | 'monthly' | 'yearly' | 'custom';
  createdAt: string;
}

const defaultBanner: Omit<PromoBanner, 'id' | 'createdAt'> = {
  message: '20% off all Gift Cards for December! 💌 Treat yourself or a loved one this month!',
  discountPercent: 20,
  linkUrl: '/gift-cards',
  linkText: 'Get Your Discount!',
  startDate: new Date().toISOString().split('T')[0],
  startTime: '00:00',
  endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  endTime: '23:59',
  timezone: 'UTC',
  isActive: false,
  sendEmails: false,
  emailSubject: '🎁 Special Promotion Just For You!',
  emailBody: 'Dear Student,\n\nWe have an exciting promotion for you! Don\'t miss out on this limited-time offer.\n\nClick the link below to claim your discount!\n\nBest regards,\nEDUVERSE ACADEMY',
  promoType: 'custom',
};

export default function PromoBannerManagement() {
  const [banners, setBanners] = useState<PromoBanner[]>([
    {
      id: '1',
      ...defaultBanner,
      createdAt: new Date().toISOString(),
    },
  ]);
  const [editingBanner, setEditingBanner] = useState<PromoBanner | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [livePreview, setLivePreview] = useState<PromoBanner | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Calculate countdown for active banner
  useEffect(() => {
    const activeBanner = banners.find(b => b.isActive);
    if (!activeBanner) return;

    const calculateTimeLeft = () => {
      const endDateTime = new Date(`${activeBanner.endDate}T${activeBanner.endTime}`);
      const tz = timezones.find(t => t.code === activeBanner.timezone);
      const offset = tz ? tz.offset * 60 * 60 * 1000 : 0;
      const targetTime = endDateTime.getTime() - offset;
      const difference = targetTime - Date.now();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        // Promo ended
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        handlePromoEnd(activeBanner);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [banners]);

  const handlePromoEnd = (banner: PromoBanner) => {
    if (banner.sendEmails) {
      toast.success('Promotion ended! Sending completion emails to users...');
    }
    setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, isActive: false } : b));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    toast.success('Promo banner saved successfully!');
    setTimeout(() => setSaved(false), 3000);
    setShowEditDialog(false);
    setEditingBanner(null);
  };

  const handleToggleActive = (banner: PromoBanner) => {
    setBanners(prev => prev.map(b => {
      if (b.id === banner.id) {
        const newActive = !b.isActive;
        if (newActive && b.sendEmails) {
          toast.success('Promotion activated! Sending notification emails to all users...');
        }
        return { ...b, isActive: newActive };
      }
      return b;
    }));
  };

  const handleDelete = (id: string) => {
    setBanners(prev => prev.filter(b => b.id !== id));
    toast.success('Promo banner deleted');
  };

  const handleAddNew = () => {
    const newBanner: PromoBanner = {
      id: Date.now().toString(),
      ...defaultBanner,
      createdAt: new Date().toISOString(),
    };
    setEditingBanner(newBanner);
    setShowEditDialog(true);
  };

  const handleEdit = (banner: PromoBanner) => {
    setEditingBanner({ ...banner });
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (!editingBanner) return;
    
    setBanners(prev => {
      const exists = prev.find(b => b.id === editingBanner.id);
      if (exists) {
        return prev.map(b => b.id === editingBanner.id ? editingBanner : b);
      }
      return [...prev, editingBanner];
    });
    handleSave();
  };

  const handleTestPromo = (banner: PromoBanner) => {
    setTestMode(true);
    setLivePreview(banner);
    toast.info('Test mode activated - Preview banner visible');
  };

  const formatTime = (value: number) => value.toString().padStart(2, '0');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Promo Banner Management</h1>
          <p className="text-muted-foreground">Create and manage promotional banners with countdown timers</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Promo
        </Button>
      </div>

      {/* Live Preview */}
      {(livePreview || banners.find(b => b.isActive)) && (
        <Card className="border-2 border-green-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {testMode ? 'Test Preview' : 'Live Preview'}
              </CardTitle>
              {testMode && (
                <Button variant="outline" size="sm" onClick={() => {
                  setTestMode(false);
                  setLivePreview(null);
                }}>
                  Exit Test Mode
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-gradient-to-r from-primary via-purple-600 to-accent text-white py-3 px-4 rounded-lg"
            >
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm md:text-base">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 animate-bounce" />
                  <span className="font-medium">
                    {(livePreview || banners.find(b => b.isActive))?.message}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs md:text-sm bg-white/20 rounded-full px-3 py-1">
                  <Timer className="h-4 w-4" />
                  <span>Ends in</span>
                  <span className="font-mono font-bold">
                    {timeLeft.days}d : {formatTime(timeLeft.hours)}h : {formatTime(timeLeft.minutes)}m : {formatTime(timeLeft.seconds)}s
                  </span>
                </div>
                <Button size="sm" className="bg-white text-primary hover:bg-white/90 font-bold">
                  <Gift className="h-4 w-4 mr-1" />
                  {(livePreview || banners.find(b => b.isActive))?.linkText}
                </Button>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      )}

      {/* Banner List */}
      <div className="grid gap-4">
        {banners.map((banner) => (
          <Card key={banner.id} className={banner.isActive ? 'border-green-500' : ''}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={banner.isActive ? 'default' : 'secondary'}>
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">{banner.promoType}</Badge>
                    {banner.sendEmails && (
                      <Badge variant="outline" className="gap-1">
                        <Mail className="h-3 w-3" /> Emails Enabled
                      </Badge>
                    )}
                  </div>
                  <p className="font-medium">{banner.message}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Percent className="h-4 w-4" />
                      {banner.discountPercent}% off
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {banner.startDate} - {banner.endDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {banner.startTime} - {banner.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      {banner.timezone}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestPromo(banner)}
                  >
                    <TestTube className="h-4 w-4 mr-1" />
                    Test
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(banner)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant={banner.isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleToggleActive(banner)}
                  >
                    {banner.isActive ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        Turn Off
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-1" />
                        Turn On
                      </>
                    )}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Promo Banner?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. The promotional banner will be permanently deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(banner.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {editingBanner && banners.find(b => b.id === editingBanner.id) 
                ? 'Edit Promo Banner' 
                : 'Create New Promo Banner'}
            </DialogTitle>
          </DialogHeader>
          
          {editingBanner && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="timing">Timing</TabsTrigger>
                  <TabsTrigger value="email">Email Settings</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Promo Message</Label>
                    <Textarea
                      value={editingBanner.message}
                      onChange={(e) => setEditingBanner({ ...editingBanner, message: e.target.value })}
                      placeholder="Enter your promotional message..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Discount Percentage</Label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={editingBanner.discountPercent}
                        onChange={(e) => setEditingBanner({ 
                          ...editingBanner, 
                          discountPercent: parseInt(e.target.value) || 0 
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Promo Type</Label>
                      <Select
                        value={editingBanner.promoType}
                        onValueChange={(value: any) => setEditingBanner({ 
                          ...editingBanner, 
                          promoType: value 
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Button Link URL</Label>
                      <Input
                        value={editingBanner.linkUrl}
                        onChange={(e) => setEditingBanner({ ...editingBanner, linkUrl: e.target.value })}
                        placeholder="/gift-cards"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Button Text</Label>
                      <Input
                        value={editingBanner.linkText}
                        onChange={(e) => setEditingBanner({ ...editingBanner, linkText: e.target.value })}
                        placeholder="Get Your Discount!"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="timing" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select
                      value={editingBanner.timezone}
                      onValueChange={(value) => setEditingBanner({ ...editingBanner, timezone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz.code} value={tz.code}>
                            {tz.name} (UTC{tz.offset >= 0 ? '+' : ''}{tz.offset})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h4 className="font-medium">Start Time</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label>Date</Label>
                          <Input
                            type="date"
                            value={editingBanner.startDate}
                            onChange={(e) => setEditingBanner({ ...editingBanner, startDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Time</Label>
                          <Input
                            type="time"
                            value={editingBanner.startTime}
                            onChange={(e) => setEditingBanner({ ...editingBanner, startTime: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-medium">End Time</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label>Date</Label>
                          <Input
                            type="date"
                            value={editingBanner.endDate}
                            onChange={(e) => setEditingBanner({ ...editingBanner, endDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Time</Label>
                          <Input
                            type="time"
                            value={editingBanner.endTime}
                            onChange={(e) => setEditingBanner({ ...editingBanner, endTime: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <span>
                          The countdown timer will display real-time based on the selected timezone. 
                          When it reaches 0, the promotion will automatically end.
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="email" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Send Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify users when promotion starts and ends
                      </p>
                    </div>
                    <Switch
                      checked={editingBanner.sendEmails}
                      onCheckedChange={(checked) => setEditingBanner({ 
                        ...editingBanner, 
                        sendEmails: checked 
                      })}
                    />
                  </div>

                  <Separator />

                  {editingBanner.sendEmails && (
                    <>
                      <div className="space-y-2">
                        <Label>Email Subject</Label>
                        <Input
                          value={editingBanner.emailSubject}
                          onChange={(e) => setEditingBanner({ 
                            ...editingBanner, 
                            emailSubject: e.target.value 
                          })}
                          placeholder="🎁 Special Promotion Just For You!"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Email Body</Label>
                        <Textarea
                          value={editingBanner.emailBody}
                          onChange={(e) => setEditingBanner({ 
                            ...editingBanner, 
                            emailBody: e.target.value 
                          })}
                          rows={8}
                          placeholder="Enter email content..."
                        />
                        <p className="text-xs text-muted-foreground">
                          Use placeholders: {'{name}'}, {'{discount}'}, {'{link}'}, {'{end_date}'}
                        </p>
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="preview" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Banner Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gradient-to-r from-primary via-purple-600 to-accent text-white py-3 px-4 rounded-lg">
                        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Gift className="h-5 w-5 animate-bounce" />
                            <span className="font-medium">{editingBanner.message}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs bg-white/20 rounded-full px-3 py-1">
                            <Timer className="h-4 w-4" />
                            <span>Ends in</span>
                            <span className="font-mono font-bold">0d : 00h : 00m : 00s</span>
                          </div>
                          <Button size="sm" className="bg-white text-primary hover:bg-white/90 font-bold">
                            <Gift className="h-4 w-4 mr-1" />
                            {editingBanner.linkText}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {editingBanner.sendEmails && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Email Preview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="outline">Subject:</Badge>
                            <span>{editingBanner.emailSubject}</span>
                          </div>
                          <Separator />
                          <div className="whitespace-pre-wrap text-sm">
                            {editingBanner.emailBody}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t sticky bottom-0 bg-background">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <AnimatePresence mode="wait">
                  {saved ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                    >
                      <Button className="bg-green-500 hover:bg-green-600">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Saved!
                      </Button>
                    </motion.div>
                  ) : (
                    <Button onClick={handleSaveEdit} disabled={saving}>
                      {saving ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
