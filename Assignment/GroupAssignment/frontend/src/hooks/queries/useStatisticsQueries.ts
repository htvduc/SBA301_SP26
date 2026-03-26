import { useQuery } from '@tanstack/react-query';
import { statisticsApi } from '@/api';

export const useAdminStatistics = () => {
  return useQuery({
    queryKey: ['admin-statistics'],
    queryFn: async () => {
      const response = await statisticsApi.getAdminStatistics();
      return response.data?.result;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false, 
    refetchOnWindowFocus: false,
    retry: 3,
  });
};

export const useAdminStatisticsByDateRange = (startDate: string, endDate: string, enabled = true) => {
  return useQuery({
    queryKey: ['admin-statistics-date-range', startDate, endDate],
    queryFn: async () => {
      const response = await statisticsApi.getAdminStatisticsByDateRange(startDate, endDate);
      return response.data?.result;
    },
    enabled: enabled && !!startDate && !!endDate,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  });
};

export const usePackageStatsByDateRange = (startDate: string, endDate: string, enabled = true) => {
  return useQuery({
    queryKey: ['package-stats', startDate, endDate],
    queryFn: async () => {
      const response = await statisticsApi.getPackageStatsByDateRange(startDate, endDate);
      return response.data?.result;
    },
    enabled: enabled && !!startDate && !!endDate,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  });
};