import axiosClient from './axiosClient';
import type { ApiResponse } from '@/types/dto/api-response.dto';
import type {
  SubscriptionPaymentResponse,
  SubscriptionResponse,
  CreateRestaurantSubscriptionRequest,
  RestaurantSubscriptionOverviewDTO,
} from '@/types/dto/subscription.dto';

export const subscriptionApi = {
  // Create restaurant with subscription and payment
  createRestaurantWithSubscription: async (
    request: CreateRestaurantSubscriptionRequest
  ): Promise<SubscriptionPaymentResponse> => {
    const response = await axiosClient.post<ApiResponse<SubscriptionPaymentResponse>>(
      `/restaurant-subscriptions/create?packageId=${request.packageId}`,
      request.restaurantRequest
    );
    return response.data.result!;
  },

  // Renew subscription
  renewSubscription: async (restaurantId: string): Promise<SubscriptionPaymentResponse> => {
    const response = await axiosClient.post<ApiResponse<SubscriptionPaymentResponse>>(
      `/restaurant-subscriptions/renew/${restaurantId}`
    );
    return response.data.result!;
  },

  // Upgrade package
  upgradePackage: async (restaurantId: string, newPackageId: string): Promise<SubscriptionPaymentResponse> => {
    const response = await axiosClient.post<ApiResponse<SubscriptionPaymentResponse>>(
      `/restaurant-subscriptions/upgrade/${restaurantId}?newPackageId=${newPackageId}`
    );
    return response.data.result!;
  },

  // Get subscription by id
  getSubscriptionById: async (subscriptionId: string): Promise<SubscriptionResponse> => {
    const response = await axiosClient.get<ApiResponse<SubscriptionResponse>>(
      `/subscriptions/${subscriptionId}`
    );
    return response.data.result!;
  },

  // Get active subscription by restaurant
  getActiveSubscriptionByRestaurant: async (restaurantId: string): Promise<SubscriptionResponse> => {
    const response = await axiosClient.get<ApiResponse<SubscriptionResponse>>(
      `/subscriptions/restaurant/${restaurantId}/active`
    );
    return response.data.result!;
  },

  // Get latest payment status
  getLatestPaymentStatus: async (restaurantId: string): Promise<SubscriptionPaymentResponse | null> => {
    const response = await axiosClient.get<ApiResponse<SubscriptionPaymentResponse>>(
      `/subscriptions/restaurant/${restaurantId}/latest-payment`
    );
    return response.data.result || null;
  },

  // Get payment history
  getPaymentHistory: async (restaurantId: string): Promise<SubscriptionPaymentResponse[]> => {
    const response = await axiosClient.get<ApiResponse<SubscriptionPaymentResponse[]>>(
      `/subscriptions/restaurant/${restaurantId}/payments`
    );
    return response.data.result || [];
  },

  // Get payment status by order code
  getPaymentStatusByOrderCode: async (orderCode: string): Promise<SubscriptionPaymentResponse> => {
    const response = await axiosClient.get<ApiResponse<SubscriptionPaymentResponse>>(
      `/payments/status/${orderCode}`
    );
    return response.data.result!;
  },

  // Cancel payment
  cancelPayment: async (orderCode: string): Promise<SubscriptionPaymentResponse> => {
    const response = await axiosClient.post<ApiResponse<SubscriptionPaymentResponse>>(
      `/payments/cancel/${orderCode}`
    );
    return response.data.result!;
  },

  // Activate subscription
  activateSubscription: async (subscriptionId: string, durationMonths: number = 1): Promise<SubscriptionResponse> => {
    const response = await axiosClient.put<ApiResponse<SubscriptionResponse>>(
      `/subscriptions/${subscriptionId}/activate?durationMonths=${durationMonths}`
    );
    return response.data.result!;
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId: string): Promise<void> => {
    await axiosClient.put(`/subscriptions/${subscriptionId}/cancel`);
  },

  // Get subscriptions overview for current owner
  getSubscriptionsOverviewForOwner: async (): Promise<RestaurantSubscriptionOverviewDTO[]> => {
    const response = await axiosClient.get<ApiResponse<RestaurantSubscriptionOverviewDTO[]>>(
      `/subscriptions/overview`
    );
    return response.data.result || [];
  },
};
