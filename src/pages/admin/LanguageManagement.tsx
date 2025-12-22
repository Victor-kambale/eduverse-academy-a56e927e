import { useState, useEffect } from 'react';
import { 
  Globe, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  GripVertical,
  Check,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Language {
  id: string;
  code: string;
  name: string;
  native_name: string;
  flag: string;
  is_rtl: boolean;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
}

export default function LanguageManagement() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLang, setEditingLang] = useState<Language | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    native_name: '',
    flag: '',
    is_rtl: false,
    is_active: true
  });

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const { data, error } = await supabase
        .from('language_settings' as any)
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setLanguages((data as unknown as Language[]) || []);
    } catch (error) {
      console.error('Error fetching languages:', error);
      toast.error('Failed to load languages');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      native_name: '',
      flag: '',
      is_rtl: false,
      is_active: true
    });
    setEditingLang(null);
  };

  const handleEdit = (lang: Language) => {
    setEditingLang(lang);
    setFormData({
      code: lang.code,
      name: lang.name,
      native_name: lang.native_name,
      flag: lang.flag,
      is_rtl: lang.is_rtl,
      is_active: lang.is_active
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.name) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      if (editingLang) {
        const { error } = await supabase
          .from('language_settings' as any)
          .update({
            code: formData.code,
            name: formData.name,
            native_name: formData.native_name,
            flag: formData.flag,
            is_rtl: formData.is_rtl,
            is_active: formData.is_active
          })
          .eq('id', editingLang.id);

        if (error) throw error;
        toast.success('Language updated');
      } else {
        const { error } = await supabase
          .from('language_settings' as any)
          .insert([{
            code: formData.code,
            name: formData.name,
            native_name: formData.native_name,
            flag: formData.flag,
            is_rtl: formData.is_rtl,
            is_active: formData.is_active,
            is_default: false,
            sort_order: languages.length + 1
          }]);

        if (error) throw error;
        toast.success('Language added');
      }
      
      setDialogOpen(false);
      resetForm();
      fetchLanguages();
    } catch (error) {
      console.error('Error saving language:', error);
      toast.error('Failed to save language');
    }
  };

  const handleDelete = async (id: string) => {
    const lang = languages.find(l => l.id === id);
    if (lang?.is_default) {
      toast.error("Cannot delete default language");
      return;
    }

    if (!confirm('Are you sure you want to delete this language?')) return;

    try {
      const { error } = await supabase
        .from('language_settings' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Language removed');
      fetchLanguages();
    } catch (error) {
      console.error('Error deleting language:', error);
      toast.error('Failed to delete language');
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    const lang = languages.find(l => l.id === id);
    if (lang?.is_default && currentState) {
      toast.error("Cannot disable default language");
      return;
    }

    try {
      const { error } = await supabase
        .from('language_settings' as any)
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;
      fetchLanguages();
    } catch (error) {
      console.error('Error toggling language:', error);
      toast.error('Failed to update language');
    }
  };

  const setAsDefault = async (id: string) => {
    try {
      // First, remove default from all
      await supabase
        .from('language_settings' as any)
        .update({ is_default: false })
        .neq('id', 'none');

      // Then set the new default
      const { error } = await supabase
        .from('language_settings' as any)
        .update({ is_default: true, is_active: true })
        .eq('id', id);

      if (error) throw error;
      toast.success('Default language updated');
      fetchLanguages();
    } catch (error) {
      console.error('Error setting default:', error);
      toast.error('Failed to update default language');
    }
  };

  const activeLanguages = languages.filter(l => l.is_active);
  const inactiveLanguages = languages.filter(l => !l.is_active);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Language Management</h1>
          <p className="text-muted-foreground">Configure available languages for your platform</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Language
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingLang ? 'Edit Language' : 'Add Language'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Language Code *</Label>
                  <Input 
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="en, zh, ar..."
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Flag Emoji</Label>
                  <Input 
                    value={formData.flag}
                    onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                    placeholder="🇺🇸"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Language Name (English) *</Label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="English"
                />
              </div>

              <div className="space-y-2">
                <Label>Native Name</Label>
                <Input 
                  value={formData.native_name}
                  onChange={(e) => setFormData({ ...formData, native_name: e.target.value })}
                  placeholder="English"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Right-to-Left (RTL)</Label>
                  <p className="text-xs text-muted-foreground">Enable for Arabic, Hebrew, etc.</p>
                </div>
                <Switch 
                  checked={formData.is_rtl} 
                  onCheckedChange={(v) => setFormData({ ...formData, is_rtl: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch 
                  checked={formData.is_active} 
                  onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingLang ? 'Update' : 'Add'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{languages.length}</p>
                <p className="text-sm text-muted-foreground">Total Languages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeLanguages.length}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <EyeOff className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inactiveLanguages.length}</p>
                <p className="text-sm text-muted-foreground">Hidden</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Languages */}
      <Card>
        <CardHeader>
          <CardTitle>Active Languages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {activeLanguages.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No active languages</p>
          ) : (
            activeLanguages.map((lang) => (
              <div 
                key={lang.id} 
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <span className="text-2xl">{lang.flag}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{lang.name}</span>
                      <Badge variant="outline" className="text-xs">{lang.code}</Badge>
                      {lang.is_rtl && <Badge variant="secondary" className="text-xs">RTL</Badge>}
                      {lang.is_default && <Badge className="bg-primary/10 text-primary text-xs">Default</Badge>}
                    </div>
                    <span className="text-sm text-muted-foreground">{lang.native_name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!lang.is_default && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setAsDefault(lang.id)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Set Default
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => toggleActive(lang.id, lang.is_active)}
                  >
                    <EyeOff className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleEdit(lang)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {!lang.is_default && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(lang.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Inactive Languages */}
      {inactiveLanguages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">Hidden Languages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {inactiveLanguages.map((lang) => (
              <div 
                key={lang.id} 
                className="flex items-center justify-between p-3 rounded-lg border border-border opacity-60"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{lang.name}</span>
                      <Badge variant="outline" className="text-xs">{lang.code}</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">{lang.native_name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => toggleActive(lang.id, lang.is_active)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(lang.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}