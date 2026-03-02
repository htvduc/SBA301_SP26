import axiosClient from './axiosClient';

const authApi = {
  login: (email, password) =>
    axiosClient
      .post('/auth/login', { email, password })
      .then((res) => res.data),

  // Backend hiện chưa có, nhưng FE code theo yêu cầu:
  register: (payload) =>
    axiosClient
      .post('/auth/register', payload)
      .then((res) => res.data)
};

export default authApi;