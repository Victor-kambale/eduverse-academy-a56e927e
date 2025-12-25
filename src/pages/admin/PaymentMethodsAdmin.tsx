import { useState } from 'react';
import { 
  CreditCard, 
  Wallet, 
  Smartphone, 
  Globe, 
  Edit, 
  Trash2, 
  Plus, 
  Save, 
  Upload,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Check,
  X,
  GraduationCap,
  Building2,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'card' | 'wallet' | 'qr' | 'mobile';
  available: boolean;
  enabledFor: {
    students: boolean;
    teachers: boolean;
    universities: boolean;
  };
  qrCodeUrl?: string;
  testCredentials?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  'credit-card': <CreditCard className="w-6 h-6" />,
  'wallet': <Wallet className="w-6 h-6" />,
  'smartphone': <Smartphone className="w-6 h-6" />,
  'globe': <Globe className="w-6 h-6" />,
};

const defaultPaymentMethods: PaymentMethod[] = [
  {
    id: 'stripe',
    name: 'Credit/Debit Card',
    icon: 'credit-card',
    description: 'Visa, Mastercard, Amex',
    category: 'card',
    available: true,
    enabledFor: { students: true, teachers: true, universities: true },
    testCredentials: '4242424242424242',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: 'wallet',
    description: 'Pay with your PayPal account',
    category: 'wallet',
    available: true,
    enabledFor: { students: true, teachers: true, universities: true },
  },
  {
    id: 'google-pay',
    name: 'Google Pay',
    icon: 'smartphone',
    description: 'Fast checkout with Google',
    category: 'wallet',
    available: true,
    enabledFor: { students: true, teachers: false, universities: false },
  },
  {
    id: 'apple-pay',
    name: 'Apple Pay',
    icon: 'smartphone',
    description: 'Pay with Touch ID or Face ID',
    category: 'wallet',
    available: true,
    enabledFor: { students: true, teachers: false, universities: false },
  },
  {
    id: 'wechat',
    name: 'WeChat Pay',
    icon: 'globe',
    description: '微信支付',
    category: 'qr',
    available: true,
    enabledFor: { students: true, teachers: true, universities: true },
    qrCodeUrl: '/images/wechat-pay-qr.png',
  },
  {
    id: 'alipay',
    name: 'Alipay',
    icon: 'globe',
    description: '支付宝',
    category: 'qr',
    available: true,
    enabledFor: { students: true, teachers: true, universities: true },
    qrCodeUrl: '/images/alipay-qr.jpg',
  },
  {
    id: 'mobile',
    name: 'Mobile Money',
    icon: 'smartphone',
    description: 'Pay via mobile number',
    category: 'mobile',
    available: true,
    enabledFor: { students: true, teachers: true, universities: true },
  },
];

export default function PaymentMethodsAdmin() {
  const [methods, setMethods] = useState<PaymentMethod[]>(defaultPaymentMethods);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [qrUploadPreview, setQrUploadPreview] = useState<string>('');

  const handleToggleEnabled = (methodId: string, userType: 'students' | 'teachers' | 'universities') => {
    setMethods(prev => prev.map(m => {
      if (m.id === methodId) {
        return {
          ...m,
          enabledFor: {
            ...m.enabledFor,
            [userType]: !m.enabledFor[userType],
          },
        };
      }
      return m;
    }));
    toast.success('Payment method updated');
  };

  const handleToggleAvailable = (methodId: string) => {
    setMethods(prev => prev.map(m => {
      if (m.id === methodId) {
        return { ...m, available: !m.available };
      }
      return m;
    }));
    toast.success('Payment method availability updated');
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod({ ...method });
    setQrUploadPreview(method.qrCodeUrl || '');
    setShowEditDialog(true);
  };

  const handleDelete = (methodId: string) => {
    setMethods(prev => prev.filter(m => m.id !== methodId));
    toast.success('Payment method deleted');
  };

  const handleAddNew = () => {
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      name: 'New Payment Method',
      icon: 'credit-card',
      description: 'Description here',
      category: 'card',
      available: true,
      enabledFor: { students: true, teachers: true, universities: true },
    };
    setEditingMethod(newMethod);
    setQrUploadPreview('');
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMethod) return;
    
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setMethods(prev => {
      const exists = prev.find(m => m.id === editingMethod.id);
      if (exists) {
        return prev.map(m => m.id === editingMethod.id ? { 
          ...editingMethod, 
          qrCodeUrl: qrUploadPreview || editingMethod.qrCodeUrl 
        } : m);
      }
      return [...prev, { ...editingMethod, qrCodeUrl: qrUploadPreview }];
    });
    
    setSaving(false);
    setSaved(true);
    toast.success('Payment method saved successfully!');
    setTimeout(() => {
      setSaved(false);
      setShowEditDialog(false);
      setEditingMethod(null);
    }, 1500);
  };

  const handleQRUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrUploadPreview(reader.result as string);
        toast.success('QR code uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'wallet': return <Wallet className="h-4 w-4" />;
      case 'qr': return <Globe className="h-4 w-4" />;
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 scroll-smooth">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Methods Administration</h1>
          <p className="text-muted-foreground">
            Manage payment methods, QR codes, and user access controls
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Payment Method
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Methods</TabsTrigger>
          <TabsTrigger value="card">Cards</TabsTrigger>
          <TabsTrigger value="wallet">Wallets</TabsTrigger>
          <TabsTrigger value="qr">QR Payments</TabsTrigger>
          <TabsTrigger value="mobile">Mobile Money</TabsTrigger>
        </TabsList>

        {['all', 'card', 'wallet', 'qr', 'mobile'].map(tab => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            <div className="grid gap-4">
              {methods
                .filter(m => tab === 'all' || m.category === tab)
                .map((method) => (
                  <Card key={method.id} className={!method.available ? 'opacity-60' : ''}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${method.available ? 'bg-accent/20' : 'bg-muted'}`}>
                            {iconMap[method.icon] || <CreditCard className="w-6 h-6" />}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{method.name}</h3>
                              <Badge variant={method.available ? 'default' : 'secondary'}>
                                {method.available ? 'Active' : 'Inactive'}
                              </Badge>
                              <Badge variant="outline" className="gap-1">
                                {getCategoryIcon(method.category)}
                                {method.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{method.description}</p>
                            
                            {/* QR Code Preview for WeChat/Alipay */}
                            {method.category === 'qr' && method.qrCodeUrl && (
                              <div className="mt-2">
                                <img 
                                  src={method.qrCodeUrl} 
                                  alt={`${method.name} QR Code`}
                                  className="w-20 h-20 rounded border object-cover"
                                />
                              </div>
                            )}
                            
                            {/* User Type Toggles */}
                            <div className="flex items-center gap-6 mt-4 pt-4 border-t">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-blue-500" />
                                <span className="text-sm">Students</span>
                                <Switch
                                  checked={method.enabledFor.students}
                                  onCheckedChange={() => handleToggleEnabled(method.id, 'students')}
                                  disabled={!method.available}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-green-500" />
                                <span className="text-sm">Teachers</span>
                                <Switch
                                  checked={method.enabledFor.teachers}
                                  onCheckedChange={() => handleToggleEnabled(method.id, 'teachers')}
                                  disabled={!method.available}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-purple-500" />
                                <span className="text-sm">Universities</span>
                                <Switch
                                  checked={method.enabledFor.universities}
                                  onCheckedChange={() => handleToggleEnabled(method.id, 'universities')}
                                  disabled={!method.available}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleAvailable(method.id)}
                          >
                            {method.available ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-1" />
                                Disable
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-1" />
                                Enable
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(method)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Payment Method?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove "{method.name}" from the platform.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(method.id)}>
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
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingMethod && methods.find(m => m.id === editingMethod.id)
                ? 'Edit Payment Method'
                : 'Add New Payment Method'}
            </DialogTitle>
          </DialogHeader>
          
          {editingMethod && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Method Name</Label>
                    <Input
                      value={editingMethod.name}
                      onChange={(e) => setEditingMethod({ ...editingMethod, name: e.target.value })}
                      placeholder="Payment method name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={editingMethod.category}
                      onValueChange={(value: any) => setEditingMethod({ 
                        ...editingMethod, 
                        category: value 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="wallet">Wallet</SelectItem>
                        <SelectItem value="qr">QR Payment</SelectItem>
                        <SelectItem value="mobile">Mobile Money</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <Select
                      value={editingMethod.icon}
                      onValueChange={(value) => setEditingMethod({ ...editingMethod, icon: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit-card">Credit Card</SelectItem>
                        <SelectItem value="wallet">Wallet</SelectItem>
                        <SelectItem value="smartphone">Smartphone</SelectItem>
                        <SelectItem value="globe">Globe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={editingMethod.description}
                      onChange={(e) => setEditingMethod({ ...editingMethod, description: e.target.value })}
                      placeholder="Brief description"
                    />
                  </div>
                </div>

                {/* QR Code Upload for QR payment methods */}
                {editingMethod.category === 'qr' && (
                  <div className="space-y-4">
                    <Separator />
                    <div>
                      <Label>QR Code Image</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload a new QR code image for {editingMethod.name}
                      </p>
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-accent transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleQRUpload}
                              className="hidden"
                              id="qr-upload"
                            />
                            <label htmlFor="qr-upload" className="cursor-pointer">
                              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                Click to upload QR code image
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                PNG, JPG up to 5MB
                              </p>
                            </label>
                          </div>
                        </div>
                        {(qrUploadPreview || editingMethod.qrCodeUrl) && (
                          <div className="space-y-2">
                            <Label>Preview</Label>
                            <div className="relative">
                              <img
                                src={qrUploadPreview || editingMethod.qrCodeUrl}
                                alt="QR Code Preview"
                                className="w-32 h-32 rounded-lg border object-cover"
                              />
                              {qrUploadPreview && (
                                <Badge className="absolute -top-2 -right-2 bg-green-500">
                                  New
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                {/* User Type Access */}
                <div className="space-y-4">
                  <Label>Enable for User Types</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-500" />
                          <span className="font-medium">Students</span>
                        </div>
                        <Switch
                          checked={editingMethod.enabledFor.students}
                          onCheckedChange={(checked) => setEditingMethod({
                            ...editingMethod,
                            enabledFor: { ...editingMethod.enabledFor, students: checked }
                          })}
                        />
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-5 w-5 text-green-500" />
                          <span className="font-medium">Teachers</span>
                        </div>
                        <Switch
                          checked={editingMethod.enabledFor.teachers}
                          onCheckedChange={(checked) => setEditingMethod({
                            ...editingMethod,
                            enabledFor: { ...editingMethod.enabledFor, teachers: checked }
                          })}
                        />
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-purple-500" />
                          <span className="font-medium">Universities</span>
                        </div>
                        <Switch
                          checked={editingMethod.enabledFor.universities}
                          onCheckedChange={(checked) => setEditingMethod({
                            ...editingMethod,
                            enabledFor: { ...editingMethod.enabledFor, universities: checked }
                          })}
                        />
                      </div>
                    </Card>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
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
                          <Check className="h-4 w-4 mr-2" />
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
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
