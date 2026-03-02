import axiosClient from './axiosClient';

// Giả định backend có /api/customer/... theo yêu cầu
const customerApi = {
  getProfile: () => axiosClient.get('/customer/profile').then((res) => res.data),
  updateProfile: (data) =>
    axiosClient.put('/customer/profile', data).then((res) => res.data),

  changePassword: (oldPassword, newPassword) =>
    axiosClient
      .put('/customer/password', { oldPassword, newPassword })
      .then((res) => res.data),

  getBookings: () => axiosClient.get('/customer/bookings').then((res) => res.data),

  createBooking: (data) =>
    axiosClient.post('/customer/bookings', data).then((res) => res.data)
};

export default customerApi;