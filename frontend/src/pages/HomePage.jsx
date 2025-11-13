// ============================================================
// src/pages/HomePage.jsx
/**
 * Home Page
 *
 * Features:
 * - Hero section
 * - Featured products
 * - Personalized recommendations (if logged in)
 * - Product categories
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../hooks/useProducts';
import { useRecommendations } from '../hooks/useRecommendations';
import { ProductGrid } from '../components/products/ProductGrid';
import { Button } from '../components/common/Button';

export const HomePage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { products, loading: productsLoading } = useProducts(8, 0);
    const { recommendations, loading: recsLoading } = useRecommendations('personalized', 4);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl font-bold mb-4">
                        Welcome to Smart Shopping
                    </h1>
                    <p className="text-xl mb-8">
                        AI-powered recommendations just for you
                    </p>
                    {!isAuthenticated ? (
                        <div className="space-x-4">
                            <Button variant="primary" size="large" onClick={() => navigate('/register')}>
                                Get Started
                            </Button>
                            <Button variant="outline" size="large" onClick={() => navigate('/login')}>
                                Sign In
                            </Button>
                        </div>
                    ) : (
                        <p className="text-lg">Welcome back, {user?.firstName}! 👋</p>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* Personalized Recommendations */}
                {isAuthenticated && recommendations && (
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-bold text-gray-800">
                                Recommended for You
                            </h2>
                            <Link to="/recommendations" className="text-blue-600 hover:text-blue-700">
                                View all →
                            </Link>
                        </div>
                        <ProductGrid
                            products={recommendations.products || []}
                            loading={recsLoading}
                            showReasons={true}
                        />
                    </section>
                )}

                {/* Featured Products */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold text-gray-800">
                            Featured Products
                        </h2>
                        <Link to="/products" className="text-blue-600 hover:text-blue-700">
                            Browse all →
                        </Link>
                    </div>
                    <ProductGrid products={products} loading={productsLoading} />
                </section>

                {/* Categories */}
                <section className="mt-12">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">
                        Shop by Category
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys'].map(category => (
                            <Link
                                key={category}
                                to={`/products?category=${category}`}
                                className="p-6 bg-white rounded-lg shadow-md text-center hover:shadow-lg transition-shadow"
                            >
                                <p className="font-semibold text-gray-800">{category}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

