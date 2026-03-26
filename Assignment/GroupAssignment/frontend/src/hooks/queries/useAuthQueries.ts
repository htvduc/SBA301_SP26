import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/authApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      toast.success('Welcome back!', {
        description: `Logged in as ${data.user.email}`,
      });
      navigate('/');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error('Login Failed', {
        description: message,
      });
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      toast.success('Logged out successfully');
      navigate('/');
    },
    onError: () => {
      toast.error('Logout failed');
    },
  });
};

export const useStaffLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ restaurantId, username, password }: { restaurantId: string; username: string; password: string }) =>
      authApi.staffLogin(restaurantId, username, password),
    onSuccess: (data) => {
      toast.success('Staff login successful!', {
        description: `Welcome back, ${data.staffInfo.username}`,
      });
      // Route based on role
      const role = data.staffInfo.role;
      if (role === 'WAITER') {
        navigate('/waiter/dashboard');
      } else if (role === 'BRANCH_MANAGER') {
        navigate('/manager/dashboard');
      } else if (role === 'RECEPTIONIST') {
        navigate('/receptionist/dashboard');
      } else {
        // Fallback dashboard
        navigate('/');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error('Staff Login Failed', {
        description: message,
      });
    },
  });
};
