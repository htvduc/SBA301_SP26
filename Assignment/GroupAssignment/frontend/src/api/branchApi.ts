import axiosClient from './axiosClient';
import type { ApiResponse, BranchDTO } from '@/types/dto';

class BranchApi {
    async getAll(): Promise<BranchDTO[]> {
        const response = await axiosClient.get<ApiResponse<BranchDTO[]>>('/branches');
        return response.data.result;
    }

    async getById(id: string): Promise<BranchDTO> {
        const response = await axiosClient.get<ApiResponse<BranchDTO>>(`/branches/${id}`);
        return response.data.result;
    }

    async getByRestaurant(restaurantId: string): Promise<BranchDTO[]> {
        const response = await axiosClient.get<ApiResponse<BranchDTO[]>>(`/branches/restaurant/${restaurantId}`);
        return response.data.result;
    }
     async getByPublicRestaurant(restaurantId: string): Promise<BranchDTO[]> {
        const response = await axiosClient.get<ApiResponse<BranchDTO[]>>(`/public/branches/restaurant/${restaurantId}`);
        return response.data.result;
    }

    async getActiveByRestaurant(restaurantId: string): Promise<BranchDTO[]> {
        const response = await axiosClient.get<ApiResponse<BranchDTO[]>>(`/branches/restaurant/${restaurantId}/active`);
        return response.data.result;
    }

    async getByOwner(ownerId: string): Promise<BranchDTO[]> {
        const response = await axiosClient.get<ApiResponse<BranchDTO[]>>(`/branches/owner/${ownerId}`);
        return response.data.result;
    }

    async getRestaurantIdByBranchId(branchId: string): Promise<string> {
        const response = await axiosClient.get<ApiResponse<string>>(`/branches/${branchId}/restaurant`);
        return response.data.result;
    }

    async getRestaurantSlugByBranchId(branchId: string): Promise<string> {
        const response = await axiosClient.get<ApiResponse<string>>(`/branches/${branchId}/restaurant/slug`);
        return response.data.result;
    }

    async create(data: BranchDTO): Promise<BranchDTO> {
        const response = await axiosClient.post<ApiResponse<BranchDTO>>('/branches', data);
        return response.data.result;
    }

    async update(id: string, data: Partial<BranchDTO>): Promise<BranchDTO> {
        const response = await axiosClient.put<ApiResponse<BranchDTO>>(`/branches/${id}`, data);
        return response.data.result;
    }

    async updateContactInfo(id: string, data: Partial<BranchDTO>): Promise<BranchDTO> {
        const response = await axiosClient.patch<ApiResponse<BranchDTO>>(`/branches/${id}/contact-info`, data);
        return response.data.result;
    }

    async delete(id: string): Promise<void> {
        await axiosClient.delete<ApiResponse<void>>(`/branches/${id}`);
    }

    async canCreate(restaurantId: string): Promise<boolean> {
        const response = await axiosClient.get<ApiResponse<boolean>>(`/branches/restaurant/${restaurantId}/can-create`);
        return response.data.result;
    }

    async getLimit(restaurantId: string): Promise<number> {
        const response = await axiosClient.get<ApiResponse<number>>(`/branches/restaurant/${restaurantId}/limit`);
        return response.data.result;
    }
}

export const branchApi = new BranchApi();
