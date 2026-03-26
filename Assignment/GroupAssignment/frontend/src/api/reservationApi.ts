import axiosClient from './axiosClient';
import type { 
    ApiResponse, 
    ReservationDTO, 
    CreateReservationRequest,
    RejectReservationRequest,
    ReservationAnalyticsDTO,
    ReservationFilterParams,
    TableAvailabilityDTO,
    GetAvailableTablesParams
} from '@/types/dto';

const toLocalDateParam = (value?: string): string | undefined => {
    if (!value) return undefined;
    // Backend expects LocalDate query params in yyyy-MM-dd format
    return value.includes('T') ? value.slice(0, 10) : value;
};

class ReservationApi {
    async getAll(): Promise<ReservationDTO[]> {
        const response = await axiosClient.get<ApiResponse<ReservationDTO[]>>('/reservations');
        return response.data.result;
    }

    async getById(id: string): Promise<ReservationDTO> {
        const response = await axiosClient.get<ApiResponse<ReservationDTO>>(`/reservations/${id}`);
        return response.data.result;
    }

    async getByBranch(branchId: string): Promise<ReservationDTO[]> {
        const response = await axiosClient.get<ApiResponse<ReservationDTO[]>>(`/reservations/branch/${branchId}`);
        return response.data.result;
    }

    async getByTable(areaTableId: string): Promise<ReservationDTO[]> {
        const response = await axiosClient.get<ApiResponse<ReservationDTO[]>>(`/reservations/table/${areaTableId}`);
        return response.data.result;
    }

    async filter(branchId: string, params: ReservationFilterParams): Promise<ReservationDTO[]> {
        const normalizedParams = {
            ...params,
            startDate: toLocalDateParam(params.startDate),
            endDate: toLocalDateParam(params.endDate),
        };

        const response = await axiosClient.get<ApiResponse<ReservationDTO[]>>(
            `/reservations/branch/${branchId}/filter`,
            { params: normalizedParams }
        );
        return response.data.result;
    }

    async create(data: CreateReservationRequest): Promise<ReservationDTO> {
        const response = await axiosClient.post<ApiResponse<ReservationDTO>>('/reservations', data);
        return response.data.result;
    }

    async createByStaff(data: CreateReservationRequest): Promise<ReservationDTO> {
        const response = await axiosClient.post<ApiResponse<ReservationDTO>>('/reservations/staff', data);
        return response.data.result;
    }

    async approve(id: string): Promise<ReservationDTO> {
        const response = await axiosClient.post<ApiResponse<ReservationDTO>>(`/reservations/${id}/approve`);
        return response.data.result;
    }

    async reject(id: string, data: RejectReservationRequest): Promise<ReservationDTO> {
        const response = await axiosClient.post<ApiResponse<ReservationDTO>>(`/reservations/${id}/reject`, data);
        return response.data.result;
    }

    async markArrived(id: string): Promise<ReservationDTO> {
        const response = await axiosClient.post<ApiResponse<ReservationDTO>>(`/reservations/${id}/arrive`);
        return response.data.result;
    }

    async complete(id: string): Promise<ReservationDTO> {
        const response = await axiosClient.post<ApiResponse<ReservationDTO>>(`/reservations/${id}/complete`);
        return response.data.result;
    }

    async markNoShow(id: string): Promise<ReservationDTO> {
        const response = await axiosClient.post<ApiResponse<ReservationDTO>>(`/reservations/${id}/no-show`);
        return response.data.result;
    }

    async getAnalytics(branchId: string, startDate: string, endDate: string): Promise<ReservationAnalyticsDTO> {
        const response = await axiosClient.get<ApiResponse<ReservationAnalyticsDTO>>(
            `/reservations/branch/${branchId}/analytics`,
            {
                params: {
                    startDate: toLocalDateParam(startDate),
                    endDate: toLocalDateParam(endDate),
                },
            }
        );
        return response.data.result;
    }

    async update(id: string, data: Partial<ReservationDTO>): Promise<ReservationDTO> {
        const response = await axiosClient.put<ApiResponse<ReservationDTO>>(`/reservations/${id}`, data);
        return response.data.result;
    }

    async delete(id: string): Promise<void> {
        await axiosClient.delete<ApiResponse<void>>(`/reservations/${id}`);
    }

    async getAvailableTables(params: GetAvailableTablesParams): Promise<TableAvailabilityDTO[]> {
        const { branchId, time, guests, duration } = params;
        const response = await axiosClient.get<ApiResponse<TableAvailabilityDTO[]>>(
            `/reservations/branch/${branchId}/available-tables`,
            { params: { time, guests, duration } }
        );
        return response.data.result;
    }
}

export const reservationApi = new ReservationApi();
