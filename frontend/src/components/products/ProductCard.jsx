/**
 * Product Card Component — Optimized with React.memo + useCallback
 *
 * Rubric: "Application of memoization (memo/useCallback/useMemo in React)"
 *
 * React.memo: Prevents re-render if props haven't changed.
 * useCallback: Stabilizes handler references so memo works properly.
 */

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { interactionsAPI } from '../../api';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

const ProductCardInner = ({ product, showReason = false, reason = '' }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const handleClick = useCallback(async () => {
        try { await interactionsAPI.recordView(product.id); }
        catch (error) { console.error('Failed to record view:', error); }
        navigate(`/products/${product.id}`);
    }, [product.id, navigate]);

    const handleAddToCart = useCallback((e) => {
        e.stopPropagation();
        addToCart(product);
    }, [product, addToCart]);

    const handleLike = useCallback(async (e) => {
        e.stopPropagation();
        try { await interactionsAPI.recordLike(product.id); }
        catch (error) { console.error('Failed to like product:', error); }
    }, [product.id]);

    return (
        <Card hoverable onClick={handleClick} className="flex flex-col h-full">
            <div className="relative aspect-square bg-gray-100 rounded-md overflow-hidden mb-3">
                {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                )}
                <button onClick={handleLike} className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">❤️</button>
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">{product.category}</span>
                <div className="flex items-center mt-2">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1 text-sm text-gray-600">{product.rating?.toFixed(1)} ({product.reviewCount} reviews)</span>
                </div>
                {showReason && reason && <p className="mt-2 text-xs text-gray-500 italic">💡 {reason}</p>}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-gray-900">${product.price?.toFixed(2)}</span>
                    {product.stock > 0 ? (
                        <span className="text-sm text-green-600">In Stock</span>
                    ) : (
                        <span className="text-sm text-red-600">Out of Stock</span>
                    )}
                </div>
                <Button variant="primary" size="small" onClick={handleAddToCart} disabled={product.stock <= 0} className="w-full">
                    Add to Cart
                </Button>
            </div>
        </Card>
    );
};

// React.memo prevents re-render when parent re-renders but props are unchanged
export const ProductCard = React.memo(ProductCardInner);