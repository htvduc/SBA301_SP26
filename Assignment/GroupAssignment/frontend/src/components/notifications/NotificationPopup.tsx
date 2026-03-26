import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Notification } from '@/types/dto/notification.dto';

interface NotificationPopupProps {
  notification: Notification;
  onDismiss: () => void;
  onClick: () => void;
}

export function NotificationPopup({ notification, onDismiss, onClick }: NotificationPopupProps) {
  // Auto-dismiss after 8 seconds (increased from 5)
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 8000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  // Determine colors based on notification type
  const isOrder = notification.type === 'order';
  const bgColor = isOrder ? 'bg-blue-50 dark:bg-blue-950' : 'bg-green-50 dark:bg-green-950';
  const borderColor = isOrder ? 'border-blue-500' : 'border-green-500';
  const textColor = isOrder ? 'text-blue-900 dark:text-blue-100' : 'text-green-900 dark:text-green-100';
  const accentColor = isOrder ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400';

  // Extract display information
  const getDisplayInfo = () => {
    if (notification.type === 'order') {
      const data = notification.data as any;
      const itemCount = data.itemCount || 0;
      const itemText = itemCount === 1 ? 'item' : 'items';
      
      return {
        tableNumber: data.tableNumber || data.tableName || 'N/A',
        customerName: data.customerName,
        requestType: 'New Order Received',
        description: `${itemCount} ${itemText} ordered`,
        icon: '🍽️'
      };
    } else {
      const data = notification.data as any;
      return {
        tableNumber: data.tableNumber || 'N/A',
        customerName: data.customerName,
        requestType: 'New Reservation',
        description: 'Reservation request received',
        icon: '📅'
      };
    }
  };

  const { tableNumber, customerName, requestType, description, icon } = getDisplayInfo();

  return (
    <div
      className={`fixed top-4 right-4 z-50 w-96 ${bgColor} ${borderColor} border-l-4 rounded-lg shadow-lg cursor-pointer transition-all hover:shadow-xl animate-in slide-in-from-right duration-300`}
      onClick={onClick}
    >
      <div className="p-4">
        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className={`absolute top-2 right-2 ${textColor} hover:opacity-70 transition-opacity`}
          aria-label="Close notification"
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className={`${textColor} pr-6`}>
          {/* Header with icon */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{icon}</span>
            <h3 className="font-bold text-lg">{requestType}</h3>
          </div>
          
          {/* Main info */}
          <div className="space-y-2">
            {/* Table number - prominent */}
            <div className={`${accentColor} font-semibold text-base`}>
              Table {tableNumber}
            </div>
            
            {/* Description */}
            <p className="text-sm opacity-90">
              {description}
            </p>
            
            {/* Customer name if available */}
            {customerName && (
              <p className="text-sm">
                <span className="font-medium">Customer:</span> {customerName}
              </p>
            )}
          </div>
          
          {/* Action hint */}
          <div className="mt-3 pt-3 border-t border-current/20">
            <p className="text-xs opacity-75">
              Click to view details
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
