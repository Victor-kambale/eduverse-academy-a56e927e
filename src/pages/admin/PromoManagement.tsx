import { useState, useEffect } from 'react';
import { 
  Plus, 
  Image, 
  Video, 
  Calendar, 
  Trash2, 
  Edit, 
  Eye, 
  EyeOff,
  Upload,
  Loader2,
  GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface PromoItem {
  id: string;
  title: string;
  description: string | null;
  media_url: string | null;
  media_type: string;
  link_url: string | null;
  link_text: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  sort_order: number;
  target_audience: string;
  created_at: string;
}

export default function PromoManagement() {
  const [promos, setPromos] = useState<PromoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    media_type: 'image',
    title: '',
    description: '',
    media_url: '',
    link_url: '',
    link_text: '',
    is_active: true,
    start_date: '',
    end_date: '',
    target_audience: 'all'
  });

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      const { data, error } = await supabase
        .from('promotional_banners' as any)
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setPromos((data as unknown as PromoItem[]) || []);
    } catch (error) {
      console.error('Error fetching promos:', error);
      toast.error('Failed to load promotional banners');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      media_type: 'image',
      title: '',
      description: '',
      media_url: '',
      link_url: '',
      link_text: '',
      is_active: true,
      start_date: '',
      end_date: '',
      target_audience: 'all'
    });
    setEditingPromo(null);
  };

  const handleEdit = (promo: PromoItem) => {
    setEditingPromo(promo);
    setFormData({
      media_type: promo.media_type,
      title: promo.title,
      description: promo.description || '',
      media_url: promo.media_url || '',
      link_url: promo.link_url || '',
      link_text: promo.link_text || '',
      is_active: promo.is_active,
      start_date: promo.start_date ? format(new Date(promo.start_date), "yyyy-MM-dd'T'HH:mm") : '',
      end_date: promo.end_date ? format(new Date(promo.end_date), "yyyy-MM-dd'T'HH:mm") : '',
      target_audience: promo.target_audience
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast.error('Title is required');
      return;
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        media_url: formData.media_url || null,
        media_type: formData.media_type,
        link_url: formData.link_url || null,
        link_text: formData.link_text || null,
        is_active: formData.is_active,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        target_audience: formData.target_audience,
        sort_order: editingPromo?.sort_order || promos.length
      };

      if (editingPromo) {
        const { error } = await supabase
          .from('promotional_banners' as any)
          .update(payload)
          .eq('id', editingPromo.id);

        if (error) throw error;
        toast.success('Banner updated successfully');
      } else {
        const { error } = await supabase
          .from('promotional_banners' as any)
          .insert([payload]);

        if (error) throw error;
        toast.success('Banner created successfully');
      }
      
      setDialogOpen(false);
      resetForm();
      fetchPromos();
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('Failed to save banner');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    
    try {
      const { error } = await supabase
        .from('promotional_banners' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Banner deleted');
      fetchPromos();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Failed to delete banner');
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('promotional_banners' as any)
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;
      fetchPromos();
    } catch (error) {
      console.error('Error toggling banner:', error);
      toast.error('Failed to update banner');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `promo-banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('course-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('course-media')
        .getPublicUrl(filePath);

      setFormData({ ...formData, media_url: publicUrl });
      toast.success('File uploaded');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Promotional Content</h1>
          <p className="text-muted-foreground">Manage carousel banners and promotional media</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Promo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPromo ? 'Edit Promotional Content' : 'Add Promotional Content'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Select 
                    value={formData.media_type} 
                    onValueChange={(v: 'image' | 'video') => setFormData({ ...formData, media_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">
                        <span className="flex items-center gap-2">
                          <Image className="w-4 h-4" /> Image
                        </span>
                      </SelectItem>
                      <SelectItem value="video">
                        <span className="flex items-center gap-2">
                          <Video className="w-4 h-4" /> Video
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center gap-2 h-10">
                    <Switch 
                      checked={formData.is_active} 
                      onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                    />
                    <span className="text-sm">{formData.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Title *</Label>
                <Input 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Promo title"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                />
              </div>

              <div className="space-y-2">
                <Label>Media Upload *</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  {formData.media_url ? (
                    <div className="space-y-2">
                      {formData.media_type === 'image' ? (
                        <img 
                          src={formData.media_url} 
                          alt="Preview" 
                          className="max-h-40 mx-auto rounded-lg object-cover"
                        />
                      ) : (
                        <video 
                          src={formData.media_url} 
                          className="max-h-40 mx-auto rounded-lg"
                          controls
                        />
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setFormData({ ...formData, media_url: '' })}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Drag & drop or click to upload
                      </p>
                      <Input 
                        type="file" 
                        accept={formData.media_type === 'image' ? 'image/*' : 'video/*'}
                        onChange={handleFileUpload}
                        className="max-w-xs mx-auto"
                        disabled={uploading}
                      />
                      {uploading && (
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Uploading...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Or enter URL directly:</p>
                <Input 
                  value={formData.media_url}
                  onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>Link URL</Label>
                <Input 
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="/courses or https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Start Date
                  </Label>
                  <Input 
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> End Date
                  </Label>
                  <Input 
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingPromo ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Promo List */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
              <p className="text-muted-foreground mt-2">Loading banners...</p>
            </CardContent>
          </Card>
        ) : promos.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No promotional content yet</p>
              <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Promo
              </Button>
            </CardContent>
          </Card>
        ) : (
          promos.map((promo) => (
            <Card key={promo.id} className={!promo.is_active ? 'opacity-60' : ''}>
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                  
                  <div className="w-24 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {promo.media_type === 'image' && promo.media_url ? (
                      <img 
                        src={promo.media_url} 
                        alt={promo.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{promo.title}</h3>
                      <Badge variant={promo.media_type === 'image' ? 'secondary' : 'outline'}>
                        {promo.media_type}
                      </Badge>
                      {promo.is_active ? (
                        <Badge className="bg-green-500/10 text-green-600">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {promo.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {promo.start_date && promo.end_date 
                        ? `${format(new Date(promo.start_date), 'PP')} - ${format(new Date(promo.end_date), 'PP')}`
                        : 'No schedule set'
                      }
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => toggleActive(promo.id, promo.is_active)}
                    >
                      {promo.is_active ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEdit(promo)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(promo.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}