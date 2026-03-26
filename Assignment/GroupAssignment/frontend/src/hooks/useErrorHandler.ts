import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';

export const useErrorHandler = () => {
  const navigate = useNavigate();

  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      // Check if it's an axios error with code 1108
      const axiosError = error as AxiosError;
      if (axiosError.response?.data && typeof axiosError.response.data === 'object') {
        const errorData = axiosError.response.data as { code?: number };
        if (errorData.code === 1108) {
          navigate('/unauthorized');
          return;
        }
      }
    }
    
    // Handle other errors as needed
  };

  return { handleError };
};