import axios from 'axios';
import { message } from 'antd';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
});

// Interceptor: Add token to request headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor: Handle response errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      if (error.response.status === 401) {
        // Unauthorized - token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        message.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        setTimeout(() => {
          window.location.href = '/login';
        }, 500);
      } else if (error.response.status === 403) {
        // Forbidden - user doesn't have permission
        console.error('Access forbidden:', error.response.data);
      } else if (error.response.status === 400) {
        // Bad request - validation error
        console.error('Validation error:', error.response.data);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('No response received:', error.request);
    } else {
      // Error in request setup
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;