/**
 * Recommendations Hook
 * Fetches personalized recommendations
 */

import { useState, useEffect } from 'react';
import { recommendationsAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export const useRecommendations = (algorithm = 'personalized', limit = 10) => {
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        // Don't fetch if not authenticated
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        const fetchRecommendations = async () => {
            try {
                setLoading(true);
                setError(null);

                let data;
                switch (algorithm) {
                    case 'collaborative':
                        data = await recommendationsAPI.getCollaborative(limit);
                        break;
                    case 'content-based':
                        data = await recommendationsAPI.getContentBased(limit);
                        break;
                    default:
                        data = await recommendationsAPI.getPersonalized(limit);
                }

                setRecommendations(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [algorithm, limit, isAuthenticated]);

    return { recommendations, loading, error };
};

/**
 * Context & Hooks Summary:
 *
 * ✅ AuthContext: Global auth state (user, token, login/logout)
 * ✅ CartContext: Shopping cart state (add, remove, checkout)
 * ✅ useDebounce: Optimizes search performance
 * ✅ useProducts: Fetches products with loading/error states
 * ✅ useRecommendations: Fetches recommendations
 *
 * Pattern: Custom hooks encapsulate logic, Context provides global state
 *
 * Next: UI Components (reusable building blocks)
 */
