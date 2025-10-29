import axios from 'axios';

const isDevelopment = import.meta.env.MODE === 'development';

// In development use the Vite dev server proxy by using a relative URL.
// This avoids TLS issues with the backend's self-signed certificate.
const BASE_URL = isDevelopment ? '/api/v1' : 'https://api.fishchi.ir/api/v1';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // console.error('Axios error:', error);
    if (error.response?.status === 401) {
      // console.error('Unauthorized access - 401');
      // Consider redirecting to login or refreshing token
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
