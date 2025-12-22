import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Users,
  BookOpen,
  Calendar,
  MessageCircle,
  AlertTriangle,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  RefreshCw,
  Clock,
  Percent,
  Search,
  FileDown,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, subDays, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart as RechartsPie,
  Pie,
  Cell,
} from 'recharts';

interface RevenueItem {
  id: string;
  source_type: string;
  total_amount: number;
  commission_amount: number;
  commission_percentage: number;
  teacher_amount: number | null;
  course_level: string | null;
  created_at: string;
  course_id: string | null;
}

interface RevenueBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'];

const sourceTypeLabels: Record<string, string> = {
  course_sale: 'Course Sales',
  course_creation_fee: 'Course Creation Fees ($5)',
  appointment_5: 'Appointments ($5/month)',
  appointment_10: 'Appointments ($10 Unlimited)',
  appointment_premium: 'Premium Appointments (+20%)',
  failed_payment_penalty: 'Failed Payment Penalties (20%)',
  maintenance: 'Maintenance Fees',
  other: 'Other Revenue',
};

const commissionRates: Record<string, number> = {
  course_sale: 30,
  course_creation_fee: 100,
  appointment_5: 100,
  appointment_10: 100,
  appointment_premium: 20,
  failed_payment_penalty: 100,
};

export default function RevenueAnalytics() {
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState<RevenueItem[]>([]);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [chartData, setChartData] = useState<any[]>([]);
  const [breakdown, setBreakdown] = useState<RevenueBreakdown[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isChartsOpen, setIsChartsOpen] = useState(true);
  const [isStatsOpen, setIsStatsOpen] = useState(true);

  useEffect(() => {
    fetchRevenue();
  }, [timeRange]);

  const fetchRevenue = async () => {
    setLoading(true);
    
    let startDate: Date;
    switch (timeRange) {
      case 'day':
        startDate = subDays(new Date(), 1);
        break;
      case 'week':
        startDate = startOfWeek(new Date());
        break;
      case 'month':
        startDate = startOfMonth(new Date());
        break;
      case 'year':
        startDate = startOfYear(new Date());
        break;
    }

    const { data, error } = await supabase
      .from('admin_revenue')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching revenue:', error);
      toast.error('Failed to fetch revenue data');
    } else {
      setRevenue(data || []);
      processChartData(data || []);
      processBreakdown(data || []);
    }
    setLoading(false);
  };

  const processChartData = (data: RevenueItem[]) => {
    const grouped: Record<string, { date: string; total: number; commission: number; teacher: number }> = {};
    
    data.forEach(item => {
      const dateKey = format(new Date(item.created_at), timeRange === 'day' ? 'HH:00' : 'MMM dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = { date: dateKey, total: 0, commission: 0, teacher: 0 };
      }
      grouped[dateKey].total += item.total_amount;
      grouped[dateKey].commission += item.commission_amount;
      grouped[dateKey].teacher += item.teacher_amount || 0;
    });

    setChartData(Object.values(grouped).reverse());
  };

  const processBreakdown = (data: RevenueItem[]) => {
    const categories: Record<string, number> = {};
    
    data.forEach(item => {
      const category = item.source_type;
      categories[category] = (categories[category] || 0) + item.commission_amount;
    });

    const total = Object.values(categories).reduce((a, b) => a + b, 0);
    
    const breakdownData: RevenueBreakdown[] = Object.entries(categories).map(([category, amount], index) => ({
      category: sourceTypeLabels[category] || category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
      color: COLORS[index % COLORS.length],
    }));

    setBreakdown(breakdownData.sort((a, b) => b.amount - a.amount));
  };

  // Filter revenue based on search query - checks all fields
  const filteredRevenue = revenue.filter(item => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const sourceLabel = sourceTypeLabels[item.source_type] || item.source_type;
    return (
      sourceLabel.toLowerCase().includes(query) ||
      item.source_type.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query) ||
      (item.course_level && item.course_level.toLowerCase().includes(query)) ||
      item.total_amount.toString().includes(query) ||
      item.commission_amount.toString().includes(query)
    );
  });

  const exportToCSV = () => {
    const headers = ['Date', 'Source', 'Level', 'Total Amount', 'Commission %', 'Admin Revenue', 'Teacher Payout'];
    const rows = filteredRevenue.map(item => [
      format(new Date(item.created_at), 'MMM d, HH:mm'),
      sourceTypeLabels[item.source_type] || item.source_type,
      item.course_level || '',
      item.total_amount.toFixed(2),
      item.commission_percentage + '%',
      item.commission_amount.toFixed(2),
      item.teacher_amount ? item.teacher_amount.toFixed(2) : ''
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue_${timeRange}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Revenue data exported to CSV');
  };

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(filteredRevenue, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue_${timeRange}_${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Revenue data exported to JSON');
  };

  const totalRevenue = revenue.reduce((sum, r) => sum + r.total_amount, 0);
  const totalCommission = revenue.reduce((sum, r) => sum + r.commission_amount, 0);
  const totalTeacherPayout = revenue.reduce((sum, r) => sum + (r.teacher_amount || 0), 0);
  const courseSales = revenue.filter(r => r.source_type === 'course_sale').length;
  const failedPaymentRevenue = revenue
    .filter(r => r.source_type === 'failed_payment_penalty')
    .reduce((sum, r) => sum + r.commission_amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Revenue Analytics</h1>
          <p className="text-muted-foreground">Track all revenue streams and commission percentages</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchRevenue}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={exportToCSV}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToJSON}>
                <FileDown className="h-4 w-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Collapsible Key Stats */}
      <Collapsible open={isStatsOpen} onOpenChange={setIsStatsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-muted/50 rounded-lg">
            <span className="font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Key Statistics
            </span>
            <ChevronRight className={`h-5 w-5 transition-transform ${isStatsOpen ? 'rotate-90' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <DollarSign className="h-8 w-8 text-accent" />
                  <Badge variant="secondary">+12.5%</Badge>
                </div>
                <p className="text-3xl font-bold mt-2">${totalRevenue.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Percent className="h-8 w-8 text-green-500" />
                  <ArrowUpRight className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold mt-2">${totalCommission.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Admin Commission</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-3xl font-bold mt-2">${totalTeacherPayout.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Teacher Payouts</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <BookOpen className="h-8 w-8 text-purple-500" />
                </div>
                <p className="text-3xl font-bold mt-2">{courseSales}</p>
                <p className="text-sm text-muted-foreground">Course Sales</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-3xl font-bold mt-2">${failedPaymentRevenue.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Failed Payment Fees (20%)</p>
              </CardContent>
            </Card>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Collapsible Charts Row */}
      <Collapsible open={isChartsOpen} onOpenChange={setIsChartsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-muted/50 rounded-lg">
            <span className="font-semibold flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Charts & Visualizations
            </span>
            <ChevronRight className={`h-5 w-5 transition-transform ${isChartsOpen ? 'rotate-90' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Over Time */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))' 
                        }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="total" 
                        stackId="1"
                        stroke="#8B5CF6" 
                        fill="#8B5CF6" 
                        fillOpacity={0.3}
                        name="Total Revenue"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="commission" 
                        stackId="2"
                        stroke="#10B981" 
                        fill="#10B981" 
                        fillOpacity={0.3}
                        name="Admin Commission"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Breakdown Pie */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Revenue by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={breakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="amount"
                      >
                        {breakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {breakdown.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }} 
                        />
                        <span className="truncate max-w-32">{item.category}</span>
                      </div>
                      <span className="font-medium">{item.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Commission Rates Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Commission Rates & Fee Structure
          </CardTitle>
          <CardDescription>Standard rates applied to different revenue sources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Course Sales</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">30%</p>
              <p className="text-sm text-muted-foreground">Admin commission</p>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <span className="font-medium">Course Creation</span>
              </div>
              <p className="text-2xl font-bold text-green-600">$5.00</p>
              <p className="text-sm text-muted-foreground">Per new course</p>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Appointments</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm"><span className="font-bold">$5</span>/month (5 free)</p>
                <p className="text-sm"><span className="font-bold">$10</span>/month (unlimited)</p>
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="font-medium">Failed Payments</span>
              </div>
              <p className="text-2xl font-bold text-red-600">20%</p>
              <p className="text-sm text-muted-foreground">Penalty fee collected</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions with Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Revenue Transactions</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date/Time</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Commission %</TableHead>
                <TableHead>Admin Revenue</TableHead>
                <TableHead>Teacher Payout</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : filteredRevenue.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No matching transactions found' : 'No revenue data found for this period'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRevenue.slice(0, 20).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(item.created_at), 'MMM d, HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {sourceTypeLabels[item.source_type] || item.source_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.course_level && (
                        <Badge variant="secondary">{item.course_level}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">${item.total_amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className="text-accent font-medium">{item.commission_percentage}%</span>
                    </TableCell>
                    <TableCell className="text-green-600 font-semibold">
                      +${item.commission_amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-blue-600">
                      {item.teacher_amount ? `$${item.teacher_amount.toFixed(2)}` : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {filteredRevenue.length > 20 && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Showing 20 of {filteredRevenue.length} transactions
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
