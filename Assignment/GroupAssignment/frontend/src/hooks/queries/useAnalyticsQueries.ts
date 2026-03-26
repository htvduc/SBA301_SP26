import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analyticsApi';
import { formatLocalDateYmd } from '@/utils/formatLocalDateYmd';

const ANALYTICS_STALE_MS = 60 * 1000;

export const useRestaurantAnalytics = (
  restaurantId: string, 
  timeframe: 'DAY' | 'MONTH' | 'YEAR' = 'DAY',
  enabled = true
) => {
  return useQuery({
    queryKey: ['restaurant-analytics', restaurantId, timeframe],
    queryFn: async () => {
      const response = await analyticsApi.getRestaurantAnalytics(restaurantId, timeframe);
      return response.data?.result;
    },
    enabled: enabled && !!restaurantId,
    staleTime: ANALYTICS_STALE_MS,
    refetchInterval: false,
    refetchOnWindowFocus: true,
    retry: 3,
  });
};

export const useRestaurantDailyRevenue = (
  restaurantId: string,
  startDate: string,
  endDate: string,
  enabled = true
) => {
  return useQuery({
    queryKey: ['restaurant-daily-revenue', restaurantId, startDate, endDate],
    queryFn: async () => {
      const response = await analyticsApi.getRestaurantDailyRevenue(restaurantId, startDate, endDate);
      return response.data?.result;
    },
    enabled: enabled && !!restaurantId && !!startDate && !!endDate,
    staleTime: ANALYTICS_STALE_MS,
    refetchInterval: false,
    refetchOnWindowFocus: true,
    retry: 3,
  });
};

export const useBranchDailyRevenue = (
  branchId: string,
  startDate: string,
  endDate: string,
  enabled = true
) => {
  return useQuery({
    queryKey: ['branch-daily-revenue', branchId, startDate, endDate],
    queryFn: async () => {
      const response = await analyticsApi.getBranchDailyRevenue(branchId, startDate, endDate);
      return response.data?.result;
    },
    enabled: enabled && !!branchId && !!startDate && !!endDate,
    staleTime: ANALYTICS_STALE_MS,
    refetchInterval: false,
    refetchOnWindowFocus: true,
    retry: 3,
  });
};

export const useTopSellingItems = (
  restaurantId: string,
  timeframe: 'DAY' | 'MONTH' | 'YEAR' = 'DAY',
  limit: number = 10,
  enabled = true
) => {
  return useQuery({
    queryKey: ['top-selling-items', restaurantId, timeframe, limit],
    queryFn: async () => {
      const response = await analyticsApi.getTopSellingItems(restaurantId, timeframe, limit);
      return response.data?.result;
    },
    enabled: enabled && !!restaurantId,
    staleTime: ANALYTICS_STALE_MS,
    refetchInterval: false,
    refetchOnWindowFocus: true,
    retry: 3,
  });
};

export const useOrderDistribution = (
  restaurantId: string,
  date: string,
  enabled = true
) => {
  return useQuery({
    queryKey: ['order-distribution', restaurantId, date],
    queryFn: async () => {
      const response = await analyticsApi.getOrderDistribution(restaurantId, date);
      return response.data?.result;
    },
    enabled: enabled && !!restaurantId && !!date,
    staleTime: ANALYTICS_STALE_MS,
    refetchInterval: false,
    refetchOnWindowFocus: true,
    retry: 3,
  });
};

export const useTodayRevenue = (
  restaurantId: string,
  enabled = true
) => {
  return useQuery({
    queryKey: ['today-revenue', restaurantId],
    queryFn: async () => {
      const today = formatLocalDateYmd(new Date());
      const yesterday = formatLocalDateYmd(new Date(Date.now() - 86400000));
      
      const [todayResponse, yesterdayResponse] = await Promise.all([
        analyticsApi.getRestaurantDailyRevenue(restaurantId, today, today),
        analyticsApi.getRestaurantDailyRevenue(restaurantId, yesterday, yesterday)
      ]);
      
      const todayData = todayResponse.data?.result?.[0];
      const yesterdayData = yesterdayResponse.data?.result?.[0];
      
      const todayRevenue = todayData?.revenue || 0;
      const yesterdayRevenue = yesterdayData?.revenue || 0;
      
      const change = yesterdayRevenue > 0 
        ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
        : todayRevenue > 0 ? 100 : 0;
      
      return {
        todayRevenue,
        yesterdayRevenue,
        change,
        todayOrders: todayData?.orderCount || 0,
        yesterdayOrders: yesterdayData?.orderCount || 0
      };
    },
    enabled: enabled && !!restaurantId,
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent for today's data)
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    refetchOnWindowFocus: true,
    retry: 3,
  });
};