import { useState, useEffect } from 'react';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Filter,
  Download,
  RefreshCw,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  type: 'earning' | 'withdrawal';
  amount: number;
  category: string;
  status: string;
  date: string;
  description: string;
}

interface EarningsBreakdown {
  course_id: string;
  course_title: string;
  total_earnings: number;
  enrollments: number;
}

export const TransactionHistory = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [earningsBreakdown, setEarningsBreakdown] = useState<EarningsBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (user?.id) {
      fetchTransactions();
      fetchEarningsBreakdown();
      
      // Set up realtime subscription for withdrawals
      const channel = supabase
        .channel('withdrawal-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'withdrawals',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchTransactions();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  const fetchTransactions = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Fetch withdrawals
      const { data: withdrawals } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch payments (earnings)
      const { data: adminRevenue } = await supabase
        .from('admin_revenue')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      const allTransactions: Transaction[] = [];

      // Add withdrawals
      withdrawals?.forEach((w) => {
        allTransactions.push({
          id: w.id,
          type: 'withdrawal',
          amount: w.amount,
          category: w.category,
          status: w.status,
          date: w.created_at,
          description: `Withdrawal via ${w.payment_method?.replace('_', ' ')}`,
        });
      });

      // Add earnings
      adminRevenue?.forEach((e) => {
        allTransactions.push({
          id: e.id,
          type: 'earning',
          amount: e.teacher_amount || 0,
          category: e.source_type,
          status: 'completed',
          date: e.created_at,
          description: `Earnings from ${e.source_type}`,
        });
      });

      // Sort by date
      allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEarningsBreakdown = async () => {
    if (!user?.id) return;

    const { data: courses } = await supabase
      .from('courses')
      .select('id, title')
      .eq('instructor_id', user.id);

    if (!courses) return;

    const breakdown: EarningsBreakdown[] = [];

    for (const course of courses) {
      const { data: revenue } = await supabase
        .from('admin_revenue')
        .select('teacher_amount')
        .eq('course_id', course.id);

      const { count: enrollmentCount } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course.id);

      const totalEarnings = revenue?.reduce((sum, r) => sum + (r.teacher_amount || 0), 0) || 0;

      if (totalEarnings > 0 || (enrollmentCount && enrollmentCount > 0)) {
        breakdown.push({
          course_id: course.id,
          course_title: course.title,
          total_earnings: totalEarnings,
          enrollments: enrollmentCount || 0,
        });
      }
    }

    setEarningsBreakdown(breakdown);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Earnings Breakdown by Course */}
      {earningsBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-accent" />
              Earnings by Course
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {earningsBreakdown.map((course) => (
                <div 
                  key={course.course_id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{course.course_title}</p>
                    <p className="text-sm text-muted-foreground">
                      {course.enrollments} enrollment{course.enrollments !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-accent">
                      ${course.total_earnings.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Transaction History</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="earning">Earnings</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchTransactions}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'earning' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'earning' 
                        ? <ArrowDownRight className="h-5 w-5" />
                        : <ArrowUpRight className="h-5 w-5" />
                      }
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.date), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={`${getStatusColor(transaction.status)} text-white`}>
                      {transaction.status}
                    </Badge>
                    <p className={`font-bold ${
                      transaction.type === 'earning' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'earning' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
