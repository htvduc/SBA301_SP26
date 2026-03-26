import axiosClient from './axiosClient';
import type { ApiResponse } from '@/types/dto/api-response.dto';
import type { PromotionDTO, CreatePromotionRequest } from '@/types/dto/promotion.dto';

class PromotionApi {
  async getPromotionsByRestaurant(restaurantId: string): Promise<PromotionDTO[]> {
    const response = await axiosClient.get<ApiResponse<PromotionDTO[]>>(`/owner/promotions/restaurant/${restaurantId}`);
    return response.data.result;
  }

  async getActivePromotionsByRestaurant(restaurantId: string): Promise<PromotionDTO[]> {
    const response = await axiosClient.get<ApiResponse<PromotionDTO[]>>(`/manager/promotions/restaurant/${restaurantId}/active`);
    return response.data.result;
  }

  async createPromotion(request: CreatePromotionRequest): Promise<PromotionDTO> {
    const response = await axiosClient.post<ApiResponse<PromotionDTO>>('/owner/promotions', request);
    return response.data.result;
  }

  async updatePromotion(promotionId: string, request: CreatePromotionRequest): Promise<PromotionDTO> {
    const response = await axiosClient.put<ApiResponse<PromotionDTO>>(`/owner/promotions/${promotionId}`, request);
    return response.data.result;
  }

  async deletePromotion(promotionId: string): Promise<void> {
    await axiosClient.delete(`/owner/promotions/${promotionId}`);
  }

  async getPromotionById(promotionId: string): Promise<PromotionDTO> {
    const response = await axiosClient.get<ApiResponse<PromotionDTO>>(`/owner/promotions/${promotionId}`);
    return response.data.result;
  }

  async updatePromotionStatus(promotionId: string, status: 'ACTIVE' | 'INACTIVE'): Promise<PromotionDTO> {
    const response = await axiosClient.patch<ApiResponse<PromotionDTO>>(`/owner/promotions/${promotionId}/status`, null, {
      params: { status }
    });
    return response.data.result;
  }
}

export const promotionApi = new PromotionApi();
