import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { staffAccountApi } from '@/api/staffApi';
import type {
  PageResponse,
  StaffAccountDTO,
  StaffAccountCreateRequest,
  StaffAccountUpdateRequest,
} from '@/types/dto';
import { useToast } from '@/hooks/use-toast';

export const useStaffByBranch = (
  branchId?: string,
  page = 1,
  size = 20,
  keyword?: string,
  roleFilter?: string,
  isActive?: boolean
) => {
  return useQuery({
    queryKey: ['staff', 'branch', branchId, page, size, keyword, roleFilter, isActive],
    queryFn: async () => {
      if (!branchId) {
        throw new Error('Branch ID is required');
      }
      const pageData: PageResponse<StaffAccountDTO> =
        await staffAccountApi.getByBranchPaginated(branchId, page, size, keyword, roleFilter, isActive);
      return pageData;
    },
    enabled: !!branchId,
    placeholderData: keepPreviousData,
  });
};

export const useManagerStaffByBranch = (
  branchId?: string,
  page = 1,
  size = 20,
  keyword?: string,
  roleFilter?: string,
  isActive?: boolean
) => {
  return useQuery({
    queryKey: ['manager-staff', 'branch', branchId, page, size, keyword, roleFilter, isActive],
    queryFn: async () => {
      if (!branchId) {
        throw new Error('Branch ID is required');
      }
      const pageData: PageResponse<StaffAccountDTO> =
        await staffAccountApi.getManagerStaffPaginated(branchId, page, size, keyword, roleFilter, isActive);
      return pageData;
    },
    enabled: !!branchId,
    placeholderData: keepPreviousData,
  });
};

export const useStaffStatistics = (branchId?: string) => {
  return useQuery({
    queryKey: ['staff-statistics', branchId],
    queryFn: async () => {
      if (!branchId) {
        throw new Error('Branch ID is required');
      }
      return await staffAccountApi.getStaffStatistics(branchId);
    },
    enabled: !!branchId,
  });
};

export const useCreateStaffAccount = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: StaffAccountCreateRequest) =>
      staffAccountApi.create(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['staff', 'branch', variables.branchId],
      });
      queryClient.invalidateQueries({
        queryKey: ['manager-staff', 'branch', variables.branchId],
      });
      queryClient.invalidateQueries({
        queryKey: ['staff-statistics', variables.branchId],
      });
      toast({
        title: 'Staff created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create staff',
        description: error?.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateStaffAccount = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: StaffAccountUpdateRequest) =>
      staffAccountApi.update(data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({
        queryKey: ['staff', 'branch', updated.branchId],
      });
      queryClient.invalidateQueries({
        queryKey: ['manager-staff', 'branch', updated.branchId],
      });
      queryClient.invalidateQueries({
        queryKey: ['staff-statistics', updated.branchId],
      });
      toast({
        title: 'Staff updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update staff',
        description: error?.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};

export const useToggleStaffStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (staffId: string) => staffAccountApi.toggleStatus(staffId),
    onMutate: async (staffId) => {
      // Cancel any outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ['staff'] });
      await queryClient.cancelQueries({ queryKey: ['manager-staff'] });

      // Helper to update a specific query cache
      const updateCache = (queryKey: string[]) => {
        const previousData = queryClient.getQueryData<PageResponse<StaffAccountDTO>>(queryKey);
        if (previousData && 'content' in previousData) {
          queryClient.setQueryData<PageResponse<StaffAccountDTO>>(queryKey, (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              content: oldData.content.map((staff) =>
                staff.id === staffId ? { ...staff, isActive: !staff.isActive } : staff
              )
            };
          });
        }
        return previousData;
      };

      // Optimistically update both possible caches
      // We don't have the exact branchId here easily but we can iterate over all
      // queries that match the base key or just let React Query handle matched queries
      const queryCaches = queryClient.getQueriesData<PageResponse<StaffAccountDTO>>({ queryKey: ['staff'] });
      const managerQueryCaches = queryClient.getQueriesData<PageResponse<StaffAccountDTO>>({ queryKey: ['manager-staff'] });

      const previousStaffData: Array<[queryKey: any, data: PageResponse<StaffAccountDTO> | undefined]> = [];
      const previousManagerStaffData: Array<[queryKey: any, data: PageResponse<StaffAccountDTO> | undefined]> = [];

      queryCaches.forEach(([queryKey]) => {
        previousStaffData.push([queryKey, updateCache(queryKey as string[])]);
      });

      managerQueryCaches.forEach(([queryKey]) => {
        previousManagerStaffData.push([queryKey, updateCache(queryKey as string[])]);
      });

      return { previousStaffData, previousManagerStaffData };
    },
    onError: (error: any, _staffId, context) => {
      // Rollback on error
      if (context?.previousStaffData) {
        context.previousStaffData.forEach(([queryKey, data]) => {
          if (data) queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousManagerStaffData) {
        context.previousManagerStaffData.forEach(([queryKey, data]) => {
          if (data) queryClient.setQueryData(queryKey, data);
        });
      }

      toast({
        title: 'Failed to update status',
        description: error?.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      // Always refetch to ensure real data is consistent
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['manager-staff'] });
    },
  });
};

export const useResetStaffPassword = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ staffAccountId, newPassword }: { staffAccountId: string; newPassword: string }) =>
      staffAccountApi.resetPassword(staffAccountId, newPassword),
    onSuccess: () => {
      toast({ title: 'Password reset successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to reset password',
        description: error?.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};

export const useTransferStaffToBranch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ staffAccountId, newBranchId }: { staffAccountId: string; newBranchId: string }) =>
      staffAccountApi.transferToBranch(staffAccountId, newBranchId),
    onSuccess: (data) => {
      // Invalidate both old and new branch queries
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['manager-staff'] });
      queryClient.invalidateQueries({ queryKey: ['staff-statistics'] });
      toast({ title: 'Staff transferred successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to transfer staff',
        description: error?.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};
