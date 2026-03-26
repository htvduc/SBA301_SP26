import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { Notification } from '@/types/dto/notification.dto';

interface NotificationContextValue {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  dismissNotification: (eventId: string) => void;
  clearAll: () => void;
  clearEventIdCache: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const processedEventIds = useRef<Set<string>>(new Set());

  const addNotification = (notification: Notification) => {
    // Deduplication check
    if (processedEventIds.current.has(notification.eventId)) {
      return;
    }

    processedEventIds.current.add(notification.eventId);
    setNotifications((prev) => [...prev, notification]);
  };

  const dismissNotification = (eventId: string) => {
    setNotifications((prev) => prev.filter((n) => n.eventId !== eventId));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const clearEventIdCache = () => {
    processedEventIds.current.clear();
  };

  const value: NotificationContextValue = {
    notifications,
    addNotification,
    dismissNotification,
    clearAll,
    clearEventIdCache,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
