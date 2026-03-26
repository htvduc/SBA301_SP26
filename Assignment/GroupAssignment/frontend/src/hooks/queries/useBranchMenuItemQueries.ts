import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchMenuItemApi } from '@/api/branchMenuItemApi';
import { useToast } from '@/hooks/use-toast';

export const useBranchMenuItemQueries = (branchId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ['branchMenuItems', branchId],
    queryFn: () => branchMenuItemApi.getMenuItemsByBranch(branchId!),
    enabled: !!branchId,
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: ({
      menuItemId,
      available,
    }: {
      menuItemId: string;
      available: boolean;
    }) => branchMenuItemApi.updateAvailability(branchId!, menuItemId, available),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branchMenuItems', branchId] });
      toast({
        title: 'Success',
        description: 'Menu item availability updated',
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to update menu item availability';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  return {
    menuItems,
    isLoading,
    updateAvailability: updateAvailabilityMutation.mutateAsync,
    isUpdating: updateAvailabilityMutation.isPending,
  };
};
