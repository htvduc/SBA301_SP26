import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { waiterOrderApi } from '@/api/waiterOrderApi';
import type {
  CreateOrderRequest,
  AddItemsToOrderRequest,
  UpdateOrderItemRequest,
  ConfirmPaymentRequest,
} from '@/types/dto';
import type { OrderLineDTO } from '@/types/dto';
import { TableStatus } from '@/types/dto';
import { toast } from '@/hooks/use-toast';

export const useWaiterMenu = (branchId: string) => {
  return useQuery({
    queryKey: ['waiter', 'menu', branchId],
    queryFn: () => waiterOrderApi.getMenuForBranch(branchId),
    enabled: !!branchId,
  });
};

export const useWaiterCategories = (branchId: string) => {
  return useQuery({
    queryKey: ['waiter', 'categories', branchId],
    queryFn: () => waiterOrderApi.getCategoriesForBranch(branchId),
    enabled: !!branchId,
  });
};

export const useActiveOrderByTable = (tableId: string) => {
  return useQuery({
    queryKey: ['waiter', 'order', 'table', tableId],
    queryFn: () => waiterOrderApi.getActiveOrderByTable(tableId),
    enabled: !!tableId,
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
};

export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['waiter', 'order', orderId],
    queryFn: () => waiterOrderApi.getOrder(orderId),
    enabled: !!orderId,
  });
};

export const useActiveOrdersByBranch = (branchId: string) => {
  return useQuery({
    queryKey: ['waiter', 'orders', 'branch', branchId, 'active'],
    queryFn: () => waiterOrderApi.getActiveOrdersByBranch(branchId),
    enabled: !!branchId,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateOrderRequest) => waiterOrderApi.createOrder(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['waiter', 'order'] });
      queryClient.invalidateQueries({ queryKey: ['waiter', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast({ title: 'Order created successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create order',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};

export const useAddItemsToOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, request }: { orderId: string; request: AddItemsToOrderRequest }) =>
      waiterOrderApi.addItemsToOrder(orderId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiter', 'order'] });
      queryClient.invalidateQueries({ queryKey: ['waiter', 'orders'] });
      toast({ title: 'Items added to order' });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to add items',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateOrderItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderItemId, request }: { orderItemId: string; request: UpdateOrderItemRequest }) =>
      waiterOrderApi.updateOrderItem(orderItemId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiter', 'order'] });
      queryClient.invalidateQueries({ queryKey: ['waiter', 'orders'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update item',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};

export const useRemoveOrderItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderItemId: string) => waiterOrderApi.removeOrderItem(orderItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiter', 'order'] });
      queryClient.invalidateQueries({ queryKey: ['waiter', 'orders'] });
      toast({ title: 'Item removed from order' });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to remove item',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => waiterOrderApi.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiter', 'order'] });
      queryClient.removeQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0] === 'waiter' &&
          q.queryKey[1] === 'order' &&
          q.queryKey[2] === 'table',
      });
      queryClient.invalidateQueries({ queryKey: ['waiter', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast({ title: 'Order cancelled' });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to cancel order',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};

export const useConfirmPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ConfirmPaymentRequest) => waiterOrderApi.confirmPayment(request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['waiter', 'order'] });
      queryClient.removeQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0] === 'waiter' &&
          q.queryKey[1] === 'order' &&
          q.queryKey[2] === 'table',
      });
      queryClient.invalidateQueries({ queryKey: ['waiter', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant-daily-revenue'] });
      queryClient.invalidateQueries({ queryKey: ['branch-daily-revenue'] });
      queryClient.invalidateQueries({ queryKey: ['top-selling-items'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['today-revenue'] });
      queryClient.invalidateQueries({ queryKey: ['order-distribution'] });

      // Clear completed kitchen orders for the paid orderId
      const completedKey = ['waiter', 'kitchen', 'completed', variables.branchId] as const;
      queryClient.setQueryData<any[]>(completedKey, (prev = []) => {
        if (!variables.orderId) return prev;
        return prev.filter((line) => line?.orderId !== variables.orderId);
      });

      // Clear all kitchen lines (including PREPARING) belonging to the paid orderId
      queryClient.setQueryData<OrderLineDTO[]>(
        ['current-order-lines', variables.branchId],
        (prev = []) => {
          if (!variables.orderId) return prev;
          return prev.filter((line) => line?.orderId !== variables.orderId);
        }
      );
      toast({ title: 'Payment confirmed successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to confirm payment',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};

export const useBillByOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['waiter', 'bill', orderId],
    queryFn: () => waiterOrderApi.getBillByOrder(orderId),
    enabled: !!orderId,
  });
};

export const useOrdersByBranch = (branchId: string) => {
  return useQuery({
    queryKey: ['waiter', 'orders', 'branch', branchId, 'all'],
    queryFn: () => waiterOrderApi.getOrdersByBranch(branchId),
    enabled: !!branchId,
  });
};

export const useOrderHistorySummaries = (branchId: string) => {
  return useQuery({
    queryKey: ['waiter', 'orders', 'branch', branchId, 'history'],
    queryFn: () => waiterOrderApi.getOrderHistorySummaries(branchId),
    enabled: !!branchId,
  });
};

export const useBillsByBranch = (branchId: string) => {
  return useQuery({
    queryKey: ['waiter', 'bills', 'branch', branchId],
    queryFn: () => waiterOrderApi.getBillsByBranch(branchId),
    enabled: !!branchId,
  });
};

export const useWaiterSetTableStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TableStatus }) =>
      waiterOrderApi.setTableStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast({ title: 'Table status updated' });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update table status',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};
export const useTodayOrdersCount = (branchId: string) => {
  return useQuery({
    queryKey: ['waiter', 'orders', 'today-count', branchId],
    queryFn: () => waiterOrderApi.getTodayOrdersCount(branchId),
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: !!branchId,
  });
};