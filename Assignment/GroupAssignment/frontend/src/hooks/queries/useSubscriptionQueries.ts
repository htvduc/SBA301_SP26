import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi } from '@/api/subscriptionApi';
import type { CreateRestaurantSubscriptionRequest } from '@/types/dto/subscription.dto';
import { useToast } from '@/hooks/use-toast';

export const useSubscriptionQueries = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Create restaurant with subscription
  const createRestaurantWithSubscription = useMutation({
    mutationFn: (request: CreateRestaurantSubscriptionRequest) =>
      subscriptionApi.createRestaurantWithSubscription(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create subscription',
        variant: 'destructive',
      });
    },
  });

  // Renew subscription
  const renewSubscription = useMutation({
    mutationFn: (restaurantId: string) => subscriptionApi.renewSubscription(restaurantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to renew subscription',
        variant: 'destructive',
      });
    },
  });

  // Upgrade package
  const upgradePackage = useMutation({
    mutationFn: ({ restaurantId, newPackageId }: { restaurantId: string; newPackageId: string }) =>
      subscriptionApi.upgradePackage(restaurantId, newPackageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to upgrade package',
        variant: 'destructive',
      });
    },
  });

  // Get active subscription by restaurant
  const useActiveSubscription = (restaurantId: string | undefined) => {
    return useQuery({
      queryKey: ['subscriptions', 'active', restaurantId],
      queryFn: () => subscriptionApi.getActiveSubscriptionByRestaurant(restaurantId!),
      enabled: !!restaurantId,
    });
  };

  // Get latest payment status
  const useLatestPaymentStatus = (restaurantId: string | undefined) => {
    return useQuery({
      queryKey: ['payments', 'latest', restaurantId],
      queryFn: () => subscriptionApi.getLatestPaymentStatus(restaurantId!),
      enabled: !!restaurantId,
    });
  };

  // Get payment history
  const usePaymentHistory = (restaurantId: string | undefined) => {
    return useQuery({
      queryKey: ['payments', 'history', restaurantId],
      queryFn: () => subscriptionApi.getPaymentHistory(restaurantId!),
      enabled: !!restaurantId,
    });
  };

  // Get payment status by order code
  const usePaymentStatusByOrderCode = (orderCode: string | undefined) => {
    return useQuery({
      queryKey: ['payments', 'status', orderCode],
      queryFn: () => subscriptionApi.getPaymentStatusByOrderCode(orderCode!),
      enabled: !!orderCode,
      refetchInterval: 3000, // Poll every 5 seconds
    });
  };

  // Cancel payment
  const cancelPayment = useMutation({
    mutationFn: (orderCode: string) => subscriptionApi.cancelPayment(orderCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({
        title: 'Payment Cancelled',
        description: 'Your payment has been cancelled successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to cancel payment',
        variant: 'destructive',
      });
    },
  });

  // Activate subscription
  const activateSubscription = useMutation({
    mutationFn: ({ subscriptionId, durationMonths }: { subscriptionId: string; durationMonths?: number }) =>
      subscriptionApi.activateSubscription(subscriptionId, durationMonths),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast({
        title: 'Subscription Activated',
        description: 'Your subscription has been activated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to activate subscription',
        variant: 'destructive',
      });
    },
  });

  // Cancel subscription
  const cancelSubscription = useMutation({
    mutationFn: (subscriptionId: string) => subscriptionApi.cancelSubscription(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast({
        title: 'Subscription Cancelled',
        description: 'Your subscription has been cancelled',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to cancel subscription',
        variant: 'destructive',
      });
    },
  });

  return {
    createRestaurantWithSubscription,
    renewSubscription,
    upgradePackage,
    useActiveSubscription,
    useLatestPaymentStatus,
    usePaymentHistory,
    usePaymentStatusByOrderCode,
    cancelPayment,
    activateSubscription,
    cancelSubscription,
  };
};
