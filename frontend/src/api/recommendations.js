/**
 * Recommendations API
 * Different algorithms for different use cases
 */

import apiClient from './client';

export const recommendationsAPI = {
    /**
     * Get personalized recommendations (Hybrid)
     * GET /recommendations
     *
     * Uses: 60% collaborative + 40% content-based
     * Cached in Redis for 1 hour
     */
    getPersonalized: async (limit = 10) => {
        const response = await apiClient.get('/recommendations', {
            params: { limit },
        });
        return response.data;
    },

    /**
     * Get collaborative filtering recommendations
     * GET /recommendations/collaborative
     *
     * Based on: Users with similar taste
     * Uses: Neo4j graph traversal
     */
    getCollaborative: async (limit = 10) => {
        const response = await apiClient.get('/recommendations/collaborative', {
            params: { limit },
        });
        return response.data;
    },

    /**
     * Get content-based recommendations
     * GET /recommendations/content-based
     *
     * Based on: Your interaction history
     * Uses: MongoDB aggregations
     */
    getContentBased: async (limit = 10) => {
        const response = await apiClient.get('/recommendations/content-based', {
            params: { limit },
        });
        return response.data;
    },
};