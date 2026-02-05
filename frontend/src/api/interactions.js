/**
 * Interaction API
 * Tracks user behavior (views, likes, purchases)
 *
 * Improves recommendations
 * Analytics for product team
 * Personalization
 */

import apiClient from './client';

export const interactionsAPI = {
    /**
     * Record product view
     * POST /interactions/view
     *
     * Call this when user views product detail page
     */
    recordView: async (productId) => {
        const response = await apiClient.post('/interactions/view', { productId });
        return response.data;
    },

    /**
     * Record product like
     * POST /interactions/like
     *
     * Weight: 3.0 (stronger signal than view)
     */
    recordLike: async (productId) => {
        const response = await apiClient.post('/interactions/like', { productId });
        return response.data;
    },

    /**
     * Record add to cart
     * POST /interactions/cart
     *
     * Weight: 5.0
     */
    recordCart: async (productId) => {
        const response = await apiClient.post('/interactions/cart', { productId });
        return response.data;
    },

    /**
     * Record purchase
     * POST /interactions/purchase
     *
     * Weight: 10.0 (strongest signal)
     */
    recordPurchase: async (purchaseData) => {
        const response = await apiClient.post('/interactions/purchase', purchaseData);
        return response.data;
    },

    /**
     * Get user's purchase history
     * GET /users/history
     */
    getHistory: async () => {
        const response = await apiClient.get('/users/history');
        return response.data;
    },
};