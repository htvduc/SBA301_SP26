import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { menuItemApi } from '@/api/menuItemApi';
import { MenuItemCreateRequest } from '@/types/dto';
import { useToast } from '@/hooks/use-toast';

export const useMenuItemQueries = (restaurantId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const menuItemsQuery = useQuery({
    queryKey: ['menuItems', restaurantId],
    queryFn: async () => {
      if (!restaurantId) throw new Error('Restaurant ID is required');
      const response = await menuItemApi.getAllByRestaurant(restaurantId);
      return response.data.result;
    },
    enabled: !!restaurantId,
  });

  const createMutation = useMutation({
    mutationFn: ({ data, imageFile }: { data: MenuItemCreateRequest; imageFile?: File }) =>
      menuItemApi.create(data, imageFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', restaurantId] });
      toast({ title: 'Menu item created successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create menu item',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, imageFile }: { id: string; data: MenuItemCreateRequest; imageFile?: File }) =>
      menuItemApi.update(id, data, imageFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', restaurantId] });
      toast({ title: 'Menu item updated successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update menu item',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => menuItemApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', restaurantId] });
      toast({ title: 'Menu item deleted successfully', variant: 'destructive' });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete menu item',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const setActiveStatusMutation = useMutation({
    mutationFn: ({ menuItemId, active }: { menuItemId: string; active: boolean }) =>
      menuItemApi.setActiveStatus(menuItemId, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', restaurantId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update status',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const updateBestSellerMutation = useMutation({
    mutationFn: ({ menuItemId, bestSeller }: { menuItemId: string; bestSeller: boolean }) =>
      menuItemApi.updateBestSeller(menuItemId, bestSeller),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', restaurantId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update best seller status',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  return {
    menuItems: menuItemsQuery.data || [],
    isLoading: menuItemsQuery.isLoading,
    isError: menuItemsQuery.isError,
    error: menuItemsQuery.error,
    createMenuItem: createMutation.mutateAsync,
    updateMenuItem: updateMutation.mutateAsync,
    deleteMenuItem: deleteMutation.mutateAsync,
    setActiveStatus: setActiveStatusMutation.mutateAsync,
    updateBestSeller: updateBestSellerMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
