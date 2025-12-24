import { useState, useEffect, useCallback } from 'react';
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
  Mail,
  Calendar,
  Clock,
  TestTube,
  Loader2,
  Upload,
  Image as ImageIcon,
  BarChart3
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
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useDropzone } from 'react-dropzone';
import { Link } from 'react-router-dom';

interface PromoBanner {
  id: string;
  title: string;
  description: string | null;
  link_url: string | null;
  link_text: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  media_url: string | null;
  media_type: string;
  target_audience: string | null;
  sort_order: number | null;
}

// Holiday templates for quick promo creation
const holidayTemplates = [
  { name: 'Christmas', emoji: '🎄', message: 'Christmas Special! Get {discount}% OFF with code', defaultCode: 'XMAS', bgColor: 'from-red-600 via-green-600 to-red-600' },
  { name: 'New Year', emoji: '🎉', message: 'New Year Sale! Start fresh with {discount}% OFF', defaultCode: 'NEWYEAR', bgColor: 'from-yellow-500 via-purple-600 to-blue-600' },
  { name: 'Valentine', emoji: '💕', message: "Valentine's Day! Spread love with {discount}% OFF", defaultCode: 'LOVE', bgColor: 'from-pink-500 via-red-500 to-pink-500' },
  { name: 'Easter', emoji: '🐰', message: 'Easter Special! Hop to {discount}% savings', defaultCode: 'EASTER', bgColor: 'from-purple-400 via-pink-400 to-yellow-400' },
  { name: 'Summer', emoji: '☀️', message: 'Summer Sale! Hot deals with {discount}% OFF', defaultCode: 'SUMMER', bgColor: 'from-orange-500 via-yellow-500 to-orange-500' },
  { name: 'Halloween', emoji: '🎃', message: 'Spooky Savings! {discount}% OFF everything', defaultCode: 'SPOOKY', bgColor: 'from-orange-600 via-black to-purple-800' },
  { name: 'Black Friday', emoji: '🏷️', message: 'Black Friday Madness! {discount}% OFF sitewide', defaultCode: 'BLACKFRI', bgColor: 'from-black via-gray-800 to-black' },
  { name: 'Cyber Monday', emoji: '💻', message: 'Cyber Monday Deals! {discount}% OFF all courses', defaultCode: 'CYBER', bgColor: 'from-cyan-500 via-blue-600 to-cyan-500' },
  { name: 'Thanksgiving', emoji: '🦃', message: 'Thanksgiving! Be thankful with {discount}% OFF', defaultCode: 'THANKS', bgColor: 'from-orange-600 via-amber-600 to-orange-600' },
  { name: 'Independence Day', emoji: '🎆', message: 'Freedom Sale! Celebrate with {discount}% OFF', defaultCode: 'FREEDOM', bgColor: 'from-red-600 via-white to-blue-600' },
  { name: 'Labor Day', emoji: '👷', message: 'Labor Day Sale! Work smart with {discount}% OFF', defaultCode: 'LABOR', bgColor: 'from-blue-700 via-red-600 to-blue-700' },
  { name: 'Back to School', emoji: '📚', message: 'Back to School! Study smart with {discount}% OFF', defaultCode: 'SCHOOL', bgColor: 'from-green-600 via-blue-600 to-green-600' },
  { name: 'Holidays', emoji: '🎁', message: 'Holiday Special! Get {discount}% OFF with code', defaultCode: 'HOLIDAYS', bgColor: 'from-red-800 via-green-800 to-red-800' },
];

export default function PromoBannerManagement() {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState<PromoBanner | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [livePreview, setLivePreview] = useState<PromoBanner | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [sendingEmails, setSendingEmails] = useState(false);

  // Fetch banners from database
  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('promotional_banners')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  // Calculate countdown for active banner
  useEffect(() => {
    const activeBanner = banners.find(b => b.is_active);
    if (!activeBanner || !activeBanner.end_date) return;

    const calculateTimeLeft = () => {
      const endDateTime = new Date(activeBanner.end_date!);
      const difference = endDateTime.getTime() - Date.now();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [banners]);

  // Image upload handler
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!editingBanner || acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `promo-${Date.now()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('course-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('course-media')
        .getPublicUrl(filePath);

      handleFieldChange('media_url', publicUrl);
      handleFieldChange('media_type', 'image');
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  }, [editingBanner]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxFiles: 1,
  });

  const handleSave = async () => {
    if (!editingBanner) return;
    
    setSaving(true);
    try {
      const bannerData = {
        title: editingBanner.title,
        description: editingBanner.description,
        link_url: editingBanner.link_url,
        link_text: editingBanner.link_text,
        start_date: editingBanner.start_date,
        end_date: editingBanner.end_date,
        is_active: editingBanner.is_active,
        media_url: editingBanner.media_url,
        media_type: editingBanner.media_type,
        target_audience: editingBanner.target_audience,
        sort_order: editingBanner.sort_order,
      };

      if (banners.find(b => b.id === editingBanner.id)) {
        // Update existing
        const { error } = await supabase
          .from('promotional_banners')
          .update(bannerData)
          .eq('id', editingBanner.id);

        if (error) throw error;
        
        // Log audit
        await supabase.from('audit_logs').insert({
          action: 'promo_banner_updated',
          entity_type: 'promotional_banner',
          entity_id: editingBanner.id,
          new_value: bannerData,
        });
      } else {
        // Insert new
        const { error } = await supabase
          .from('promotional_banners')
          .insert(bannerData);

        if (error) throw error;

        // Log audit
        await supabase.from('audit_logs').insert({
          action: 'promo_banner_created',
          entity_type: 'promotional_banner',
          new_value: bannerData,
        });
      }

      toast.success('Promo banner saved successfully!');
      setHasChanges(false);
      setShowEditDialog(false);
      setEditingBanner(null);
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  const handleSendEmails = async (banner: PromoBanner) => {
    setSendingEmails(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-promo-notification', {
        body: {
          bannerId: banner.id,
          promoTitle: banner.title,
          promoDescription: banner.description,
          linkUrl: banner.link_url,
          linkText: banner.link_text,
          endDate: banner.end_date,
        },
      });

      if (error) throw error;

      toast.success(`Promotional emails sent to ${data.sentCount || 0} users!`);
      fetchBanners();
    } catch (error) {
      console.error('Error sending emails:', error);
      toast.error('Failed to send promotional emails');
    } finally {
      setSendingEmails(false);
    }
  };

  const handleToggleActive = async (banner: PromoBanner) => {
    try {
      const newActive = !banner.is_active;
      const { error } = await supabase
        .from('promotional_banners')
        .update({ is_active: newActive })
        .eq('id', banner.id);

      if (error) throw error;

      // Log audit
      await supabase.from('audit_logs').insert({
        action: newActive ? 'promo_banner_activated' : 'promo_banner_deactivated',
        entity_type: 'promotional_banner',
        entity_id: banner.id,
      });

      toast.success(newActive ? 'Banner activated!' : 'Banner deactivated');
      fetchBanners();
    } catch (error) {
      console.error('Error toggling banner:', error);
      toast.error('Failed to update banner');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('promotional_banners')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log audit
      await supabase.from('audit_logs').insert({
        action: 'promo_banner_deleted',
        entity_type: 'promotional_banner',
        entity_id: id,
      });

      toast.success('Promo banner deleted');
      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Failed to delete banner');
    }
  };

  const handleAddNew = () => {
    const newBanner: PromoBanner = {
      id: '',
      title: '20% off all Gift Cards for December! 💌',
      description: 'Treat yourself or a loved one this month!',
      link_url: '/gift-cards',
      link_text: 'Get Your Discount!',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: false,
      media_url: null,
      media_type: 'image',
      target_audience: 'all',
      sort_order: 0,
    };
    setEditingBanner(newBanner);
    setHasChanges(true);
    setShowEditDialog(true);
  };

  const handleEdit = (banner: PromoBanner) => {
    setEditingBanner({ ...banner });
    setHasChanges(false);
    setShowEditDialog(true);
  };

  const handleFieldChange = (field: keyof PromoBanner, value: any) => {
    if (!editingBanner) return;
    setEditingBanner({ ...editingBanner, [field]: value });
    setHasChanges(true);
  };

  const applyHolidayTemplate = (template: typeof holidayTemplates[0], discount: number = 20) => {
    if (!editingBanner) return;
    setEditingBanner({
      ...editingBanner,
      title: template.message.replace('{discount}', discount.toString()) + ' ' + template.defaultCode,
      description: `${template.emoji} Use code ${template.defaultCode} at checkout!`,
    });
    setHasChanges(true);
  };

  const handleTestPromo = (banner: PromoBanner) => {
    setTestMode(true);
    setLivePreview(banner);
    toast.info('Test mode activated - Preview banner visible');
  };

  const formatTime = (value: number) => value.toString().padStart(2, '0');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Promo Banner Management</h1>
          <p className="text-muted-foreground">Create and manage promotional banners with countdown timers</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/promo-analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Link>
          </Button>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Promo
          </Button>
        </div>
      </div>

      {/* Live Preview */}
      {(livePreview || banners.find(b => b.is_active)) && (
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
                    {(livePreview || banners.find(b => b.is_active))?.title}
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
                  {(livePreview || banners.find(b => b.is_active))?.link_text || 'Get Your Discount!'}
                </Button>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      )}

      {/* Banner List */}
      <div className="grid gap-4">
        {banners.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No promotional banners yet</p>
              <p className="text-muted-foreground mb-4">Create your first banner to display on the platform</p>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Promo
              </Button>
            </CardContent>
          </Card>
        ) : (
          banners.map((banner) => (
            <Card key={banner.id} className={banner.is_active ? 'border-green-500' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    {/* Banner Image Preview */}
                    {banner.media_url && (
                      <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img 
                          src={banner.media_url} 
                          alt="Banner" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={banner.is_active ? 'default' : 'secondary'}>
                          {banner.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">{banner.target_audience || 'all'}</Badge>
                      </div>
                      <p className="font-medium">{banner.title}</p>
                      {banner.description && (
                        <p className="text-sm text-muted-foreground">{banner.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {banner.start_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(banner.start_date).toLocaleDateString()}
                          </span>
                        )}
                        {banner.end_date && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Until {new Date(banner.end_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendEmails(banner)}
                      disabled={sendingEmails}
                    >
                      {sendingEmails ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-1" />
                          Send Emails
                        </>
                      )}
                    </Button>
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
                      variant={banner.is_active ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleActive(banner)}
                    >
                      {banner.is_active ? (
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
          ))
        )}
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
                  <TabsTrigger value="media">Media</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Banner Title/Message</Label>
                    <Textarea
                      value={editingBanner.title}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      placeholder="20% off all Gift Cards for December! 💌"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Textarea
                      value={editingBanner.description || ''}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      placeholder="Additional details about the promotion"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Button Text</Label>
                      <Input
                        value={editingBanner.link_text || ''}
                        onChange={(e) => handleFieldChange('link_text', e.target.value)}
                        placeholder="Get Your Discount!"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Button Link</Label>
                      <Input
                        value={editingBanner.link_url || ''}
                        onChange={(e) => handleFieldChange('link_url', e.target.value)}
                        placeholder="/gift-cards"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Target Audience</Label>
                    <Select
                      value={editingBanner.target_audience || 'all'}
                      onValueChange={(value) => handleFieldChange('target_audience', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="students">Students Only</SelectItem>
                        <SelectItem value="teachers">Teachers Only</SelectItem>
                        <SelectItem value="new">New Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="media" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Banner Image</Label>
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary'
                      }`}
                    >
                      <input {...getInputProps()} />
                      {uploadingImage ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <p className="text-sm text-muted-foreground">Uploading...</p>
                        </div>
                      ) : editingBanner.media_url ? (
                        <div className="space-y-4">
                          <img 
                            src={editingBanner.media_url} 
                            alt="Banner preview" 
                            className="max-h-40 mx-auto rounded-lg"
                          />
                          <p className="text-sm text-muted-foreground">
                            Drop a new image to replace
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Drag & drop an image or click to browse
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, GIF, WebP up to 10MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {editingBanner.media_url && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        handleFieldChange('media_url', null);
                        handleFieldChange('media_type', 'none');
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Image
                    </Button>
                  )}
                </TabsContent>

                <TabsContent value="schedule" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="datetime-local"
                        value={editingBanner.start_date?.slice(0, 16) || ''}
                        onChange={(e) => handleFieldChange('start_date', new Date(e.target.value).toISOString())}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="datetime-local"
                        value={editingBanner.end_date?.slice(0, 16) || ''}
                        onChange={(e) => handleFieldChange('end_date', new Date(e.target.value).toISOString())}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Active Status</p>
                      <p className="text-sm text-muted-foreground">
                        Enable to display banner on the platform
                      </p>
                    </div>
                    <Switch
                      checked={editingBanner.is_active}
                      onCheckedChange={(checked) => handleFieldChange('is_active', checked)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="templates" className="space-y-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    Click a template to apply it to your banner
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {holidayTemplates.map((template) => (
                      <Button
                        key={template.name}
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-2"
                        onClick={() => applyHolidayTemplate(template)}
                      >
                        <span className="text-2xl">{template.emoji}</span>
                        <span className="text-sm font-medium">{template.name}</span>
                        <span className="text-xs text-muted-foreground">{template.defaultCode}</span>
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <Separator className="my-6" />

              {/* Preview */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="bg-gradient-to-r from-primary via-purple-600 to-accent text-white py-3 px-4 rounded-lg">
                  <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Gift className="h-5 w-5" />
                      <span className="font-medium">{editingBanner.title}</span>
                    </div>
                    <Button size="sm" className="bg-white text-primary hover:bg-white/90 font-bold">
                      {editingBanner.link_text || 'Get Your Discount!'}
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            {hasChanges && (
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
