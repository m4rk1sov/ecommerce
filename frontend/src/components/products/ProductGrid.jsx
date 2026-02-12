/**
 * Product Grid — Memoized to prevent unnecessary re-renders
 */

import React, { useMemo } from 'react';
import { ProductCard } from './ProductCard';
import { Loading } from '../common/Loading';
import { ErrorMessage } from '../common/ErrorMessage';

const ProductGridInner = ({ products, loading, error, showReasons = false }) => {
    if (loading) return <Loading text="Loading products..." />;
    if (error) return <ErrorMessage message={error} />;
    if (!products || products.length === 0) {
        return <div className="text-center py-12"><p className="text-gray-500 text-lg">No products found</p></div>;
    }

    // useMemo: Normalize product list only when products array changes
    const normalizedProducts = useMemo(() =>
        products.map((item) => ({
            key: item.product?.id || item.id,
            product: item.product || item,
            reason: item.reason,
        })), [products]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {normalizedProducts.map((item) => (
                <ProductCard
                    key={item.key}
                    product={item.product}
                    showReason={showReasons}
                    reason={item.reason}
                />
            ))}
        </div>
    );
};

export const ProductGrid = React.memo(ProductGridInner);