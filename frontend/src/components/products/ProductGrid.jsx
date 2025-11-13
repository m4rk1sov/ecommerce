// ============================================================
// src/components/products/ProductGrid.jsx
/**
 * Product Grid Component
 * Responsive grid layout for products
 */

import React from 'react';
import { ProductCard } from './ProductCard';
import { Loading } from '../common/Loading';
import { ErrorMessage } from '../common/ErrorMessage';

export const ProductGrid = ({ products, loading, error, showReasons = false }) => {
    if (loading) {
        return <Loading text="Loading products..." />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    if (!products || products.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((item) => (
                <ProductCard
                    key={item.product?.id || item.id}
                    product={item.product || item}
                    showReason={showReasons}
                    reason={item.reason}
                />
            ))}
        </div>
    );
};

