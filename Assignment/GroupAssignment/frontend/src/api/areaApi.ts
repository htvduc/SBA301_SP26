import axiosClient from './axiosClient';
import type { ApiResponse, AreaDTO, EntityStatus } from '@/types/dto';

class AreaApi {
    async getAll(): Promise<AreaDTO[]> {
        const response = await axiosClient.get<ApiResponse<AreaDTO[]>>('/areas');
        return response.data.result;
    }

    async getById(id: string): Promise<AreaDTO> {
        const response = await axiosClient.get<ApiResponse<AreaDTO>>(`/areas/${id}`);
        return response.data.result;
    }

    async getByBranch(branchId: string): Promise<AreaDTO[]> {
        const response = await axiosClient.get<ApiResponse<AreaDTO[]>>(`/areas/branch/${branchId}`);
        return response.data.result;
    }
    async getByPublicBranch(branchId: string): Promise<AreaDTO[]> {
        const response = await axiosClient.get<ApiResponse<AreaDTO[]>>(`/public/areas/branch/${branchId}`);
        return response.data.result;
    }

    async getByBranchAndStatus(branchId: string, status: EntityStatus): Promise<AreaDTO[]> {
        const response = await axiosClient.get<ApiResponse<AreaDTO[]>>(`/areas/branch/${branchId}/status/${status}`);
        return response.data.result;
    }

    async create(data: AreaDTO): Promise<AreaDTO> {
        const response = await axiosClient.post<ApiResponse<AreaDTO>>('/areas', data);
        return response.data.result;
    }

    async update(id: string, data: Partial<AreaDTO>): Promise<AreaDTO> {
        const response = await axiosClient.put<ApiResponse<AreaDTO>>(`/areas/${id}`, data);
        return response.data.result;
    }

    async delete(id: string): Promise<void> {
        await axiosClient.delete<ApiResponse<void>>(`/areas/${id}`);
    }

    async activate(id: string): Promise<AreaDTO> {
        const response = await axiosClient.put<ApiResponse<AreaDTO>>(`/areas/${id}/activate`);
        return response.data.result;
    }

    async deactivate(id: string): Promise<AreaDTO> {
        const response = await axiosClient.put<ApiResponse<AreaDTO>>(`/areas/${id}/deactivate`);
        return response.data.result;
    }
}

export const areaApi = new AreaApi();
