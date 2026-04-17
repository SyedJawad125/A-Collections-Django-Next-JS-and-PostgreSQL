// import axios from 'axios';

// // Create an Axios instance
// const axiosInstance = axios.create({
//   baseURL: 'http://localhost:8000', 
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Add a request interceptor
// axiosInstance.interceptors.request.use(
//   (config) => {
//     // Get the access token from localStorage
//     const token = localStorage.getItem('access_token');
    
//     if (token) {
//       // Add Bearer token to Authorization header
//       config.headers.Authorization = `Bearer ${token}`;
//       console.log('Request interceptor: Token attached to request');
//     } else {
//       console.log('Request interceptor: No token found');
//     }
    
//     return config;
//   },
//   (error) => {
//     console.error('Request interceptor error:', error);
//     return Promise.reject(error);
//   }
// );

// // Add a response interceptor to handle token refresh
// axiosInstance.interceptors.response.use(
//   (response) => {
//     // If response is successful, just return it
//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config;

//     // If error is 401 (Unauthorized) and we haven't tried to refresh yet
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         console.log('Token expired, attempting to refresh...');
        
//         // Get refresh token
//         const refreshToken = localStorage.getItem('refresh_token');
        
//         if (!refreshToken) {
//           console.error('No refresh token found');
//           throw new Error('No refresh token available');
//         }

//         // Call refresh token endpoint - CORRECTED TO MATCH BACKEND
//         const response = await axios.post('http://localhost:8000/api/user/v1/refresh/', {
//           refresh_token: refreshToken  // Backend expects 'refresh_token', not 'refresh'
//         });

//         // Backend returns tokens in data.data structure
//         const newAccessToken = response.data.data.access_token;
//         const newRefreshToken = response.data.data.refresh_token;
        
//         // Store new tokens
//         localStorage.setItem('access_token', newAccessToken);
//         localStorage.setItem('refresh_token', newRefreshToken);
        
//         console.log('Token refreshed successfully');

//         // Update the failed request with new token
//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
//         // Retry the original request
//         return axiosInstance(originalRequest);
        
//       } catch (refreshError) {
//         console.error('Token refresh failed:', refreshError);
        
//         // Clear all auth data
//         localStorage.removeItem('access_token');
//         localStorage.removeItem('refresh_token');
//         localStorage.removeItem('permissions');
//         localStorage.removeItem('role');
//         localStorage.removeItem('user');
        
//         // Redirect to login page
//         if (typeof window !== 'undefined') {
//           window.location.href = '/login';
//         }
        
//         return Promise.reject(refreshError);
//       }
//     }

//     // For other errors, just reject
//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;


import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach Bearer token ───────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: auto-refresh on 401 ─────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue requests while a refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = typeof window !== 'undefined'
        ? localStorage.getItem('refresh_token')
        : null;

      if (!refreshToken) {
        isRefreshing = false;
        _clearAuthAndRedirect();
        return Promise.reject(error);
      }

      try {
        // Backend expects { refresh_token: "..." } and returns { data: { access_token, refresh_token } }
        const res = await axios.post(`${BASE_URL}/api/user/v1/refresh/`, {
          refresh_token: refreshToken,
        });

        const newAccess  = res.data?.data?.access_token;
        const newRefresh = res.data?.data?.refresh_token;

        if (!newAccess) throw new Error('No access token in refresh response');

        localStorage.setItem('access_token', newAccess);
        if (newRefresh) localStorage.setItem('refresh_token', newRefresh);

        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        processQueue(null, newAccess);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        _clearAuthAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

function _clearAuthAndRedirect() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('permissions');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}

export default axiosInstance;