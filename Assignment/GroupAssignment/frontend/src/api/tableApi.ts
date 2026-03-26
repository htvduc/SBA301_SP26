import axiosClient from './axiosClient';
import type { ApiResponse, AreaTableDTO, TableStatus } from '@/types/dto';

class TableApi {
    async getAll(): Promise<AreaTableDTO[]> {
        const response = await axiosClient.get<ApiResponse<AreaTableDTO[]>>('/tables');
        return response.data.result;
    }

    async getById(id: string): Promise<AreaTableDTO> {
        const response = await axiosClient.get<ApiResponse<AreaTableDTO>>(`/tables/${id}`);
        return response.data.result;
    }

    async getByArea(areaId: string): Promise<AreaTableDTO[]> {
        const response = await axiosClient.get<ApiResponse<AreaTableDTO[]>>(`/tables/area/${areaId}`);
        return response.data.result;
    }
     async getByPublicArea(areaId: string): Promise<AreaTableDTO[]> {
        const response = await axiosClient.get<ApiResponse<AreaTableDTO[]>>(`/public/tables/area/${areaId}`);
        return response.data.result;
    }

    async getByBranch(branchId: string): Promise<AreaTableDTO[]> {
        const response = await axiosClient.get<ApiResponse<AreaTableDTO[]>>(`/tables/branch/${branchId}`);
        return response.data.result;
    }

    async getByAreaAndStatus(areaId: string, status: TableStatus): Promise<AreaTableDTO[]> {
        const response = await axiosClient.get<ApiResponse<AreaTableDTO[]>>(`/tables/area/${areaId}/status/${status}`);
        return response.data.result;
    }

    async create(data: AreaTableDTO): Promise<AreaTableDTO> {
        const response = await axiosClient.post<ApiResponse<AreaTableDTO>>('/tables', data);
        return response.data.result;
    }

    async update(id: string, data: Partial<AreaTableDTO>): Promise<AreaTableDTO> {
        const response = await axiosClient.put<ApiResponse<AreaTableDTO>>(`/tables/${id}`, data);
        return response.data.result;
    }

    async delete(id: string): Promise<void> {
        await axiosClient.delete(`/tables/${id}`);
    }

    async setStatus(id: string, status: TableStatus): Promise<AreaTableDTO> {
        const response = await axiosClient.put<ApiResponse<AreaTableDTO>>(`/tables/${id}/status?status=${status}`);
        return response.data.result;
    }

    async markOutOfOrder(id: string): Promise<AreaTableDTO> {
        const response = await axiosClient.put<ApiResponse<AreaTableDTO>>(`/tables/${id}/out-of-order`);
        return response.data.result;
    }

    async markAvailable(id: string): Promise<AreaTableDTO> {
        const response = await axiosClient.put<ApiResponse<AreaTableDTO>>(`/tables/${id}/available`);
        return response.data.result;
    }

    async markOccupied(id: string): Promise<AreaTableDTO> {
        const response = await axiosClient.put<ApiResponse<AreaTableDTO>>(`/tables/${id}/occupied`);
        return response.data.result;
    }

    async getByQrCode(qrCode: string): Promise<AreaTableDTO> {
        const response = await axiosClient.get<ApiResponse<AreaTableDTO>>(`/tables/qr?qrCode=${encodeURIComponent(qrCode)}`);
        return response.data.result;
    }
}

export const tableApi = new TableApi();
