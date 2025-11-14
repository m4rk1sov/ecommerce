/**
 * Protected Route Component
 * Redirects to login if not authenticated
 *
 * Usage:
 * <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

