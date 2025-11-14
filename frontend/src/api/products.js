/**
 * Product API
 * Handles all product-related endpoints
 */

import apiClient from './client';

export const productsAPI = {
    /**
     * Get all products with pagination
     * GET /products?limit=20&offset=0
     */
    getAll: async (limit = 20, offset = 0) => {
        const response = await apiClient.get('/products', {
            params: { limit, offset },
        });
        return response.data.products || [];
    },

    /**
     * Get product by ID
     * GET /products/:id
     */
    getById: async (id) => {
        const response = await apiClient.get(`/products/${id}`);
        return response.data;
    },

    /**
     * Search products
     * GET /products/search?q=laptop&category=Electronics
     */
    search: async (query, category = '', limit = 20) => {
        const response = await apiClient.get('/products/search', {
            params: { q: query, category, limit },
        });
        return response.data.products || [];
    },

    /**
     * Get products by category
     * GET /products/search?category=Electronics
     */
    getByCategory: async (category, limit = 20) => {
        const response = await apiClient.get('/products/search', {
            params: { category, limit },
        });
        return response.data.products || [];
    },

    /**
     * Get related products
     * GET /products/:id/related
     */
    getRelated: async (productId, limit = 5) => {
        const response = await apiClient.get(`/products/${productId}/related`, {
            params: { limit },
        });
        return response.data.products || [];
    },

    /**
     * Admin: Create product
     * POST /admin/products
     */
    create: async (productData) => {
        const response = await apiClient.post('/admin/products', productData);
        return response.data;
    },

    /**
     * Admin: Update product
     * PUT /admin/products/:id
     */
    update: async (id, productData) => {
        const response = await apiClient.put(`/admin/products/${id}`, productData);
        return response.data;
    },

    /**
     * Admin: Delete product
     * DELETE /admin/products/:id
     */
    delete: async (id) => {
        const response = await apiClient.delete(`/admin/products/${id}`);
        return response.data;
    },
};