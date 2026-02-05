/**
 * Products Hook
 * Encapsulates product fetching logic
 *
 * Custom hook:
 * Reusable across multiple pages
 * Handles loading/error states
 * Single place to update API calls
 *
 * Like a service layer in the backend
 */

import { useState, useEffect } from 'react';
import { productsAPI } from '../api';
import {useDebounce} from "./useDebounce";

export const useProducts = (limit = 20, offset = 0) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await productsAPI.getAll(limit, offset);
                setProducts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [limit, offset]);

    return { products, loading, error };
};

/**
 * Product Search Hook
 */
export const useProductSearch = (query, category = '') => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Debounce search query
    const debouncedQuery = useDebounce(query, 500);

    useEffect(() => {
        if (!debouncedQuery) {
            setProducts([]);
            return;
        }

        const searchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await productsAPI.search(debouncedQuery, category);
                setProducts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        searchProducts();
    }, [debouncedQuery, category]);

    return { products, loading, error };
};