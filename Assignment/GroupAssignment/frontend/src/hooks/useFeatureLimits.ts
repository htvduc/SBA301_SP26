import { useQuery } from '@tanstack/react-query';
import { menuItemApi } from '@/api/menuItemApi';
import { customizationApi } from '@/api/customizationApi';
import { branchApi } from '@/api/branchApi';

export const useMenuItemLimit = (restaurantId: string | undefined) => {
  return useQuery({
    queryKey: ['menuItemLimit', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return null;
      const response = await menuItemApi.getLimit(restaurantId);
      return response.data.result;
    },
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCanCreateMenuItem = (restaurantId: string | undefined) => {
  return useQuery({
    queryKey: ['canCreateMenuItem', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return true; // Default to true if no restaurant
      const response = await menuItemApi.canCreate(restaurantId);
      return response.data.result;
    },
    enabled: !!restaurantId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useCustomizationLimit = (restaurantId: string | undefined) => {
  return useQuery({
    queryKey: ['customizationLimit', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return null;
      const response = await customizationApi.getLimit(restaurantId);
      return response.data.result;
    },
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCanCreateCustomization = (restaurantId: string | undefined, categoryId: string | undefined) => {
  return useQuery({
    queryKey: ['canCreateCustomization', restaurantId, categoryId],
    queryFn: async () => {
      if (!restaurantId || !categoryId) return true; // Default to true if no restaurant or category
      const response = await customizationApi.canCreateForCategory(restaurantId, categoryId);
      return response.data.result;
    },
    enabled: !!restaurantId && !!categoryId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useBranchLimit = (restaurantId: string | undefined) => {
  return useQuery({
    queryKey: ['branchLimit', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return null;
      const response = await branchApi.getLimit(restaurantId);
      return response;
    },
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCanCreateBranch = (restaurantId: string | undefined) => {
  return useQuery({
    queryKey: ['canCreateBranch', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return true; // Default to true if no restaurant
      const response = await branchApi.canCreate(restaurantId);
      return response;
    },
    enabled: !!restaurantId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useAIAssistantAccess = (restaurantId: string | undefined) => {
  return useQuery({
    queryKey: ['aiAssistantAccess', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return false;
      try {
        const { aiConsultantApi } = await import('@/api/aiConsultantApi');
        return await aiConsultantApi.checkAIAssistantAccess(restaurantId);
      } catch {
        return false;
      }
    },
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000,
  });
};
