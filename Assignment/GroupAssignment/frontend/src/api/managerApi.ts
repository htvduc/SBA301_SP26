import axiosClient from './axiosClient';
import type {
  ApiResponse,
  OrderDTO,
  OrderLineDTO,
  BillDTO,
} from '@/types/dto';

class ManagerApi {
  // Order Management
  async getOrderDetails(orderId: string): Promise<OrderDTO> {
    const response = await axiosClient.get<ApiResponse<OrderDTO>>(`/manager/orders/${orderId}`);
    return response.data.result;
  }

  async getOrderHistory(branchId: string): Promise<OrderDTO[]> {
    const response = await axiosClient.get<ApiResponse<OrderDTO[]>>(`/manager/orders/history?branchId=${branchId}`);
    return response.data.result;
  }

  // Kitchen / Live Orders
  async getCurrentOrderLines(branchId: string): Promise<OrderLineDTO[]> {
    const response = await axiosClient.get<ApiResponse<OrderLineDTO[]>>(`/manager/order-lines/current?branchId=${branchId}`);
    return response.data.result;
  }

  async getOrderLineDetails(orderLineId: string): Promise<OrderLineDTO> {
    const response = await axiosClient.get<ApiResponse<OrderLineDTO>>(`/manager/order-lines/${orderLineId}`);
    return response.data.result;
  }

  async updateOrderLineStatus(orderLineId: string, status: string): Promise<OrderLineDTO> {
    const response = await axiosClient.patch<ApiResponse<OrderLineDTO>>(
      `/manager/order-lines/${orderLineId}/status?status=${status}`
    );
    return response.data.result;
  }

  // Billing Management
  async getBillDetails(billId: string): Promise<BillDTO> {
    const response = await axiosClient.get<ApiResponse<BillDTO>>(`/manager/bills/${billId}`);
    return response.data.result;
  }

  async getBillingHistory(branchId: string, startDate: string, endDate: string): Promise<BillDTO[]> {
    const response = await axiosClient.get<ApiResponse<BillDTO[]>>(
      `/manager/bills/history?branchId=${branchId}&startDate=${startDate}&endDate=${endDate}`
    );
    return response.data.result;
  }

  // Paginated Search
  async searchOrders(params: {
    branchId: string;
    status?: string;
    searchTerm?: string;
    startDate?: string;
    endDate?: string;
    page: number;
    size: number;
  }): Promise<ApiResponse<any>> {
    const { branchId, status, searchTerm, startDate, endDate, page, size } = params;
    let url = `/manager/orders/search?branchId=${branchId}&page=${page}&size=${size}`;
    if (status && status !== 'ALL') url += `&status=${status}`;
    if (searchTerm) url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    
    const response = await axiosClient.get<ApiResponse<any>>(url);
    return response.data;
  }

  async searchBills(params: {
    branchId: string;
    startDate: string;
    endDate: string;
    paymentMethod?: string;
    searchTerm?: string;
    page: number;
    size: number;
  }): Promise<ApiResponse<any>> {
    const { branchId, startDate, endDate, paymentMethod, searchTerm, page, size } = params;
    let url = `/manager/bills/search?branchId=${branchId}&startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`;
    if (paymentMethod && paymentMethod !== 'ALL') url += `&paymentMethod=${paymentMethod}`;
    if (searchTerm) url += `&searchTerm=${encodeURIComponent(searchTerm)}`;

    const response = await axiosClient.get<ApiResponse<any>>(url);
    return response.data;
  }
}

export const managerApi = new ManagerApi();
