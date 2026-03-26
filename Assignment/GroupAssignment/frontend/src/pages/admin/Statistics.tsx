import { Users, Store, CreditCard, DollarSign, TrendingUp, Package, Calendar, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from "recharts";
import { useAdminStatistics, useAdminStatisticsByDateRange } from "@/hooks/queries/useStatisticsQueries";
import { useMemo, useState } from "react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Statistics = () => {
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);

  const [isFilterActive, setIsFilterActive] = useState(false);

  // Use different hooks based on whether date filter is active
  const { data: defaultStats, isLoading: defaultLoading, error: defaultError } = useAdminStatistics();
  const { data: filteredStats, isLoading: filteredLoading, error: filteredError } = useAdminStatisticsByDateRange(
    dateRange?.startDate || '',
    dateRange?.endDate || '',
    isFilterActive && !!dateRange
  );

  // Choose which data to use
  const stats = isFilterActive && dateRange ? filteredStats : defaultStats;
  const isLoading = isFilterActive && dateRange ? filteredLoading : defaultLoading;
  const error = isFilterActive && dateRange ? filteredError : defaultError;

  const handleDateRangeChange = (start: string, end: string) => {
    if (start && end) {
      setDateRange({ startDate: start, endDate: end });
      setIsFilterActive(true);
    }
  };

  const handleStartDateChange = (value: string) => {
    if (value) {
      if (dateRange?.endDate) {
        handleDateRangeChange(value, dateRange.endDate);
      } else {
        setDateRange(prev => ({ ...prev, startDate: value, endDate: '' }));
      }
    }
  };

  const handleEndDateChange = (value: string) => {
    if (value) {
      if (dateRange?.startDate) {
        handleDateRangeChange(dateRange.startDate, value);
      } else {
        // If only end date is selected, set start date to 30 days before
        const endDate = new Date(value);
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 30);
        handleDateRangeChange(startDate.toISOString().split('T')[0], value);
      }
    }
  };

  const handleResetFilter = () => {
    setDateRange(null);
    setIsFilterActive(false);
  };

  const statCards = useMemo(() => {
    if (!stats) return [];
    
    return [
      { 
        title: "Total Users", 
        value: stats.totalUsers?.toLocaleString() || "0", 
        icon: Users, 
        color: "text-primary" 
      },
      { 
        title: "Total Restaurants", 
        value: stats.totalRestaurants?.toLocaleString() || "0", 
        icon: Store, 
        color: "text-accent" 
      },
      { 
        title: "Active Subscriptions", 
        value: stats.activeSubscriptions?.toLocaleString() || "0", 
        icon: CreditCard, 
        color: "hsl(var(--violet))" 
      },
      { 
        title: isFilterActive ? "Period Revenue" : "Monthly Revenue", 
        value: `${stats.monthlyRevenue?.toLocaleString() || "0"}đ`, 
        icon: DollarSign, 
        color: "text-amber-500" 
      },
    ];
  }, [stats, isFilterActive]);

  const packageDistributionData = useMemo(() => {
    if (!stats?.packageStats?.length) return [];
    
    return stats.packageStats.map((pkg, index) => ({
      name: pkg.packageName,
      value: pkg.totalSubscriptions,
      fill: COLORS[index % COLORS.length],
      revenue: pkg.totalRevenue
    }));
  }, [stats?.packageStats]);

  const weeklyRevenueData = useMemo(() => {
    if (!stats?.weeklyRevenue?.length) return [];
    
    return stats.weeklyRevenue.map(week => ({
      week: week.weekLabel,
      revenue: week.totalRevenue,
      transactions: week.totalTransactions
    }));
  }, [stats?.weeklyRevenue]);

  const packageStatsData = useMemo(() => {
    if (!stats?.packageStats?.length) return [];
    
    return stats.packageStats.map(pkg => ({
      name: pkg.packageName,
      newSubs: pkg.newSubscriptions,
      renewals: pkg.renewals,
      upgrades: pkg.upgrades,
      total: pkg.totalSubscriptions
    }));
  }, [stats?.packageStats]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Statistics</h1>
          <p className="text-muted-foreground text-sm">Loading statistics...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-5">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">
          <p>Error loading statistics. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Statistics</h1>
          <p className="text-muted-foreground text-sm">
            {isFilterActive && dateRange 
              ? `Filtered data from ${dateRange.startDate} to ${dateRange.endDate}`
              : "System overview and analytics"
            }
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <input
              type="date"
              className="px-3 py-2 border border-border rounded-md text-sm bg-background"
              onChange={(e) => handleStartDateChange(e.target.value)}
              value={dateRange?.startDate || ''}
              placeholder="Start date"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              className="px-3 py-2 border border-border rounded-md text-sm bg-background"
              onChange={(e) => handleEndDateChange(e.target.value)}
              value={dateRange?.endDate || ''}
              placeholder="End date"
            />
          </div>
          
          {isFilterActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilter}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.title} className="border-border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{s.title}</p>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {isFilterActive ? "Revenue Trend" : "Weekly Revenue (Last 8 Weeks)"}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {weeklyRevenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="week" 
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(value) => `${value.toLocaleString()}đ`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))", 
                      borderRadius: 8 
                    }}
                    formatter={(value: number, name: string) => [
                      name === 'revenue' ? `$${value.toLocaleString()}` : value,
                      name === 'revenue' ? 'Revenue' : 'Transactions'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2} 
                    dot={{ r: 4, fill: "hsl(var(--primary))" }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                <div>
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No revenue data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="w-4 h-4" />
              {isFilterActive ? "Package Distribution (Filtered Period)" : "Package Distribution (This Week)"}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {packageDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={packageDistributionData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="45%" 
                    outerRadius={80} 
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {packageDistributionData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string, props: any) => [
                      `${value} subscriptions`,
                      `Revenue: $${props.payload.revenue.toLocaleString()}`
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                <div>
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No package data available for this week</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {packageStatsData.length > 0 ? (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">
              {isFilterActive ? "Package Subscription Breakdown (Filtered Period)" : "Package Subscription Breakdown (This Week)"}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={packageStatsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))", 
                    borderRadius: 8 
                  }}
                />
                <Legend />
                <Bar dataKey="newSubs" stackId="a" fill="#0088FE" name="New Subscriptions" />
                <Bar dataKey="renewals" stackId="a" fill="#00C49F" name="Renewals" />
                <Bar dataKey="upgrades" stackId="a" fill="#FFBB28" name="Upgrades" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">
              {isFilterActive ? "Package Subscription Breakdown (Filtered Period)" : "Package Subscription Breakdown (This Week)"}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No package subscription data available for this week</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Statistics;
