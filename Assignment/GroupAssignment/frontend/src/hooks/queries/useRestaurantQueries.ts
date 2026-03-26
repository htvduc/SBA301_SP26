import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantApi } from '@/api/restaurantApi';
import type { RestaurantDTO, RestaurantCreateRequest } from '@/types/dto';
import { toast } from '@/hooks/use-toast';

export const useRestaurants = () => {
    return useQuery({
        queryKey: ['restaurants'],
        queryFn: () => restaurantApi.getAll(),
    });
};

export const useRestaurantsByOwner = (userId: string) => {
    return useQuery({
        queryKey: ['restaurants', 'owner', userId],
        queryFn: async () => {
            const restaurants = await restaurantApi.getByOwner(userId);
            // Filter only active restaurants (status = true)
            return restaurants.filter(r => r.status);
        },
        enabled: !!userId,
    });
};

export const useRestaurant = (id: string) => {
    return useQuery({
        queryKey: ['restaurants', id],
        queryFn: () => restaurantApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateRestaurant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: RestaurantCreateRequest) => restaurantApi.create(data),
        onMutate: async (newRestaurant) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['restaurants', 'owner', newRestaurant.userId] });

            // Snapshot the previous value
            const previousRestaurants = queryClient.getQueryData<RestaurantDTO[]>(['restaurants', 'owner', newRestaurant.userId]);

            // Optimistically update
            queryClient.setQueryData<RestaurantDTO[]>(
                ['restaurants', 'owner', newRestaurant.userId],
                (old) => {
                    const tempRestaurant: RestaurantDTO = {
                        restaurantId: 'temp-' + Date.now(),
                        userId: newRestaurant.userId,
                        name: newRestaurant.name,
                        email: newRestaurant.email,
                        restaurantPhone: newRestaurant.restaurantPhone,
                        publicUrl: newRestaurant.publicUrl || '',
                        description: newRestaurant.description || '',
                        status: false,
                    };
                    if (!old) return [tempRestaurant];
                    return [...old, tempRestaurant];
                }
            );

            return { previousRestaurants, userId: newRestaurant.userId };
        },
        onSuccess: (data, variables, context) => {
            // Invalidate and refetch to get real data from server
            queryClient.invalidateQueries({ queryKey: ['restaurants'] });
            queryClient.invalidateQueries({ queryKey: ['restaurants', 'owner', context.userId] });
            toast({
                title: 'Success',
                description: 'Restaurant created successfully',
            });
        },
        onError: (error: any, variables, context) => {
            // Rollback on error
            if (context?.previousRestaurants && context?.userId) {
                queryClient.setQueryData(
                    ['restaurants', 'owner', context.userId],
                    context.previousRestaurants
                );
            }
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create restaurant',
                variant: 'destructive',
            });
        },
    });
};

export const useUpdateRestaurant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<RestaurantDTO> }) =>
            restaurantApi.update(id, data),
        onMutate: async ({ id, data }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['restaurants'] });

            // Snapshot the previous value
            const previousRestaurants = queryClient.getQueriesData({ queryKey: ['restaurants'] });

            queryClient.setQueriesData<RestaurantDTO[]>({ queryKey: ['restaurants'] }, (old) => {
                if (!old || !Array.isArray(old)) return old;
                return old.map(restaurant =>
                    restaurant.restaurantId === id ? { ...restaurant, ...data } : restaurant
                );
            });

            queryClient.setQueryData<RestaurantDTO>(['restaurants', id], (old) => {
                if (!old) return old;
                return { ...old, ...data };
            });

            return { previousRestaurants };
        },
        onSuccess: (updatedRestaurant, variables) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['restaurants'] });
            queryClient.invalidateQueries({ queryKey: ['restaurants', variables.id] });
            toast({
                title: 'Success',
                description: 'Restaurant updated successfully',
            });
        },
        onError: (error: any, variables, context) => {
            // Rollback on error
            if (context?.previousRestaurants) {
                context.previousRestaurants.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update restaurant',
                variant: 'destructive',
            });
        },
    });
};

export const useDeleteRestaurant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => restaurantApi.delete(id),
        onMutate: async (id) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['restaurants'] });

            // Snapshot the previous value
            const previousRestaurants = queryClient.getQueriesData({ queryKey: ['restaurants'] });

            queryClient.setQueriesData<RestaurantDTO[]>({ queryKey: ['restaurants'] }, (old) => {
                if (!old || !Array.isArray(old)) return old;
                return old.filter(restaurant => restaurant.restaurantId !== id);
            });

            return { previousRestaurants };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurants'] });
            queryClient.invalidateQueries({ queryKey: ['branches'] });
            toast({
                title: 'Success',
                description: 'Restaurant deleted successfully',
            });
        },
        onError: (error: any, variables, context) => {
            // Rollback on error
            if (context?.previousRestaurants) {
                context.previousRestaurants.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete restaurant',
                variant: 'destructive',
            });
        },
    });
};
