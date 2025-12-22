import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  ExternalLink,
  Loader2,
  GripVertical,
  Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface FooterLink {
  id: string;
  section: string;
  title: string;
  url: string;
  description: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  is_external: boolean | null;
  icon: string | null;
  created_at: string;
}

const sections = ['resources', 'company', 'legal', 'courses'];

export default function FooterLinksManagement() {
  const [links, setLinks] = useState<FooterLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<FooterLink | null>(null);
  const [draggedItem, setDraggedItem] = useState<FooterLink | null>(null);
  const [formData, setFormData] = useState({
    section: 'resources',
    title: '',
    url: '',
    description: '',
    is_active: true,
    is_external: false,
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('footer_links')
        .select('*')
        .order('section')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching footer links:', error);
      toast.error('Failed to load footer links');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      section: 'resources',
      title: '',
      url: '',
      description: '',
      is_active: true,
      is_external: false,
    });
    setEditingLink(null);
  };

  const handleEdit = (link: FooterLink) => {
    setEditingLink(link);
    setFormData({
      section: link.section,
      title: link.title,
      url: link.url,
      description: link.description || '',
      is_active: link.is_active ?? true,
      is_external: link.is_external ?? false,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.url) {
      toast.error('Title and URL are required');
      return;
    }

    try {
      const payload = {
        section: formData.section,
        title: formData.title,
        url: formData.url,
        description: formData.description || null,
        is_active: formData.is_active,
        is_external: formData.is_external,
        sort_order: editingLink?.sort_order ?? links.filter(l => l.section === formData.section).length,
      };

      if (editingLink) {
        const { error } = await supabase
          .from('footer_links')
          .update(payload)
          .eq('id', editingLink.id);

        if (error) throw error;
        toast.success('Footer link updated');
      } else {
        const { error } = await supabase
          .from('footer_links')
          .insert([payload]);

        if (error) throw error;
        toast.success('Footer link created');
      }

      setDialogOpen(false);
      resetForm();
      fetchLinks();
    } catch (error) {
      console.error('Error saving footer link:', error);
      toast.error('Failed to save footer link');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    try {
      const { error } = await supabase
        .from('footer_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Footer link deleted');
      fetchLinks();
    } catch (error) {
      console.error('Error deleting footer link:', error);
      toast.error('Failed to delete footer link');
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('footer_links')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;
      fetchLinks();
    } catch (error) {
      console.error('Error toggling footer link:', error);
      toast.error('Failed to update footer link');
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, link: FooterLink) => {
    setDraggedItem(link);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', link.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetLink: FooterLink) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.id === targetLink.id) {
      setDraggedItem(null);
      return;
    }

    // Only allow reordering within the same section
    if (draggedItem.section !== targetLink.section) {
      toast.error('Cannot move links between sections');
      setDraggedItem(null);
      return;
    }

    const sectionLinks = links.filter(l => l.section === draggedItem.section);
    const draggedIndex = sectionLinks.findIndex(l => l.id === draggedItem.id);
    const targetIndex = sectionLinks.findIndex(l => l.id === targetLink.id);

    // Reorder the array
    const newSectionLinks = [...sectionLinks];
    newSectionLinks.splice(draggedIndex, 1);
    newSectionLinks.splice(targetIndex, 0, draggedItem);

    // Update sort_order for all affected links
    const updates = newSectionLinks.map((link, index) => ({
      id: link.id,
      sort_order: index,
    }));

    try {
      // Update each link's sort_order
      for (const update of updates) {
        await supabase
          .from('footer_links')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
      }

      toast.success('Order updated');
      fetchLinks();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }

    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const getLinksBySection = (section: string) => 
    links.filter(l => l.section === section).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Footer Links Management</h1>
          <p className="text-muted-foreground">Manage footer navigation links - drag to reorder</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingLink ? 'Edit Footer Link' : 'Add Footer Link'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Section *</Label>
                  <Select 
                    value={formData.section} 
                    onValueChange={(v) => setFormData({ ...formData, section: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resources">Resources</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="courses">Courses</SelectItem>
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
                    <span className="text-sm">{formData.is_active ? 'Visible' : 'Hidden'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Title *</Label>
                <Input 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Link title"
                />
              </div>

              <div className="space-y-2">
                <Label>URL *</Label>
                <Input 
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="/help or https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description (optional)"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch 
                  checked={formData.is_external} 
                  onCheckedChange={(v) => setFormData({ ...formData, is_external: v })}
                />
                <Label className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  External link (opens in new tab)
                </Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingLink ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
            <p className="text-muted-foreground mt-2">Loading footer links...</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="resources" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="resources">Resources ({getLinksBySection('resources').length})</TabsTrigger>
            <TabsTrigger value="company">Company ({getLinksBySection('company').length})</TabsTrigger>
            <TabsTrigger value="legal">Legal ({getLinksBySection('legal').length})</TabsTrigger>
            <TabsTrigger value="courses">Courses ({getLinksBySection('courses').length})</TabsTrigger>
          </TabsList>

          {sections.map((section) => (
            <TabsContent key={section} value={section} className="space-y-3">
              {getLinksBySection(section).length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <LinkIcon className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No links in this section</p>
                    <Button className="mt-4" onClick={() => {
                      setFormData({ ...formData, section });
                      setDialogOpen(true);
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Link
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                getLinksBySection(section).map((link, index) => (
                  <Card 
                    key={link.id} 
                    className={`transition-all ${!link.is_active ? 'opacity-60' : ''} ${draggedItem?.id === link.id ? 'opacity-50 ring-2 ring-primary' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, link)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, link)}
                    onDragEnd={handleDragEnd}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="cursor-grab active:cursor-grabbing">
                          <GripVertical className="w-5 h-5 text-muted-foreground" />
                        </div>
                        
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <LinkIcon className="w-5 h-5 text-primary" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{link.title}</h3>
                            {link.is_external && (
                              <ExternalLink className="w-3 h-3 text-muted-foreground" />
                            )}
                            {link.is_active ? (
                              <Badge className="bg-green-500/10 text-green-600">Visible</Badge>
                            ) : (
                              <Badge variant="secondary">Hidden</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{link.url}</p>
                          {link.description && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">{link.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => toggleActive(link.id, link.is_active ?? true)}
                          >
                            {link.is_active ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(link)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(link.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}