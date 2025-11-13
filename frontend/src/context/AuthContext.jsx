
/**
 * Authentication Context
 *
 * Why Context?
 * - Auth state needs to be accessible everywhere (header, protected routes, etc.)
 * - Avoid prop drilling (passing user through 10 components)
 * - Single source of truth for authentication
 *
 * Backend Analogy: Like dependency injection - provides auth service to all components
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api';

// Create context
const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Wraps app and provides auth state to all children
 *
 * Usage:
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true); // Loading on app init

    /**
     * Initialize auth state from localStorage
     * Runs once when app loads
     *
     * Why useEffect?
     * - Side effect: reading from localStorage
     * - Empty dependency array [] = run once on mount
     */
    useEffect(() => {
        const initAuth = () => {
            const savedToken = localStorage.getItem('token');
            const savedUser = authAPI.getCurrentUser();

            if (savedToken && savedUser) {
                setToken(savedToken);
                setUser(savedUser);
            }

            setLoading(false);
        };

        initAuth();
    }, []);

    /**
     * Login function
     * Called from LoginPage
     *
     * Returns: { success: boolean, error?: string }
     */
    const login = async (credentials) => {
        try {
            const { user, token } = await authAPI.login(credentials);
            setUser(user);
            setToken(token);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    /**
     * Register function
     * Called from RegisterPage
     */
    const register = async (userData) => {
        try {
            const { user, token } = await authAPI.register(userData);
            setUser(user);
            setToken(token);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    /**
     * Logout function
     * Clears state and localStorage
     */
    const logout = () => {
        authAPI.logout();
        setUser(null);
        setToken(null);
    };

    /**
     * Update user profile
     * Called after profile update
     */
    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    // Context value - all functions/state available to consumers
    const value = {
        user,
        token,
        isAuthenticated: !!token, // Boolean: is user logged in?
        loading,
        login,
        register,
        logout,
        updateUser,
    };

    // Don't render children until auth state is loaded
    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom Hook: useAuth
 * Simplifies consuming context
 *
 * Usage:
 * const { user, login, logout } = useAuth();
 *
 * Why custom hook?
 * - Cleaner than useContext(AuthContext)
 * - Can add validation/error handling
 * - Provides better error messages
 */

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return context;
};
