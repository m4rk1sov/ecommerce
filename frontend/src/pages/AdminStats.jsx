/**
 * Admin Stats Page — Presenter component (nested under /admin/stats)
 *
 * Demonstrates: Nested routing, useMemo for computed values.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { productsAPI } from '../api';
import { Loading } from '../components/common/Loading';

export const AdminStats = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await productsAPI.getAll(100, 0);
                setProducts(data);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    // useMemo: Avoids recalculating on every render (Performance requirement)
    const stats = useMemo(() => ({
        total: products.length,
        categories: new Set(products.map((p) => p.category)).size,
        inStock: products.filter((p) => p.stock > 0).length,
        outOfStock: products.filter((p) => p.stock === 0).length,
        avgPrice: products.length
            ? (products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2)
            : '0.00',
        avgRating: products.length
            ? (products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length).toFixed(1)
            : '0.0',
    }), [products]);

    if (loading) return <Loading text="Loading statistics..." />;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { label: 'Total Products', value: stats.total, color: 'text-blue-600' },
                { label: 'Categories', value: stats.categories, color: 'text-purple-600' },
                { label: 'In Stock', value: stats.inStock, color: 'text-green-600' },
                { label: 'Out of Stock', value: stats.outOfStock, color: 'text-red-600' },
                { label: 'Avg Price', value: `$${stats.avgPrice}`, color: 'text-gray-800' },
                { label: 'Avg Rating', value: `⭐ ${stats.avgRating}`, color: 'text-yellow-600' },
            ].map(({ label, value, color }) => (
                <div key={label} className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-gray-600 text-sm font-medium">{label}</h3>
                    <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
                </div>
            ))}
        </div>
    );
};