import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tableApi } from '@/api/tableApi';
import type { AreaTableDTO } from '@/types/dto';
import { TableStatus } from '@/types/dto';
import { toast } from '@/hooks/use-toast';

export const useTables = () => {
    return useQuery({
        queryKey: ['tables'],
        queryFn: () => tableApi.getAll(),
    });
};

export const useTablesByArea = (areaId: string) => {
    return useQuery({
        queryKey: ['tables', 'area', areaId],
        queryFn: () => tableApi.getByArea(areaId),
        enabled: !!areaId && !areaId.startsWith('temp-'), // Don't fetch for temporary IDs
    });
};

export const useTablesByBranch = (
    branchId: string,
    options?: {
        refetchInterval?: number;
        refetchOnWindowFocus?: boolean;
        enabled?: boolean;
    }
) => {
    return useQuery({
        queryKey: ['tables', 'branch', branchId],
        queryFn: () => tableApi.getByBranch(branchId),
        enabled: options?.enabled ?? !!branchId,
        refetchInterval: options?.refetchInterval,
        refetchOnWindowFocus: options?.refetchOnWindowFocus,
    });
};

export const useTablesByAreaAndStatus = (areaId: string, status: TableStatus) => {
    return useQuery({
        queryKey: ['tables', 'area', areaId, 'status', status],
        queryFn: () => tableApi.getByAreaAndStatus(areaId, status),
        enabled: !!areaId,
    });
};

export const useTable = (id: string) => {
    return useQuery({
        queryKey: ['tables', id],
        queryFn: () => tableApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateTable = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AreaTableDTO) => tableApi.create(data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            queryClient.invalidateQueries({ queryKey: ['tables', 'area', variables.areaId] });
            toast({
                title: 'Success',
                description: 'Table created successfully',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create table',
                variant: 'destructive',
            });
        },
    });
};

export const useUpdateTable = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<AreaTableDTO> }) =>
            tableApi.update(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: ['tables'] });

            const previousTables = queryClient.getQueriesData({ queryKey: ['tables'] });

            queryClient.setQueriesData<AreaTableDTO[]>({ queryKey: ['tables'] }, (old) => {
                if (!old) return old;
                return old.map(table =>
                    table.areaTableId === id ? { ...table, ...data } : table
                );
            });

            return { previousTables };
        },
        onSuccess: (updatedTable) => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            queryClient.invalidateQueries({ queryKey: ['tables', updatedTable.areaTableId] });
            if (updatedTable.areaId) {
                queryClient.invalidateQueries({ queryKey: ['tables', 'area', updatedTable.areaId] });
            }
            toast({
                title: 'Success',
                description: 'Table updated successfully',
            });
        },
        onError: (error: any, variables, context) => {
            if (context?.previousTables) {
                context.previousTables.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update table',
                variant: 'destructive',
            });
        },
    });
};

export const useDeleteTable = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => tableApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            toast({
                title: 'Success',
                description: 'Table deleted successfully',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete table',
                variant: 'destructive',
            });
        },
    });
};

export const useSetTableStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: TableStatus }) =>
            tableApi.setStatus(id, status),
        onMutate: async ({ id, status }) => {
            await queryClient.cancelQueries({ queryKey: ['tables'] });

            const previousTables = queryClient.getQueriesData({ queryKey: ['tables'] });

            queryClient.setQueriesData<AreaTableDTO[]>({ queryKey: ['tables'] }, (old) => {
                if (!old) return old;
                return old.map(table =>
                    table.areaTableId === id ? { ...table, status } : table
                );
            });

            return { previousTables };
        },
        onSuccess: (updatedTable) => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            if (updatedTable.areaId) {
                queryClient.invalidateQueries({ queryKey: ['tables', 'area', updatedTable.areaId] });
            }
            toast({
                title: 'Success',
                description: 'Table status updated successfully',
            });
        },
        onError: (error: any, variables, context) => {
            if (context?.previousTables) {
                context.previousTables.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update table status',
                variant: 'destructive',
            });
        },
    });
};

export const useMarkTableOutOfOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => tableApi.markOutOfOrder(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['tables'] });

            const previousTables = queryClient.getQueriesData({ queryKey: ['tables'] });

            queryClient.setQueriesData<AreaTableDTO[]>({ queryKey: ['tables'] }, (old) => {
                if (!old) return old;
                return old.map(table =>
                    table.areaTableId === id ? { ...table, status: TableStatus.INACTIVE } : table
                );
            });

            return { previousTables };
        },
        onSuccess: (updatedTable) => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            if (updatedTable.areaId) {
                queryClient.invalidateQueries({ queryKey: ['tables', 'area', updatedTable.areaId] });
            }
            toast({
                title: 'Success',
                description: 'Table marked as out of order',
            });
        },
        onError: (error: any, variables, context) => {
            if (context?.previousTables) {
                context.previousTables.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to mark table as out of order',
                variant: 'destructive',
            });
        },
    });
};

export const useMarkTableAvailable = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => tableApi.markAvailable(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['tables'] });

            const previousTables = queryClient.getQueriesData({ queryKey: ['tables'] });

            queryClient.setQueriesData<AreaTableDTO[]>({ queryKey: ['tables'] }, (old) => {
                if (!old) return old;
                return old.map(table =>
                    table.areaTableId === id ? { ...table, status: TableStatus.FREE } : table
                );
            });

            return { previousTables };
        },
        onSuccess: (updatedTable) => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            if (updatedTable.areaId) {
                queryClient.invalidateQueries({ queryKey: ['tables', 'area', updatedTable.areaId] });
            }
            toast({
                title: 'Success',
                description: 'Table marked as available',
            });
        },
        onError: (error: any, variables, context) => {
            if (context?.previousTables) {
                context.previousTables.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to mark table as available',
                variant: 'destructive',
            });
        },
    });
};
export const useMarkTableOccupied = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => tableApi.markOccupied(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['tables'] });

            const previousTables = queryClient.getQueriesData({ queryKey: ['tables'] });

            queryClient.setQueriesData<AreaTableDTO[]>({ queryKey: ['tables'] }, (old) => {
                if (!old) return old;
                return old.map(table =>
                    table.areaTableId === id ? { ...table, status: TableStatus.OCCUPIED } : table
                );
            });

            return { previousTables };
        },
        onSuccess: (updatedTable) => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            if (updatedTable.areaId) {
                queryClient.invalidateQueries({ queryKey: ['tables', 'area', updatedTable.areaId] });
            }
            toast({
                title: 'Success',
                description: 'Table marked as occupied',
            });
        },
        onError: (error: any, variables, context) => {
            if (context?.previousTables) {
                context.previousTables.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to mark table as occupied',
                variant: 'destructive',
            });
        },
    });
};