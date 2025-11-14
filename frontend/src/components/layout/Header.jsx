import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Button } from '../common/Button';

export const Header = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();
    const { getItemCount, setIsOpen } = useCart();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Check if user is admin (for demo: user1@example.com)
    const isAdmin = user?.email === 'user1@example.com';

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="text-2xl">🛍️</div>
                        <span className="text-xl font-bold text-gray-800">SmartShop</span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-6">
                        <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">
                            Home
                        </Link>
                        <Link to="/products" className="text-gray-700 hover:text-blue-600 font-medium">
                            Products
                        </Link>
                        {isAuthenticated && (
                            <>
                                <Link to="/recommendations" className="text-gray-700 hover:text-blue-600 font-medium">
                                    Recommendations
                                </Link>
                                {isAdmin && (
                                    <Link to="/admin" className="text-gray-700 hover:text-blue-600 font-medium">
                                        Admin
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>

                    {/* Right Side */}
                    <div className="flex items-center space-x-4">
                        {/* Cart */}
                        <button
                            onClick={() => setIsOpen(true)}
                            className="relative p-2 text-gray-700 hover:text-blue-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {getItemCount() > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getItemCount()}
                </span>
                            )}
                        </button>

                        {/* User Menu */}
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/profile"
                                    className="text-sm text-gray-700 hover:text-blue-600 font-medium"
                                >
                                    👤 {user?.firstName}
                                </Link>
                                <Button variant="secondary" size="small" onClick={handleLogout}>
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Button variant="secondary" size="small" onClick={() => navigate('/login')}>
                                    Login
                                </Button>
                                <Button variant="primary" size="small" onClick={() => navigate('/register')}>
                                    Sign Up
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
