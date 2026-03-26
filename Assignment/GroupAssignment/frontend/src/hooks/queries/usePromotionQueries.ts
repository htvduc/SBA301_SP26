import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { promotionApi } from '@/api/promotionApi';
import { CreatePromotionRequest } from '@/types/dto';
import { useToast } from '@/hooks/use-toast';

export const usePromotionQueries = (restaurantId: string, onlyActive: boolean = false) => {
  const query = useQuery({
    queryKey: ['promotions', restaurantId, onlyActive],
    queryFn: () => onlyActive 
      ? promotionApi.getActivePromotionsByRestaurant(restaurantId)
      : promotionApi.getPromotionsByRestaurant(restaurantId),
    enabled: !!restaurantId,
  });

  return {
    promotions: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
};

export const usePromotionActions = (restaurantId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createPromo = useMutation({
    mutationFn: (request: CreatePromotionRequest) => promotionApi.createPromotion(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions', restaurantId] });
      toast({ title: 'Campaign launched successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Launch failed',
        description: error.response?.data?.message || 'Check your configuration.',
        variant: 'destructive',
      });
    },
  });

  const updatePromo = useMutation({
    mutationFn: ({ promotionId, request }: { promotionId: string; request: CreatePromotionRequest }) =>
      promotionApi.updatePromotion(promotionId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions', restaurantId] });
      toast({ title: 'Campaign strategy updated' });
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error.response?.data?.message || 'Check your inputs.',
        variant: 'destructive',
      });
    },
  });

  const deletePromo = useMutation({
    mutationFn: (id: string) => promotionApi.deletePromotion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions', restaurantId] });
      toast({ title: 'Campaign terminated', variant: 'destructive' });
    },
    onError: (error: any) => {
      toast({
        title: 'Termination failed',
        description: error.response?.data?.message || 'Campaign is protected.',
        variant: 'destructive',
      });
    },
  });

  const togglePromoStatus = useMutation({
    mutationFn: ({ promotionId, status }: { promotionId: string; status: 'ACTIVE' | 'INACTIVE' }) =>
      promotionApi.updatePromotionStatus(promotionId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions', restaurantId] });
      toast({ title: 'Campaign status updated' });
    },
    onError: (error: any) => {
      toast({
        title: 'Status update failed',
        description: error.response?.data?.message || 'Check connection.',
        variant: 'destructive',
      });
    },
  });

  return {
    createPromo,
    updatePromo,
    deletePromo,
    togglePromoStatus,
  };
};
