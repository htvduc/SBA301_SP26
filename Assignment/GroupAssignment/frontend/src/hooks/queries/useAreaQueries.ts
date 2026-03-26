import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { areaApi } from '@/api/areaApi';
import type { AreaDTO } from '@/types/dto';
import { EntityStatus } from '@/types/dto';
import { toast } from '@/hooks/use-toast';

export const useAreas = () => {
    return useQuery({
        queryKey: ['areas'],
        queryFn: () => areaApi.getAll(),
    });
};

export const useAreasByBranch = (branchId: string) => {
    return useQuery({
        queryKey: ['areas', 'branch', branchId],
        queryFn: () => areaApi.getByBranch(branchId),
        enabled: !!branchId,
    });
};

export const useAreasByBranchAndStatus = (branchId: string, status: EntityStatus) => {
    return useQuery({
        queryKey: ['areas', 'branch', branchId, 'status', status],
        queryFn: () => areaApi.getByBranchAndStatus(branchId, status),
        enabled: !!branchId,
    });
};

export const useArea = (id: string) => {
    return useQuery({
        queryKey: ['areas', id],
        queryFn: () => areaApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateArea = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AreaDTO) => areaApi.create(data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['areas'] });
            queryClient.invalidateQueries({ queryKey: ['areas', 'branch', variables.branchId] });
            toast({
                title: 'Success',
                description: 'Area created successfully',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create area',
                variant: 'destructive',
            });
        },
    });
};

export const useUpdateArea = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<AreaDTO> }) =>
            areaApi.update(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: ['areas'] });

            const previousAreas = queryClient.getQueriesData({ queryKey: ['areas'] });

            queryClient.setQueriesData<AreaDTO[]>({ queryKey: ['areas'] }, (old) => {
                if (!old) return old;
                return old.map(area =>
                    area.areaId === id ? { ...area, ...data } : area
                );
            });

            return { previousAreas };
        },
        onSuccess: (updatedArea) => {
            queryClient.invalidateQueries({ queryKey: ['areas'] });
            queryClient.invalidateQueries({ queryKey: ['areas', updatedArea.areaId] });
            if (updatedArea.branchId) {
                queryClient.invalidateQueries({ queryKey: ['areas', 'branch', updatedArea.branchId] });
            }
            toast({
                title: 'Success',
                description: 'Area updated successfully',
            });
        },
        onError: (error: any, variables, context) => {
            if (context?.previousAreas) {
                context.previousAreas.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update area',
                variant: 'destructive',
            });
        },
    });
};

export const useDeleteArea = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => areaApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['areas'] });
            toast({
                title: 'Success',
                description: 'Area deleted successfully',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete area',
                variant: 'destructive',
            });
        },
    });
};

export const useActivateArea = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => areaApi.activate(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['areas'] });

            const previousAreas = queryClient.getQueriesData({ queryKey: ['areas'] });

            queryClient.setQueriesData<AreaDTO[]>({ queryKey: ['areas'] }, (old) => {
                if (!old) return old;
                return old.map(area =>
                    area.areaId === id ? { ...area, status: EntityStatus.ACTIVE } : area
                );
            });

            return { previousAreas };
        },
        onSuccess: (updatedArea) => {
            queryClient.invalidateQueries({ queryKey: ['areas'] });
            if (updatedArea.branchId) {
                queryClient.invalidateQueries({ queryKey: ['areas', 'branch', updatedArea.branchId] });
            }
            toast({
                title: 'Success',
                description: 'Area activated successfully',
            });
        },
        onError: (error: any, variables, context) => {
            if (context?.previousAreas) {
                context.previousAreas.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to activate area',
                variant: 'destructive',
            });
        },
    });
};

export const useDeactivateArea = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => areaApi.deactivate(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['areas'] });

            const previousAreas = queryClient.getQueriesData({ queryKey: ['areas'] });

            queryClient.setQueriesData<AreaDTO[]>({ queryKey: ['areas'] }, (old) => {
                if (!old) return old;
                return old.map(area =>
                    area.areaId === id ? { ...area, status: EntityStatus.INACTIVE } : area
                );
            });

            return { previousAreas };
        },
        onSuccess: (updatedArea) => {
            queryClient.invalidateQueries({ queryKey: ['areas'] });
            if (updatedArea.branchId) {
                queryClient.invalidateQueries({ queryKey: ['areas', 'branch', updatedArea.branchId] });
            }
            toast({
                title: 'Success',
                description: 'Area deactivated successfully',
            });
        },
        onError: (error: any, variables, context) => {
            if (context?.previousAreas) {
                context.previousAreas.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to deactivate area',
                variant: 'destructive',
            });
        },
    });
};
