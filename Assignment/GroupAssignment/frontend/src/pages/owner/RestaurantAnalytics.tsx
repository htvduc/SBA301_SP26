import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRestaurantDailyRevenue, useTopSellingItems, useOrderDistribution } from "@/hooks/queries/useAnalyticsQueries";
import { useAIAssistantAccess } from "@/hooks/useFeatureLimits";
import { formatCurrency } from "@/utils/currency";
import { TrendingUp, ShoppingCart, CheckCircle, XCircle, Activity, BarChart3, Sparkles, Award, Calendar, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { AIConsultantChatbot } from "@/components/ai/AIConsultantChatbot";
import { PremiumFeatureBanner } from "@/components/ai/PremiumFeatureBanner";
import { formatLocalDateYmd } from "@/utils/formatLocalDateYmd";

export function RestaurantAnalytics() {
  const { id } = useParams<{ id: string }>();
  const[timeframe, setTimeframe] = useState<'DAY' | 'MONTH' | 'YEAR'>('DAY');
  const [selectedDate] = useState(() => formatLocalDateYmd(new Date()));
  const[showAIChat, setShowAIChat] = useState(false);
  const [dateOffset, setDateOffset] = useState(0); // 0 = current period, -1 = previous period, etc.

  // Calculate date range for daily revenue based on timeframe and dateOffset
  const { startDate, endDate, periodLabel } = useMemo(() => {
    const today = new Date();
    let start: Date;
    let end: Date;
    let label: string;
    
    switch (timeframe) {
      case 'DAY':
        // 7 days period
        end = new Date(today);
        end.setDate(today.getDate() + (dateOffset * 7));
        start = new Date(end);
        start.setDate(end.getDate() - 6);
        
        if (dateOffset === 0) {
          label = 'This Week';
        } else if (dateOffset === -1) {
          label = 'Last Week';
        } else if (dateOffset < -1) {
          label = `${Math.abs(dateOffset)} weeks ago`;
        } else {
          label = `${dateOffset} weeks ahead`;
        }
        break;
        
      case 'MONTH':
        // 30 days period
        end = new Date(today);
        end.setDate(today.getDate() + (dateOffset * 30));
        start = new Date(end);
        start.setDate(end.getDate() - 29);
        
        if (dateOffset === 0) {
          label = 'This Month';
        } else if (dateOffset === -1) {
          label = 'Last Month';
        } else if (dateOffset < -1) {
          label = `${Math.abs(dateOffset)} months ago`;
        } else {
          label = `${dateOffset} months ahead`;
        }
        break;
        
      case 'YEAR':
        // 12 months period
        end = new Date(today);
        end.setMonth(today.getMonth() + (dateOffset * 12));
        start = new Date(end);
        start.setMonth(end.getMonth() - 11);
        start.setDate(1);
        
        if (dateOffset === 0) {
          label = 'This Year';
        } else if (dateOffset === -1) {
          label = 'Last Year';
        } else if (dateOffset < -1) {
          label = `${Math.abs(dateOffset)} years ago`;
        } else {
          label = `${dateOffset} years ahead`;
        }
        break;
        
      default:
        end = new Date(today);
        start = new Date(today);
        start.setDate(today.getDate() - 6);
        label = 'This Week';
    }
    
    return {
      startDate: formatLocalDateYmd(start),
      endDate: formatLocalDateYmd(end),
      periodLabel: label
    };
  }, [timeframe, dateOffset]);

  const { data: dailyRevenue, isLoading: dailyRevenueLoading, error: analyticsError } = useRestaurantDailyRevenue(id || '', startDate, endDate);
  const { data: topItems, isLoading: topItemsLoading } = useTopSellingItems(id || '', timeframe, 10);
  const { data: orderDistribution, isLoading: distributionLoading } = useOrderDistribution(id || '', selectedDate);
  const { data: hasAIAccess, isLoading: aiAccessLoading } = useAIAssistantAccess(id);

  // Calculate analytics from dailyRevenue data
  const analytics = useMemo(() => {
    if (!dailyRevenue || dailyRevenue.length === 0) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        avgOrderValue: 0,
        timeframe
      };
    }

    const totalRevenue = dailyRevenue.reduce((sum, day) => sum + day.revenue, 0);
    const totalOrders = dailyRevenue.reduce((sum, day) => sum + day.orderCount, 0);
    const completedOrders = dailyRevenue.reduce((sum, day) => sum + day.completedOrders, 0);
    const cancelledOrders = dailyRevenue.reduce((sum, day) => sum + day.cancelledOrders, 0);
    const avgOrderValue =
      completedOrders > 0 ? totalRevenue / completedOrders : 0;

    return {
      totalRevenue,
      totalOrders,
      completedOrders,
      cancelledOrders,
      avgOrderValue,
      timeframe
    };
  }, [dailyRevenue, timeframe]);

  // Xử lý dữ liệu biểu đồ dựa trên Timeframe
  const chartData = useMemo(() => {
    if (!dailyRevenue || dailyRevenue.length === 0) return [];

    if (timeframe === 'YEAR') {
      // Gộp thành 12 tháng
      const monthlyData: Record<string, any> = {};
      dailyRevenue.forEach(day => {
        const date = new Date(day.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            label: date.toLocaleDateString('en-US', { month: 'short' }),
            revenue: 0,
            orderCount: 0,
            completedOrders: 0,
            cancelledOrders: 0,
            timestamp: new Date(date.getFullYear(), date.getMonth(), 1).getTime()
          };
        }
        monthlyData[monthKey].revenue += day.revenue;
        monthlyData[monthKey].orderCount += day.orderCount;
        monthlyData[monthKey].completedOrders += day.completedOrders;
        monthlyData[monthKey].cancelledOrders += day.cancelledOrders;
      });
      return Object.values(monthlyData).sort((a: any, b: any) => a.timestamp - b.timestamp);
    }

    if (timeframe === 'MONTH') {
      // Gộp thành 4-5 tuần
      const weeklyData: any[] = [];
      const sortedData = [...dailyRevenue].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      let currentWeek: any = null;
      let weekNumber = 1;

      sortedData.forEach((day, index) => {
        if (index % 7 === 0) {
          if (currentWeek) {
            weeklyData.push(currentWeek);
          }
          currentWeek = {
            label: `Week ${weekNumber}`,
            revenue: 0,
            orderCount: 0,
            completedOrders: 0,
            cancelledOrders: 0
          };
          weekNumber++;
        }
        
        if (currentWeek) {
          currentWeek.revenue += day.revenue;
          currentWeek.orderCount += day.orderCount;
          currentWeek.completedOrders += day.completedOrders;
          currentWeek.cancelledOrders += day.cancelledOrders;
        }
      });

      if (currentWeek) {
        weeklyData.push(currentWeek);
      }

      return weeklyData;
    }

    // DAY: 7 ngày với tên ngày trong tuần
    return dailyRevenue.map(day => {
      const date = new Date(day.date);
      return {
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: day.revenue,
        orderCount: day.orderCount,
        completedOrders: day.completedOrders,
        cancelledOrders: day.cancelledOrders
      };
    });
  }, [dailyRevenue, timeframe]);

  const isLoading = dailyRevenueLoading || topItemsLoading || distributionLoading;

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 space-y-6 bg-slate-50/50 min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-1/4 bg-slate-200 rounded-md"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[400px] bg-slate-200 rounded-xl"></div>
            <div className="h-[400px] bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (analyticsError || !analytics) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Activity className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-medium text-slate-900">Unable to load analytics</h3>
          <p className="text-slate-500">There was a problem fetching the data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-slate-50/30 dark:bg-slate-950/30 min-h-screen">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Analytics Overview</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor your restaurant's performance and insights.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1.5 rounded-lg shadow-sm border dark:border-slate-800">
            <Select value={timeframe} onValueChange={(value: 'DAY' | 'MONTH' | 'YEAR') => { setTimeframe(value); setDateOffset(0); }}>
              <SelectTrigger className="w-[140px] border-none shadow-none focus:ring-0 font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAY">This Week</SelectItem>
                <SelectItem value="MONTH">This Month</SelectItem>
                <SelectItem value="YEAR">This Year</SelectItem>
              </SelectContent>
            </Select>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
            {!aiAccessLoading && hasAIAccess && (
              <Button
                onClick={() => setShowAIChat(!showAIChat)}
                className={`gap-2 transition-all ${
                  showAIChat 
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700" 
                    : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg"
                }`}
                variant={showAIChat ? "ghost" : "default"}
              >
                <Sparkles className={`h-4 w-4 ${showAIChat ? "text-violet-600 dark:text-violet-400" : "text-white"}`} />
                {showAIChat ? "Close Assistant" : "Ask AI"}
              </Button>
            )}
          </div>
        </div>

        {/* Date Navigation */}
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDateOffset(dateOffset - 1)}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {periodLabel}
                </span>
                {dateOffset !== 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDateOffset(0)}
                    className="gap-2 text-xs"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </Button>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDateOffset(dateOffset + 1)}
                disabled={dateOffset >= 0}
                className="gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {!aiAccessLoading && !hasAIAccess && <PremiumFeatureBanner />}

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start relative w-full">
          
          {/* Main Analytics Content */}
          <div className={`flex-1 space-y-8 transition-all duration-300 ease-in-out min-w-0 w-full`}>
            
            {/* KPI Cards */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${showAIChat ? 'lg:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-5'} gap-4`}>
              <Card className="border-none shadow-sm bg-white dark:bg-slate-900 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Revenue</CardTitle>
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-950 rounded-full">
                    <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(analytics.totalRevenue)}</div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white dark:bg-slate-900 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Orders</CardTitle>
                  <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-full">
                    <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{analytics.totalOrders}</div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white dark:bg-slate-900 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Completed</CardTitle>
                  <div className="p-2 bg-green-100 dark:bg-green-950 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{analytics.completedOrders}</div>
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                    {analytics.totalOrders > 0 ? `${((analytics.completedOrders / analytics.totalOrders) * 100).toFixed(1)}% rate` : '0%'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white dark:bg-slate-900 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Cancelled</CardTitle>
                  <div className="p-2 bg-red-100 dark:bg-red-950 rounded-full">
                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{analytics.cancelledOrders}</div>
                  <p className="text-xs text-red-500 dark:text-red-400 font-medium mt-1">
                    {analytics.totalOrders > 0 ? `${((analytics.cancelledOrders / analytics.totalOrders) * 100).toFixed(1)}% rate` : '0%'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white dark:bg-slate-900 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg. Order Value</CardTitle>
                  <div className="p-2 bg-violet-100 dark:bg-violet-950 rounded-full">
                    <Activity className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(analytics.avgOrderValue)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className={`grid grid-cols-1 gap-6 ${showAIChat ? 'xl:grid-cols-1' : 'xl:grid-cols-2'}`}>
              
              {/* Daily Revenue Trend - FIXED UI/UX */}
              <Card className="border-none shadow-sm bg-white dark:bg-slate-900 min-w-0 xl:col-span-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                    Revenue Trend
                  </CardTitle>
                  <CardDescription>
                    {timeframe === 'DAY' ? 'Last 7 days' : timeframe === 'MONTH' ? 'Weekly revenue for the last 4 weeks' : 'Monthly revenue for the last 12 months'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dailyRevenueLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                    </div>
                  ) : chartData && chartData.length > 0 ? (
                    <div className="h-[300px] mt-4 flex items-end gap-1 sm:gap-2 w-full pt-6">
                      {chartData.map((item, idx) => {
                        const maxRevenue = Math.max(...chartData.map((d: any) => d.revenue), 1);
                        const heightPercent = (item.revenue / maxRevenue) * 100;
                        
                        // Ẩn bớt nhãn nếu có nhiều cột để tránh chữ đè lên nhau
                        const shouldHideLabel = timeframe === 'YEAR' && idx % 2 !== 0;

                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end min-w-[8px]">
                            
                            {/* CSS Tooltip khi Hover */}
                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-lg py-1.5 px-3 pointer-events-none whitespace-nowrap z-20 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg border border-slate-600">
                              <p className="font-medium text-slate-300 mb-0.5">{item.label}</p>
                              <p className="font-bold text-sm text-emerald-400">{formatCurrency(item.revenue)}</p>
                              <p className="text-[10px] text-slate-400">{item.orderCount} orders</p>
                              {/* Tam giác chỉ xuống của Tooltip */}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-700"></div>
                            </div>

                            {/* Cột biểu đồ (Bar) */}
                            <div
                              className="w-full max-w-[40px] bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-t-md transition-all duration-500 relative overflow-hidden flex flex-col justify-end"
                              style={{ height: `${Math.max(heightPercent, 2)}%` }}
                            >
                              <div className="bg-gradient-to-t from-emerald-500 to-emerald-400 dark:from-emerald-600 dark:to-emerald-500 w-full rounded-t-sm transition-all duration-300 opacity-80 group-hover:opacity-100 h-full"></div>
                            </div>

                            {/* Nhãn trục X (Tháng / Tuần / Ngày) */}
                            <span className={`text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-2 truncate max-w-full text-center ${shouldHideLabel ? 'hidden md:block' : 'block'}`}>
                              {item.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-slate-400 dark:text-slate-500">
                      <TrendingUp className="h-12 w-12 mb-3 opacity-20" />
                      <p>No revenue data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Selling Items */}
              <Card className="border-none shadow-sm bg-white dark:bg-slate-900 min-w-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                    Top Selling Items
                  </CardTitle>
                  <CardDescription>Highest revenue generating items {timeframe.toLowerCase()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topItems && topItems.length > 0 ? (
                      topItems.map((item, index) => (
                        <div key={item.menuItemId} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold shadow-sm shrink-0
                            ${index === 0 ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400' : 
                              index === 1 ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' : 
                              index === 2 ? 'bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">{item.menuItemName}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{item.quantitySold} units sold</p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-base font-bold text-slate-900 dark:text-slate-100">{formatCurrency(item.totalRevenue)}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
                        <ShoppingCart className="h-10 w-10 mb-3 opacity-20" />
                        <p>No sales data available yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Order Distribution */}
              <Card className="border-none shadow-sm bg-white dark:bg-slate-900 min-w-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                    Hourly Orders
                  </CardTitle>
                  <CardDescription>Order volume distribution across the day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orderDistribution && orderDistribution.length > 0 ? (
                      orderDistribution
                        .filter(d => d.orderCount > 0)
                        .map((data) => {
                          const maxCount = Math.max(...orderDistribution.map(d => d.orderCount));
                          const percentage = Math.min((data.orderCount / maxCount) * 100, 100);
                          
                          return (
                            <div key={data.hour} className="flex items-center gap-4 group">
                              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 w-16 tabular-nums shrink-0">
                                {data.hour.toString().padStart(2, '0')}:00
                              </span>
                              <div className="flex-1 flex items-center gap-3 min-w-0">
                                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                                  <div 
                                    className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 dark:from-blue-500 dark:to-indigo-600 transition-all duration-1000 ease-out group-hover:opacity-80" 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-bold w-8 text-right text-slate-700 dark:text-slate-300 shrink-0">{data.orderCount}</span>
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
                        <Activity className="h-10 w-10 mb-3 opacity-20" />
                        <p>No order data for today</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI Chat Sidebar */}
          {showAIChat && hasAIAccess && (
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 lg:sticky lg:top-6 z-10 animate-in slide-in-from-right-8 fade-in duration-300 ease-out">
              <AIConsultantChatbot
                restaurantId={id}
                timeframe={timeframe}
                specificDate={selectedDate}
                onClose={() => setShowAIChat(false)}
              />
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}