export interface LoginRequest {
  email: string;
  password: string;
}

export interface StaffLoginRequest {
  restaurantId: string;
  username: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface UserInfoResponse {
  userId: string;
  username: string;
  email: string;
  googleAccount: boolean;
}

export interface ConfirmPaymentRequest {
  orderId: string;
  branchId: string;
  paymentMethod: string; // Matches PaymentMethod enum: CASH, MOMO, VNPAY
  note?: string;
  promotionCode?: string;
}

export interface ChangePasswordRequest {
  userId: string;
  password: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
  password: string;
}

export interface UserInfoUpdateRequest {
  username: string;
}

export interface SignupRequest {
  email: string;
  username: string;
  password: string;
}

export interface OTPMailRequest {
  mail: string;
  name: string;
}

export interface OTPValidateRequest {
  email: string;
  otp: string;
}

export interface RestaurantCreateRequest {
  userId: string;
  name: string;
  email: string;
  restaurantPhone: string;
  publicUrl?: string;
  description?: string;
}
