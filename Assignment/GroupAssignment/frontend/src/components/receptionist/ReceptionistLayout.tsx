import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import ReceptionistSidebar from "./ReceptionistSidebar";
import { NotificationProvider, useNotification } from "@/contexts/NotificationContext";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuthStore } from "@/stores/authStore";
import { NotificationPopup } from "@/components/notifications/NotificationPopup";
import { ConnectionStatusIndicator } from "@/components/notifications/ConnectionStatusIndicator";
import { ConnectionWarning } from "@/components/notifications/ConnectionWarning";
import { NotificationErrorBoundary } from "@/components/notifications/NotificationErrorBoundary";
import { playNotificationSound } from "@/utils/audioAlert";
import { reservationApi } from "@/api/reservationApi";
import type { Notification, ReservationNotificationData } from "@/types/dto/notification.dto";
import { ReservationStatus } from "@/types/dto/reservation.dto";
import { useQueryClient } from "@tanstack/react-query";

function ReceptionistLayoutContent() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const staffInfo = useAuthStore((state) => state.staffInfo);
    const accessToken = useAuthStore((state) => state.accessToken);
    const { notifications, addNotification, dismissNotification, clearEventIdCache } = useNotification();
    const { connectionStatus, socket, retryCountdown } = useWebSocket(accessToken, "RECEPTIONIST");
    const hasReconnectedRef = useRef(false);

    useEffect(() => {
        if (!socket) return;

        const handleReservationNotification = (data: any) => {
            try {
                const notification: Notification = {
                    eventId: data.eventId,
                    type: 'reservation',
                    id: data.reservationId,
                    title: 'New Reservation',
                    message: `${data.customerName} - ${data.guestNumber} guests`,
                    timestamp: Date.now(),
                    data: {
                        reservationId: data.reservationId,
                        branchId: data.branchId,
                        customerName: data.customerName,
                        customerPhone: data.customerPhone,
                        customerEmail: data.customerEmail,
                        startTime: data.startTime,
                        guestNumber: data.guestNumber,
                        tableNumber: data.tableNumber,
                    } as ReservationNotificationData,
                };

                addNotification(notification);
                playNotificationSound();
                
                // Invalidate reservation queries to trigger refetch
                queryClient.invalidateQueries({ queryKey: ['reservations', 'list'] });
            } catch (error) {
                const fallbackNotification: Notification = {
                    eventId: data.eventId || `fallback-${Date.now()}`,
                    type: 'reservation',
                    id: 'unknown',
                    title: 'New Reservation',
                    message: 'A new reservation has been received',
                    timestamp: Date.now(),
                    data: {} as ReservationNotificationData,
                };
                addNotification(fallbackNotification);
                
                // Still invalidate queries even on error
                queryClient.invalidateQueries({ queryKey: ['reservations', 'list'] });
            }
        };

        const handleAuthenticated = async () => {
            if (hasReconnectedRef.current && staffInfo?.branchId) {
                try {
                    // Invalidate queries to refetch fresh data after reconnection
                    queryClient.invalidateQueries({ queryKey: ['reservations', 'list'] });
                    clearEventIdCache();
                } catch (error) {
                }
            }
            hasReconnectedRef.current = true;
        };

        socket.on('reservation:new', handleReservationNotification);
        socket.on('authenticated', handleAuthenticated);

        return () => {
            socket.off('reservation:new', handleReservationNotification);
            socket.off('authenticated', handleAuthenticated);
        };
    }, [socket, staffInfo, addNotification, clearEventIdCache, queryClient]);

    const navigateToReservation = (notification: Notification) => {
        dismissNotification(notification.eventId);
        navigate('/receptionist/reservations');
    };

    return (
        <SidebarProvider>
            <ConnectionWarning 
                isVisible={connectionStatus === 'disconnected' || connectionStatus === 'reconnecting'} 
                retryCountdown={retryCountdown ?? undefined}
            />
            <div className="flex min-h-screen w-full">
                <ReceptionistSidebar />
                <main className="flex-1 overflow-auto">
                    <div className="p-4 flex justify-end">
                        <ConnectionStatusIndicator status={connectionStatus} />
                    </div>
                    <Outlet />
                </main>
            </div>
            {notifications.map((notification) => (
                <NotificationErrorBoundary key={notification.eventId}>
                    <NotificationPopup
                        notification={notification}
                        onDismiss={() => dismissNotification(notification.eventId)}
                        onClick={() => navigateToReservation(notification)}
                    />
                </NotificationErrorBoundary>
            ))}
        </SidebarProvider>
    );
}

const ReceptionistLayout = () => {
    return (
        <NotificationProvider>
            <ReceptionistLayoutContent />
        </NotificationProvider>
    );
};

export default ReceptionistLayout;