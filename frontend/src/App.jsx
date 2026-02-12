import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CartSidebar } from './components/layout/CartSidebar';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminRoute } from './components/layout/AdminRoute';

// Lazy load pages (Code Splitting — only downloaded when navigated to)
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ProductsPage = lazy(() => import('./pages/ProductsPage').then(m => ({ default: m.ProductsPage })));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const RecommendationsPage = lazy(() => import('./pages/RecommendationsPage').then(m => ({ default: m.RecommendationsPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProducts = lazy(() => import('./pages/AdminProducts').then(m => ({ default: m.AdminProducts })));
const AdminStats = lazy(() => import('./pages/AdminStats').then(m => ({ default: m.AdminStats })));

// Loading fallback
const Loading = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
        </div>
    </div>
);

// 404
const NotFoundPage = () => (
    <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
        <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
        <a href="/" className="text-blue-600 hover:text-blue-700 font-medium">Go back home</a>
    </div>
);

function App() {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <AuthProvider>
                    <CartProvider>
                        <div className="min-h-screen bg-gray-50 flex flex-col">
                            <Header />
                            <main className="flex-1">
                                <Suspense fallback={<Loading />}>
                                    <Routes>
                                        {/* Public Routes */}
                                        <Route path="/" element={<HomePage />} />
                                        <Route path="/login" element={<LoginPage />} />
                                        <Route path="/register" element={<RegisterPage />} />
                                        <Route path="/products" element={<ProductsPage />} />
                                        <Route path="/products/:id" element={<ProductDetailPage />} />

                                        {/* Protected Routes */}
                                        <Route path="/recommendations" element={
                                            <ProtectedRoute><RecommendationsPage /></ProtectedRoute>
                                        } />
                                        <Route path="/profile" element={
                                            <ProtectedRoute><ProfilePage /></ProtectedRoute>
                                        } />

                                        {/* Nested Admin Routes (Protected + Admin Guard) */}
                                        <Route path="/admin" element={
                                            <AdminRoute><AdminDashboard /></AdminRoute>
                                        }>
                                            <Route index element={<AdminStats />} />
                                            <Route path="products" element={<AdminProducts />} />
                                            <Route path="stats" element={<AdminStats />} />
                                        </Route>

                                        {/* 404 */}
                                        <Route path="*" element={<NotFoundPage />} />
                                    </Routes>
                                </Suspense>
                            </main>
                            <Footer />
                            <CartSidebar />
                        </div>
                    </CartProvider>
                </AuthProvider>
            </BrowserRouter>
        </Provider>
    );
}

export default App;