/**
 * Admin Dashboard Layout — Container for nested admin routes
 *
 * Architecture: Container/Presenter pattern.
 * This is the Container — it provides the layout shell + navigation.
 * <Outlet> renders the active nested route (AdminStats or AdminProducts).
 */

import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

export const AdminDashboard = () => {
    const linkClass = ({ isActive }) =>
        `px-4 py-2 rounded-lg font-medium transition-colors ${
            isActive
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
                <p className="text-gray-600 mb-6">Manage your e-commerce platform</p>

                {/* Sub-navigation for nested routes */}
                <nav className="flex space-x-4 mb-8">
                    <NavLink to="/admin/stats" className={linkClass}>📊 Statistics</NavLink>
                    <NavLink to="/admin/products" className={linkClass}>📦 Products</NavLink>
                </nav>

                {/* Nested route content renders here */}
                <Outlet />
            </div>
        </div>
    );
};