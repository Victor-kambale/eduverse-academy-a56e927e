import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Search, 
  Check, 
  X, 
  Eye, 
  Download,
  Clock,
  Building,
  User,
  Phone,
  FileText,
  AlertTriangle,
  CreditCard,
  Wallet,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface Withdrawal {
  id: string;
  user_id: string;
  user_type: string;
  amount: number;
  currency: string;
  category: string;
  payment_method: string;
  payment_details: any;
  status: string;
  id_document_url: string | null;
  signature_url: string | null;
  contract_url: string | null;
  phone_verified: boolean;
  receipt_number: string | null;
  created_at: string;
  rejection_reason: string | null;
}

const paymentMethodIcons: Record<string, any> = {
  paypal: Wallet,
  bank_transfer: Building,
  stripe: CreditCard,
  google_pay: Wallet,
  apple_pay: Wallet,
  wechat: Smartphone,
  alipay: Smartphone,
  payoneer: CreditCard,
  mobile_money: Phone,
};

const categoryLabels: Record<string, string> = {
  course_sales: 'Course Sales',
  appointments: 'Appointments',
  course_creation_fees: 'Course Creation Fees',
  maintenance: 'Maintenance',
  other: 'Other',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  verification_required: 'bg-orange-500',
  processing: 'bg-blue-500',
  completed: 'bg-green-500',
  rejected: 'bg-red-500',
  failed: 'bg-red-700',
};

export default function WithdrawalManagement() {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching withdrawals:', error);
      toast.error('Failed to fetch withdrawals');
    } else {
      setWithdrawals(data || []);
    }
    setLoading(false);
  };

  const handleApprove = async (withdrawal: Withdrawal) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('withdrawals')
        .update({
          status: 'completed',
          processed_by: user?.id,
          processed_at: new Date().toISOString(),
        })
        .eq('id', withdrawal.id);

      if (error) throw error;

      // Create notification
      await supabase.from('notifications').insert({
        user_id: withdrawal.user_id,
        title: 'Withdrawal Approved!',
        message: `Your withdrawal of $${withdrawal.amount} has been approved and processed.`,
        type: 'success',
      });

      toast.success('Withdrawal approved successfully');
      fetchWithdrawals();
      setIsViewDialogOpen(false);
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      toast.error('Failed to approve withdrawal');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal || !rejectionReason.trim()) return;
    
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('withdrawals')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          processed_by: user?.id,
          processed_at: new Date().toISOString(),
        })
        .eq('id', selectedWithdrawal.id);

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: selectedWithdrawal.user_id,
        title: 'Withdrawal Rejected',
        message: `Your withdrawal request was rejected. Reason: ${rejectionReason}`,
        type: 'warning',
      });

      toast.success('Withdrawal rejected');
      fetchWithdrawals();
      setIsRejectDialogOpen(false);
      setIsViewDialogOpen(false);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      toast.error('Failed to reject withdrawal');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={`${statusColors[status]} text-white`}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </Badge>
    );
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    const matchesSearch = w.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter(w => w.status === 'pending').length,
    processing: withdrawals.filter(w => w.status === 'processing').length,
    completed: withdrawals.filter(w => w.status === 'completed').length,
    totalAmount: withdrawals.filter(w => w.status === 'completed').reduce((sum, w) => sum + w.amount, 0),
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Withdrawal Management</h1>
        <p className="text-muted-foreground">Review and process withdrawal requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold">${stats.totalAmount.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Total Paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.processing}</p>
            <p className="text-sm text-muted-foreground">Processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verification_required">Verification Required</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredWithdrawals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No withdrawals found
                </TableCell>
              </TableRow>
            ) : (
              filteredWithdrawals.map((withdrawal) => {
                const PaymentIcon = paymentMethodIcons[withdrawal.payment_method] || CreditCard;
                return (
                  <TableRow key={withdrawal.id}>
                    <TableCell className="font-mono text-xs">
                      {withdrawal.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {withdrawal.user_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${withdrawal.amount.toFixed(2)} {withdrawal.currency}
                    </TableCell>
                    <TableCell>{categoryLabels[withdrawal.category]}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <PaymentIcon className="h-4 w-4" />
                        <span className="capitalize">{withdrawal.payment_method.replace('_', ' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {withdrawal.id_document_url && <FileText className="h-4 w-4 text-green-500" />}
                        {withdrawal.signature_url && <User className="h-4 w-4 text-green-500" />}
                        {withdrawal.phone_verified && <Phone className="h-4 w-4 text-green-500" />}
                        {withdrawal.contract_url && <FileText className="h-4 w-4 text-blue-500" />}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(withdrawal.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedWithdrawal(withdrawal);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Withdrawal Details</DialogTitle>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-6">
              {/* Amount and Status */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-3xl font-bold">${selectedWithdrawal.amount.toFixed(2)}</p>
                  <p className="text-muted-foreground">{categoryLabels[selectedWithdrawal.category]}</p>
                </div>
                {getStatusBadge(selectedWithdrawal.status)}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">User Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="capitalize">{selectedWithdrawal.user_type}</Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent className="capitalize">
                    {selectedWithdrawal.payment_method.replace('_', ' ')}
                  </CardContent>
                </Card>
              </div>

              {/* Verification Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Verification Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div className={`p-3 rounded-lg text-center ${selectedWithdrawal.id_document_url ? 'bg-green-100 text-green-700' : 'bg-muted'}`}>
                      <FileText className="h-6 w-6 mx-auto mb-1" />
                      <p className="text-xs">ID Document</p>
                      <p className="font-semibold">{selectedWithdrawal.id_document_url ? '✓' : '✗'}</p>
                    </div>
                    <div className={`p-3 rounded-lg text-center ${selectedWithdrawal.signature_url ? 'bg-green-100 text-green-700' : 'bg-muted'}`}>
                      <User className="h-6 w-6 mx-auto mb-1" />
                      <p className="text-xs">Signature</p>
                      <p className="font-semibold">{selectedWithdrawal.signature_url ? '✓' : '✗'}</p>
                    </div>
                    <div className={`p-3 rounded-lg text-center ${selectedWithdrawal.phone_verified ? 'bg-green-100 text-green-700' : 'bg-muted'}`}>
                      <Phone className="h-6 w-6 mx-auto mb-1" />
                      <p className="text-xs">Phone Verified</p>
                      <p className="font-semibold">{selectedWithdrawal.phone_verified ? '✓' : '✗'}</p>
                    </div>
                    <div className={`p-3 rounded-lg text-center ${selectedWithdrawal.contract_url ? 'bg-green-100 text-green-700' : 'bg-muted'}`}>
                      <FileText className="h-6 w-6 mx-auto mb-1" />
                      <p className="text-xs">Contract</p>
                      <p className="font-semibold">{selectedWithdrawal.contract_url ? '✓' : '✗'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Receipt Info */}
              {selectedWithdrawal.receipt_number && (
                <Card>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Receipt Number</p>
                      <p className="font-mono font-semibold">{selectedWithdrawal.receipt_number}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download Receipt
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Rejection Reason */}
              {selectedWithdrawal.rejection_reason && (
                <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <h4 className="font-semibold text-destructive mb-1 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Rejection Reason
                  </h4>
                  <p className="text-sm text-muted-foreground">{selectedWithdrawal.rejection_reason}</p>
                </div>
              )}

              {/* Actions */}
              {selectedWithdrawal.status === 'pending' && (
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsRejectDialogOpen(true)}
                    disabled={processing}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedWithdrawal)}
                    disabled={processing || (!selectedWithdrawal.id_document_url && selectedWithdrawal.user_type !== 'admin')}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve & Process
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Withdrawal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Please provide a reason for rejecting this withdrawal request.
            </p>
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || processing}
            >
              Reject Withdrawal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
