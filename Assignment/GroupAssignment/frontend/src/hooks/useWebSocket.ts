import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';
import { getSocketConfig } from '@/config/socket.config';

type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

interface UseWebSocketReturn {
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  connect: () => void;
  disconnect: () => void;
  socket: Socket | null;
  retryCountdown: number | null;
}

const socketConfig = getSocketConfig();
const SOCKET_URL = socketConfig.url;
const HEARTBEAT_INTERVAL = 15000;
const HEARTBEAT_TIMEOUT = 30000;
const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

export function useWebSocket(
  token: string | null,
  role: string | null
): UseWebSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectDelayRef = useRef<number>(INITIAL_RECONNECT_DELAY);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tokenRef = useRef(token);
  const roleRef = useRef(role);

  useEffect(() => {
    tokenRef.current = token;
    roleRef.current = role;
  }, [token, role]);

  const clearHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      return;
    }

    const delay = reconnectDelayRef.current;
    const countdownSeconds = Math.ceil(delay / 1000);
    setRetryCountdown(countdownSeconds);

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev === null || prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectTimeoutRef.current = null;
      setRetryCountdown(null);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      reconnectDelayRef.current = Math.min(
        reconnectDelayRef.current * 2,
        MAX_RECONNECT_DELAY
      );
      
      if (tokenRef.current && roleRef.current) {
        const socket = io(SOCKET_URL, {
          ...socketConfig.options,
        });

        setupSocketHandlers(socket);
        socketRef.current = socket;
        socket.connect();
      }
    }, delay);
  }, []);

  const startHeartbeat = useCallback(() => {
    clearHeartbeat();

    heartbeatIntervalRef.current = setInterval(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('ping');

        heartbeatTimeoutRef.current = setTimeout(() => {
          setConnectionStatus('reconnecting');
          socketRef.current?.disconnect();
        }, HEARTBEAT_TIMEOUT);
      }
    }, HEARTBEAT_INTERVAL);
  }, [clearHeartbeat]);

  const setupSocketHandlers = useCallback((socket: Socket) => {
    socket.on('connect', async () => {
      const currentToken = tokenRef.current;
      
      // Check if token is expired by trying to decode it
      if (currentToken) {
        try {
          // Decode JWT to check expiration (without verification)
          const payload = JSON.parse(atob(currentToken.split('.')[1]));
          const expiresAt = payload.exp * 1000; // Convert to milliseconds
          const now = Date.now();
          const timeUntilExpiry = expiresAt - now;
          
          // If token expires in less than 30 seconds, refresh it first
          if (timeUntilExpiry <= 30000) {
            
            try {
              const isStaff = !!roleRef.current && roleRef.current !== 'USER';
              const refreshEndpoint = isStaff ? '/auth/staff-refresh' : '/auth/refresh';
              
              // Import axios dynamically to avoid circular dependency
              const axiosModule = await import('@/api/axiosClient');
              const axios = axiosModule.default;
              const response = await axios.post(refreshEndpoint, {}, { withCredentials: true });
              
              if (response.data?.result) {
                const result = response.data.result;
                const newToken = result.accessToken;
                
                // Update token in store and ref
                if (result.user) {
                  useAuthStore.getState().setAuthData({
                    accessToken: newToken,
                    refreshToken: result.refreshToken,
                    user: result.user,
                  });
                } else if (result.staffInfo) {
                  useAuthStore.getState().setStaffAuthData({
                    accessToken: newToken,
                    refreshToken: result.refreshToken,
                    staffInfo: result.staffInfo,
                  });
                }
                
                tokenRef.current = newToken;
                socket.emit('authenticate', newToken);
              } else {
                throw new Error('No token in refresh response');
              }
            } catch (refreshError) {
              useAuthStore.getState().clearAuthData();
              socket.disconnect();
              return;
            }
          } else {
            socket.emit('authenticate', currentToken);
          }
        } catch (decodeError) {
          socket.emit('authenticate', currentToken);
        }
      } else {
        socket.disconnect();
      }
    });

    socket.on('authenticated', () => {
      setConnectionStatus('connected');
      setRetryCountdown(null);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;
      startHeartbeat();
    });

    socket.on('pong', () => {
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
        heartbeatTimeoutRef.current = null;
      }
    });

    socket.on('connect_error', (error) => {
      setConnectionStatus('disconnected');
      scheduleReconnect();
    });

    socket.on('disconnect', (reason) => {
      setConnectionStatus('disconnected');
      clearHeartbeat();

      if (reason === 'io client disconnect') {
        // Client initiated disconnect - not reconnecting
      } else {
        scheduleReconnect();
      }
    });

    socket.on('error', (error) => {
      setConnectionStatus('disconnected');
      clearHeartbeat();
      scheduleReconnect();
    });
  }, [startHeartbeat, clearHeartbeat, scheduleReconnect]);

  const connect = useCallback(() => {
    if (!tokenRef.current || !roleRef.current) {
      return;
    }

    if (socketRef.current?.connected) {
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setConnectionStatus('reconnecting');

    const socket = io(SOCKET_URL, {
      ...socketConfig.options,
    });

    setupSocketHandlers(socket);
    socketRef.current = socket;
    socket.connect();
  }, [setupSocketHandlers]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    setRetryCountdown(null);
    clearHeartbeat();

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.removeAllListeners();
      socketRef.current = null;
    }

    setConnectionStatus('disconnected');
    reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;
  }, [clearHeartbeat]);

  useEffect(() => {
    if (token && role) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [token, role, connect, disconnect]);

  return {
    isConnected: connectionStatus === 'connected',
    connectionStatus,
    connect,
    disconnect,
    socket: socketRef.current,
    retryCountdown,
  };
}
