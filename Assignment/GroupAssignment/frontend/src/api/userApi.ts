import axiosClient from './axiosClient';
import type { ApiResponse } from '@/types/dto/api-response.dto';
import type { 
  SignupRequest, 
  OTPMailRequest, 
  OTPValidateRequest,
  UserInfoUpdateRequest,
  UserInfoResponse,
  ChangePasswordRequest
} from '@/types/dto/request.dto';
import type { UserDTO } from '@/types/dto/user.dto';

export const userApi = {
  // Get user by ID
  getUserById: async (userId: string): Promise<UserDTO> => {
    const response = await axiosClient.get<ApiResponse<UserDTO>>(
      `/users/${userId}`
    );
    return response.data.result;
  },

  // Update user
  updateUser: async (data: UserDTO): Promise<UserDTO> => {
    const response = await axiosClient.put<ApiResponse<UserDTO>>(
      '/users',
      data
    );
    return response.data.result;
  },

  // Get user info (profile)
  getUserInfo: async (userId: string): Promise<UserInfoResponse> => {
    const response = await axiosClient.get<ApiResponse<UserInfoResponse>>(
      `/users/${userId}/info`
    );
    return response.data.result;
  },

  // Update user info (profile)
  updateUserInfo: async (userId: string, data: UserInfoUpdateRequest): Promise<UserInfoResponse> => {
    const response = await axiosClient.put<ApiResponse<UserInfoResponse>>(
      `/users/${userId}/info`,
      data
    );
    return response.data.result;
  },

  // Upload avatar (or remove if file is null)
  uploadAvatar: async (userId: string, file: File | null): Promise<string | null> => {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    const response = await axiosClient.post<ApiResponse<string | null>>(
      `/users/${userId}/avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.result;
  },

  // Get avatar URL
  getAvatar: async (userId: string): Promise<string | null> => {
    const response = await axiosClient.get<ApiResponse<string>>(
      `/users/${userId}/avatar`
    );
    return response.data.result;
  },

  // Send OTP to email
  sendOTP: async (data: OTPMailRequest): Promise<ApiResponse<string>> => {
    const response = await axiosClient.post<ApiResponse<string>>(
      '/users/mail',
      data
    );
    return response.data;
  },

  // Validate OTP code
  validateOTP: async (data: OTPValidateRequest): Promise<ApiResponse<boolean>> => {
    const response = await axiosClient.post<ApiResponse<boolean>>(
      '/users/mail/otp',
      data
    );
    return response.data;
  },

  // Sign up new user
  signup: async (data: SignupRequest): Promise<ApiResponse<UserDTO>> => {
    const response = await axiosClient.post<ApiResponse<UserDTO>>(
      '/users/signup',
      data
    );
    return response.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordRequest): Promise<boolean> => {
    const response = await axiosClient.post<ApiResponse<boolean>>(
      '/users/changepass',
      data
    );
    return response.data.result;
  },

  // Forgot password (reset password with OTP verification)
  forgotPassword: async (email: string, password: string): Promise<boolean> => {
    const response = await axiosClient.post<ApiResponse<boolean>>(
      '/users/forgetpass',
      { email, password }
    );
    return response.data.result;
  },
};
