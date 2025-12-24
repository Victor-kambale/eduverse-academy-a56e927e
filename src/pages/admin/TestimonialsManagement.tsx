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
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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

interface Testimonial {
  id: string;
  name: string;
  role: string;
  country_code: string;
  country_emoji: string;
  rating: number;
  testimonial_text: string;
  photo_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const countries = [
  { code: 'US', name: 'United States', emoji: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', emoji: '🇬🇧' },
  { code: 'CA', name: 'Canada', emoji: '🇨🇦' },
  { code: 'AU', name: 'Australia', emoji: '🇦🇺' },
  { code: 'DE', name: 'Germany', emoji: '🇩🇪' },
  { code: 'FR', name: 'France', emoji: '🇫🇷' },
  { code: 'IN', name: 'India', emoji: '🇮🇳' },
  { code: 'NG', name: 'Nigeria', emoji: '🇳🇬' },
  { code: 'KE', name: 'Kenya', emoji: '🇰🇪' },
  { code: 'UG', name: 'Uganda', emoji: '🇺🇬' },
  { code: 'ZA', name: 'South Africa', emoji: '🇿🇦' },
  { code: 'GH', name: 'Ghana', emoji: '🇬🇭' },
  { code: 'PK', name: 'Pakistan', emoji: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', emoji: '🇧🇩' },
  { code: 'JP', name: 'Japan', emoji: '🇯🇵' },
  { code: 'CN', name: 'China', emoji: '🇨🇳' },
  { code: 'BR', name: 'Brazil', emoji: '🇧🇷' },
  { code: 'MX', name: 'Mexico', emoji: '🇲🇽' },
  { code: 'ES', name: 'Spain', emoji: '🇪🇸' },
  { code: 'IT', name: 'Italy', emoji: '🇮🇹' },
];

const defaultTestimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'> = {
  name: '',
  role: 'Eduverse Graduate',
  country_code: 'US',
  country_emoji: '🇺🇸',
  rating: 5,
  testimonial_text: '',
  photo_url: null,
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

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      setTestimonials(data || []);
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
    
    if (!editingTestimonial.name || !editingTestimonial.testimonial_text) {
      toast.error('Name and testimonial text are required');
      return;
    }

    setSaving(true);
    try {
      if (editingTestimonial.id) {
        // Update existing
        const { error } = await supabase
          .from('testimonials')
          .update({
            name: editingTestimonial.name,
            role: editingTestimonial.role,
            country_code: editingTestimonial.country_code,
            country_emoji: editingTestimonial.country_emoji,
            rating: editingTestimonial.rating,
            testimonial_text: editingTestimonial.testimonial_text,
            photo_url: editingTestimonial.photo_url,
            is_active: editingTestimonial.is_active,
            sort_order: editingTestimonial.sort_order,
          })
          .eq('id', editingTestimonial.id);
        
        if (error) throw error;
        toast.success('Testimonial updated successfully');
      } else {
        // Create new
        const { error } = await supabase
          .from('testimonials')
          .insert({
            name: editingTestimonial.name,
            role: editingTestimonial.role,
            country_code: editingTestimonial.country_code,
            country_emoji: editingTestimonial.country_emoji,
            rating: editingTestimonial.rating,
            testimonial_text: editingTestimonial.testimonial_text,
            photo_url: editingTestimonial.photo_url,
            is_active: editingTestimonial.is_active,
            sort_order: editingTestimonial.sort_order,
          });
        
        if (error) throw error;
        toast.success('Testimonial created successfully');
      }

      // Log audit
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      await supabase.from('audit_logs').insert([{
        user_id: currentUser?.id,
        action: editingTestimonial.id ? 'update' : 'create',
        entity_type: 'testimonial',
        entity_id: editingTestimonial.id || undefined,
        new_value: editingTestimonial as any,
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

      // Log audit
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

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    if (country && editingTestimonial) {
      setEditingTestimonial({
        ...editingTestimonial,
        country_code: country.code,
        country_emoji: country.emoji,
      });
    }
  };

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
        <div>
          <h1 className="text-3xl font-bold">Testimonials Management</h1>
          <p className="text-muted-foreground">Manage graduate testimonials displayed on the platform</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      {/* Testimonial Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Live Preview - "What Eduverse's Graduates Have to Say"
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.filter(t => t.is_active).slice(0, 3).map((testimonial) => (
              <Card key={testimonial.id} className="relative">
                <CardContent className="p-6">
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
                  <p className="text-sm text-muted-foreground">{testimonial.testimonial_text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Testimonials List */}
      <div className="grid gap-4">
        {testimonials.map((testimonial) => (
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
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{testimonial.name}</h3>
                      <Badge variant={testimonial.is_active ? 'default' : 'secondary'}>
                        {testimonial.is_active ? 'Active' : 'Hidden'}
                      </Badge>
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
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        Show
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

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial?.id ? 'Edit Testimonial' : 'Add New Testimonial'}
            </DialogTitle>
          </DialogHeader>
          
          {editingTestimonial && (
            <div className="space-y-4">
              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>Profile Photo (Optional)</Label>
                <div className="flex items-center gap-4">
                  {editingTestimonial.photo_url ? (
                    <img 
                      src={editingTestimonial.photo_url} 
                      alt="Preview"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploading}
                    />
                    {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
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
                  <Select
                    value={editingTestimonial.country_code}
                    onValueChange={handleCountryChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.emoji} {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <Label>Testimonial Text</Label>
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

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Testimonial'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}