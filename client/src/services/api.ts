import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // send HttpOnly cookies on every request
});

export default api;
