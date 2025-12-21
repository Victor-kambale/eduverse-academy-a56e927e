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

interface PromoItem {
  id: string;
  type: 'image' | 'video';
  title: string;
  description: string;
  mediaUrl: string;
  linkUrl: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  order: number;
}

const mockPromos: PromoItem[] = [
  {
    id: '1',
    type: 'image',
    title: 'Summer Sale 2025',
    description: '50% off on all courses',
    mediaUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    linkUrl: '/courses',
    isActive: true,
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    order: 1
  },
  {
    id: '2',
    type: 'image',
    title: 'New Web Development Bootcamp',
    description: 'Learn full-stack development',
    mediaUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
    linkUrl: '/course/1',
    isActive: true,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    order: 2
  }
];

export default function PromoManagement() {
  const [promos, setPromos] = useState<PromoItem[]>(mockPromos);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'image' as 'image' | 'video',
    title: '',
    description: '',
    mediaUrl: '',
    linkUrl: '',
    isActive: true,
    startDate: '',
    endDate: ''
  });

  const resetForm = () => {
    setFormData({
      type: 'image',
      title: '',
      description: '',
      mediaUrl: '',
      linkUrl: '',
      isActive: true,
      startDate: '',
      endDate: ''
    });
    setEditingPromo(null);
  };

  const handleEdit = (promo: PromoItem) => {
    setEditingPromo(promo);
    setFormData({
      type: promo.type,
      title: promo.title,
      description: promo.description,
      mediaUrl: promo.mediaUrl,
      linkUrl: promo.linkUrl,
      isActive: promo.isActive,
      startDate: promo.startDate,
      endDate: promo.endDate
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.mediaUrl) {
      toast.error('Please fill in required fields');
      return;
    }

    if (editingPromo) {
      setPromos(promos.map(p => 
        p.id === editingPromo.id 
          ? { ...p, ...formData } 
          : p
      ));
      toast.success('Promo updated successfully');
    } else {
      const newPromo: PromoItem = {
        id: Date.now().toString(),
        ...formData,
        order: promos.length + 1
      };
      setPromos([...promos, newPromo]);
      toast.success('Promo created successfully');
    }
    
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setPromos(promos.filter(p => p.id !== id));
    toast.success('Promo deleted');
  };

  const toggleActive = (id: string) => {
    setPromos(promos.map(p => 
      p.id === id ? { ...p, isActive: !p.isActive } : p
    ));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    // Simulate upload - in real app, upload to Supabase storage
    setTimeout(() => {
      const fakeUrl = URL.createObjectURL(file);
      setFormData({ ...formData, mediaUrl: fakeUrl });
      setUploading(false);
      toast.success('File uploaded');
    }, 1500);
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
                    value={formData.type} 
                    onValueChange={(v: 'image' | 'video') => setFormData({ ...formData, type: v })}
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
                      checked={formData.isActive} 
                      onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
                    />
                    <span className="text-sm">{formData.isActive ? 'Active' : 'Inactive'}</span>
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
                  {formData.mediaUrl ? (
                    <div className="space-y-2">
                      {formData.type === 'image' ? (
                        <img 
                          src={formData.mediaUrl} 
                          alt="Preview" 
                          className="max-h-40 mx-auto rounded-lg object-cover"
                        />
                      ) : (
                        <video 
                          src={formData.mediaUrl} 
                          className="max-h-40 mx-auto rounded-lg"
                          controls
                        />
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setFormData({ ...formData, mediaUrl: '' })}
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
                        accept={formData.type === 'image' ? 'image/*' : 'video/*'}
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
                  value={formData.mediaUrl}
                  onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>Link URL</Label>
                <Input 
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="/courses or https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Start Date
                  </Label>
                  <Input 
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> End Date
                  </Label>
                  <Input 
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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
        {promos.length === 0 ? (
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
            <Card key={promo.id} className={!promo.isActive ? 'opacity-60' : ''}>
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                  
                  <div className="w-24 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {promo.type === 'image' ? (
                      <img 
                        src={promo.mediaUrl} 
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
                      <Badge variant={promo.type === 'image' ? 'secondary' : 'outline'}>
                        {promo.type}
                      </Badge>
                      {promo.isActive ? (
                        <Badge className="bg-green-500/10 text-green-600">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {promo.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {promo.startDate && promo.endDate 
                        ? `${promo.startDate} - ${promo.endDate}`
                        : 'No schedule set'
                      }
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => toggleActive(promo.id)}
                    >
                      {promo.isActive ? (
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