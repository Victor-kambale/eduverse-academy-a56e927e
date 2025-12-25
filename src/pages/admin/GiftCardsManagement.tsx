import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Save,
  Gift,
  Ban,
  CheckCircle,
  Search,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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

interface GiftCard {
  id: string;
  name: string;
  gradient: string;
  category: string;
  icon: string | null;
  is_active: boolean;
  is_disabled: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const gradientOptions = [
  { label: 'Red', value: 'from-red-500 to-red-700' },
  { label: 'Blue', value: 'from-blue-500 to-blue-700' },
  { label: 'Green', value: 'from-green-500 to-green-700' },
  { label: 'Purple', value: 'from-purple-500 to-purple-700' },
  { label: 'Pink', value: 'from-pink-400 to-red-500' },
  { label: 'Orange', value: 'from-orange-400 to-amber-500' },
  { label: 'Teal', value: 'from-teal-400 to-teal-600' },
  { label: 'Indigo', value: 'from-indigo-500 to-purple-600' },
  { label: 'Gold', value: 'from-yellow-300 to-amber-500' },
  { label: 'Slate', value: 'from-slate-700 to-slate-900' },
  { label: 'Rose', value: 'from-rose-300 to-rose-500' },
  { label: 'Sky', value: 'from-sky-300 to-sky-500' },
];

const categoryOptions = [
  { label: 'Holiday', value: 'holiday' },
  { label: 'Celebration', value: 'celebration' },
  { label: 'Special', value: 'special' },
  { label: 'Custom', value: 'custom' },
];

const defaultGiftCard: Omit<GiftCard, 'id' | 'created_at' | 'updated_at'> = {
  name: '',
  gradient: 'from-purple-500 to-pink-500',
  category: 'special',
  icon: null,
  is_active: true,
  is_disabled: false,
  sort_order: 0,
};

export default function GiftCardsManagement() {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCard, setEditingCard] = useState<GiftCard | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGiftCards();

    // Real-time subscription
    const channel = supabase
      .channel('gift-cards-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gift_cards' },
        () => fetchGiftCards()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchGiftCards = async () => {
    try {
      const { data, error } = await supabase
        .from('gift_cards')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      setGiftCards(data || []);
    } catch (error: any) {
      toast.error('Failed to load gift cards');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    const newCard = {
      ...defaultGiftCard,
      id: '',
      created_at: '',
      updated_at: '',
      sort_order: giftCards.length,
    } as GiftCard;
    setEditingCard(newCard);
    setShowEditDialog(true);
  };

  const handleEdit = (card: GiftCard) => {
    setEditingCard({ ...card });
    setShowEditDialog(true);
  };

  const handleSave = async () => {
    if (!editingCard) return;

    if (!editingCard.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);
    try {
      if (editingCard.id) {
        const { error } = await supabase
          .from('gift_cards')
          .update({
            name: editingCard.name,
            gradient: editingCard.gradient,
            category: editingCard.category,
            icon: editingCard.icon,
            is_active: editingCard.is_active,
            is_disabled: editingCard.is_disabled,
            sort_order: editingCard.sort_order,
          })
          .eq('id', editingCard.id);

        if (error) throw error;
        toast.success('Gift card updated successfully');
      } else {
        const { error } = await supabase
          .from('gift_cards')
          .insert({
            name: editingCard.name,
            gradient: editingCard.gradient,
            category: editingCard.category,
            icon: editingCard.icon,
            is_active: editingCard.is_active,
            is_disabled: editingCard.is_disabled,
            sort_order: editingCard.sort_order,
          });

        if (error) throw error;
        toast.success('Gift card created successfully');
      }

      // Log audit
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      await supabase.from('audit_logs').insert([{
        user_id: currentUser?.id,
        action: editingCard.id ? 'update' : 'create',
        entity_type: 'gift_card',
        entity_id: editingCard.id || undefined,
        new_value: editingCard as any,
      }]);

      setShowEditDialog(false);
      setEditingCard(null);
      fetchGiftCards();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gift_cards')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      await supabase.from('audit_logs').insert([{
        user_id: currentUser?.id,
        action: 'delete',
        entity_type: 'gift_card',
        entity_id: id,
      }]);

      toast.success('Gift card deleted');
      fetchGiftCards();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleToggleActive = async (card: GiftCard) => {
    try {
      const { error } = await supabase
        .from('gift_cards')
        .update({ is_active: !card.is_active })
        .eq('id', card.id);

      if (error) throw error;
      toast.success(`Gift card ${card.is_active ? 'hidden' : 'shown'}`);
      fetchGiftCards();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleToggleDisabled = async (card: GiftCard) => {
    try {
      const { error } = await supabase
        .from('gift_cards')
        .update({ is_disabled: !card.is_disabled })
        .eq('id', card.id);

      if (error) throw error;
      toast.success(`Gift card ${card.is_disabled ? 'enabled' : 'disabled'}`);
      fetchGiftCards();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredCards = giftCards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || card.category === filterCategory;
    return matchesSearch && matchesCategory;
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
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Gift className="h-8 w-8 text-primary" />
              Gift Cards Management
            </h1>
            <p className="text-muted-foreground">Manage gift card designs displayed on the platform</p>
          </div>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Gift Card
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
                  placeholder="Search gift cards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoryOptions.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Live Preview - Active Gift Cards on Platform
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] scroll-smooth">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-1">
              {giftCards.filter(c => c.is_active && !c.is_disabled).slice(0, 12).map((card) => (
                <div 
                  key={card.id}
                  className={`aspect-[4/3] bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center p-3 shadow-lg hover:scale-105 transition-transform`}
                >
                  <Gift className="h-6 w-6 text-white/80" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Gift Cards List */}
      <ScrollArea className="h-[500px] scroll-smooth">
        <div className="grid gap-4 p-1">
          {filteredCards.map((card) => (
            <Card 
              key={card.id} 
              className={`${!card.is_active || card.is_disabled ? 'opacity-60' : ''} transition-all`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-20 h-14 bg-gradient-to-br ${card.gradient} rounded-lg flex items-center justify-center shadow-md`}>
                      <Gift className="h-6 w-6 text-white/80" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{card.name}</h3>
                        <Badge variant="outline">{card.category}</Badge>
                        {!card.is_active && <Badge variant="secondary">Hidden</Badge>}
                        {card.is_disabled && <Badge variant="destructive">Disabled</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">Sort order: {card.sort_order}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(card)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(card)}
                    >
                      {card.is_active ? (
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
                    <Button
                      variant={card.is_disabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleDisabled(card)}
                    >
                      {card.is_disabled ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Enable
                        </>
                      ) : (
                        <>
                          <Ban className="h-4 w-4 mr-1" />
                          Disable
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
                          <AlertDialogTitle>Delete Gift Card?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. "{card.name}" will be permanently deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(card.id)}>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCard?.id ? 'Edit Gift Card' : 'Add New Gift Card'}
            </DialogTitle>
          </DialogHeader>

          {editingCard && (
            <ScrollArea className="max-h-[70vh] scroll-smooth">
              <div className="space-y-4 p-1">
                {/* Preview */}
                <div className="flex justify-center">
                  <div className={`w-40 h-24 bg-gradient-to-br ${editingCard.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Gift className="h-10 w-10 text-white/80" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={editingCard.name}
                    onChange={(e) => setEditingCard({ ...editingCard, name: e.target.value })}
                    placeholder="Gift card name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Gradient Style</Label>
                  <Select
                    value={editingCard.gradient}
                    onValueChange={(value) => setEditingCard({ ...editingCard, gradient: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gradient" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradientOptions.map(grad => (
                        <SelectItem key={grad.value} value={grad.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-4 rounded bg-gradient-to-r ${grad.value}`} />
                            {grad.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={editingCard.category}
                    onValueChange={(value) => setEditingCard({ ...editingCard, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={editingCard.sort_order}
                    onChange={(e) => setEditingCard({ ...editingCard, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Active (Visible on platform)</Label>
                  <Switch
                    checked={editingCard.is_active}
                    onCheckedChange={(checked) => setEditingCard({ ...editingCard, is_active: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Disabled (Cannot be purchased)</Label>
                  <Switch
                    checked={editingCard.is_disabled}
                    onCheckedChange={(checked) => setEditingCard({ ...editingCard, is_disabled: checked })}
                  />
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Gift Card'}
                </Button>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
