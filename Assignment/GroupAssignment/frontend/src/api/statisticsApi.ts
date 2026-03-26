import axiosClient from './axiosClient';
import { ApiResponse } from '@/types/dto';

export interface PackageStatsDTO {
  packageName: string;
  newSubscriptions: number;
  renewals: number;
  upgrades: number;
  totalSubscriptions: number;
  totalRevenue: number;
  period: string;
}

export interface WeeklyRevenueDTO {
  weekStart: string;
  weekEnd: string;
  weekLabel: string;
  totalRevenue: number;
  totalTransactions: number;
}

export interface AdminStatisticsDTO {
  totalUsers: number;
  totalRestaurants: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  packageStats: PackageStatsDTO[];
  weeklyRevenue: WeeklyRevenueDTO[];
}

export const statisticsApi = {
  getAdminStatistics: (): Promise<ApiResponse<AdminStatisticsDTO>> =>
    axiosClient.get('/packages/statistics'),

  getAdminStatisticsByDateRange: (startDate: string, endDate: string): Promise<ApiResponse<AdminStatisticsDTO>> =>
    axiosClient.get('/packages/statistics/date-range', {
      params: { startDate, endDate }
    }),

  getPackageStatsByDateRange: (startDate: string, endDate: string): Promise<ApiResponse<PackageStatsDTO[]>> =>
    axiosClient.get('/packages/statistics/package-stats', {
      params: { startDate, endDate }
    }),
};