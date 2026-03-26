import axiosClient from './axiosClient';
import { ApiResponse, CategoryDTO, CategoryCreateRequest } from '@/types/dto';

export const categoryApi = {
  getAllByRestaurant: (restaurantId: string) =>
    axiosClient.get<ApiResponse<CategoryDTO[]>>('/public/categories', {
      params: { restaurantId },
    }),

  getById: (id: string) =>
    axiosClient.get<ApiResponse<CategoryDTO>>(`/categories/${id}`),

  create: (data: CategoryCreateRequest) =>
    axiosClient.post<ApiResponse<CategoryDTO>>('/categories', data),

  update: (id: string, data: CategoryDTO) =>
    axiosClient.put<ApiResponse<CategoryDTO>>(`/categories/${id}`, data),

  delete: (id: string) =>
    axiosClient.delete<ApiResponse<void>>(`/categories/${id}`),
};
