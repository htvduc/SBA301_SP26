package com.example.backend.services;

import com.corundumstudio.socketio.SocketIOServer;
import com.example.backend.dto.OrderNotificationDTO;
import com.example.backend.dto.ReservationNotificationDTO;
import com.example.backend.entities.TableStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final SocketIOServer socketIOServer;
    private final Logger logger = LoggerFactory.getLogger(NotificationServiceImpl.class);

    public NotificationServiceImpl(SocketIOServer socketIOServer) {
        this.socketIOServer = socketIOServer;
    }

    @Override
    public void emitOrderNotification(UUID branchId, OrderNotificationDTO notification) {
        String roomName = "branch:" + branchId + ":waiter";
        try {
            logger.info("=== EMITTING ORDER NOTIFICATION ===");
            logger.info("Room: {}", roomName);
            logger.info("Event: order:new");
            logger.info("Notification: eventId={}, orderId={}, tableNumber={}, itemCount={}", 
                    notification.getEventId(), notification.getOrderId(), 
                    notification.getTableNumber(), notification.getItemCount());
            
            int recipientCount = socketIOServer.getRoomOperations(roomName).getClients().size();
            logger.info("Recipients in room: {}", recipientCount);
            
            socketIOServer.getRoomOperations(roomName).sendEvent("order:new", notification);
            
            if (recipientCount == 0) {
                logger.warn("⚠️ Emitted order notification to room '{}' but no recipients were present", roomName);
            } else {
                logger.info("✅ Successfully emitted order notification to room '{}' with {} recipient(s)", roomName, recipientCount);
            }
        } catch (Exception e) {
            logger.error("❌ Failed to emit order notification to room '{}': {}", roomName, e.getMessage(), e);
        }
    }

    @Override
    public void emitReservationNotification(UUID branchId, ReservationNotificationDTO notification) {
        String roomName = "branch:" + branchId + ":receptionist";
        try {
            int recipientCount = socketIOServer.getRoomOperations(roomName).getClients().size();
            socketIOServer.getRoomOperations(roomName).sendEvent("reservation:new", notification);
            
            if (recipientCount == 0) {
                logger.warn("Emitted reservation notification to room '{}' but no recipients were present", roomName);
            } else {
                logger.info("Emitted reservation notification to room '{}' with {} recipient(s)", roomName, recipientCount);
            }
        } catch (Exception e) {
            logger.error("Failed to emit reservation notification to room '{}': {}", roomName, e.getMessage(), e);
        }
    }

    @Override
    public void emitTableStatusChanged(UUID branchId, UUID tableId, TableStatus status) {
        String roomName = "branch:" + branchId + ":waiter";
        try {
            logger.info("=== EMITTING TABLE STATUS CHANGE ===");
            logger.info("Room: {}", roomName);
            logger.info("Event: table:status_changed");
            logger.info("TableId: {}, Status: {}", tableId, status);
            
            Map<String, Object> data = new HashMap<>();
            data.put("tableId", tableId.toString());
            data.put("status", status.name());
            
            int recipientCount = socketIOServer.getRoomOperations(roomName).getClients().size();
            logger.info("Recipients in room: {}", recipientCount);
            
            socketIOServer.getRoomOperations(roomName).sendEvent("table:status_changed", data);
            
            if (recipientCount == 0) {
                logger.warn("⚠️ Emitted table status change to room '{}' but no recipients were present", roomName);
            } else {
                logger.info("✅ Successfully emitted table status change to room '{}' with {} recipient(s)", roomName, recipientCount);
            }
        } catch (Exception e) {
            logger.error("❌ Failed to emit table status change to room '{}': {}", roomName, e.getMessage(), e);
        }
    }
}
