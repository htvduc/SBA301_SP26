import { CustomizationType } from './customization.dto';

export enum OrderStatus {
  EATING = 'EATING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum OrderLineStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  ONLINE = 'ONLINE',
  CASH = 'CASH',
  CARD = 'CARD',
}

export interface OrderItemCustomizationDTO {
  orderItemCustomizationId: string;
  customizationId: string;
  customizationName: string;
  quantity: number;
  totalPrice: number;
}

export interface OrderItemDTO {
  orderItemId: string;
  menuItemId: string;
  menuItemName: string;
  menuItemImageUrl: string | null;
  menuItemPrice: number;
  discountedPrice: number;
  quantity: number;
  totalPrice: number;
  note: string | null;
  customizations: OrderItemCustomizationDTO[];
}

export interface OrderLineDTO {
  orderLineId: string;
  orderId: string;
  orderLineStatus: OrderLineStatus;
  totalPrice: number;
  createdAt: string;
  tableName?: string;
  orderItems: OrderItemDTO[];
}

export interface OrderDTO {
  orderId: string;
  areaTableId: string;
  tableName: string;
  areaName: string;
  status: OrderStatus;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  orderLines: OrderLineDTO[];
}

export interface OrderSummaryDTO {
  orderId: string;
  areaTableId: string;
  tableName: string;
  areaName: string;
  status: OrderStatus;
  totalPrice: number;
  createdAt: string;
}

/** Waiter history list row — no order lines (loaded on detail). */
export interface OrderHistorySummaryDTO {
  orderId: string;
  areaTableId: string;
  tableName: string;
  areaName: string;
  status: OrderStatus;
  totalPrice: number;
  paidAmount?: number;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
}

export interface BillDTO {
  billId: string;
  orderId: string;
  branchId: string;
  tableName: string;
  areaName: string;
  finalPrice: number;
  discountAmount: number;
  promotionCode: string | null;
  promotionName: string | null;
  note: string | null;
  paymentMethod: PaymentMethod;
  paidTime: string;
  createdAt: string;
  order: OrderDTO | null;
  restaurantName: string | null;
  branchAddress: string | null;
  branchPhone: string | null;
}

export interface BillSummaryDTO {
  billId: string;
  orderId: string;
  tableName: string;
  areaName: string;
  finalPrice: number;
  paymentMethod: PaymentMethod;
  paidTime: string;
}

export interface CreateOrderItemCustomizationRequest {
  customizationId: string ;
  quantity: number;
}

export interface CreateOrderItemRequest {
  menuItemId: string;
  quantity: number;
  note: string;
  customizations: CreateOrderItemCustomizationRequest[];
}

export interface CreateOrderRequest {
  areaTableId: string;
  items: CreateOrderItemRequest[];
}

export interface AddItemsToOrderRequest {
  items: CreateOrderItemRequest[];
}

export interface UpdateOrderItemRequest {
  quantity: number;
  note: string;
}

export interface ConfirmPaymentRequest {
  orderId: string;
  branchId: string;
  paymentMethod: PaymentMethod;
  note: string;
  promotionCode: string;
}

export interface WaiterMenuItemDTO {
  menuItemId: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName: string;
  isBestSeller: boolean;
  hasCustomization: boolean;
  imageUrl: string | null;
  discountedPrice?: number;
  customizations: WaiterCustomizationDTO[];
}

export interface WaiterCustomizationDTO {
  customizationId: string;
  name: string;
  price: number;
  customizationType: CustomizationType;
}

export interface WaiterCategoryDTO {
  categoryId: string;
  name: string;
}

export interface CartItem {
  cartItemId: string;
  menuItemId: string;
  name: string;
  price: number;
  discountedPrice?: number;
  imageUrl: string | null;
  quantity: number;
  note: string;
  customizations: {
    customizationId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalPrice: number;
}
