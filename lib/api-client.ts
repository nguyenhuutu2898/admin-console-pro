import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'sonner';

// Get BASE_URL from environment variables
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Add timestamp
    config.headers = config.headers || {};
    config.headers['x-request-time'] = new Date().toISOString();
    
    // Add timezone
    config.headers['x-request-timezone'] = 'Asia/Ho_Chi_Minh';
    
    // Add authorization token
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          localStorage.removeItem('auth-token');
          localStorage.removeItem('auth-storage');
          window.location.href = '/login';
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          break;
          
        case 403:
          // Forbidden - access denied
          toast.error('Bạn không có quyền thực hiện hành động này.');
          break;
          
        case 404:
          // Not found
          toast.error('Không tìm thấy dữ liệu.');
          break;
          
        case 422:
          // Validation error
          if (data?.error?.details) {
            const errors = Object.values(data.error.details).flat();
            errors.forEach((error: any) => toast.error(error));
          } else {
            toast.error(data?.error?.message || 'Dữ liệu không hợp lệ.');
          }
          break;
          
        case 500:
          // Server error
          toast.error('Lỗi máy chủ. Vui lòng thử lại sau.');
          break;
          
        default:
          toast.error(data?.error?.message || 'Đã xảy ra lỗi không xác định.');
      }
    } else if (error.request) {
      // Network error
      toast.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
    } else {
      // Other error
      toast.error('Đã xảy ra lỗi không xác định.');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;