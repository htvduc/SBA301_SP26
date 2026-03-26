import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchApi } from '@/api/branchApi';
import type { BranchDTO } from '@/types/dto';
import { toast } from '@/hooks/use-toast';

export const useBranches = () => {
    return useQuery({
        queryKey: ['branches'],
        queryFn: () => branchApi.getAll(),
    });
};

export const useBranchesByRestaurant = (restaurantId: string) => {
    return useQuery({
        queryKey: ['branches', 'restaurant', restaurantId],
        queryFn: () => branchApi.getByRestaurant(restaurantId),
        enabled: !!restaurantId,
    });
};

export const useActiveBranchesByRestaurant = (restaurantId: string) => {
    return useQuery({
        queryKey: ['branches', 'restaurant', restaurantId, 'active'],
        queryFn: () => branchApi.getActiveByRestaurant(restaurantId),
        enabled: !!restaurantId,
    });
};

export const useBranchesByOwner = (ownerId: string) => {
    return useQuery({
        queryKey: ['branches', 'owner', ownerId],
        queryFn: () => branchApi.getByOwner(ownerId),
        enabled: !!ownerId,
    });
};

export const useBranch = (id: string) => {
    return useQuery({
        queryKey: ['branches', id],
        queryFn: () => branchApi.getById(id),
        enabled: !!id,
    });
};

export const useRestaurantSlugByBranch = (branchId: string) => {
    return useQuery({
        queryKey: ['branches', branchId, 'restaurant-slug'],
        queryFn: () => branchApi.getRestaurantSlugByBranchId(branchId),
        enabled: !!branchId,
    });
};

export const useCreateBranch = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: BranchDTO) => branchApi.create(data),
        onMutate: async (newBranch) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['branches', 'restaurant', newBranch.restaurantId] });

            // Snapshot the previous value
            const previousBranches = queryClient.getQueryData<BranchDTO[]>(['branches', 'restaurant', newBranch.restaurantId]);

            // Optimistically update
            queryClient.setQueryData<BranchDTO[]>(
                ['branches', 'restaurant', newBranch.restaurantId],
                (old) => {
                    if (!old) return [{ ...newBranch, branchId: 'temp-' + Date.now(), isActive: true }];
                    return [...old, { ...newBranch, branchId: 'temp-' + Date.now(), isActive: true }];
                }
            );

            return { previousBranches, restaurantId: newBranch.restaurantId };
        },
        onSuccess: (data, variables, context) => {
            // Invalidate and refetch to get real data from server
            queryClient.invalidateQueries({ queryKey: ['branches'] });
            queryClient.invalidateQueries({ queryKey: ['branches', 'restaurant', context.restaurantId] });
            toast({
                title: 'Success',
                description: 'Branch created successfully',
            });
        },
        onError: (error: any, variables, context) => {
            // Rollback on error
            if (context?.previousBranches && context?.restaurantId) {
                queryClient.setQueryData(
                    ['branches', 'restaurant', context.restaurantId],
                    context.previousBranches
                );
            }
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create branch',
                variant: 'destructive',
            });
        },
    });
};

export const useUpdateBranch = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<BranchDTO> }) =>
            branchApi.update(id, data),
        onMutate: async ({ id, data }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['branches'] });

            // Snapshot the previous value
            const previousBranches = queryClient.getQueriesData({ queryKey: ['branches'] });

            // Optimistically update all branch queries
            queryClient.setQueriesData<BranchDTO[]>({ queryKey: ['branches'] }, (old) => {
                if (!old) return old;
                return old.map(branch =>
                    branch.branchId === id ? { ...branch, ...data } : branch
                );
            });

            return { previousBranches };
        },
        onSuccess: (updatedBranch) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['branches'] });
            queryClient.invalidateQueries({ queryKey: ['branches', updatedBranch.branchId] });
            if (updatedBranch.restaurantId) {
                queryClient.invalidateQueries({ queryKey: ['branches', 'restaurant', updatedBranch.restaurantId] });
            }
            toast({
                title: 'Success',
                description: 'Branch updated successfully',
            });
        },
        onError: (error: any, variables, context) => {
            // Rollback on error
            if (context?.previousBranches) {
                context.previousBranches.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update branch',
                variant: 'destructive',
            });
        },
    });
};

export const useUpdateBranchContactInfo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<BranchDTO> }) =>
            branchApi.updateContactInfo(id, data),
        onSuccess: (updatedBranch) => {
            queryClient.invalidateQueries({ queryKey: ['branches'] });
            queryClient.invalidateQueries({ queryKey: ['branches', updatedBranch.branchId] });
            if (updatedBranch.restaurantId) {
                queryClient.invalidateQueries({ queryKey: ['branches', 'restaurant', updatedBranch.restaurantId] });
            }
            toast({
                title: 'Success',
                description: 'Contact information updated successfully',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update contact information',
                variant: 'destructive',
            });
        },
    });
};

export const useDeleteBranch = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => branchApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branches'] });
            toast({
                title: 'Success',
                description: 'Branch deleted successfully',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete branch',
                variant: 'destructive',
            });
        },
    });
};
