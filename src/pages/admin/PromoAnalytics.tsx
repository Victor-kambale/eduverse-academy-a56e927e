import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Eye, 
  MousePointer, 
  TrendingUp, 
  Calendar,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, subDays, startOfDay } from 'date-fns';

interface AnalyticsData {
  totalClicks: number;
  totalViews: number;
  totalConversions: number;
  clickThroughRate: number;
  conversionRate: number;
  dailyData: { date: string; clicks: number; views: number; conversions: number }[];
  bannerPerformance: { name: string; clicks: number; views: number; ctr: number }[];
}

const COLORS = ['hsl(262, 80%, 50%)', 'hsl(330, 80%, 60%)', 'hsl(45, 80%, 50%)', 'hsl(180, 60%, 45%)'];

export default function PromoAnalytics() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalClicks: 0,
    totalViews: 0,
    totalConversions: 0,
    clickThroughRate: 0,
    conversionRate: 0,
    dailyData: [],
    bannerPerformance: [],
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const startDate = startOfDay(subDays(new Date(), parseInt(timeRange)));
      
      // Fetch analytics data
      const { data: analyticsData, error } = await supabase
        .from('promo_analytics')
        .select('*, promotional_banners!inner(title)')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // Process data
      const clicks = analyticsData?.filter(a => a.event_type === 'click') || [];
      const views = analyticsData?.filter(a => a.event_type === 'view') || [];
      const conversions = analyticsData?.filter(a => a.event_type === 'conversion') || [];

      const totalClicks = clicks.length;
      const totalViews = views.length;
      const totalConversions = conversions.length;
      const clickThroughRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

      // Group by day
      const dailyMap = new Map<string, { clicks: number; views: number; conversions: number }>();
      for (let i = 0; i < parseInt(timeRange); i++) {
        const date = format(subDays(new Date(), i), 'MMM dd');
        dailyMap.set(date, { clicks: 0, views: 0, conversions: 0 });
      }

      analyticsData?.forEach(item => {
        const date = format(new Date(item.created_at), 'MMM dd');
        const current = dailyMap.get(date) || { clicks: 0, views: 0, conversions: 0 };
        if (item.event_type === 'click') current.clicks++;
        if (item.event_type === 'view') current.views++;
        if (item.event_type === 'conversion') current.conversions++;
        dailyMap.set(date, current);
      });

      const dailyData = Array.from(dailyMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .reverse();

      // Group by banner
      const bannerMap = new Map<string, { title: string; clicks: number; views: number }>();
      analyticsData?.forEach(item => {
        const bannerId = item.banner_id;
        const title = (item.promotional_banners as any)?.title || 'Unknown';
        const current = bannerMap.get(bannerId) || { title, clicks: 0, views: 0 };
        if (item.event_type === 'click') current.clicks++;
        if (item.event_type === 'view') current.views++;
        bannerMap.set(bannerId, current);
      });

      const bannerPerformance = Array.from(bannerMap.values()).map(b => ({
        name: b.title.substring(0, 20) + (b.title.length > 20 ? '...' : ''),
        clicks: b.clicks,
        views: b.views,
        ctr: b.views > 0 ? (b.clicks / b.views) * 100 : 0,
      }));

      setAnalytics({
        totalClicks,
        totalViews,
        totalConversions,
        clickThroughRate,
        conversionRate,
        dailyData,
        bannerPerformance,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Promo Analytics</h1>
          <p className="text-muted-foreground">Track banner performance and conversion metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-5 w-5" />
              <span className="text-blue-100 text-sm">Total Views</span>
            </div>
            <p className="text-3xl font-bold">{analytics.totalViews.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MousePointer className="h-5 w-5" />
              <span className="text-purple-100 text-sm">Total Clicks</span>
            </div>
            <p className="text-3xl font-bold">{analytics.totalClicks.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5" />
              <span className="text-green-100 text-sm">Conversions</span>
            </div>
            <p className="text-3xl font-bold">{analytics.totalConversions.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-700 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5" />
              <span className="text-orange-100 text-sm">Click Rate</span>
            </div>
            <p className="text-3xl font-bold">{analytics.clickThroughRate.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500 to-pink-700 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5" />
              <span className="text-pink-100 text-sm">Conv. Rate</span>
            </div>
            <p className="text-3xl font-bold">{analytics.conversionRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Daily Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-muted-foreground" tick={{ fontSize: 12 }} />
                <YAxis className="text-muted-foreground" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line type="monotone" dataKey="views" stroke="hsl(220, 70%, 50%)" strokeWidth={2} name="Views" />
                <Line type="monotone" dataKey="clicks" stroke="hsl(280, 70%, 50%)" strokeWidth={2} name="Clicks" />
                <Line type="monotone" dataKey="conversions" stroke="hsl(140, 70%, 45%)" strokeWidth={2} name="Conversions" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Banner Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.bannerPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.bannerPerformance}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-muted-foreground" tick={{ fontSize: 10 }} />
                  <YAxis className="text-muted-foreground" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Clicks" />
                  <Bar dataKey="views" fill="hsl(var(--primary) / 0.5)" radius={[4, 4, 0, 0]} name="Views" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No banner data available</p>
                  <p className="text-sm">Analytics will appear once banners are clicked</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{analytics.totalViews}</p>
                  <p className="text-sm text-muted-foreground">Views</p>
                </div>
              </div>
            </div>
            <div className="text-2xl text-muted-foreground">→</div>
            <div className="text-center">
              <div className="w-28 h-28 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <div>
                  <p className="text-2xl font-bold text-purple-600">{analytics.totalClicks}</p>
                  <p className="text-sm text-muted-foreground">Clicks</p>
                </div>
              </div>
              <Badge variant="secondary" className="mt-2">
                {analytics.clickThroughRate.toFixed(1)}% CTR
              </Badge>
            </div>
            <div className="text-2xl text-muted-foreground">→</div>
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">{analytics.totalConversions}</p>
                  <p className="text-sm text-muted-foreground">Conversions</p>
                </div>
              </div>
              <Badge variant="secondary" className="mt-2">
                {analytics.conversionRate.toFixed(1)}% Conv.
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
