import axiosClient from './axiosClient';

const roomApi = {
  getAll: () => axiosClient.get('/rooms').then((res) => res.data),
  getAvailable: (startDate, endDate) =>
    axiosClient
      .get('/rooms', { params: { startDate, endDate } })
      .then((res) => res.data),
  getAllWithStatus: (checkDate) =>
    axiosClient
      .get('/rooms/all-with-status', { params: { checkDate } })
      .then((res) => res.data),
  getTypes: () => axiosClient.get('/rooms/types').then((res) => res.data)
};

export default roomApi;