package com.example.backend.services;

import com.example.backend.dto.OrderNotificationDTO;
import com.example.backend.dto.ReservationNotificationDTO;
import com.example.backend.entities.TableStatus;

import java.util.UUID;

public interface NotificationService {
    void emitOrderNotification(UUID branchId, OrderNotificationDTO notification);
    
    void emitReservationNotification(UUID branchId, ReservationNotificationDTO notification);
    
    void emitTableStatusChanged(UUID branchId, UUID tableId, TableStatus status);
}
