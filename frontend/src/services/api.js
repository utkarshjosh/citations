import axios from 'axios';

const API_BASE_URL =  '/api';
// import.meta.env.VITE_API_URL ||
// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to determine if error is retryable
const isRetryableError = (error) => {
  if (!error.response) {
    // Network errors are retryable
    return true;
  }
  
  const status = error.response.status;
  // Retry on 5xx errors and 429 (rate limit)
  return status >= 500 || status === 429;
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with retry logic
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const config = error.config;
    
    // Initialize retry count
    if (!config.__retryCount) {
      config.__retryCount = 0;
    }
    
    // Check if we should retry
    if (config.__retryCount < MAX_RETRIES && isRetryableError(error)) {
      config.__retryCount++;
      
      // Calculate exponential backoff delay
      const backoffDelay = RETRY_DELAY * Math.pow(2, config.__retryCount - 1);
      
      console.log(`Retrying request (attempt ${config.__retryCount}/${MAX_RETRIES}) after ${backoffDelay}ms...`);
      
      await delay(backoffDelay);
      
      return apiClient(config);
    }
    
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token
          localStorage.removeItem('authToken');
          console.error('Unauthorized access');
          break;
        case 403:
          console.error('Access forbidden:', data?.message || 'You do not have permission');
          break;
        case 404:
          console.error('Resource not found:', data?.message || 'The requested resource was not found');
          break;
        case 429:
          console.error('Rate limit exceeded:', data?.message || 'Too many requests');
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          console.error('Server error:', data?.message || 'Internal server error');
          break;
        default:
          console.error('API Error:', data?.message || error.message);
      }
      
      // Enhance error object with user-friendly message
      error.userMessage = data?.message || getErrorMessage(status);
    } else if (error.request) {
      console.error('Network error - no response received');
      error.userMessage = 'Network error. Please check your internet connection.';
    } else {
      console.error('Error:', error.message);
      error.userMessage = 'An unexpected error occurred. Please try again.';
    }
    
    return Promise.reject(error);
  }
);

// Helper function to get user-friendly error messages
const getErrorMessage = (status) => {
  const messages = {
    400: 'Invalid request. Please check your input.',
    401: 'You need to be logged in to perform this action.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    429: 'Too many requests. Please try again later.',
    500: 'Server error. Please try again later.',
    502: 'Bad gateway. Please try again later.',
    503: 'Service unavailable. Please try again later.',
    504: 'Gateway timeout. Please try again later.',
  };
  
  return messages[status] || 'An error occurred. Please try again.';
};

// Export enhanced API client with utility methods
export const api = {
  client: apiClient,
  
  // Wrapper methods with better error handling
  async get(url, config = {}) {
    try {
      const response = await apiClient.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async post(url, data, config = {}) {
    try {
      const response = await apiClient.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async put(url, data, config = {}) {
    try {
      const response = await apiClient.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async delete(url, config = {}) {
    try {
      const response = await apiClient.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default apiClient;
