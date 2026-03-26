import axiosClient from './axiosClient';
import { ApiResponse, PageResponse } from '@/types/dto';

export interface RestaurantSummary {
  restaurantId: string;
  name: string;
  status: boolean;
  createdAt: string;
}

export interface AdminUser {
  userId: string;
  email: string;
  username: string;
  roleName: string;
  status: string;
  createdAt: string;
  restaurants: RestaurantSummary[];
}

export const adminUserApi = {
  getRestaurantOwners: (search?: string, page = 0, size = 10): Promise<ApiResponse<PageResponse<AdminUser>>> =>
    axiosClient.get('/admin/users/restaurant-owners', {
      params: { search, page, size }
    }),

  getUserDetails: (userId: string): Promise<ApiResponse<AdminUser>> =>
    axiosClient.get(`/admin/users/${userId}`),
};