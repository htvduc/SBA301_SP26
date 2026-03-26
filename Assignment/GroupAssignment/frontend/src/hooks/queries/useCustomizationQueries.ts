import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customizationApi } from '@/api/customizationApi';
import { CustomizationCreateRequest, CustomizationDTO } from '@/types/dto';
import { useToast } from '@/hooks/use-toast';

export const useCustomizationQueries = (restaurantId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const customizationsQuery = useQuery({
    queryKey: ['customizations', restaurantId],
    queryFn: async () => {
      if (!restaurantId) throw new Error('Restaurant ID is required');
      const response = await customizationApi.getAllByRestaurant(restaurantId);
      return response.data.result;
    },
    enabled: !!restaurantId,
  });

  const createMutation = useMutation({
    mutationFn: (data: CustomizationCreateRequest) => customizationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customizations', restaurantId] });
      toast({ title: 'Customization created successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create customization',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CustomizationDTO }) =>
      customizationApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customizations', restaurantId] });
      toast({ title: 'Customization updated successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update customization',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customizationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customizations', restaurantId] });
      toast({ title: 'Customization deleted successfully', variant: 'destructive' });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete customization',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  return {
    customizations: customizationsQuery.data || [],
    isLoading: customizationsQuery.isLoading,
    isError: customizationsQuery.isError,
    error: customizationsQuery.error,
    createCustomization: createMutation.mutateAsync,
    updateCustomization: updateMutation.mutateAsync,
    deleteCustomization: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
