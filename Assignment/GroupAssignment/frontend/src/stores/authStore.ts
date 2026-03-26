import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthenticationResponse, UserDTO, StaffAuthResponse, StaffInfo } from '@/types/dto';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserDTO | null;
  staffInfo: StaffInfo | null;
  hydrated: boolean;

  setAuthData: (authResponse: AuthenticationResponse) => void;
  setStaffAuthData: (authResponse: StaffAuthResponse) => void;
  clearAuthData: () => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  setHydrated: (hydrated: boolean) => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      staffInfo: null,
      hydrated: false,

      setAuthData: (authResponse: AuthenticationResponse) => {
        set({
          accessToken: authResponse.accessToken,
          refreshToken: authResponse.refreshToken,
          user: authResponse.user,
          staffInfo: null,
        });
      },

      setStaffAuthData: (authResponse: StaffAuthResponse) => {
        set({
          accessToken: authResponse.accessToken,
          refreshToken: authResponse.refreshToken,
          user: null,
          staffInfo: authResponse.staffInfo,
        });
      },

      clearAuthData: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          staffInfo: null,
        });
      },

      updateTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken });
      },

      setHydrated: (hydrated: boolean) => {
        set({ hydrated });
      },

      isAuthenticated: () => {
        const state = get();
        return !!state.user || !!state.staffInfo;
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
