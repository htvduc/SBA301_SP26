import axiosClient from './axiosClient';

// Giả định backend có các endpoint /api/staff/... theo yêu cầu đề bài
const staffApi = {
  // Customers
  getCustomers: () => axiosClient.get('/staff/customers').then((res) => res.data),
  createCustomer: (data) =>
    axiosClient.post('/staff/customers', data).then((res) => res.data),
  updateCustomer: (id, data) =>
    axiosClient.put(`/staff/customers/${id}`, data).then((res) => res.data),
  deleteCustomer: (id) => axiosClient.delete(`/staff/customers/${id}`),

  // Rooms
  getRooms: () => axiosClient.get('/staff/rooms').then((res) => res.data),
  createRoom: (data) => axiosClient.post('/staff/rooms', data).then((res) => res.data),
  updateRoom: (id, data) =>
    axiosClient.put(`/staff/rooms/${id}`, data).then((res) => res.data),
  deleteRoom: (id) => axiosClient.delete(`/staff/rooms/${id}`),

  // Bookings
  getBookings: () => axiosClient.get('/staff/bookings').then((res) => res.data),
  updateBookingStatus: (id, status) =>
    axiosClient.put(`/staff/bookings/${id}/status`, { status }).then((res) => res.data),
  deleteBooking: (id) =>
    axiosClient.delete(`/staff/bookings/${id}`).then((res) => res.data)
};

export default staffApi;