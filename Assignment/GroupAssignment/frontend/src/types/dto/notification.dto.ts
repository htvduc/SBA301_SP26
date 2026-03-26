// Notification DTOs matching backend structure

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

export interface Notification {
  eventId: string;
  type: 'order' | 'reservation';
  id: string; // orderId or reservationId
  title: string;
  message: string;
  timestamp: number;
  data: OrderNotificationData | ReservationNotificationData;
}

export interface OrderNotificationData {
  orderId: string;
  branchId: string;
  tableNumber: string;
  tableName: string;
  customerName?: string;
  itemCount: number;
  totalAmount: number;
}

export interface ReservationNotificationData {
  reservationId: string;
  branchId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  startTime: string;
  guestNumber: number;
  tableNumber?: string;
}
