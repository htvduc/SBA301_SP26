import axiosClient from './axiosClient';
import type { ApiResponse } from '@/types/dto/api-response.dto';

export interface AIConsultantRequest {
  question: string;
  timeframe: 'DAY' | 'MONTH' | 'YEAR';
  sessionId?: string;
  specificDate?: string;
}

export interface AIConsultantResponse {
  response: string;
  sessionId: string;
  timestamp: string;
}

export const aiConsultantApi = {
  consultRestaurant: async (
    restaurantId: string,
    request: AIConsultantRequest
  ): Promise<ApiResponse<AIConsultantResponse>> => {
    const response = await axiosClient.post(
      `/restaurants/${restaurantId}/ai-consultant`,
      request
    );
    return response.data;
  },

  consultBranch: async (
    branchId: string,
    request: AIConsultantRequest
  ): Promise<ApiResponse<AIConsultantResponse>> => {
    const response = await axiosClient.post(
      `/branches/${branchId}/ai-consultant`,
      request
    );
    return response.data;
  },

  checkAIAssistantAccess: async (restaurantId: string): Promise<boolean> => {
    try {
      const response = await axiosClient.get<ApiResponse<number>>(
        `/restaurants/${restaurantId}/features/ai-assistant/limit`
      );
      return response.data.result !== 0;
    } catch {
      return false;
    }
  },
};
