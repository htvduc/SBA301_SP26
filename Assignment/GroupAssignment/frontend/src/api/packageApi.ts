import axiosClient from './axiosClient';
import type { ApiResponse } from '@/types/dto/api-response.dto';
import type { PackageFeatureDTO, FeatureDTO } from '@/types/dto/package.dto';

export const packageApi = {
  // Get all packages with features (admin only)
  getAllPackages: async (): Promise<PackageFeatureDTO[]> => {
    const response = await axiosClient.get<ApiResponse<PackageFeatureDTO[]>>('/packages');
    return response.data.result || [];
  },

  // Get active packages with features (public endpoint)
  getActivePackages: async (): Promise<PackageFeatureDTO[]> => {
    const response = await axiosClient.get<ApiResponse<PackageFeatureDTO[]>>('/packages/active');
    return response.data.result || [];
  },

  // Get package by id
  getPackageById: async (packageId: string): Promise<PackageFeatureDTO> => {
    const response = await axiosClient.get<ApiResponse<PackageFeatureDTO>>(`/packages/${packageId}`);
    return response.data.result!;
  },

  // Create package
  createPackage: async (data: PackageFeatureDTO): Promise<PackageFeatureDTO> => {
    const response = await axiosClient.post<ApiResponse<PackageFeatureDTO>>('/packages', data);
    return response.data.result!;
  },

  // Update package
  updatePackage: async (packageId: string, data: PackageFeatureDTO): Promise<PackageFeatureDTO> => {
    const response = await axiosClient.put<ApiResponse<PackageFeatureDTO>>(`/packages/${packageId}`, data);
    return response.data.result!;
  },

  // Activate package
  activatePackage: async (packageId: string): Promise<void> => {
    await axiosClient.put(`/packages/${packageId}/activate`);
  },

  // Deactivate package
  deactivatePackage: async (packageId: string): Promise<void> => {
    await axiosClient.put(`/packages/${packageId}/deactivate`);
  },

  // Delete feature from package
  deleteFeatureFromPackage: async (packageId: string, featureId: string): Promise<void> => {
    await axiosClient.delete(`/packages/${packageId}/features/${featureId}`);
  },

  // Get all features
  getAllFeatures: async (): Promise<FeatureDTO[]> => {
    const response = await axiosClient.get<ApiResponse<FeatureDTO[]>>('/features');
    return response.data.result || [];
  },
};
