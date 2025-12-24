import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  RefreshCw, 
  Download,
  Users,
  GraduationCap,
  Building2,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface RevenueData {
  totalRevenue: number;
  studentRevenue: number;
  teacherRevenue: number;
  universityRevenue: number;
  periodLabel: string;
}

interface RealtimeRevenueProps {
  userType?: 'admin' | 'teacher' | 'university' | 'student';
  userId?: string;
}

const RealtimeRevenue = ({ userType = 'admin', userId }: RealtimeRevenueProps) => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [revenue, setRevenue] = useState<RevenueData>({
    totalRevenue: 0,
    studentRevenue: 0,
    teacherRevenue: 0,
    universityRevenue: 0,
    periodLabel: 'Today'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const getPeriodDates = (p: string) => {
    const now = new Date();
    let startDate: Date;
    let label: string;

    switch (p) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        label = 'Today';
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        label = 'This Week';
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        label = 'This Month';
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        label = 'This Year';
        break;
      default:
        startDate = new Date(now.setHours(0, 0, 0, 0));
        label = 'Today';
    }

    return { startDate, label };
  };

  const fetchRevenue = async () => {
    setIsLoading(true);
    const { startDate, label } = getPeriodDates(period);

    try {
      // Fetch payments for the period
      const { data: payments, error } = await supabase
        .from('payments')
        .select('amount, created_at, user_id')
        .gte('created_at', startDate.toISOString())
        .eq('status', 'completed');

      if (error) throw error;

      // Fetch admin revenue
      const { data: adminRevenue } = await supabase
        .from('admin_revenue')
        .select('total_amount, teacher_amount, commission_amount')
        .gte('created_at', startDate.toISOString());

      const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      const teacherShare = adminRevenue?.reduce((sum, r) => sum + (r.teacher_amount || 0), 0) || 0;
      const platformRevenue = adminRevenue?.reduce((sum, r) => sum + (r.commission_amount || 0), 0) || 0;

      setRevenue({
        totalRevenue,
        studentRevenue: totalRevenue,
        teacherRevenue: teacherShare,
        universityRevenue: platformRevenue * 0.3, // University gets 30% of platform revenue
        periodLabel: label
      });

      setLastUpdate(new Date());
      
      // Play success sound for new revenue
      const audio = new Audio('/sounds/success.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (error) {
      console.error('Error fetching revenue:', error);
      toast.error('Failed to fetch revenue data');
    } finally {
      setIsLoading(false);
    }
  };

  const exportRevenue = () => {
    const data = {
      period: revenue.periodLabel,
      totalRevenue: revenue.totalRevenue,
      studentRevenue: revenue.studentRevenue,
      teacherRevenue: revenue.teacherRevenue,
      universityRevenue: revenue.universityRevenue,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-${period}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Revenue data exported successfully!');
  };

  useEffect(() => {
    fetchRevenue();

    // Set up realtime subscription for new payments
    const channel = supabase
      .channel('revenue-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'payments',
        },
        (payload) => {
          console.log('New payment received:', payload);
          fetchRevenue();
          
          // Play notification sound and voice
          const audio = new Audio('/sounds/success.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {});

          toast.success(`New payment received: $${(payload.new as any).amount}`, {
            duration: 5000
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [period]);

  const RevenueCard = ({ 
    title, 
    amount, 
    icon: Icon, 
    color 
  }: { 
    title: string; 
    amount: number; 
    icon: any; 
    color: string;
  }) => (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`border-2 ${color}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <motion.p
                key={amount}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold"
              >
                ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </motion.p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-${color.split('-')[1]}/20`}>
              <Icon className={`w-6 h-6 text-${color.split('-')[1]}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              Real-time Revenue
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
              <SelectTrigger className="w-32">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchRevenue} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" size="icon" onClick={exportRevenue}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <RevenueCard
            title={`Total Revenue (${revenue.periodLabel})`}
            amount={revenue.totalRevenue}
            icon={DollarSign}
            color="border-success"
          />
          
          {(userType === 'admin' || userType === 'student') && (
            <RevenueCard
              title="Student Payments"
              amount={revenue.studentRevenue}
              icon={Users}
              color="border-blue-500"
            />
          )}
          
          {(userType === 'admin' || userType === 'teacher') && (
            <RevenueCard
              title="Teacher Earnings"
              amount={revenue.teacherRevenue}
              icon={GraduationCap}
              color="border-purple-500"
            />
          )}
          
          {(userType === 'admin' || userType === 'university') && (
            <RevenueCard
              title="University Revenue"
              amount={revenue.universityRevenue}
              icon={Building2}
              color="border-cyan-500"
            />
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            Live Updates Active
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealtimeRevenue;
