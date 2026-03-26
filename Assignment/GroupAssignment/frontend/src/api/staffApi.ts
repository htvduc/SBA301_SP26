import axiosClient from './axiosClient';
import type {
  ApiResponse,
  StaffAccountBackendDTO,
  StaffAccountDTO,
  StaffAccountCreateRequest,
  StaffAccountUpdateRequest,
  PageResponse,
} from '@/types/dto';
import { mapStaffAccountFromBackend } from '@/types/dto';

class StaffAccountApi {
  async getByBranchPaginated(
    branchId: string,
    page: number,
    size: number,
    keyword?: string,
    roleFilter?: string,
    isActive?: boolean
  ): Promise<PageResponse<StaffAccountDTO>> {
    const response = await axiosClient.get<
      ApiResponse<PageResponse<StaffAccountBackendDTO>>
    >('/staff/owner/paginated', {
      params: { branchId, page, size, keyword, roleFilter, isActive },
    });

    const backendPage = response.data.result;

    return {
      ...backendPage,
      content: backendPage.content.map(mapStaffAccountFromBackend),
    };
  }

  async getManagerStaffPaginated(
    branchId: string,
    page: number,
    size: number,
    keyword?: string,
    roleFilter?: string,
    isActive?: boolean
  ): Promise<PageResponse<StaffAccountDTO>> {
    const response = await axiosClient.get<
      ApiResponse<PageResponse<StaffAccountBackendDTO>>
    >('/staff/manager/paginated', {
      params: { branchId, page, size, keyword, roleFilter, isActive },
    });

    const backendPage = response.data.result;

    return {
      ...backendPage,
      content: backendPage.content.map(mapStaffAccountFromBackend),
    };
  }

  async getStaffStatistics(branchId: string): Promise<{ waiters: number, receptionists: number }> {
    const response = await axiosClient.get<ApiResponse<{ waiters: number, receptionists: number }>>(
      `/staff/manager/statistic/${branchId}`
    );
    return response.data.result;
  }

  async getById(id: string): Promise<StaffAccountDTO> {
    const response = await axiosClient.get<ApiResponse<StaffAccountBackendDTO>>(
      `/staff/${id}`
    );
    return mapStaffAccountFromBackend(response.data.result);
  }

  async create(request: StaffAccountCreateRequest): Promise<StaffAccountDTO> {
    const response = await axiosClient.post<
      ApiResponse<StaffAccountBackendDTO>
    >('/staff', request);
    return mapStaffAccountFromBackend(response.data.result);
  }

  async update(
    request: StaffAccountUpdateRequest
  ): Promise<StaffAccountDTO> {
    const response = await axiosClient.put<
      ApiResponse<StaffAccountBackendDTO>
    >('/staff', request);
    return mapStaffAccountFromBackend(response.data.result);
  }

  async toggleStatus(id: string): Promise<StaffAccountDTO> {
    const response = await axiosClient.delete<
      ApiResponse<StaffAccountBackendDTO>
    >(`/staff/${id}`);
    return mapStaffAccountFromBackend(response.data.result);
  }

  async resetPassword(staffAccountId: string, newPassword: string): Promise<void> {
    await axiosClient.patch(`/staff/${staffAccountId}/password`, { newPassword });
  }

  async transferToBranch(staffAccountId: string, newBranchId: string): Promise<StaffAccountDTO> {
    const response = await axiosClient.patch<ApiResponse<StaffAccountBackendDTO>>(
      `/staff/${staffAccountId}/transfer`,
      { newBranchId }
    );
    return mapStaffAccountFromBackend(response.data.result);
  }
}

export const staffAccountApi = new StaffAccountApi();

