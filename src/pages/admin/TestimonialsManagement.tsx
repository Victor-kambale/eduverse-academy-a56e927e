import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Eye, 
  EyeOff, 
  Save,
  Upload,
  Globe,
  User,
  MessageSquare,
  Video,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Search,
  ArrowLeft,
  Play,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { VideoRotationGallery } from '@/components/testimonials/VideoRotationGallery';
import { BulkImportExport } from '@/components/admin/BulkImportExport';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  country_code: string;
  country_emoji: string;
  rating: number;
  testimonial_text: string;
  photo_url: string | null;
  video_url: string | null;
  testimonial_type: string;
  social_facebook: string | null;
  social_twitter: string | null;
  social_linkedin: string | null;
  social_instagram: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// All countries with search
const allCountries = [
  { code: 'AF', name: 'Afghanistan', emoji: '🇦🇫' },
  { code: 'AL', name: 'Albania', emoji: '🇦🇱' },
  { code: 'DZ', name: 'Algeria', emoji: '🇩🇿' },
  { code: 'AR', name: 'Argentina', emoji: '🇦🇷' },
  { code: 'AU', name: 'Australia', emoji: '🇦🇺' },
  { code: 'AT', name: 'Austria', emoji: '🇦🇹' },
  { code: 'BD', name: 'Bangladesh', emoji: '🇧🇩' },
  { code: 'BE', name: 'Belgium', emoji: '🇧🇪' },
  { code: 'BR', name: 'Brazil', emoji: '🇧🇷' },
  { code: 'CA', name: 'Canada', emoji: '🇨🇦' },
  { code: 'CL', name: 'Chile', emoji: '🇨🇱' },
  { code: 'CN', name: 'China', emoji: '🇨🇳' },
  { code: 'CO', name: 'Colombia', emoji: '🇨🇴' },
  { code: 'CZ', name: 'Czech Republic', emoji: '🇨🇿' },
  { code: 'DK', name: 'Denmark', emoji: '🇩🇰' },
  { code: 'EG', name: 'Egypt', emoji: '🇪🇬' },
  { code: 'FI', name: 'Finland', emoji: '🇫🇮' },
  { code: 'FR', name: 'France', emoji: '🇫🇷' },
  { code: 'DE', name: 'Germany', emoji: '🇩🇪' },
  { code: 'GH', name: 'Ghana', emoji: '🇬🇭' },
  { code: 'GR', name: 'Greece', emoji: '🇬🇷' },
  { code: 'HK', name: 'Hong Kong', emoji: '🇭🇰' },
  { code: 'HU', name: 'Hungary', emoji: '🇭🇺' },
  { code: 'IN', name: 'India', emoji: '🇮🇳' },
  { code: 'ID', name: 'Indonesia', emoji: '🇮🇩' },
  { code: 'IE', name: 'Ireland', emoji: '🇮🇪' },
  { code: 'IL', name: 'Israel', emoji: '🇮🇱' },
  { code: 'IT', name: 'Italy', emoji: '🇮🇹' },
  { code: 'JP', name: 'Japan', emoji: '🇯🇵' },
  { code: 'KE', name: 'Kenya', emoji: '🇰🇪' },
  { code: 'MY', name: 'Malaysia', emoji: '🇲🇾' },
  { code: 'MX', name: 'Mexico', emoji: '🇲🇽' },
  { code: 'MA', name: 'Morocco', emoji: '🇲🇦' },
  { code: 'NL', name: 'Netherlands', emoji: '🇳🇱' },
  { code: 'NZ', name: 'New Zealand', emoji: '🇳🇿' },
  { code: 'NG', name: 'Nigeria', emoji: '🇳🇬' },
  { code: 'NO', name: 'Norway', emoji: '🇳🇴' },
  { code: 'PK', name: 'Pakistan', emoji: '🇵🇰' },
  { code: 'PE', name: 'Peru', emoji: '🇵🇪' },
  { code: 'PH', name: 'Philippines', emoji: '🇵🇭' },
  { code: 'PL', name: 'Poland', emoji: '🇵🇱' },
  { code: 'PT', name: 'Portugal', emoji: '🇵🇹' },
  { code: 'RO', name: 'Romania', emoji: '🇷🇴' },
  { code: 'RU', name: 'Russia', emoji: '🇷🇺' },
  { code: 'SA', name: 'Saudi Arabia', emoji: '🇸🇦' },
  { code: 'SG', name: 'Singapore', emoji: '🇸🇬' },
  { code: 'ZA', name: 'South Africa', emoji: '🇿🇦' },
  { code: 'KR', name: 'South Korea', emoji: '🇰🇷' },
  { code: 'ES', name: 'Spain', emoji: '🇪🇸' },
  { code: 'SE', name: 'Sweden', emoji: '🇸🇪' },
  { code: 'CH', name: 'Switzerland', emoji: '🇨🇭' },
  { code: 'TW', name: 'Taiwan', emoji: '🇹🇼' },
  { code: 'TH', name: 'Thailand', emoji: '🇹🇭' },
  { code: 'TR', name: 'Turkey', emoji: '🇹🇷' },
  { code: 'UA', name: 'Ukraine', emoji: '🇺🇦' },
  { code: 'AE', name: 'United Arab Emirates', emoji: '🇦🇪' },
  { code: 'GB', name: 'United Kingdom', emoji: '🇬🇧' },
  { code: 'US', name: 'United States', emoji: '🇺🇸' },
  { code: 'UG', name: 'Uganda', emoji: '🇺🇬' },
  { code: 'VN', name: 'Vietnam', emoji: '🇻🇳' },
  { code: 'ZW', name: 'Zimbabwe', emoji: '🇿🇼' },
];

const defaultTestimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'> = {
  name: '',
  role: 'Eduverse Graduate',
  country_code: 'US',
  country_emoji: '🇺🇸',
  rating: 5,
  testimonial_text: '',
  photo_url: null,
  video_url: null,
  testimonial_type: 'text',
  social_facebook: null,
  social_twitter: null,
  social_linkedin: null,
  social_instagram: null,
  is_active: true,
  sort_order: 0,
};

export default function TestimonialsManagement() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showVideoGallery, setShowVideoGallery] = useState(false);
  const [videoGalleryIndex, setVideoGalleryIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTestimonials();

    // Real-time subscription
    const channel = supabase
      .channel('testimonials-admin-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'testimonials' },
        () => fetchTestimonials()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      setTestimonials((data || []) as Testimonial[]);
    } catch (error: any) {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    const newTestimonial = {
      ...defaultTestimonial,
      id: '',
      created_at: '',
      updated_at: '',
      sort_order: testimonials.length,
    } as Testimonial;
    setEditingTestimonial(newTestimonial);
    setShowEditDialog(true);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial({ ...testimonial });
    setShowEditDialog(true);
  };

  const handleSave = async () => {
    if (!editingTestimonial) return;
    
    if (!editingTestimonial.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!editingTestimonial.testimonial_text.trim() && editingTestimonial.testimonial_type === 'text') {
      toast.error('Testimonial text is required');
      return;
    }
    if (!editingTestimonial.video_url && editingTestimonial.testimonial_type === 'video') {
      toast.error('Video URL is required for video testimonials');
      return;
    }

    setSaving(true);
    try {
      const testimonialData = {
        name: editingTestimonial.name,
        role: editingTestimonial.role,
        country_code: editingTestimonial.country_code,
        country_emoji: editingTestimonial.country_emoji,
        rating: editingTestimonial.rating,
        testimonial_text: editingTestimonial.testimonial_text,
        photo_url: editingTestimonial.photo_url,
        video_url: editingTestimonial.video_url,
        testimonial_type: editingTestimonial.testimonial_type,
        social_facebook: editingTestimonial.social_facebook,
        social_twitter: editingTestimonial.social_twitter,
        social_linkedin: editingTestimonial.social_linkedin,
        social_instagram: editingTestimonial.social_instagram,
        is_active: editingTestimonial.is_active,
        sort_order: editingTestimonial.sort_order,
      };

      if (editingTestimonial.id) {
        const { error } = await supabase
          .from('testimonials')
          .update(testimonialData)
          .eq('id', editingTestimonial.id);
        
        if (error) throw error;
        toast.success('Testimonial updated successfully');
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert(testimonialData);
        
        if (error) throw error;
        toast.success('Testimonial created successfully');
      }

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      await supabase.from('audit_logs').insert([{
        user_id: currentUser?.id,
        action: editingTestimonial.id ? 'update' : 'create',
        entity_type: 'testimonial',
        entity_id: editingTestimonial.id || undefined,
        new_value: testimonialData as any,
      }]);

      setShowEditDialog(false);
      setEditingTestimonial(null);
      fetchTestimonials();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      await supabase.from('audit_logs').insert([{
        user_id: currentUser?.id,
        action: 'delete',
        entity_type: 'testimonial',
        entity_id: id,
      }]);

      toast.success('Testimonial deleted');
      fetchTestimonials();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleToggleActive = async (testimonial: Testimonial) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_active: !testimonial.is_active })
        .eq('id', testimonial.id);
      
      if (error) throw error;
      toast.success(`Testimonial ${testimonial.is_active ? 'hidden' : 'shown'}`);
      fetchTestimonials();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `testimonial-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      if (editingTestimonial) {
        setEditingTestimonial({ ...editingTestimonial, photo_url: publicUrl });
      }
      toast.success('Photo uploaded');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video file must be under 50MB');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `testimonial-video-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('course-media')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('course-media')
        .getPublicUrl(fileName);

      if (editingTestimonial) {
        setEditingTestimonial({ ...editingTestimonial, video_url: publicUrl });
      }
      toast.success('Video uploaded');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCountryChange = (countryCode: string) => {
    const country = allCountries.find(c => c.code === countryCode);
    if (country && editingTestimonial) {
      setEditingTestimonial({
        ...editingTestimonial,
        country_code: country.code,
        country_emoji: country.emoji,
      });
    }
  };

  const filteredCountries = allCountries.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredTestimonials = testimonials.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.testimonial_text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || t.testimonial_type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Testimonials Management</h1>
            <p className="text-muted-foreground">Manage graduate testimonials with text and video support</p>
          </div>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search testimonials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="text">Text Only</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Import/Export */}
      <BulkImportExport entityType="testimonials" onImportComplete={fetchTestimonials} />

      {/* Video Gallery Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video Testimonials Gallery
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowVideoGallery(true)}
              disabled={testimonials.filter(t => t.is_active && t.video_url).length === 0}
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              Open 3D Gallery
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[180px] scroll-smooth">
            <div className="flex gap-4 pb-4">
              {testimonials.filter(t => t.is_active && t.video_url).map((t, index) => (
                <div 
                  key={t.id}
                  onClick={() => {
                    setVideoGalleryIndex(index);
                    setShowVideoGallery(true);
                  }}
                  className="flex-shrink-0 w-48 h-32 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden group cursor-pointer hover:scale-105 transition-transform"
                >
                  {t.photo_url ? (
                    <img src={t.photo_url} alt={t.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white text-xs font-medium truncate">{t.name}</p>
                  </div>
                </div>
              ))}
              {testimonials.filter(t => t.is_active && t.video_url).length === 0 && (
                <p className="text-muted-foreground">No video testimonials yet</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Video Rotation Gallery Modal */}
      <VideoRotationGallery
        videos={testimonials
          .filter(t => t.is_active && t.video_url)
          .map(t => ({
            id: t.id,
            name: t.name,
            role: t.role,
            country_emoji: t.country_emoji,
            video_url: t.video_url!,
            photo_url: t.photo_url || undefined,
          }))}
        isOpen={showVideoGallery}
        onClose={() => setShowVideoGallery(false)}
        initialIndex={videoGalleryIndex}
      />

      {/* Testimonial Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Live Preview - "What Eduverse's Graduates Have to Say"
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[250px] scroll-smooth">
            <div className="grid md:grid-cols-3 gap-6 p-1">
              {testimonials.filter(t => t.is_active).slice(0, 6).map((testimonial) => (
                <Card key={testimonial.id} className="relative rounded-2xl">
                  <CardContent className="p-6">
                    {testimonial.testimonial_type === 'video' && (
                      <Badge className="absolute top-2 left-2 bg-red-500">
                        <Video className="h-3 w-3 mr-1" />
                        Video
                      </Badge>
                    )}
                    <div className="absolute top-4 right-4 text-4xl text-muted-foreground/20">"</div>
                    <div className="flex items-center gap-3 mb-4">
                      {testimonial.photo_url ? (
                        <img 
                          src={testimonial.photo_url} 
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <span className="text-lg font-bold">{testimonial.name.charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role} {testimonial.country_emoji}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{testimonial.testimonial_text}</p>
                    {/* Social Links */}
                    {(testimonial.social_facebook || testimonial.social_twitter || testimonial.social_linkedin || testimonial.social_instagram) && (
                      <div className="flex gap-2 mt-3 pt-3 border-t">
                        {testimonial.social_facebook && (
                          <a href={testimonial.social_facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                            <Facebook className="h-4 w-4" />
                          </a>
                        )}
                        {testimonial.social_twitter && (
                          <a href={testimonial.social_twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                            <Twitter className="h-4 w-4" />
                          </a>
                        )}
                        {testimonial.social_linkedin && (
                          <a href={testimonial.social_linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                            <Linkedin className="h-4 w-4" />
                          </a>
                        )}
                        {testimonial.social_instagram && (
                          <a href={testimonial.social_instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                            <Instagram className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Testimonials List */}
      <ScrollArea className="h-[400px] scroll-smooth">
        <div className="grid gap-4 p-1">
          {filteredTestimonials.map((testimonial) => (
            <Card key={testimonial.id} className={!testimonial.is_active ? 'opacity-60' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {testimonial.photo_url ? (
                      <img 
                        src={testimonial.photo_url} 
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <span className="text-2xl font-bold">{testimonial.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{testimonial.name}</h3>
                        <Badge variant={testimonial.is_active ? 'default' : 'secondary'}>
                          {testimonial.is_active ? 'Active' : 'Hidden'}
                        </Badge>
                        {testimonial.testimonial_type === 'video' && (
                          <Badge variant="outline" className="text-red-500 border-red-500">
                            <Video className="h-3 w-3 mr-1" />
                            Video
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role} {testimonial.country_emoji}
                      </p>
                      <div className="flex gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-amber-500 fill-amber-500" />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{testimonial.testimonial_text}</p>
                      {/* Social Links Display */}
                      <div className="flex gap-2 mt-2">
                        {testimonial.social_facebook && <Facebook className="h-4 w-4 text-blue-600" />}
                        {testimonial.social_twitter && <Twitter className="h-4 w-4 text-sky-500" />}
                        {testimonial.social_linkedin && <Linkedin className="h-4 w-4 text-blue-700" />}
                        {testimonial.social_instagram && <Instagram className="h-4 w-4 text-pink-500" />}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(testimonial)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(testimonial)}
                    >
                      {testimonial.is_active ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          Off
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          On
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
                          <AlertDialogTitle>Delete Testimonial?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. The testimonial will be permanently deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(testimonial.id)}>
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
      </ScrollArea>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial?.id ? 'Edit Testimonial' : 'Add New Testimonial'}
            </DialogTitle>
          </DialogHeader>
          
          {editingTestimonial && (
            <ScrollArea className="max-h-[70vh] pr-4 scroll-smooth">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                  <TabsTrigger value="social">Social Links</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  {/* Testimonial Type */}
                  <div className="space-y-2">
                    <Label>Testimonial Type</Label>
                    <Select
                      value={editingTestimonial.testimonial_type}
                      onValueChange={(v) => setEditingTestimonial({ ...editingTestimonial, testimonial_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Text Testimonial
                          </div>
                        </SelectItem>
                        <SelectItem value="video">
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            Video Testimonial
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input
                        value={editingTestimonial.name}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                        placeholder="e.g., John D."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Input
                        value={editingTestimonial.role}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                        placeholder="e.g., Eduverse Graduate"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <div className="space-y-2">
                        <Input
                          placeholder="Search countries..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                        />
                        <Select
                          value={editingTestimonial.country_code}
                          onValueChange={handleCountryChange}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <ScrollArea className="h-[200px]">
                              {filteredCountries.map((country) => (
                                <SelectItem key={country.code} value={country.code}>
                                  {country.emoji} {country.name}
                                </SelectItem>
                              ))}
                            </ScrollArea>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Rating</Label>
                      <Select
                        value={editingTestimonial.rating.toString()}
                        onValueChange={(v) => setEditingTestimonial({ ...editingTestimonial, rating: parseInt(v) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 4, 3, 2, 1].map((r) => (
                            <SelectItem key={r} value={r.toString()}>
                              {'⭐'.repeat(r)} ({r} stars)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Testimonial Text {editingTestimonial.testimonial_type === 'text' && '*'}</Label>
                    <Textarea
                      value={editingTestimonial.testimonial_text}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, testimonial_text: e.target.value })}
                      placeholder="Enter the testimonial..."
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingTestimonial.is_active}
                      onCheckedChange={(checked) => setEditingTestimonial({ ...editingTestimonial, is_active: checked })}
                    />
                    <Label>Display on platform</Label>
                  </div>
                </TabsContent>

                <TabsContent value="media" className="space-y-4 mt-4">
                  {/* Photo Upload */}
                  <div className="space-y-2">
                    <Label>Profile Photo</Label>
                    <div className="flex items-center gap-4">
                      {editingTestimonial.photo_url ? (
                        <img 
                          src={editingTestimonial.photo_url} 
                          alt="Preview"
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          disabled={uploading}
                        />
                        {uploading && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
                      </div>
                    </div>
                  </div>

                  {/* Video Upload (only for video type) */}
                  {editingTestimonial.testimonial_type === 'video' && (
                    <div className="space-y-2">
                      <Label>Video File or URL *</Label>
                      <Input
                        value={editingTestimonial.video_url || ''}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, video_url: e.target.value })}
                        placeholder="https://youtube.com/watch?v=... or upload below"
                      />
                      <div className="flex items-center gap-4 mt-2">
                        <Input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoUpload}
                          disabled={uploading}
                        />
                      </div>
                      {editingTestimonial.video_url && (
                        <div className="mt-2 p-3 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Video URL: {editingTestimonial.video_url}</p>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="social" className="space-y-4 mt-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Add social media links to display on the testimonial card
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Facebook className="h-5 w-5 text-blue-600" />
                      <Input
                        value={editingTestimonial.social_facebook || ''}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, social_facebook: e.target.value || null })}
                        placeholder="https://facebook.com/username"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Twitter className="h-5 w-5 text-sky-500" />
                      <Input
                        value={editingTestimonial.social_twitter || ''}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, social_twitter: e.target.value || null })}
                        placeholder="https://twitter.com/username"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Linkedin className="h-5 w-5 text-blue-700" />
                      <Input
                        value={editingTestimonial.social_linkedin || ''}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, social_linkedin: e.target.value || null })}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Instagram className="h-5 w-5 text-pink-500" />
                      <Input
                        value={editingTestimonial.social_instagram || ''}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, social_instagram: e.target.value || null })}
                        placeholder="https://instagram.com/username"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 justify-end mt-6 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Testimonial'}
                </Button>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
