// src/api/client.js
/**
 * Axios HTTP Client Configuration
 *
 * Why Axios Instance?
 * - Centralized configuration (base URL, timeout, headers)
 * - Request/Response interceptors (add auth token, handle errors)
 * - Consistent error handling across the app
 *
 * Backend Analogy: Like your HTTP client in Go with middleware
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 10000, // 10 seconds (fail fast)
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Request Interceptor
 * Automatically adds JWT token to every request
 *
 * Backend Analogy: Like your AuthMiddleware in Go
 */
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`📤 ${config.method.toUpperCase()} ${config.url}`, config.data);
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response Interceptor
 * Handles errors globally and logs responses
 *
 * Benefits:
 * - Automatic logout on 401 (unauthorized)
 * - Consistent error format
 * - Global error logging
 */
apiClient.interceptors.response.use(
    (response) => {
        // Log response in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`📥 ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
        }
        return response;
    },
    (error) => {
        // Handle different error types
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            // 401: Unauthorized - logout user
            if (status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }

            // 403: Forbidden
            if (status === 403) {
                console.error('Access forbidden');
            }

            // 500: Server error
            if (status >= 500) {
                console.error('Server error:', data);
            }

            // Return formatted error
            return Promise.reject({
                message: data.error || data.message || 'An error occurred',
                status,
                data,
            });
        } else if (error.request) {
            // Request made but no response (network error)
            return Promise.reject({
                message: 'Network error. Please check your connection.',
                status: 0,
            });
        } else {
            // Something else happened
            return Promise.reject({
                message: error.message || 'An unexpected error occurred',
                status: -1,
            });
        }
    }
);

export default apiClient;
