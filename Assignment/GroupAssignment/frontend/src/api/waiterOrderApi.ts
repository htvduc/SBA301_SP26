import axiosClient from './axiosClient';
import type {
  ApiResponse,
  AreaTableDTO,
  OrderDTO,
  OrderHistorySummaryDTO,
  BillDTO,
  CreateOrderRequest,
  AddItemsToOrderRequest,
  UpdateOrderItemRequest,
  ConfirmPaymentRequest,
  WaiterMenuItemDTO,
  WaiterCategoryDTO,
  TableStatus,
  OrderLineDTO,
} from '@/types/dto';

class WaiterOrderApi {
  async createOrder(request: CreateOrderRequest): Promise<OrderDTO> {
    const response = await axiosClient.post<ApiResponse<OrderDTO>>('/waiter/orders', request);
    return response.data.result;
  }

  async addItemsToOrder(orderId: string, request: AddItemsToOrderRequest): Promise<OrderDTO> {
    const response = await axiosClient.post<ApiResponse<OrderDTO>>(`/waiter/orders/${orderId}/items`, request);
    return response.data.result;
  }

  async getOrder(orderId: string): Promise<OrderDTO> {
    const response = await axiosClient.get<ApiResponse<OrderDTO>>(`/waiter/orders/${orderId}`);
    return response.data.result;
  }

  async getActiveOrderByTable(tableId: string): Promise<OrderDTO | null> {
    const response = await axiosClient.get<ApiResponse<OrderDTO | null>>(`/waiter/orders/table/${tableId}/active`);
    return response.data.result;
  }

  async getOrderHistorySummaries(branchId: string): Promise<OrderHistorySummaryDTO[]> {
    const response = await axiosClient.get<ApiResponse<OrderHistorySummaryDTO[]>>(
      `/waiter/orders/branch/${branchId}/history`
    );
    return response.data.result;
  }

  async getOrdersByBranch(branchId: string): Promise<OrderDTO[]> {
    const response = await axiosClient.get<ApiResponse<OrderDTO[]>>(`/waiter/orders/branch/${branchId}`);
    return response.data.result;
  }

  async getActiveOrdersByBranch(branchId: string): Promise<OrderDTO[]> {
    const response = await axiosClient.get<ApiResponse<OrderDTO[]>>(`/waiter/orders/branch/${branchId}/active`);
    return response.data.result;
  }

  async updateOrderItem(orderItemId: string, request: UpdateOrderItemRequest): Promise<OrderDTO> {
    const response = await axiosClient.put<ApiResponse<OrderDTO>>(`/waiter/orders/items/${orderItemId}`, request);
    return response.data.result;
  }

  async removeOrderItem(orderItemId: string): Promise<OrderDTO> {
    const response = await axiosClient.delete<ApiResponse<OrderDTO>>(`/waiter/orders/items/${orderItemId}`);
    return response.data.result;
  }

  async cancelOrder(orderId: string): Promise<OrderDTO> {
    const response = await axiosClient.put<ApiResponse<OrderDTO>>(`/waiter/orders/${orderId}/cancel`);
    return response.data.result;
  }

  async confirmPayment(request: ConfirmPaymentRequest): Promise<BillDTO> {
    const response = await axiosClient.post<ApiResponse<BillDTO>>('/waiter/bills/confirm', request);
    return response.data.result;
  }

  async getBillByOrder(orderId: string): Promise<BillDTO> {
    const response = await axiosClient.get<ApiResponse<BillDTO>>(`/waiter/bills/order/${orderId}`);
    return response.data.result;
  }

  async getBillsByBranch(branchId: string): Promise<BillDTO[]> {
    const response = await axiosClient.get<ApiResponse<BillDTO[]>>(`/waiter/bills/branch/${branchId}`);
    return response.data.result;
  }

  async getMenuForBranch(branchId: string): Promise<WaiterMenuItemDTO[]> {
    const response = await axiosClient.get<ApiResponse<WaiterMenuItemDTO[]>>(`/branch-menu-items/branch/${branchId}`);
    return response.data.result
      .filter((item: Record<string, unknown>) => item.available)
      .map((item: Record<string, unknown>) => ({
        ...(item as unknown as WaiterMenuItemDTO),
        isBestSeller: Boolean(item.isBestSeller ?? item.bestSeller),
      }));
  }

  async getCategoriesForBranch(branchId: string): Promise<WaiterCategoryDTO[]> {
    const response = await axiosClient.get<ApiResponse<WaiterMenuItemDTO[]>>(`/branch-menu-items/branch/${branchId}`);
    const items = response.data.result;
    const categoryMap = new Map<string, string>();
    items.forEach((item: any) => {
      if (item.categoryId && item.categoryName) {
        categoryMap.set(item.categoryId, item.categoryName);
      }
    });
    return Array.from(categoryMap.entries()).map(([categoryId, name]) => ({ categoryId, name }));
  }

  async setTableStatus(tableId: string, status: TableStatus): Promise<AreaTableDTO> {
    const response = await axiosClient.put<ApiResponse<AreaTableDTO>>(`/waiter/tables/${tableId}/status?status=${status}`);
    return response.data.result;
  }

  async getTodayOrdersCount(branchId: string): Promise<number> {
    const response = await axiosClient.get<ApiResponse<number>>(`/waiter/orders/branch/${branchId}/today-count`);
    return response.data.result;
  }

  async getCurrentOrderLines(branchId: string): Promise<OrderLineDTO[]> {
    const response = await axiosClient.get<ApiResponse<OrderLineDTO[]>>(`/manager/order-lines/current?branchId=${branchId}`);
    return response.data.result;
  }

  async updateOrderLineStatus(orderLineId: string, status: string): Promise<OrderLineDTO> {
    const response = await axiosClient.patch<ApiResponse<OrderLineDTO>>(
      `/manager/order-lines/${orderLineId}/status?status=${status}`
    );
    return response.data.result;
  }
}

export const waiterOrderApi = new WaiterOrderApi();
