import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationApi } from '@/api/reservationApi';
import { toast } from 'sonner';
import type {
  ReservationDTO,
  CreateReservationRequest,
  RejectReservationRequest,
  ReservationFilterParams,
  GetAvailableTablesParams,
} from '@/types/dto';

const RESERVATION_KEYS = {
  all: ['reservations'] as const,
  lists: () => [...RESERVATION_KEYS.all, 'list'] as const,
  list: (branchId: string, filters?: ReservationFilterParams) =>
    [...RESERVATION_KEYS.lists(), branchId, filters] as const,
  details: () => [...RESERVATION_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...RESERVATION_KEYS.details(), id] as const,
  byTable: (tableId: string) => [...RESERVATION_KEYS.all, 'by-table', tableId] as const,
  analytics: (branchId: string, startDate: string, endDate: string) =>
    [...RESERVATION_KEYS.all, 'analytics', branchId, startDate, endDate] as const,
  availableTables: (params: GetAvailableTablesParams) =>
    [...RESERVATION_KEYS.all, 'available-tables', params] as const,
};

export const useReservations = (
  branchId: string,
  filters?: ReservationFilterParams
) => {
  return useQuery({
    queryKey: RESERVATION_KEYS.list(branchId, filters),
    queryFn: () => reservationApi.filter(branchId, filters || {}),
    enabled: !!branchId,
  });
};

export const useReservationById = (id: string) => {
  return useQuery({
    queryKey: RESERVATION_KEYS.detail(id),
    queryFn: () => reservationApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReservationRequest) => reservationApi.createByStaff(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.lists() });
      toast.success('Reservation created successfully', {
        description: `Reservation for ${data.customerName} has been created and approved.`,
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to create reservation. Please try again.';
      toast.error('Creation Failed', {
        description: message,
      });
    },
  });
};

export const useApproveReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reservationApi.approve(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.detail(data.reservationId) });
      toast.success('Reservation approved', {
        description: `Reservation for ${data.customerName} has been approved.`,
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to approve reservation. Please try again.';
      toast.error('Approval Failed', {
        description: message,
      });
    },
  });
};

export const useRejectReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectReservationRequest }) =>
      reservationApi.reject(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.detail(data.reservationId) });
      toast.success('Reservation rejected', {
        description: `Reservation for ${data.customerName} has been rejected.`,
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to reject reservation. Please try again.';
      toast.error('Rejection Failed', {
        description: message,
      });
    },
  });
};

export const useMarkArrived = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reservationApi.markArrived(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.detail(data.reservationId) });
      toast.success('Customer arrived', {
        description: `${data.customerName} has been marked as arrived.`,
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to mark customer as arrived. Please try again.';
      toast.error('Arrival Marking Failed', {
        description: message,
      });
    },
  });
};

export const useCompleteReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reservationApi.complete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.detail(data.reservationId) });
      toast.success('Reservation completed', {
        description: `Reservation for ${data.customerName} has been marked as completed.`,
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to complete reservation. Please try again.';
      toast.error('Completion Failed', {
        description: message,
      });
    },
  });
};

export const useMarkNoShow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reservationApi.markNoShow(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.detail(data.reservationId) });
      toast.success('Marked as no-show', {
        description: `Reservation for ${data.customerName} has been marked as no-show.`,
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to mark as no-show. Please try again.';
      toast.error('No-Show Marking Failed', {
        description: message,
      });
    },
  });
};

export const useReservationAnalytics = (
  branchId: string,
  startDate: string,
  endDate: string
) => {
  return useQuery({
    queryKey: RESERVATION_KEYS.analytics(branchId, startDate, endDate),
    queryFn: () => reservationApi.getAnalytics(branchId, startDate, endDate),
    enabled: !!branchId && !!startDate && !!endDate,
  });
};

export const useAvailableTables = (params: GetAvailableTablesParams) => {
  return useQuery({
    queryKey: RESERVATION_KEYS.availableTables(params),
    queryFn: () => reservationApi.getAvailableTables(params),
    enabled: !!params.branchId && !!params.time && params.guests > 0,
  });
};

export const useReservationsByTable = (tableId: string) => {
  return useQuery({
    queryKey: RESERVATION_KEYS.byTable(tableId),
    queryFn: () => reservationApi.getByTable(tableId),
    enabled: !!tableId,
  });
};
