import { authApi } from '@/api/authApi';

interface UseGoogleOAuthReturn {
  initiateGoogleLogin: () => void;
}

export function useGoogleOAuth(): UseGoogleOAuthReturn {
  const initiateGoogleLogin = () => {
    // Simply redirect to Spring Security OAuth2 endpoint
    // Backend will handle everything and redirect back to /dashboard
    authApi.redirectToGoogleLogin();
  };

  return {
    initiateGoogleLogin,
  };
}
