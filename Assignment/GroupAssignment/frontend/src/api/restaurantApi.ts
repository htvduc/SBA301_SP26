import axiosClient from './axiosClient';
import type { ApiResponse, RestaurantDTO, RestaurantCreateRequest } from '@/types/dto';

class RestaurantApi {
    async getAll(): Promise<RestaurantDTO[]> {
        const response = await axiosClient.get<ApiResponse<RestaurantDTO[]>>('/restaurants');
        return response.data.result;
    }

    async getById(id: string): Promise<RestaurantDTO> {
        const response = await axiosClient.get<ApiResponse<RestaurantDTO>>(`/restaurants/${id}`);
        return response.data.result;
    }

    async  getBySlug(slug: string): Promise<RestaurantDTO> {
        const response = await axiosClient.get<ApiResponse<RestaurantDTO>>(`/public/restaurants/${slug}`);
        return response.data.result;
    }

    async getByOwner(userId: string): Promise<RestaurantDTO[]> {
        const response = await axiosClient.get<ApiResponse<RestaurantDTO[]>>(`/restaurants/owner/${userId}`);
        return response.data.result;
    }

    async create(request: RestaurantCreateRequest): Promise<RestaurantDTO> {
        const response = await axiosClient.post<ApiResponse<RestaurantDTO>>('/restaurants', request);
        return response.data.result;
    }

    async update(id: string, data: Partial<RestaurantDTO>): Promise<RestaurantDTO> {
        const response = await axiosClient.put<ApiResponse<RestaurantDTO>>(`/restaurants/${id}`, data);
        return response.data.result;
    }

    async delete(id: string): Promise<void> {
        await axiosClient.delete<ApiResponse<void>>(`/restaurants/${id}`);
    }
}

export const restaurantApi = new RestaurantApi();
