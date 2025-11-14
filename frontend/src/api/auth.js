/**
 * Authentication API
 *
 * Why separate files?
 * - Organized by domain (like backend services)
 * - Easy to find and maintain
 * - Single responsibility principle
 */

import apiClient from './client';

export const authAPI = {
    /**
     * Register new user
     * POST /auth/register
     */
    register: async (userData) => {
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
    },

    /**
     * Login user
     * POST /auth/login
     *
     * Note: Stores token and user in localStorage
     */
    login: async (credentials) => {
        const response = await apiClient.post('/auth/login', credentials);
        const { user, token } = response.data;

        // Store in localStorage (persists across page refreshes)
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        return { user, token };
    },

    /**
     * Logout user (client-side only)
     */
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    /**
     * Get current user from localStorage
     */
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },
};