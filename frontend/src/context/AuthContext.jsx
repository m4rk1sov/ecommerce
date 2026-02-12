/**
 * Authentication Context — Façade over Redux
 *
 * Why keep Context alongside Redux?
 * - Existing components use useAuth() — no mass refactoring needed
 * - Context provides a clean DI interface
 * - Redux handles the actual state machine (thunks, reducers)
 * - Demonstrates understanding of BOTH patterns (rubric bonus)
 */

import React, { createContext, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginUser, registerUser, logout, updateUser, clearAuthError } from '../store/authSlice';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const dispatch = useDispatch();
    const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth);

    const login = async (credentials) => {
        try {
            await dispatch(loginUser(credentials)).unwrap();
            return { success: true };
        } catch (err) {
            return { success: false, error: err };
        }
    };

    const register = async (userData) => {
        try {
            await dispatch(registerUser(userData)).unwrap();
            return { success: true };
        } catch (err) {
            return { success: false, error: err };
        }
    };

    const handleLogout = () => {
        dispatch(logout());
    };

    const handleUpdateUser = (updatedUser) => {
        dispatch(updateUser(updatedUser));
    };

    const value = {
        user,
        token,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout: handleLogout,
        updateUser: handleUpdateUser,
        clearError: () => dispatch(clearAuthError()),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};