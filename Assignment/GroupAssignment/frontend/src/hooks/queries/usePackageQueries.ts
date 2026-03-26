import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { packageApi } from '@/api/packageApi';
import type { PackageFeatureDTO } from '@/types/dto/package.dto';
import { useToast } from '@/hooks/use-toast';

export const PACKAGE_QUERY_KEYS = {
  all: ['packages'] as const,
  list: () => [...PACKAGE_QUERY_KEYS.all, 'list'] as const,
  detail: (id: string) => [...PACKAGE_QUERY_KEYS.all, 'detail', id] as const,
  features: ['features'] as const,
};

// Get all packages
export const usePackages = () => {
  return useQuery({
    queryKey: PACKAGE_QUERY_KEYS.list(),
    queryFn: packageApi.getAllPackages,
  });
};

// Get package by id
export const usePackage = (packageId: string) => {
  return useQuery({
    queryKey: PACKAGE_QUERY_KEYS.detail(packageId),
    queryFn: () => packageApi.getPackageById(packageId),
    enabled: !!packageId,
  });
};

// Get all features
export const useFeatures = () => {
  return useQuery({
    queryKey: PACKAGE_QUERY_KEYS.features,
    queryFn: packageApi.getAllFeatures,
  });
};

// Create package
export const useCreatePackage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: PackageFeatureDTO) => packageApi.createPackage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PACKAGE_QUERY_KEYS.list() });
      toast({
        title: 'Package created',
        description: 'Package has been created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create package',
        variant: 'destructive',
      });
    },
  });
};

// Update package
export const useUpdatePackage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ packageId, data }: { packageId: string; data: PackageFeatureDTO }) =>
      packageApi.updatePackage(packageId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PACKAGE_QUERY_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: PACKAGE_QUERY_KEYS.detail(variables.packageId) });
      toast({
        title: 'Package updated',
        description: 'Package has been updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update package',
        variant: 'destructive',
      });
    },
  });
};

// Activate package
export const useActivatePackage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (packageId: string) => packageApi.activatePackage(packageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PACKAGE_QUERY_KEYS.list() });
      toast({
        title: 'Package activated',
        description: 'Package has been activated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to activate package',
        variant: 'destructive',
      });
    },
  });
};

// Deactivate package
export const useDeactivatePackage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (packageId: string) => packageApi.deactivatePackage(packageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PACKAGE_QUERY_KEYS.list() });
      toast({
        title: 'Package deactivated',
        description: 'Package has been deactivated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to deactivate package',
        variant: 'destructive',
      });
    },
  });
};

// Delete feature from package
export const useDeleteFeatureFromPackage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ packageId, featureId }: { packageId: string; featureId: string }) =>
      packageApi.deleteFeatureFromPackage(packageId, featureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PACKAGE_QUERY_KEYS.list() });
      toast({
        title: 'Feature removed',
        description: 'Feature has been removed from package',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to remove feature',
        variant: 'destructive',
      });
    },
  });
};
