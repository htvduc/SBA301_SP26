import axiosClient from './axiosClient';
import { ApiResponse, MenuItemDTO, MenuItemCreateRequest, CustomizationDTO, mapMenuItemFromBackend } from '@/types/dto';

export const menuItemApi = {
  getAllByRestaurant: async (restaurantId: string) => {
    const response = await axiosClient.get<ApiResponse<any[]>>('/menu-items', {
      params: { restaurantId },
    });
    return {
      ...response,
      data: {
        ...response.data,
        result: response.data.result.map(mapMenuItemFromBackend),
      },
    };
  },

  getById: async (id: string) => {
    const response = await axiosClient.get<ApiResponse<any>>(`/menu-items/${id}`);
    return {
      ...response,
      data: {
        ...response.data,
        result: mapMenuItemFromBackend(response.data.result),
      },
    };
  },

  create: async (data: MenuItemCreateRequest, imageFile?: File) => {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (imageFile) {
      formData.append('imageFile', imageFile);
    }
    const response = await axiosClient.post<ApiResponse<any>>('/menu-items/create', formData);
    return {
      ...response,
      data: {
        ...response.data,
        result: mapMenuItemFromBackend(response.data.result),
      },
    };
  },

  update: async (id: string, data: MenuItemCreateRequest, imageFile?: File) => {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (imageFile) {
      formData.append('imageFile', imageFile);
    }
    const response = await axiosClient.put<ApiResponse<any>>(`/menu-items/${id}`, formData);
    return {
      ...response,
      data: {
        ...response.data,
        result: mapMenuItemFromBackend(response.data.result),
      },
    };
  },

  delete: (id: string) =>
    axiosClient.delete<ApiResponse<void>>(`/menu-items/${id}`),

  isActiveInBranch: (menuItemId: string, branchId: string) =>
    axiosClient.get<ApiResponse<boolean>>(`/menu-items/${menuItemId}/branch/${branchId}/active`),

  setActiveStatus: async (menuItemId: string, active: boolean) => {
    const response = await axiosClient.put<ApiResponse<any>>(`/menu-items/${menuItemId}/status`, null, {
      params: { active },
    });
    return {
      ...response,
      data: {
        ...response.data,
        result: mapMenuItemFromBackend(response.data.result),
      },
    };
  },

  updateBestSeller: async (menuItemId: string, bestSeller: boolean) => {
    const response = await axiosClient.put<ApiResponse<any>>(`/menu-items/${menuItemId}/best-seller`, null, {
      params: { bestSeller },
    });
    return {
      ...response,
      data: {
        ...response.data,
        result: mapMenuItemFromBackend(response.data.result),
      },
    };
  },

  getCustomizations: (menuItemId: string) =>
    axiosClient.get<ApiResponse<CustomizationDTO[]>>(`/public/menu-items/${menuItemId}/customizations`),

  canCreate: (restaurantId: string) =>
    axiosClient.get<ApiResponse<boolean>>(`/menu-items/restaurant/${restaurantId}/can-create`),

  getLimit: (restaurantId: string) =>
    axiosClient.get<ApiResponse<number>>(`/menu-items/restaurant/${restaurantId}/limit`),
};
