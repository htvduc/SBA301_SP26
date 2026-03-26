import { useQuery } from '@tanstack/react-query';
import { adminUserApi } from '@/api';

export const useRestaurantOwners = (search?: string, page = 0, size = 10) => {
  return useQuery({
    queryKey: ['restaurant-owners', search, page, size],
    queryFn: async () => {
      const response = await adminUserApi.getRestaurantOwners(search, page, size);
      return response.data?.result;
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  });
};

export const useUserDetails = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: ['user-details', userId],
    queryFn: async () => {
      const response = await adminUserApi.getUserDetails(userId);
      return response.data?.result;
    },
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  });
};