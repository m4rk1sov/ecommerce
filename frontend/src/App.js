import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/layout/Header';
import { CartSidebar } from './components/layout/CartSidebar';
import { Loading } from './components/common/Loading';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Lazy load pages (code splitting)
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ProductsPage = lazy(() => import('./pages/ProductsPage').then(m => ({ default: m.ProductsPage })));
const RecommendationsPage = lazy(() => import('./pages/RecommendationsPage').then(m => ({ default: m.RecommendationsPage })));

function App() {
    return (
        <BrowserRouter>
            {/* Global Providers */}
            <AuthProvider>
                <CartProvider>
                    <div className="min-h-screen bg-gray-50">
                        {/* Header (appears on all pages) */}
                        <Header />

                        {/* Main Content */}
                        <main>
                            <Suspense fallback={<Loading />}>
                                <Routes>
                                    {/* Public Routes */}
                                    <Route path="/" element={<HomePage />} />
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/register" element={<RegisterPage />} />
                                    <Route path="/products" element={<ProductsPage />} />

                                    {/* Protected Routes */}
                                    <Route
                                        path="/recommendations"
                                        element={
                                            <ProtectedRoute>
                                                <RecommendationsPage />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* 404 Not Found */}
                                    <Route path="*" element={<NotFoundPage />} />
                                </Routes>
                            </Suspense>
                        </main>

                        {/* Cart Sidebar (global) */}
                        <CartSidebar />
                    </div>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

// Simple 404 page
const NotFoundPage = () => (
    <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
        <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
        <a href="/" className="text-blue-600 hover:text-blue-700">Go back home</a>
    </div>
);

export default App;