import axios from 'axios';
import { showNotification } from '../utils/errorHandler';

const BASE_URL = '/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Flag to prevent multiple logout calls
let isLoggingOut = false;

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error for debugging
    console.log(
      'API Error:',
      error.response?.status,
      error.response?.data?.message
    );

    if (error.response?.status === 401 && !isLoggingOut) {
      isLoggingOut = true;

      // Token expired or invalid
      // Dispatch logout action after store is initialized
      setTimeout(() => {
        import('../store').then(({ store }) => {
          import('../store/features/authSlice').then(({ logout }) => {
            store.dispatch(logout());
            // Reset flag after logout
            setTimeout(() => {
              isLoggingOut = false;
            }, 1000);
          });
        });
      }, 0);

      // Show notification to user
      if (window.location.pathname !== '/login') {
        // Only show notification if not already on login page
        showNotification(
          'جلسه شما منقضی شده است. لطفاً مجدداً وارد شوید.',
          'warning'
        );
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
