import { useMutation } from '@tanstack/react-query';
import { aiConsultantApi, type AIConsultantRequest } from '@/api/aiConsultantApi';
import { useErrorHandler } from '../useErrorHandler';

export const useAIConsultantQueries = () => {
  const { handleError } = useErrorHandler();

  const consultRestaurant = useMutation({
    mutationFn: ({
      restaurantId,
      request,
    }: {
      restaurantId: string;
      request: AIConsultantRequest;
    }) => aiConsultantApi.consultRestaurant(restaurantId, request),
    onError: handleError,
  });

  const consultBranch = useMutation({
    mutationFn: ({
      branchId,
      request,
    }: {
      branchId: string;
      request: AIConsultantRequest;
    }) => aiConsultantApi.consultBranch(branchId, request),
    onError: handleError,
  });

  return {
    consultRestaurant,
    consultBranch,
  };
};
