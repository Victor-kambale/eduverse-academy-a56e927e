import { useState } from 'react';
import { 
  Globe, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  GripVertical,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isRtl: boolean;
  isActive: boolean;
  isDefault: boolean;
  order: number;
}

const defaultLanguages: Language[] = [
  { id: '1', code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', isRtl: false, isActive: true, isDefault: true, order: 1 },
  { id: '2', code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', isRtl: false, isActive: true, isDefault: false, order: 2 },
  { id: '3', code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', isRtl: false, isActive: true, isDefault: false, order: 3 },
  { id: '4', code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', isRtl: false, isActive: true, isDefault: false, order: 4 },
  { id: '5', code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', isRtl: false, isActive: true, isDefault: false, order: 5 },
  { id: '6', code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', isRtl: true, isActive: true, isDefault: false, order: 6 },
  { id: '7', code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', isRtl: false, isActive: false, isDefault: false, order: 7 },
  { id: '8', code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', isRtl: false, isActive: false, isDefault: false, order: 8 },
  { id: '9', code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', isRtl: false, isActive: false, isDefault: false, order: 9 },
  { id: '10', code: 'lg', name: 'Luganda', nativeName: 'Oluganda', flag: '🇺🇬', isRtl: false, isActive: false, isDefault: false, order: 10 },
];

export default function LanguageManagement() {
  const [languages, setLanguages] = useState<Language[]>(defaultLanguages);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLang, setEditingLang] = useState<Language | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    nativeName: '',
    flag: '',
    isRtl: false,
    isActive: true
  });

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      nativeName: '',
      flag: '',
      isRtl: false,
      isActive: true
    });
    setEditingLang(null);
  };

  const handleEdit = (lang: Language) => {
    setEditingLang(lang);
    setFormData({
      code: lang.code,
      name: lang.name,
      nativeName: lang.nativeName,
      flag: lang.flag,
      isRtl: lang.isRtl,
      isActive: lang.isActive
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.code || !formData.name) {
      toast.error('Please fill in required fields');
      return;
    }

    if (editingLang) {
      setLanguages(languages.map(l => 
        l.id === editingLang.id 
          ? { ...l, ...formData } 
          : l
      ));
      toast.success('Language updated');
    } else {
      const newLang: Language = {
        id: Date.now().toString(),
        ...formData,
        isDefault: false,
        order: languages.length + 1
      };
      setLanguages([...languages, newLang]);
      toast.success('Language added');
    }
    
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    const lang = languages.find(l => l.id === id);
    if (lang?.isDefault) {
      toast.error("Cannot delete default language");
      return;
    }
    setLanguages(languages.filter(l => l.id !== id));
    toast.success('Language removed');
  };

  const toggleActive = (id: string) => {
    const lang = languages.find(l => l.id === id);
    if (lang?.isDefault && lang.isActive) {
      toast.error("Cannot disable default language");
      return;
    }
    setLanguages(languages.map(l => 
      l.id === id ? { ...l, isActive: !l.isActive } : l
    ));
  };

  const setAsDefault = (id: string) => {
    setLanguages(languages.map(l => ({
      ...l,
      isDefault: l.id === id,
      isActive: l.id === id ? true : l.isActive
    })));
    toast.success('Default language updated');
  };

  const activeLanguages = languages.filter(l => l.isActive);
  const inactiveLanguages = languages.filter(l => !l.isActive);

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
                  value={formData.nativeName}
                  onChange={(e) => setFormData({ ...formData, nativeName: e.target.value })}
                  placeholder="English"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Right-to-Left (RTL)</Label>
                  <p className="text-xs text-muted-foreground">Enable for Arabic, Hebrew, etc.</p>
                </div>
                <Switch 
                  checked={formData.isRtl} 
                  onCheckedChange={(v) => setFormData({ ...formData, isRtl: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch 
                  checked={formData.isActive} 
                  onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
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
          {activeLanguages.map((lang) => (
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
                    {lang.isRtl && <Badge variant="secondary" className="text-xs">RTL</Badge>}
                    {lang.isDefault && <Badge className="bg-primary/10 text-primary text-xs">Default</Badge>}
                  </div>
                  <span className="text-sm text-muted-foreground">{lang.nativeName}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!lang.isDefault && (
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
                  onClick={() => toggleActive(lang.id)}
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
                {!lang.isDefault && (
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
          ))}
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
                    <span className="text-sm text-muted-foreground">{lang.nativeName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => toggleActive(lang.id)}
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