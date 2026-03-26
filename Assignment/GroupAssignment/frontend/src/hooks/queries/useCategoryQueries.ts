import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '@/api/categoryApi';
import { CategoryCreateRequest, CategoryDTO } from '@/types/dto';
import { useToast } from '@/hooks/use-toast';

export const useCategoryQueries = (restaurantId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const categoriesQuery = useQuery({
    queryKey: ['categories', restaurantId],
    queryFn: async () => {
      if (!restaurantId) throw new Error('Restaurant ID is required');
      const response = await categoryApi.getAllByRestaurant(restaurantId);
      return response.data.result;
    },
    enabled: !!restaurantId,
  });

  const createMutation = useMutation({
    mutationFn: (data: CategoryCreateRequest) => categoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', restaurantId] });
      toast({ title: 'Category created successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create category',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryDTO }) =>
      categoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', restaurantId] });
      toast({ title: 'Category updated successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update category',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', restaurantId] });
      toast({ title: 'Category deleted successfully', variant: 'destructive' });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete category',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  return {
    categories: categoriesQuery.data || [],
    isLoading: categoriesQuery.isLoading,
    isError: categoriesQuery.isError,
    error: categoriesQuery.error,
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
