/**
 * WebSocket Configuration
 * 
 * This module provides smart WebSocket URL detection with multiple fallback strategies:
 * 1. Environment variable (VITE_SOCKET_URL)
 * 2. Auto-detection based on current location
 * 3. Default localhost for development
 */

export interface SocketConfig {
  url: string;
  options: {
    autoConnect: boolean;
    reconnection: boolean;
    transports: string[];
    path?: string;
  };
}

/**
 * Get WebSocket URL with intelligent fallback
 */
export const getSocketUrl = (): string => {
  // 1. Priority: Environment variable
  const envSocketUrl = import.meta.env.VITE_SOCKET_URL;
  if (envSocketUrl) {
    return envSocketUrl;
  }

  // 2. Auto-detect based on current location
  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  // Development: localhost with specific port
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8099';
  }
  
  // Production: same domain as frontend
  // If frontend is on port 80/443, don't include port in URL
  if (port && port !== '80' && port !== '443') {
    return `${protocol}//${hostname}:${port}`;
  }
  
  return `${protocol}//${hostname}`;
};

/**
 * Get Socket.IO configuration
 */
export const getSocketConfig = (): SocketConfig => {
  const url = getSocketUrl();
  
  return {
    url,
    options: {
      autoConnect: false,
      reconnection: false, // We handle reconnection manually
      transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
      // Uncomment if your backend uses custom path
      // path: '/socket.io/',
    },
  };
};

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV || window.location.hostname === 'localhost';
};

/**
 * Get connection timeout based on environment
 */
export const getConnectionTimeout = (): number => {
  return isDevelopment() ? 5000 : 10000; // 5s for dev, 10s for prod
};
