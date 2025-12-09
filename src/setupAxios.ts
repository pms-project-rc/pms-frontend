/**
 * Setup axios interceptors
 * This must be imported BEFORE any other services that use axios
 */
import axios from 'axios';
import { authService } from './services/authService';

// Axios interceptor to add auth token to requests
axios.interceptors.request.use(
    (config) => {
        const token = authService.getToken();
        if (token) {
            console.log('[AXIOS] Adding Authorization header to request');
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.log('[AXIOS] No token found, request will be sent without Authorization header');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Axios interceptor to handle 401 responses
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.log('[AXIOS] 401 Unauthorized - logging out');
            authService.logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

console.log('[AXIOS] Interceptors configured');
