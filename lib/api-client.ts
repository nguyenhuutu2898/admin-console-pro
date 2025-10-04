import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Get BASE_URL from environment variables
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add headers
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Add x-request-time header (ISO + offset)
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset();
    const requestTime = now.toISOString();
    
    config.headers = {
      ...config.headers,
      'x-request-time': requestTime,
      'x-request-timezone': 'Asia/Ho_Chi_Minh',
    };

    // Add authorization token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access denied:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
