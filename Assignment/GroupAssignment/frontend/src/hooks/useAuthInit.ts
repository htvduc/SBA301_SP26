import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/authApi';

// Helper: check if current path is a public customer page
const isPublicCustomerPage = (): boolean => {
  const path = window.location.pathname;
  
  // Skip auth for root path and common public pages
  if (path === '/' || path === '/login' || path === '/register' || path === '/staff-login' || path === '/forgot-password') {
    return true;
  }
  
  // Customer pages follow pattern: /:slug/home, /:slug/menu, /:slug/reservations, /:slug/checkout
  const publicPagePatterns = ['/home', '/menu', '/reservations', '/checkout'];
  if (publicPagePatterns.some(pattern => path.includes(pattern))) {
    return true;
  }
  
  // Check if it's a slug-only path (e.g., /my-restaurant)
  // Pattern: starts with /, followed by slug (no more slashes), not a known protected route
  const protectedPrefixes = ['/restaurant', '/dashboard', '/admin', '/manager', '/waiter', '/receptionist', '/payment', '/profile'];
  const isProtectedRoute = protectedPrefixes.some(prefix => path.startsWith(prefix));
  
  if (!isProtectedRoute) {
    // If path has only one segment (/:slug), it's likely a customer page
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 1) {
      return true;
    }
  }
  
  return false;
};

export const useAuthInit = () => {
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const setStaffAuthData = useAuthStore((state) => state.setStaffAuthData);
  const clearAuthData = useAuthStore((state) => state.clearAuthData);
  const hasFetched = useRef(false);

  useEffect(() => {
    // Chỉ fetch một lần duy nhất khi app khởi động
    if (hasFetched.current) return;
    hasFetched.current = true;

    const initAuth = async () => {
      const currentState = useAuthStore.getState();
      
      // Check if we're on a public customer page
      const isPublic = isPublicCustomerPage();
      console.log('[useAuthInit] Current path:', window.location.pathname, 'Is public:', isPublic);
      
      // If we already have complete auth data (token + user/staff), skip API call
      if (currentState.accessToken && (currentState.user || currentState.staffInfo)) {
        console.log('[useAuthInit] Already have complete auth data, skipping API call');
        return;
      }

      // For public pages: only call /auth/me if we DON'T have user data
      // This handles OAuth redirects where cookies are set but localStorage is empty
      if (isPublic && currentState.user) {
        console.log('[useAuthInit] Public page with existing user data, skipping');
        return;
      }

      // Call /auth/me in these cases:
      // 1. Protected pages (always check auth)
      // 2. Public pages without user data (might have cookies from OAuth)
      // 3. Have token but no user/staffInfo (data corrupted)
      try {
        console.log('[useAuthInit] Calling /auth/me');
        const result = await authApi.getCurrentUser();

        if (result && (result.user || result.staffInfo)) {
          // /auth/me returns user/staff info but NOT tokens
          // Tokens come from cookies (set by backend)
          if (result.user) {
            setAuthData({
              accessToken: currentState.accessToken || '', 
              refreshToken: currentState.refreshToken || '',
              user: result.user,
            });
          }
          if (result.staffInfo) {
            setStaffAuthData({
              accessToken: currentState.accessToken || '',
              refreshToken: currentState.refreshToken || '',
              staffInfo: result.staffInfo,
            });
          }
        } else {
          // No valid session
          if (!isPublic) {
            // Only clear auth data on protected pages
            clearAuthData();
          }
        }
      } catch (error) {
        console.log('[useAuthInit] Error calling /auth/me:', error);
        // Only clear auth data if we're on a protected page
        if (!isPublic) {
          clearAuthData();
        }
      }
    };

    initAuth();
  }, [setAuthData, setStaffAuthData, clearAuthData]);
};
